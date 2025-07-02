// File: src/app/api/admin/courses/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/courses
 * Admin-only endpoint untuk mengelola semua courses
 * Supports filtering by status, category, instructor, etc.
 */
export async function GET(request: NextRequest) {
  try {
    // 🔐 Authentication required
    const user = await getCurrentUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // 👑 Admin only
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const instructor = searchParams.get('instructor')
    const level = searchParams.get('level')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sort') || 'newest'

    // Build where clause for admin queries
    let whereClause: any = {}

    // Status filter - Admin bisa lihat semua status
    if (status && status !== 'all') {
      if (status.toLowerCase() === 'pending_review') {
        // Handle both status variants for pending courses
        whereClause.OR = [
          { status: 'PENDING_REVIEW' },
          { 
            status: 'DRAFT',
            approvalStatus: 'PENDING' 
          }
        ]
      } else {
        whereClause.status = status.toUpperCase()
      }
    }

    // Category filter
    if (category && category !== 'all') {
      whereClause.category = {
        slug: category
      }
    }

    // Instructor filter
    if (instructor && instructor !== 'all') {
      whereClause.instructorId = instructor
    }

    // Level filter
    if (level && level !== 'all') {
      whereClause.level = level.toUpperCase()
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Sort options
    let orderBy: any = { createdAt: 'desc' } // default
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      case 'price_high':
        orderBy = { price: 'desc' }
        break
      case 'price_low':
        orderBy = { price: 'asc' }
        break
      case 'updated':
        orderBy = { updatedAt: 'desc' }
        break
    }

    // Fetch courses with full relations for admin
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          sessions: {
            select: {
              id: true,
              title: true,
              duration: true,
              isFree: true,
              order: true
            },
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              sessions: true,
              payments: true
            }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.course.count({ where: whereClause })
    ])

    // Add admin-specific metadata to each course
    const coursesWithMetadata = courses.map(course => ({
      ...course,
      adminMetadata: {
        canApprove: course.status === 'PENDING_REVIEW' || 
                   (course.status === 'DRAFT' && course.approvalStatus === 'PENDING'),
        canReject: course.status === 'PENDING_REVIEW' || 
                  (course.status === 'DRAFT' && course.approvalStatus === 'PENDING'),
        canPublish: course.approvalStatus === 'APPROVED' && course.status !== 'PUBLISHED',
        canEdit: true, // Admin can edit any course
        canDelete: course.status === 'DRAFT' || course.status === 'REJECTED',
        needsReview: course.status === 'PENDING_REVIEW' || 
                    (course.status === 'DRAFT' && course.approvalStatus === 'PENDING'),
        enrollmentCount: course._count.enrollments,
        revenueGenerated: 0 // TODO: Calculate from payments
      }
    }))

    // Generate summary stats for admin dashboard
    const stats = {
      total: totalCount,
      pending: courses.filter(c => 
        c.status === 'PENDING_REVIEW' || 
        (c.status === 'DRAFT' && c.approvalStatus === 'PENDING')
      ).length,
      approved: courses.filter(c => c.approvalStatus === 'APPROVED').length,
      rejected: courses.filter(c => c.approvalStatus === 'REJECTED').length,
      published: courses.filter(c => c.status === 'PUBLISHED').length,
      draft: courses.filter(c => c.status === 'DRAFT').length
    }

    return NextResponse.json({
      success: true,
      courses: coursesWithMetadata,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats,
      meta: {
        userRole: 'ADMIN',
        filters: {
          status,
          category,
          instructor,
          level,
          sortBy
        },
        availableStatuses: ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED'],
        requestedBy: user.id
      }
    })

  } catch (error) {
    console.error('❌ GET /api/admin/courses error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch admin courses',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}