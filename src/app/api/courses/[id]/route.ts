// File: src/app/api/courses/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/courses/[id]
 * Get single course by ID dengan access control
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const user = await getCurrentUserFromRequest(request)

    // Build include object based on user role
    const includeObj: any = {
      instructor: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true
        }
      },
      category: true,
      _count: {
        select: {
          enrollments: true,
          reviews: true,
          sessions: true
        }
      }
    }

    // Include sessions based on access level
    if (user?.role === 'ADMIN' || 
        (user?.role === 'INSTRUCTOR' && await isOwner(courseId, user.id))) {
      // Full access for admin and course owner
      includeObj.sessions = {
        include: {
          contents: true,
          _count: {
            select: {
              progress: true
            }
          }
        },
        orderBy: {
          order: 'asc'
        }
      }
    } else {
      // Limited access for students and public
      includeObj.sessions = {
        where: {
          isFree: true
        },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          isFree: true,
          duration: true
        },
        orderBy: {
          order: 'asc'
        }
      }
    }

    // Find course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: includeObj
    })

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // Access control for non-public courses
    if (course.status !== 'PUBLISHED' || course.approvalStatus !== 'APPROVED') {
      // Only owner, admin, or enrolled students can access
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        )
      }

      if (user.role !== 'ADMIN' && course.instructorId !== user.id) {
        // Check if student is enrolled
        if (user.role === 'STUDENT') {
          const enrollment = await prisma.enrollment.findFirst({
            where: {
              userId: user.id,
              courseId: course.id
            }
          })
          
          if (!enrollment) {
            return NextResponse.json(
              { success: false, message: 'Access denied' },
              { status: 403 }
            )
          }
        } else {
          return NextResponse.json(
            { success: false, message: 'Access denied' },
            { status: 403 }
          )
        }
      }
    }

    // Add user-specific metadata
    let userMeta = null
    if (user) {
      if (user.role === 'STUDENT') {
        // Get enrollment info
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            userId: user.id,
            courseId: course.id
          },
          include: {
            sessionProgress: true
          }
        })
        
        userMeta = {
          isEnrolled: !!enrollment,
          progress: enrollment?.progress || 0,
          completedSessions: enrollment?.sessionProgress?.filter(sp => sp.isCompleted).length || 0
        }
      } else if (user.role === 'INSTRUCTOR') {
        userMeta = {
          isOwner: course.instructorId === user.id,
          canEdit: course.instructorId === user.id && ['DRAFT', 'REJECTED'].includes(course.status),
          canSubmitForReview: course.instructorId === user.id && course.status === 'DRAFT'
        }
      } else if (user.role === 'ADMIN') {
        userMeta = {
          canApprove: course.status === 'PENDING_REVIEW',
          canReject: course.status === 'PENDING_REVIEW',
          canPublish: course.approvalStatus === 'APPROVED' && course.status !== 'PUBLISHED'
        }
      }
    }

    return NextResponse.json({
      success: true,
      course,
      userMeta,
      permissions: {
        canView: true,
        canEdit: userMeta?.isOwner || user?.role === 'ADMIN',
        canEnroll: !userMeta?.isEnrolled && course.status === 'PUBLISHED'
      }
    })

  } catch (error) {
    console.error('❌ GET /api/courses/[id] error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch course',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/courses/[id]
 * Update course - Owner or Admin only
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const user = await getCurrentUserFromRequest(request)

    // Authentication required
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if course exists and get current data
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

    // Authorization check
    if (user.role !== 'ADMIN' && existingCourse.instructorId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'You can only edit your own courses' },
        { status: 403 }
      )
    }

    // Instructors can only edit DRAFT or REJECTED courses
    if (user.role === 'INSTRUCTOR' && 
        !['DRAFT', 'REJECTED'].includes(existingCourse.status)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'You can only edit courses in DRAFT or REJECTED status' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      shortDesc,
      category,
      level,
      price,
      thumbnail,
      trailerUrl,
      freeContentLimit,
      sessions = [],
      submitForReview = false
    } = body

    // Handle category
    let categoryRecord = existingCourse.categoryId
    if (category && category !== existingCourse.categoryId) {
      const foundCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { id: category },
            { slug: category },
            { name: category }
          ]
        }
      })
      
      if (foundCategory) {
        categoryRecord = foundCategory.id
      } else {
        // Create new category
        const slug = category.toLowerCase().replace(/\s+/g, '-')
        const newCategory = await prisma.category.create({
          data: {
            name: category,
            slug: slug
          }
        })
        categoryRecord = newCategory.id
      }
    }

    // Determine new status
    let newStatus = existingCourse.status
    if (submitForReview && existingCourse.status === 'DRAFT') {
      newStatus = 'PENDING_REVIEW'
    } else if (existingCourse.status === 'REJECTED') {
      // Reset to DRAFT when editing rejected course
      newStatus = 'DRAFT'
    }

    // Update course using transaction for data integrity
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // Delete existing sessions and contents if sessions provided
      if (sessions.length > 0) {
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
          title: title || existingCourse.title,
          description: description || existingCourse.description,
          shortDesc: shortDesc || description?.substring(0, 150) || existingCourse.shortDesc,
          thumbnail,
          trailerUrl,
          price: price !== undefined ? parseFloat(price) : existingCourse.price,
          level: level?.toUpperCase() || existingCourse.level,
          freeContentLimit: freeContentLimit !== undefined ? parseInt(freeContentLimit) : existingCourse.freeContentLimit,
          status: newStatus,
          categoryId: categoryRecord,
          totalSessions: sessions.length || existingCourse.totalSessions,
          totalDuration: sessions.length > 0 
            ? sessions.reduce((total: number, session: any) => total + (session.duration || 0), 0)
            : existingCourse.totalDuration,
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

      // Create new sessions if provided
      if (sessions.length > 0) {
        for (const [index, session] of sessions.entries()) {
          const createdSession = await tx.courseSession.create({
            data: {
              courseId: course.id,
              title: session.title,
              description: session.description,
              order: session.order || index + 1,
              isFree: session.isFree || index < (freeContentLimit || 3),
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

    // Log activity
    console.log(`✅ Course updated: ${updatedCourse.title} by ${user.name} (${user.role}) - Status: ${newStatus}`)

    return NextResponse.json({
      success: true,
      message: submitForReview 
        ? 'Course submitted for review successfully' 
        : 'Course updated successfully',
      course: updatedCourse,
      actions: {
        canEdit: ['DRAFT', 'REJECTED'].includes(newStatus),
        canSubmitForReview: newStatus === 'DRAFT',
        statusChanged: newStatus !== existingCourse.status
      }
    })

  } catch (error) {
    console.error('❌ PUT /api/courses/[id] error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update course',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course - Owner or Admin only
 * Only DRAFT courses can be deleted
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const user = await getCurrentUserFromRequest(request)

    // Authentication required
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { success: false, message: 'Course not found' },
        { status: 404 }
      )
    }

    // Authorization check
    if (user.role !== 'ADMIN' && course.instructorId !== user.id) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own courses' },
        { status: 403 }
      )
    }

    // Business rule: Only DRAFT courses without enrollments can be deleted
    if (course.status !== 'DRAFT') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Only courses in DRAFT status can be deleted' 
        },
        { status: 403 }
      )
    }

    if (course._count.enrollments > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete course with existing enrollments' 
        },
        { status: 403 }
      )
    }

    // Delete course (cascade delete handles sessions and contents)
    await prisma.course.delete({
      where: { id: courseId }
    })

    // Log activity
    console.log(`🗑️ Course deleted: ${course.title} by ${user.name} (${user.role})`)

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    })

  } catch (error) {
    console.error('❌ DELETE /api/courses/[id] error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete course',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Helper function to check if user is course owner
async function isOwner(courseId: string, userId: string): Promise<boolean> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true }
  })
  return course?.instructorId === userId
}