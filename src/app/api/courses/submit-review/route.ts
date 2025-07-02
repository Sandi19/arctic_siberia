// File: src/app/api/courses/submit-review/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/courses/submit-review
 * Submit course for admin review - INSTRUCTOR only
 * Changes status from DRAFT to PENDING_REVIEW
 */
export async function POST(request: NextRequest) {
  try {
    // 🔐 Authentication required
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // 👨‍🏫 Only INSTRUCTOR can submit for review (Admin creates directly APPROVED)
    if (user.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { success: false, message: 'Only instructors can submit courses for review' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { courseId, ...courseData } = body

    let course

    if (courseId) {
      // Update existing course and submit for review
      const existingCourse = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          sessions: {
            include: {
              contents: true
            }
          }
        }
      })

      if (!existingCourse) {
        return NextResponse.json(
          { success: false, message: 'Course not found' },
          { status: 404 }
        )
      }

      // Check ownership
      if (existingCourse.instructorId !== user.id) {
        return NextResponse.json(
          { success: false, message: 'You can only submit your own courses' },
          { status: 403 }
        )
      }

      // Check current status
      if (existingCourse.status !== 'DRAFT' && existingCourse.status !== 'REJECTED') {
        return NextResponse.json(
          { 
            success: false, 
            message: `Course is already ${existingCourse.status}. Only DRAFT or REJECTED courses can be submitted for review.`
          },
          { status: 400 }
        )
      }

      // Validate course completeness before submission
      const validation = validateCourseForSubmission(existingCourse, courseData)
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Course is not ready for submission',
            errors: validation.errors
          },
          { status: 400 }
        )
      }

      // Update course with new data and change status
      course = await updateCourseForSubmission(courseId, courseData, user.id)

    } else {
      // Create new course and submit for review
      const validation = validateCourseDataForSubmission(courseData)
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Course data is incomplete',
            errors: validation.errors
          },
          { status: 400 }
        )
      }

      // Create course directly with PENDING_REVIEW status
      course = await createCourseForSubmission(courseData, user.id)
    }

    // Log submission activity
    console.log(`📋 Course submitted for review: ${course.title} by ${user.name} (ID: ${course.id})`)

    // TODO: Send notification to admins (email, in-app notification, etc.)
    // await sendReviewNotificationToAdmins(course)

    return NextResponse.json({
      success: true,
      message: 'Course submitted for review successfully',
      course: {
        id: course.id,
        title: course.title,
        status: course.status,
        approvalStatus: course.approvalStatus,
        submittedAt: course.updatedAt
      },
      nextSteps: {
        description: 'Your course is now pending admin review',
        estimatedReviewTime: '24-48 hours',
        actions: [
          'You will receive email notification when review is complete',
          'You can track review status in your instructor dashboard',
          'Course cannot be edited while in review'
        ]
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ POST /api/courses/submit-review error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to submit course for review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Validate existing course for submission
 */
function validateCourseForSubmission(course: any, updates: any = {}) {
  const errors: string[] = []
  
  const title = updates.title || course.title
  const description = updates.description || course.description
  const sessions = updates.sessions || course.sessions || []
  const category = updates.category || course.categoryId

  // Required fields validation
  if (!title || title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long')
  }

  if (!description || description.trim().length < 50) {
    errors.push('Description must be at least 50 characters long')
  }

  if (!category) {
    errors.push('Category is required')
  }

  // Content validation
  if (sessions.length === 0) {
    errors.push('At least one session is required')
  }

  // Session validation
  sessions.forEach((session: any, index: number) => {
    if (!session.title || session.title.trim().length < 3) {
      errors.push(`Session ${index + 1}: Title is required (min 3 characters)`)
    }
    
    if (!session.contents || session.contents.length === 0) {
      errors.push(`Session ${index + 1}: At least one content item is required`)
    }
    
    if (session.contents) {
      session.contents.forEach((content: any, contentIndex: number) => {
        if (!content.title || content.title.trim().length < 3) {
          errors.push(`Session ${index + 1}, Content ${contentIndex + 1}: Title is required`)
        }
        
        if (content.type === 'VIDEO' && !content.youtubeUrl) {
          errors.push(`Session ${index + 1}, Content ${contentIndex + 1}: YouTube URL is required for video content`)
        }
        
        if (content.type === 'QUIZ' && (!content.quizData || !content.quizData.questions || content.quizData.questions.length === 0)) {
          errors.push(`Session ${index + 1}, Content ${contentIndex + 1}: Quiz questions are required`)
        }
      })
    }
  })

  // Business rules validation
  const freeContentLimit = updates.freeContentLimit || course.freeContentLimit || 3
  const freeSessionsCount = sessions.filter((s: any) => s.isFree).length
  
  if (freeSessionsCount === 0) {
    errors.push('At least one session must be marked as free for preview')
  }

  if (freeSessionsCount > freeContentLimit) {
    errors.push(`Too many free sessions (${freeSessionsCount}). Limit is ${freeContentLimit}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate course data for new submission
 */
function validateCourseDataForSubmission(data: any) {
  const errors: string[] = []

  if (!data.title || data.title.trim().length < 5) {
    errors.push('Title must be at least 5 characters long')
  }

  if (!data.description || data.description.trim().length < 50) {
    errors.push('Description must be at least 50 characters long')
  }

  if (!data.category) {
    errors.push('Category is required')
  }

  if (!data.sessions || data.sessions.length === 0) {
    errors.push('At least one session is required')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Update existing course for submission
 */
async function updateCourseForSubmission(courseId: string, data: any, instructorId: string) {
  return await prisma.$transaction(async (tx) => {
    // Handle category
    let categoryId = data.category
    if (data.category && typeof data.category === 'string') {
      let categoryRecord = await tx.category.findFirst({
        where: {
          OR: [
            { id: data.category },
            { slug: data.category },
            { name: data.category }
          ]
        }
      })

      if (!categoryRecord) {
        const slug = data.category.toLowerCase().replace(/\s+/g, '-')
        categoryRecord = await tx.category.create({
          data: {
            name: data.category,
            slug: slug
          }
        })
      }
      categoryId = categoryRecord.id
    }

    // Delete existing sessions if new ones provided
    if (data.sessions && data.sessions.length > 0) {
      await tx.sessionContent.deleteMany({
        where: {
          session: {
            courseId: courseId
          }
        }
      })
      
      await tx.courseSession.deleteMany({
        where: {
          courseId: courseId
        }
      })
    }

    // Update course
    const course = await tx.course.update({
      where: { id: courseId },
      data: {
        title: data.title,
        description: data.description,
        shortDesc: data.shortDesc || data.description?.substring(0, 150),
        thumbnail: data.thumbnail,
        trailerUrl: data.trailerUrl,
        price: data.price ? parseFloat(data.price) : undefined,
        level: data.level?.toUpperCase(),
        freeContentLimit: data.freeContentLimit ? parseInt(data.freeContentLimit) : undefined,
        categoryId: categoryId,
        status: 'PENDING_REVIEW',
        approvalStatus: 'PENDING',
        totalSessions: data.sessions?.length,
        totalDuration: data.sessions?.reduce((total: number, session: any) => {
          return total + (session.duration || 0)
        }, 0),
        updatedAt: new Date()
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    })

    // Create new sessions
    if (data.sessions && data.sessions.length > 0) {
      for (const [index, session] of data.sessions.entries()) {
        const createdSession = await tx.courseSession.create({
          data: {
            courseId: course.id,
            title: session.title,
            description: session.description,
            order: session.order || index + 1,
            isFree: session.isFree || index < (data.freeContentLimit || 3),
            duration: session.duration
          }
        })

        // Create session contents
        if (session.contents && session.contents.length > 0) {
          await tx.sessionContent.createMany({
            data: session.contents.map((content: any, contentIndex: number) => ({
              sessionId: createdSession.id,
              type: content.type?.toUpperCase() || 'VIDEO',
              title: content.title,
              description: content.description,
              youtubeUrl: content.youtubeUrl,
              zoomLink: content.zoomLink,
              quizData: content.quizData,
              exerciseContent: content.exerciseContent,
              materialUrl: content.materialUrl,
              order: content.order || contentIndex + 1,
              duration: content.duration,
              isFree: content.isFree || false
            }))
          })
        }
      }
    }

    return course
  })
}

/**
 * Create new course for submission
 */
async function createCourseForSubmission(data: any, instructorId: string) {
  // Handle category
  let categoryRecord = await prisma.category.findFirst({
    where: {
      OR: [
        { id: data.category },
        { slug: data.category },
        { name: data.category }
      ]
    }
  })

  if (!categoryRecord) {
    const slug = data.category.toLowerCase().replace(/\s+/g, '-')
    categoryRecord = await prisma.category.create({
      data: {
        name: data.category,
        slug: slug
      }
    })
  }

  // Generate unique slug
  const baseSlug = data.title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  let slug = baseSlug
  let counter = 1
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  // Create course with PENDING_REVIEW status
  const course = await prisma.course.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      shortDesc: data.shortDesc || data.description.substring(0, 150),
      thumbnail: data.thumbnail,
      trailerUrl: data.trailerUrl,
      price: parseFloat(data.price) || 0,
      status: 'PENDING_REVIEW',
      level: data.level?.toUpperCase() || 'BEGINNER',
      freeContentLimit: parseInt(data.freeContentLimit) || 3,
      approvalStatus: 'PENDING',
      instructorId: instructorId,
      categoryId: categoryRecord.id,
      totalSessions: data.sessions?.length || 0,
      totalDuration: data.sessions?.reduce((total: number, session: any) => {
        return total + (session.duration || 0)
      }, 0) || 0,
      // Create sessions
      sessions: data.sessions ? {
        create: data.sessions.map((session: any, index: number) => ({
          title: session.title,
          description: session.description,
          order: session.order || index + 1,
          isFree: session.isFree || index < (data.freeContentLimit || 3),
          duration: session.duration,
          // Create session contents
          contents: session.contents ? {
            create: session.contents.map((content: any, contentIndex: number) => ({
              type: content.type?.toUpperCase() || 'VIDEO',
              title: content.title,
              description: content.description,
              youtubeUrl: content.youtubeUrl,
              zoomLink: content.zoomLink,
              quizData: content.quizData,
              exerciseContent: content.exerciseContent,
              materialUrl: content.materialUrl,
              order: content.order || contentIndex + 1,
              duration: content.duration,
              isFree: content.isFree || false
            }))
          } : undefined
        }))
      } : undefined
    },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      category: true
    }
  })

  return course
}