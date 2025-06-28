import { PrismaClient, UserRole, CourseStatus, DifficultyLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Buat admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@arcticsiberia.com' },
    update: {},
    create: {
      email: 'admin@arcticsiberia.com',
      name: 'Admin Arctic Siberia',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  // Buat instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@arcticsiberia.com' },
    update: {},
    create: {
      email: 'instructor@arcticsiberia.com',
      name: 'Dmitri Volkov',
      password: hashedPassword,
      role: UserRole.INSTRUCTOR,
    },
  })

  // Buat sample student
  const student = await prisma.user.upsert({
    where: { email: 'student@arcticsiberia.com' },
    update: {},
    create: {
      email: 'student@arcticsiberia.com',
      name: 'Andi Wijaya',
      password: hashedPassword,
      role: UserRole.STUDENT,
    },
  })

  // Buat kategori
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
  ])

  // Buat sample course
  const course1 = await prisma.course.upsert({
    where: { slug: 'russian-alphabet-basics' },
    update: {},
    create: {
      title: 'Alfabet Rusia untuk Pemula',
      slug: 'russian-alphabet-basics',
      description: 'Pelajari alfabet Cyrillic dari dasar hingga bisa membaca kata-kata sederhana dalam bahasa Rusia. Kursus ini cocok untuk pemula yang belum pernah belajar bahasa Rusia sama sekali.',
      shortDesc: 'Belajar alfabet Cyrillic dari nol hingga bisa membaca',
      price: 299000,
      originalPrice: 399000,
      status: CourseStatus.PUBLISHED,
      level: DifficultyLevel.BEGINNER,
      duration: 180, // 3 jam
      isPublished: true,
      isFeatured: true,
      instructorId: instructor.id,
      categoryId: categories[0].id,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { slug: 'everyday-russian-conversation' },
    update: {},
    create: {
      title: 'Percakapan Sehari-hari dalam Bahasa Rusia',
      slug: 'everyday-russian-conversation',
      description: 'Kuasai percakapan dasar bahasa Rusia untuk situasi sehari-hari seperti berbelanja, memesan makanan, dan berkenalan dengan orang baru.',
      shortDesc: 'Percakapan praktis untuk kehidupan sehari-hari',
      price: 499000,
      originalPrice: 699000,
      status: CourseStatus.PUBLISHED,
      level: DifficultyLevel.BEGINNER,
      duration: 360, // 6 jam
      isPublished: true,
      isFeatured: true,
      instructorId: instructor.id,
      categoryId: categories[0].id,
    },
  })

  // Buat lessons untuk course pertama
  const lessons1 = await Promise.all([
    prisma.lesson.create({
      data: {
        title: 'Pengenalan Alfabet Cyrillic',
        slug: 'pengenalan-alfabet-cyrillic',
        description: 'Pelajari sejarah dan dasar-dasar alfabet Cyrillic',
        content: 'Alfabet Cyrillic adalah sistem penulisan yang digunakan untuk bahasa Rusia dan beberapa bahasa Slavia lainnya...',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 900, // 15 menit
        order: 1,
        isPublished: true,
        isFree: true,
        courseId: course1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Huruf Vokal dalam Bahasa Rusia',
        slug: 'huruf-vokal-rusia',
        description: 'Pelajari 10 huruf vokal dalam alfabet Rusia',
        content: 'Bahasa Rusia memiliki 10 huruf vokal: А, Е, Ё, И, О, У, Ы, Э, Ю, Я...',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 1200, // 20 menit
        order: 2,
        isPublished: true,
        courseId: course1.id,
      },
    }),
    prisma.lesson.create({
      data: {
        title: 'Huruf Konsonan Dasar',
        slug: 'huruf-konsonan-dasar',
        description: 'Mengenal huruf konsonan yang sering digunakan',
        content: 'Huruf konsonan dasar yang perlu dikuasai terlebih dahulu...',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        duration: 1500, // 25 menit
        order: 3,
        isPublished: true,
        courseId: course1.id,
      },
    }),
  ])

  // Buat sample materials
  await prisma.material.createMany({
    data: [
      {
        title: 'Tabel Alfabet Cyrillic',
        filename: 'cyrillic-alphabet-table.pdf',
        fileUrl: '/sample-pdf/contoh.pdf',
        fileSize: 245760,
        fileType: 'pdf',
        lessonId: lessons1[0].id,
      },
      {
        title: 'Audio Pronunciation Guide',
        filename: 'vowels-pronunciation.mp3',
        fileUrl: '/audio/vowels-pronunciation.mp3',
        fileSize: 1024000,
        fileType: 'mp3',
        lessonId: lessons1[1].id,
      },
    ],
  })

  // Enroll student ke course
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      progress: 33.33,
    },
  })

  // Buat sample progress
  await prisma.progress.create({
    data: {
      userId: student.id,
      lessonId: lessons1[0].id,
      isCompleted: true,
      completedAt: new Date(),
      watchedDuration: 900,
    },
  })

  // Buat sample payment
  await prisma.payment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      amount: 299000,
      currency: 'IDR',
      status: 'COMPLETED',
      paymentMethod: 'transfer',
      transactionId: 'TXN-001-2024',
      paidAt: new Date(),
    },
  })

  // Buat sample review
  await prisma.review.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      rating: 5,
      comment: 'Kursus yang sangat bagus! Penjelasan mudah dipahami dan materi lengkap.',
    },
  })

  console.log('Seed data berhasil dibuat!')
  console.log('Login credentials:')
  console.log('Admin: admin@arcticsiberia.com / password123')
  console.log('Instructor: instructor@arcticsiberia.com / password123')
  console.log('Student: student@arcticsiberia.com / password123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })