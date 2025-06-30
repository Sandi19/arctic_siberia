// File: prisma/seed.ts

import { PrismaClient, UserRole, CourseStatus, CourseApprovalStatus, DifficultyLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive seed process...')
  
  // Hash password yang sama untuk semua user
  const hashedPassword = await bcrypt.hash('password123', 10)

  // 👑 ADMIN USERS (5 users)
  console.log('👑 Creating ADMIN users...')
  const admins = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin1@arcticsiberia.com' },
      update: {},
      create: {
        email: 'admin1@arcticsiberia.com',
        name: 'Vladimir Petrov',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin2@arcticsiberia.com' },
      update: {},
      create: {
        email: 'admin2@arcticsiberia.com',
        name: 'Elena Kozlova',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin3@arcticsiberia.com' },
      update: {},
      create: {
        email: 'admin3@arcticsiberia.com',
        name: 'Mikhail Volkov',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin4@arcticsiberia.com' },
      update: {},
      create: {
        email: 'admin4@arcticsiberia.com',
        name: 'Olga Smirnova',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.upsert({
      where: { email: 'admin5@arcticsiberia.com' },
      update: {},
      create: {
        email: 'admin5@arcticsiberia.com',
        name: 'Dmitri Ivanov',
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    }),
  ])

  // 👨‍🏫 INSTRUCTOR USERS (5 users)
  console.log('👨‍🏫 Creating INSTRUCTOR users...')
  const instructors = await Promise.all([
    prisma.user.upsert({
      where: { email: 'instructor1@arcticsiberia.com' },
      update: {},
      create: {
        email: 'instructor1@arcticsiberia.com',
        name: 'Dr. Dmitri Volkov',
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
      },
    }),
    prisma.user.upsert({
      where: { email: 'instructor2@arcticsiberia.com' },
      update: {},
      create: {
        email: 'instructor2@arcticsiberia.com',
        name: 'Prof. Anna Smirnova',
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
      },
    }),
    prisma.user.upsert({
      where: { email: 'instructor3@arcticsiberia.com' },
      update: {},
      create: {
        email: 'instructor3@arcticsiberia.com',
        name: 'Dr. Ivan Petrov',
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
      },
    }),
    prisma.user.upsert({
      where: { email: 'instructor4@arcticsiberia.com' },
      update: {},
      create: {
        email: 'instructor4@arcticsiberia.com',
        name: 'Prof. Elena Kozlova',
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
      },
    }),
    prisma.user.upsert({
      where: { email: 'instructor5@arcticsiberia.com' },
      update: {},
      create: {
        email: 'instructor5@arcticsiberia.com',
        name: 'Dr. Mikhail Romanov',
        password: hashedPassword,
        role: UserRole.INSTRUCTOR,
      },
    }),
  ])

  // 🎓 STUDENT USERS (5 users)
  console.log('🎓 Creating STUDENT users...')
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'student1@arcticsiberia.com' },
      update: {},
      create: {
        email: 'student1@arcticsiberia.com',
        name: 'Andi Wijaya',
        password: hashedPassword,
        role: UserRole.STUDENT,
      },
    }),
    prisma.user.upsert({
      where: { email: 'student2@arcticsiberia.com' },
      update: {},
      create: {
        email: 'student2@arcticsiberia.com',
        name: 'Sari Dewi',
        password: hashedPassword,
        role: UserRole.STUDENT,
      },
    }),
    prisma.user.upsert({
      where: { email: 'student3@arcticsiberia.com' },
      update: {},
      create: {
        email: 'student3@arcticsiberia.com',
        name: 'Budi Santoso',
        password: hashedPassword,
        role: UserRole.STUDENT,
      },
    }),
    prisma.user.upsert({
      where: { email: 'student4@arcticsiberia.com' },
      update: {},
      create: {
        email: 'student4@arcticsiberia.com',
        name: 'Maya Putri',
        password: hashedPassword,
        role: UserRole.STUDENT,
      },
    }),
    prisma.user.upsert({
      where: { email: 'student5@arcticsiberia.com' },
      update: {},
      create: {
        email: 'student5@arcticsiberia.com',
        name: 'Reza Pratama',
        password: hashedPassword,
        role: UserRole.STUDENT,
      },
    }),
  ])

  // 📚 Buat kategori
  console.log('📚 Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'basic-russian' },
      update: {},
      create: {
        name: 'Bahasa Rusia Dasar',
        slug: 'basic-russian',
        description: 'Pelajari dasar-dasar bahasa Rusia dari nol',
        icon: '🇷🇺',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'intermediate-russian' },
      update: {},
      create: {
        name: 'Bahasa Rusia Menengah',
        slug: 'intermediate-russian',
        description: 'Tingkatkan kemampuan bahasa Rusia Anda',
        icon: '📚',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business-russian' },
      update: {},
      create: {
        name: 'Bahasa Rusia Bisnis',
        slug: 'business-russian',
        description: 'Bahasa Rusia untuk keperluan bisnis dan profesional',
        icon: '💼',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'conversation-russian' },
      update: {},
      create: {
        name: 'Percakapan Bahasa Rusia',
        slug: 'conversation-russian',
        description: 'Latihan percakapan dan speaking bahasa Rusia',
        icon: '💬',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'culture-russian' },
      update: {},
      create: {
        name: 'Budaya dan Tradisi Rusia',
        slug: 'culture-russian',
        description: 'Pelajari budaya, sejarah, dan tradisi Rusia',
        icon: '🏛️',
      },
    }),
  ])

  // 🎯 Buat sample courses dari berbagai instructor dengan status berbeda
  console.log('🎯 Creating sample courses...')
  
  // ✅ APPROVED Courses
  const approvedCourse1 = await prisma.course.upsert({
    where: { slug: 'russian-alphabet-basics' },
    update: {},
    create: {
      title: 'Alfabet Rusia untuk Pemula',
      slug: 'russian-alphabet-basics',
      description: 'Pelajari alfabet Cyrillic dari dasar hingga bisa membaca kata-kata sederhana dalam bahasa Rusia. Kursus ini cocok untuk pemula yang belum pernah belajar bahasa Rusia sama sekali.',
      shortDesc: 'Menguasai alfabet Cyrillic dengan mudah dan menyenangkan',
      price: 299000,
      originalPrice: 399000,
      status: CourseStatus.APPROVED,
      approvalStatus: CourseApprovalStatus.APPROVED,
      level: DifficultyLevel.BEGINNER,
      duration: 1200, // 20 jam
      isPublished: true,
      isFeatured: true,
      instructorId: instructors[0].id, // Dr. Dmitri Volkov
      categoryId: categories[0].id,
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      approvedBy: admins[0].id,
    },
  })

  const approvedCourse2 = await prisma.course.upsert({
    where: { slug: 'russian-numbers-time' },
    update: {},
    create: {
      title: 'Angka dan Waktu dalam Bahasa Rusia',
      slug: 'russian-numbers-time',
      description: 'Pelajari cara menyebutkan angka, waktu, tanggal, dan perhitungan dalam bahasa Rusia dengan benar.',
      shortDesc: 'Menguasai angka dan waktu dalam bahasa Rusia',
      price: 199000,
      originalPrice: 299000,
      status: CourseStatus.APPROVED,
      approvalStatus: CourseApprovalStatus.APPROVED,
      level: DifficultyLevel.BEGINNER,
      duration: 800, // 13 jam
      isPublished: true,
      instructorId: instructors[1].id, // Prof. Anna Smirnova
      categoryId: categories[0].id,
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      approvedBy: admins[1].id,
    },
  })

  // ⏳ PENDING Courses (menunggu approval)
  const pendingCourse1 = await prisma.course.upsert({
    where: { slug: 'business-russian-intensive' },
    update: {},
    create: {
      title: 'Bahasa Rusia untuk Bisnis Internasional',
      slug: 'business-russian-intensive',
      description: 'Kursus intensif bahasa Rusia untuk keperluan bisnis, negosiasi, dan komunikasi profesional di lingkungan kerja internasional.',
      shortDesc: 'Bahasa Rusia profesional untuk dunia bisnis',
      price: 799000,
      originalPrice: 999000,
      status: CourseStatus.PENDING,
      approvalStatus: CourseApprovalStatus.PENDING,
      level: DifficultyLevel.INTERMEDIATE,
      duration: 2400, // 40 jam
      isPublished: false,
      instructorId: instructors[2].id, // Dr. Ivan Petrov
      categoryId: categories[2].id,
    },
  })

  const pendingCourse2 = await prisma.course.upsert({
    where: { slug: 'russian-culture-history' },
    update: {},
    create: {
      title: 'Budaya dan Sejarah Rusia',
      slug: 'russian-culture-history',
      description: 'Jelajahi kekayaan budaya, seni, sastra, dan sejarah Rusia dari zaman Tsar hingga era modern.',
      shortDesc: 'Memahami budaya dan sejarah Rusia',
      price: 449000,
      status: CourseStatus.PENDING,
      approvalStatus: CourseApprovalStatus.PENDING,
      level: DifficultyLevel.INTERMEDIATE,
      duration: 1800, // 30 jam
      isPublished: false,
      instructorId: instructors[3].id, // Prof. Elena Kozlova
      categoryId: categories[4].id,
    },
  })

  // ❌ REJECTED Course
  const rejectedCourse = await prisma.course.upsert({
    where: { slug: 'russian-conversation-basic' },
    update: {},
    create: {
      title: 'Percakapan Bahasa Rusia Sehari-hari',
      slug: 'russian-conversation-basic',
      description: 'Belajar percakapan bahasa Rusia untuk kebutuhan sehari-hari seperti berbelanja, bertanya arah, dan komunikasi sosial.',
      shortDesc: 'Percakapan Rusia untuk kehidupan sehari-hari',
      price: 399000,
      status: CourseStatus.REJECTED,
      approvalStatus: CourseApprovalStatus.REJECTED,
      level: DifficultyLevel.BEGINNER,
      duration: 1500, // 25 jam
      isPublished: false,
      instructorId: instructors[4].id, // Dr. Mikhail Romanov
      categoryId: categories[3].id,
      rejectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      rejectedBy: admins[2].id,
      rejectionReason: 'Kualitas audio video kurang baik dan materi perlu disusun ulang dengan struktur yang lebih sistematis. Mohon perbaiki kualitas recording dan tambahkan subtitle.',
    },
  })

  // 📝 DRAFT Course
  const draftCourse = await prisma.course.upsert({
    where: { slug: 'advanced-russian-grammar' },
    update: {},
    create: {
      title: 'Tata Bahasa Rusia Lanjutan',
      slug: 'advanced-russian-grammar',
      description: 'Mendalami tata bahasa Rusia tingkat lanjut termasuk kasus, aspek verbal, dan struktur kalimat kompleks.',
      shortDesc: 'Tata bahasa Rusia untuk level advanced',
      price: 699000,
      status: CourseStatus.DRAFT,
      approvalStatus: CourseApprovalStatus.PENDING,
      level: DifficultyLevel.ADVANCED,
      duration: 3600, // 60 jam
      isPublished: false,
      instructorId: instructors[0].id, // Dr. Dmitri Volkov
      categoryId: categories[1].id,
    },
  })

  // 📖 Buat lessons untuk approved courses
  console.log('📖 Creating lessons...')
  const lessons = await Promise.all([
    // Lessons untuk course 1
    prisma.lesson.create({
      data: {
        title: 'Pengenalan Alfabet Cyrillic',
        slug: 'pengenalan-alfabet-cyrillic',
        description: 'Mengenal sejarah dan bentuk huruf-huruf dalam alfabet Cyrillic',
        content: 'Alfabet Cyrillic adalah sistem penulisan yang digunakan untuk bahasa Rusia dan beberapa bahasa Slavia lainnya...',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 900, // 15 menit
        order: 1,
        isPublished: true,
        courseId: approvedCourse1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Huruf Vokal dalam Bahasa Rusia',
        slug: 'huruf-vokal-bahasa-rusia',
        description: 'Pelajari 10 huruf vokal dalam alfabet Rusia',
        content: 'Bahasa Rusia memiliki 10 huruf vokal: А, Е, Ё, И, О, У, Ы, Э, Ю, Я...',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 1200, // 20 menit
        order: 2,
        isPublished: true,
        courseId: approvedCourse1.id,
      },
    }),
    // Lessons untuk course 2
    prisma.lesson.create({
      data: {
        title: 'Angka 1-20 dalam Bahasa Rusia',
        slug: 'angka-1-20-bahasa-rusia',
        description: 'Belajar menyebutkan angka 1 sampai 20 dalam bahasa Rusia',
        content: 'Angka dalam bahasa Rusia: один (1), два (2), три (3)...',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 800, // 13 menit
        order: 1,
        isPublished: true,
        courseId: approvedCourse2.id,
      },
    }),
  ])

  // 🎓 Enroll students ke approved courses
  console.log('🎓 Creating enrollments...')
  await Promise.all([
    // Student 1 enrolled in both courses
    prisma.enrollment.create({
      data: {
        userId: students[0].id,
        courseId: approvedCourse1.id,
        progress: 75.0,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: students[0].id,
        courseId: approvedCourse2.id,
        progress: 45.0,
      },
    }),
    // Student 2 enrolled in course 1
    prisma.enrollment.create({
      data: {
        userId: students[1].id,
        courseId: approvedCourse1.id,
        progress: 30.0,
      },
    }),
    // Student 3 enrolled in course 1 (completed)
    prisma.enrollment.create({
      data: {
        userId: students[2].id,
        courseId: approvedCourse1.id,
        progress: 100.0,
        isCompleted: true,
        completedAt: new Date(),
        certificateIssued: true,
      },
    }),
    // Student 4 enrolled in course 2
    prisma.enrollment.create({
      data: {
        userId: students[3].id,
        courseId: approvedCourse2.id,
        progress: 60.0,
      },
    }),
    // Student 5 enrolled in both courses
    prisma.enrollment.create({
      data: {
        userId: students[4].id,
        courseId: approvedCourse1.id,
        progress: 85.0,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: students[4].id,
        courseId: approvedCourse2.id,
        progress: 20.0,
      },
    }),
  ])

  // 🏆 Buat certificate untuk student yang sudah selesai
  console.log('🏆 Creating certificates...')
  await prisma.certificate.create({
    data: {
      userId: students[2].id, // Budi Santoso
      courseId: approvedCourse1.id,
      certificateNumber: 'CERT-AS-001-2024',
      issuedAt: new Date(),
    },
  })

  // ⭐ Buat sample reviews
  console.log('⭐ Creating reviews...')
  await Promise.all([
    prisma.review.create({
      data: {
        userId: students[0].id,
        courseId: approvedCourse1.id,
        rating: 5,
        comment: 'Kursus yang sangat bagus! Penjelasan Dr. Dmitri mudah dipahami dan materi lengkap.',
      },
    }),
    prisma.review.create({
      data: {
        userId: students[1].id,
        courseId: approvedCourse1.id,
        rating: 4,
        comment: 'Materinya bagus, tapi mungkin bisa ditambahkan lebih banyak latihan praktik.',
      },
    }),
    prisma.review.create({
      data: {
        userId: students[2].id,
        courseId: approvedCourse1.id,
        rating: 5,
        comment: 'Excellent course! Finally understand Cyrillic alphabet properly. Terima kasih!',
      },
    }),
  ])

  console.log('')
  console.log('✅ COMPREHENSIVE SEED COMPLETED!')
  console.log('=' .repeat(60))
  console.log('')
  
  // USER ACCOUNTS SUMMARY
  console.log('👥 USER ACCOUNTS CREATED (Password: password123 untuk semua)')
  console.log('')
  
  console.log('👑 ADMIN ACCOUNTS (5 users):')
  console.log('   📧 admin1@arcticsiberia.com - Vladimir Petrov')
  console.log('   📧 admin2@arcticsiberia.com - Elena Kozlova')
  console.log('   📧 admin3@arcticsiberia.com - Mikhail Volkov')
  console.log('   📧 admin4@arcticsiberia.com - Olga Smirnova')
  console.log('   📧 admin5@arcticsiberia.com - Dmitri Ivanov')
  console.log('')
  
  console.log('👨‍🏫 INSTRUCTOR ACCOUNTS (5 users):')
  console.log('   📧 instructor1@arcticsiberia.com - Dr. Dmitri Volkov')
  console.log('   📧 instructor2@arcticsiberia.com - Prof. Anna Smirnova')
  console.log('   📧 instructor3@arcticsiberia.com - Dr. Ivan Petrov')
  console.log('   📧 instructor4@arcticsiberia.com - Prof. Elena Kozlova')
  console.log('   📧 instructor5@arcticsiberia.com - Dr. Mikhail Romanov')
  console.log('')
  
  console.log('🎓 STUDENT ACCOUNTS (5 users):')
  console.log('   📧 student1@arcticsiberia.com - Andi Wijaya')
  console.log('   📧 student2@arcticsiberia.com - Sari Dewi')
  console.log('   📧 student3@arcticsiberia.com - Budi Santoso')
  console.log('   📧 student4@arcticsiberia.com - Maya Putri')
  console.log('   📧 student5@arcticsiberia.com - Reza Pratama')
  console.log('')
  
  console.log('📚 COURSE STATUS DEMO:')
  console.log('   ✅ APPROVED: "Alfabet Rusia untuk Pemula" & "Angka dan Waktu"')
  console.log('   ⏳ PENDING: "Bahasa Rusia Bisnis" & "Budaya dan Sejarah"')
  console.log('   ❌ REJECTED: "Percakapan Sehari-hari" (dengan feedback)')
  console.log('   📝 DRAFT: "Tata Bahasa Lanjutan"')
  console.log('')
  
  console.log('🎯 TESTING GUIDE:')
  console.log('   👑 Login as ADMIN to approve/reject pending courses')
  console.log('   👨‍🏫 Login as INSTRUCTOR to create new courses (will be PENDING)')
  console.log('   🎓 Login as STUDENT to access APPROVED courses and see progress')
  console.log('')
  console.log('🚀 Ready to test the 3-role system!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })