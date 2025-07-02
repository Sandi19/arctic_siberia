// File: src/app/api/courses/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/courses
 * List courses dengan filtering dan pagination
 * Public untuk approved courses, private untuk instructor's own courses
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const instructorOnly = searchParams.get('instructor_only') === 'true'

    // Get current user (optional untuk public courses)
    const user = await getCurrentUserFromRequest(request)

    // Build where clause
    let whereClause: any = {}

    // Jika instructor_only=true, hanya tampilkan courses milik instructor
    if (instructorOnly && user?.role === 'INSTRUCTOR') {
      whereClause.instructorId = user.id
    } else if (!user || user.role === 'STUDENT') {
      // Public courses - hanya yang APPROVED dan PUBLISHED
      whereClause.status = 'PUBLISHED'
      whereClause.approvalStatus = 'APPROVED'
    } else if (user.role === 'ADMIN') {
      // Admin bisa lihat semua courses
      // Tidak ada filter tambahan
    }

    // Apply filters
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase()
    }
    if (category) {
      whereClause.category = {
        slug: category
      }
    }
    if (level) {
      whereClause.level = level.toUpperCase()
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Fetch courses with relations
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          category: true,
          sessions: {
            select: {
              id: true,
              title: true,
              order: true,
              isFree: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              sessions: true
            }
          }
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.course.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      courses,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      meta: {
        userRole: user?.role || 'GUEST',
        filters: {
          status,
          category,
          level,
          instructorOnly
        }
      }
    })

  } catch (error) {
    console.error('❌ GET /api/courses error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch courses',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses
 * Create new course - INSTRUCTOR only
 * Status: DRAFT (auto-save), PENDING_REVIEW (submit for review)
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

    // 👨‍🏫 Only INSTRUCTOR and ADMIN can create courses
    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Only instructors can create courses' },
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

    // ✅ Validation
    if (!title || !description || !category) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Title, description, and category are required',
          errors: {
            title: !title ? 'Title is required' : null,
            description: !description ? 'Description is required' : null,
            category: !category ? 'Category is required' : null
          }
        },
        { status: 400 }
      )
    }

    // Find or create category
    let categoryRecord = await prisma.category.findFirst({
      where: {
        OR: [
          { id: category },
          { slug: category },
          { name: category }
        ]
      }
    })

    if (!categoryRecord) {
      // Create category if not exists (untuk development)
      const slug = category.toLowerCase().replace(/\s+/g, '-')
      categoryRecord = await prisma.category.create({
        data: {
          name: category,
          slug: slug
        }
      })
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase()
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

    // Determine status based on user role and submitForReview flag
    let status = 'DRAFT'
    let approvalStatus = 'PENDING'

    if (submitForReview) {
      status = 'PENDING_REVIEW'
    } else if (user.role === 'ADMIN') {
      // Admin courses auto-approved
      status = 'APPROVED'
      approvalStatus = 'APPROVED'
    }

    // Create course with sessions
    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        shortDesc: shortDesc || description.substring(0, 150),
        thumbnail,
        trailerUrl,
        price: parseFloat(price) || 0,
        status,
        level: level?.toUpperCase() || 'BEGINNER',
        freeContentLimit: parseInt(freeContentLimit) || 3,
        approvalStatus,
        instructorId: user.id,
        categoryId: categoryRecord.id,
        totalSessions: sessions.length,
        // Calculate total duration from sessions
        totalDuration: sessions.reduce((total: number, session: any) => {
          return total + (session.duration || 0)
        }, 0),
        // Create sessions if provided
        sessions: sessions.length > 0 ? {
          create: sessions.map((session: any, index: number) => ({
            title: session.title,
            description: session.description,
            order: session.order || index + 1,
            isFree: session.isFree || index < freeContentLimit,
            duration: session.duration,
            // Create session contents if provided
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
        category: true,
        sessions: {
          include: {
            contents: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    // Log activity
    console.log(`✅ Course created: ${course.title} by ${user.name} (${user.role}) - Status: ${status}`)

    return NextResponse.json({
      success: true,
      message: submitForReview 
        ? 'Course submitted for review successfully' 
        : 'Course saved as draft successfully',
      course,
      actions: {
        canEdit: true,
        canSubmitForReview: status === 'DRAFT',
        canPublish: user.role === 'ADMIN' && status === 'APPROVED'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('❌ POST /api/courses error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create course',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}