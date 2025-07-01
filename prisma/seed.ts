// File: prisma/seed.ts
// Updated seed untuk Course Builder + Session Management System

import { PrismaClient, UserRole, CourseStatus, CourseApprovalStatus, DifficultyLevel, ContentType, EnrollmentType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Arctic Siberia Course Builder seed process...')
  
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vladimir',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mikhail',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olga',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitri',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrDmitri',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfAnna',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrIvan',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfElena',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrMikhail',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sari',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
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
        avatar: 'https://api.dicebear.com/7.x/avataaarts/svg?seed=Maya',
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
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Reza',
      },
    }),
  ])

  // 📚 Create categories sesuai Arctic Siberia specifications
  console.log('📚 Creating categories...')
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'russian-grammar' },
      update: {},
      create: {
        name: 'Russian Grammar',
        slug: 'russian-grammar',
        description: 'Master Russian grammar from basics to advanced',
        icon: '📚',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'russian-vocabulary' },
      update: {},
      create: {
        name: 'Russian Vocabulary',
        slug: 'russian-vocabulary',
        description: 'Build your Russian vocabulary systematically',
        icon: '📖',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'russian-conversation' },
      update: {},
      create: {
        name: 'Russian Conversation',
        slug: 'russian-conversation',
        description: 'Practice speaking and conversational Russian',
        icon: '💬',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'business-russian' },
      update: {},
      create: {
        name: 'Business Russian',
        slug: 'business-russian',
        description: 'Professional Russian for business context',
        icon: '💼',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'russian-culture' },
      update: {},
      create: {
        name: 'Russian Culture',
        slug: 'russian-culture',
        description: 'Learn about Russian culture and traditions',
        icon: '🏛️',
      },
    }),
  ])

  // 🎯 Create instructor revenue settings
  console.log('💰 Setting up instructor revenue shares...')
  await Promise.all([
    prisma.instructorSettings.upsert({
      where: { instructorId: instructors[0].id },
      update: {},
      create: {
        instructorId: instructors[0].id,
        revenueSharePercent: 70.0,
        setBy: admins[0].id,
        notes: 'Senior instructor - higher revenue share',
      },
    }),
    prisma.instructorSettings.upsert({
      where: { instructorId: instructors[1].id },
      update: {},
      create: {
        instructorId: instructors[1].id,
        revenueSharePercent: 65.0,
        setBy: admins[0].id,
        notes: 'Experienced instructor',
      },
    }),
    prisma.instructorSettings.upsert({
      where: { instructorId: instructors[2].id },
      update: {},
      create: {
        instructorId: instructors[2].id,
        revenueSharePercent: 60.0,
        setBy: admins[1].id,
        notes: 'New instructor - standard rate',
      },
    }),
  ])

  // 🎯 Create sample courses dengan berbagai status
  console.log('🎯 Creating sample courses with sessions...')
  
  // ✅ APPROVED Course 1 - Complete with sessions
  const approvedCourse1 = await prisma.course.create({
    data: {
      title: 'Russian Alphabet Fundamentals',
      slug: 'russian-alphabet-fundamentals',
      description: 'Master the Cyrillic alphabet from scratch. Learn to read and write Russian letters with confidence. Perfect for absolute beginners who want to build a solid foundation in Russian literacy.',
      shortDesc: 'Master Cyrillic alphabet with interactive lessons',
      price: 299000,
      originalPrice: 399000,
      status: CourseStatus.APPROVED,
      approvalStatus: CourseApprovalStatus.APPROVED,
      level: DifficultyLevel.BEGINNER,
      freeContentLimit: 3,
      totalSessions: 4,
      totalDuration: 240, // 4 hours
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isPublished: true,
      isFeatured: true,
      instructorId: instructors[0].id,
      categoryId: categories[0].id, // Russian Grammar
      approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      approvedBy: admins[0].id,
      sessions: {
        create: [
          {
            title: 'Introduction to Cyrillic',
            description: 'History and overview of the Russian alphabet',
            order: 0,
            isFree: true,
            duration: 45,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Welcome to Russian Alphabet',
                  description: 'Introduction video explaining what you will learn',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 15,
                  isFree: true,
                },
                {
                  type: ContentType.EXERCISE,
                  title: 'Alphabet Recognition Exercise',
                  description: 'Practice recognizing Cyrillic letters',
                  exerciseContent: 'Look at these letters and identify them: А, Б, В, Г, Д',
                  order: 1,
                  duration: 20,
                  isFree: true,
                },
                {
                  type: ContentType.QUIZ,
                  title: 'Introduction Quiz',
                  description: 'Test your basic knowledge',
                  quizData: {
                    questions: [
                      {
                        id: 'q1',
                        question: 'How many letters are in the Russian alphabet?',
                        type: 'multiple_choice',
                        options: ['26', '30', '33', '36'],
                        correctAnswer: 2,
                        explanation: 'The Russian alphabet has 33 letters.'
                      }
                    ]
                  },
                  order: 2,
                  duration: 10,
                  isFree: true,
                }
              ]
            }
          },
          {
            title: 'Vowel Letters',
            description: 'Learn the 10 Russian vowel letters',
            order: 1,
            isFree: true,
            duration: 60,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Russian Vowels Explained',
                  description: 'Detailed explanation of all vowel sounds',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 25,
                  isFree: true,
                },
                {
                  type: ContentType.EXERCISE,
                  title: 'Vowel Pronunciation Practice',
                  description: 'Practice pronouncing Russian vowels',
                  exerciseContent: 'Repeat after the audio: А, Е, Ё, И, О, У, Ы, Э, Ю, Я',
                  order: 1,
                  duration: 20,
                  isFree: true,
                },
                {
                  type: ContentType.QUIZ,
                  title: 'Vowel Recognition Quiz',
                  description: 'Test your vowel knowledge',
                  quizData: {
                    questions: [
                      {
                        id: 'q1',
                        question: 'Which of these is a Russian vowel?',
                        type: 'multiple_choice',
                        options: ['Б', 'А', 'Д', 'К'],
                        correctAnswer: 1,
                        explanation: 'А is a vowel letter in Russian.'
                      }
                    ]
                  },
                  order: 2,
                  duration: 15,
                  isFree: true,
                }
              ]
            }
          },
          {
            title: 'Consonant Letters',
            description: 'Master Russian consonants and their sounds',
            order: 2,
            isFree: false,
            duration: 75,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Russian Consonants Overview',
                  description: 'Complete guide to Russian consonant sounds',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 30,
                  isFree: false,
                },
                {
                  type: ContentType.EXERCISE,
                  title: 'Consonant Writing Practice',
                  description: 'Practice writing Russian consonants',
                  exerciseContent: 'Write these consonants 5 times each: Б, В, Г, Д, Ж, З',
                  order: 1,
                  duration: 25,
                  isFree: false,
                },
                {
                  type: ContentType.LIVE_SESSION,
                  title: 'Live Pronunciation Session',
                  description: 'Interactive session with instructor for pronunciation practice',
                  zoomLink: 'https://zoom.us/j/123456789',
                  order: 2,
                  duration: 20,
                  isFree: false,
                }
              ]
            }
          },
          {
            title: 'Reading Practice',
            description: 'Put it all together - read Russian words',
            order: 3,
            isFree: false,
            duration: 60,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Reading Russian Words',
                  description: 'Learn to read your first Russian words',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 25,
                  isFree: false,
                },
                {
                  type: ContentType.DOCUMENT,
                  title: 'Reading Practice Worksheet',
                  description: 'Downloadable practice materials',
                  materialUrl: 'https://example.com/russian-reading-practice.pdf',
                  order: 1,
                  duration: 25,
                  isFree: false,
                },
                {
                  type: ContentType.QUIZ,
                  title: 'Final Assessment',
                  description: 'Test your reading skills',
                  quizData: {
                    questions: [
                      {
                        id: 'q1',
                        question: 'What does "мама" mean?',
                        type: 'multiple_choice',
                        options: ['father', 'mother', 'sister', 'brother'],
                        correctAnswer: 1,
                        explanation: 'мама means mother in Russian.'
                      }
                    ]
                  },
                  order: 2,
                  duration: 10,
                  isFree: false,
                }
              ]
            }
          }
        ]
      }
    },
  })

  // ✅ APPROVED Course 2 - Russian Numbers
  const approvedCourse2 = await prisma.course.create({
    data: {
      title: 'Russian Numbers and Time',
      slug: 'russian-numbers-time',
      description: 'Learn to count, tell time, and work with dates in Russian. Essential skills for everyday communication and practical situations.',
      shortDesc: 'Master numbers, time, and dates in Russian',
      price: 199000,
      originalPrice: 299000,
      status: CourseStatus.APPROVED,
      approvalStatus: CourseApprovalStatus.APPROVED,
      level: DifficultyLevel.BEGINNER,
      freeContentLimit: 2,
      totalSessions: 3,
      totalDuration: 180, // 3 hours
      thumbnail: 'https://images.unsplash.com/photo-1495019899663-bd64d88b53a3?w=400',
      isPublished: true,
      instructorId: instructors[1].id,
      categoryId: categories[1].id, // Russian Vocabulary
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approvedBy: admins[1].id,
      sessions: {
        create: [
          {
            title: 'Numbers 1-20',
            description: 'Learn basic numbers in Russian',
            order: 0,
            isFree: true,
            duration: 45,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Russian Numbers 1-20',
                  description: 'Learn to count from 1 to 20 in Russian',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 20,
                  isFree: true,
                },
                {
                  type: ContentType.AUDIO,
                  title: 'Number Pronunciation Audio',
                  description: 'Audio practice for number pronunciation',
                  materialUrl: 'https://example.com/russian-numbers-audio.mp3',
                  order: 1,
                  duration: 15,
                  isFree: true,
                },
                {
                  type: ContentType.QUIZ,
                  title: 'Numbers Quiz',
                  description: 'Test your number knowledge',
                  quizData: {
                    questions: [
                      {
                        id: 'q1',
                        question: 'How do you say "5" in Russian?',
                        type: 'multiple_choice',
                        options: ['четыре', 'пять', 'шесть', 'семь'],
                        correctAnswer: 1,
                        explanation: 'пять means five in Russian.'
                      }
                    ]
                  },
                  order: 2,
                  duration: 10,
                  isFree: true,
                }
              ]
            }
          },
          {
            title: 'Large Numbers and Money',
            description: 'Handle bigger numbers and currency',
            order: 1,
            isFree: true,
            duration: 60,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Large Numbers in Russian',
                  description: 'Learn hundreds, thousands, and money',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 30,
                  isFree: true,
                },
                {
                  type: ContentType.EXERCISE,
                  title: 'Money Calculation Practice',
                  description: 'Practice with Russian currency',
                  exerciseContent: 'Convert these amounts: 100 рублей, 500 рублей, 1000 рублей',
                  order: 1,
                  duration: 20,
                  isFree: true,
                },
                {
                  type: ContentType.QUIZ,
                  title: 'Money and Numbers Quiz',
                  description: 'Test your understanding',
                  quizData: {
                    questions: [
                      {
                        id: 'q1',
                        question: 'What is Russian currency called?',
                        type: 'multiple_choice',
                        options: ['доллар', 'евро', 'рубль', 'йена'],
                        correctAnswer: 2,
                        explanation: 'Russian currency is called рубль (ruble).'
                      }
                    ]
                  },
                  order: 2,
                  duration: 10,
                  isFree: true,
                }
              ]
            }
          },
          {
            title: 'Time and Dates',
            description: 'Tell time and work with calendar dates',
            order: 2,
            isFree: false,
            duration: 75,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Telling Time in Russian',
                  description: 'Master Russian time expressions',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 35,
                  isFree: false,
                },
                {
                  type: ContentType.EXERCISE,
                  title: 'Time Practice Exercises',
                  description: 'Practice reading and saying time',
                  exerciseContent: 'What time is it? 15:30, 09:45, 12:00, 18:20',
                  order: 1,
                  duration: 25,
                  isFree: false,
                },
                {
                  type: ContentType.QUIZ,
                  title: 'Time and Date Final Quiz',
                  description: 'Comprehensive time assessment',
                  quizData: {
                    questions: [
                      {
                        id: 'q1',
                        question: 'How do you say "What time is it?" in Russian?',
                        type: 'multiple_choice',
                        options: ['Сколько времени?', 'Какая дата?', 'Когда это?', 'Где часы?'],
                        correctAnswer: 0,
                        explanation: 'Сколько времени? means "What time is it?" in Russian.'
                      }
                    ]
                  },
                  order: 2,
                  duration: 15,
                  isFree: false,
                }
              ]
            }
          }
        ]
      }
    },
  })

  // ⏳ PENDING Course - Business Russian
  const pendingCourse = await prisma.course.create({
    data: {
      title: 'Business Russian for Professionals',
      slug: 'business-russian-professionals',
      description: 'Comprehensive course for professionals who need Russian for business contexts. Learn formal communication, negotiations, and industry-specific vocabulary.',
      shortDesc: 'Professional Russian for business success',
      price: 799000,
      originalPrice: 999000,
      status: CourseStatus.PENDING_REVIEW,
      approvalStatus: CourseApprovalStatus.PENDING,
      level: DifficultyLevel.INTERMEDIATE,
      freeContentLimit: 2,
      totalSessions: 2,
      totalDuration: 120,
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      isPublished: false,
      instructorId: instructors[2].id,
      categoryId: categories[3].id, // Business Russian
      sessions: {
        create: [
          {
            title: 'Business Introductions',
            description: 'Professional introductions and networking',
            order: 0,
            isFree: true,
            duration: 60,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Professional Introductions',
                  description: 'How to introduce yourself professionally',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 30,
                  isFree: true,
                },
                {
                  type: ContentType.EXERCISE,
                  title: 'Business Card Exchange Practice',
                  description: 'Practice exchanging business cards',
                  exerciseContent: 'Role-play: Exchange business cards with a Russian colleague',
                  order: 1,
                  duration: 20,
                  isFree: true,
                },
                {
                  type: ContentType.QUIZ,
                  title: 'Business Etiquette Quiz',
                  description: 'Test your business etiquette knowledge',
                  quizData: {
                    questions: [
                      {
                        id: 'q1',
                        question: 'How do you say "Nice to meet you" formally in Russian?',
                        type: 'multiple_choice',
                        options: ['Привет', 'Очень приятно', 'Как дела', 'Пока'],
                        correctAnswer: 1,
                        explanation: 'Очень приятно is the formal way to say "Nice to meet you".'
                      }
                    ]
                  },
                  order: 2,
                  duration: 10,
                  isFree: true,
                }
              ]
            }
          },
          {
            title: 'Negotiation Skills',
            description: 'Advanced negotiation techniques in Russian',
            order: 1,
            isFree: false,
            duration: 60,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Negotiation Vocabulary',
                  description: 'Key phrases for business negotiations',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 25,
                  isFree: false,
                },
                {
                  type: ContentType.LIVE_SESSION,
                  title: 'Mock Negotiation Session',
                  description: 'Practice negotiations with instructor',
                  zoomLink: 'https://zoom.us/j/987654321',
                  order: 1,
                  duration: 35,
                  isFree: false,
                }
              ]
            }
          }
        ]
      }
    },
  })

  // ❌ REJECTED Course
  const rejectedCourse = await prisma.course.create({
    data: {
      title: 'Russian Conversation Basics',
      slug: 'russian-conversation-basics',
      description: 'Basic conversational Russian for everyday situations.',
      shortDesc: 'Learn basic Russian conversations',
      price: 399000,
      status: CourseStatus.REJECTED,
      approvalStatus: CourseApprovalStatus.REJECTED,
      level: DifficultyLevel.BEGINNER,
      freeContentLimit: 3,
      totalSessions: 1,
      totalDuration: 60,
      isPublished: false,
      instructorId: instructors[4].id,
      categoryId: categories[2].id, // Russian Conversation
      rejectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      rejectedBy: admins[2].id,
      rejectionReason: 'Audio quality is poor and content structure needs improvement. Please re-record videos with better audio equipment and add subtitles.',
      sessions: {
        create: [
          {
            title: 'Basic Greetings',
            description: 'Learn how to greet people in Russian',
            order: 0,
            isFree: true,
            duration: 60,
            contents: {
              create: [
                {
                  type: ContentType.VIDEO,
                  title: 'Russian Greetings',
                  description: 'Basic greeting phrases',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  order: 0,
                  duration: 30,
                  isFree: true,
                }
              ]
            }
          }
        ]
      }
    },
  })

  // 📝 DRAFT Course
  const draftCourse = await prisma.course.create({
    data: {
      title: 'Advanced Russian Grammar',
      slug: 'advanced-russian-grammar',
      description: 'Deep dive into complex Russian grammar structures.',
      shortDesc: 'Master advanced Russian grammar',
      price: 699000,
      status: CourseStatus.DRAFT,
      approvalStatus: CourseApprovalStatus.PENDING,
      level: DifficultyLevel.ADVANCED,
      freeContentLimit: 1,
      totalSessions: 0,
      totalDuration: 0,
      isPublished: false,
      instructorId: instructors[0].id,
      categoryId: categories[0].id, // Russian Grammar
    },
  })

  // 🎓 Create enrollments
  console.log('🎓 Creating enrollments...')
  await Promise.all([
    // Student 1 - enrolled in both approved courses
    prisma.enrollment.create({
      data: {
        userId: students[0].id,
        courseId: approvedCourse1.id,
        enrollmentType: EnrollmentType.PAID,
        progress: 75.0,
      },
    }),
    prisma.enrollment.create({
      data: {
        userId: students[0].id,
        courseId: approvedCourse2.id,
        enrollmentType: EnrollmentType.FREE,
        progress: 45.0,
      },
    }),
    // Student 2 - enrolled in course 1
    prisma.enrollment.create({
      data: {
        userId: students[1].id,
        courseId: approvedCourse1.id,
        enrollmentType: EnrollmentType.FREE,
        progress: 30.0,
      },
    }),
    // Student 3 - completed course 1
    prisma.enrollment.create({
      data: {
        userId: students[2].id,
        courseId: approvedCourse1.id,
        enrollmentType: EnrollmentType.PAID,
        progress: 100.0,
        isCompleted: true,
        completedAt: new Date(),
        certificateIssued: true,
      },
    }),
    // Student 4 - enrolled in course 2
    prisma.enrollment.create({
      data: {
        userId: students[3].id,
        courseId: approvedCourse2.id,
        enrollmentType: EnrollmentType.PAID,
        progress: 60.0,
      },
    }),
    // Student 5 - enrolled in both courses
    prisma.enrollment.create({
      data: {
        userId: students[4].id,
        courseId: approvedCourse1.id,
        enrollmentType: EnrollmentType.FREE,
        progress: 85.0,
      },
    }),
  ])

  // 🏆 Create certificate for completed student
  console.log('🏆 Creating certificates...')
  await prisma.certificate.create({
    data: {
      userId: students[2].id, // Budi Santoso
      courseId: approvedCourse1.id,
      certificateNumber: 'CERT-AS-RUS-001-2024',
      issuedAt: new Date(),
    },
  })

  // ⭐ Create sample reviews
  console.log('⭐ Creating reviews...')
  await Promise.all([
    prisma.review.create({
      data: {
        userId: students[0].id,
        courseId: approvedCourse1.id,
        rating: 5,
        comment: 'Excellent course! Dr. Dmitri explains everything clearly and the session structure makes learning easy.',
      },
    }),
    prisma.review.create({
      data: {
        userId: students[1].id,
        courseId: approvedCourse1.id,
        rating: 4,
        comment: 'Great content, but could use more interactive exercises.',
      },
    }),
    prisma.review.create({
      data: {
        userId: students[2].id,
        courseId: approvedCourse1.id,
        rating: 5,
        comment: 'Perfect for beginners! I can now read Russian confidently. The session-based approach really works!',
      },
    }),
    prisma.review.create({
      data: {
        userId: students[3].id,
        courseId: approvedCourse2.id,
        rating: 4,
        comment: 'Numbers and time are much clearer now. Prof. Anna is a great teacher.',
      },
    }),
  ])

  console.log('')
  console.log('✅ ARCTIC SIBERIA COURSE BUILDER SEED COMPLETED!')
  console.log('=' .repeat(80))
  console.log('')
  
  // USER ACCOUNTS SUMMARY
  console.log('👥 USER ACCOUNTS CREATED (Password: password123 for all)')
  console.log('')
  
  console.log('👑 ADMIN ACCOUNTS (5 users):')
  console.log(`   📧 admin1@arcticsiberia.com - Vladimir Petrov (ID: ${admins[0].id})`)
  console.log(`   📧 admin2@arcticsiberia.com - Elena Kozlova (ID: ${admins[1].id})`)
  console.log(`   📧 admin3@arcticsiberia.com - Mikhail Volkov (ID: ${admins[2].id})`)
  console.log(`   📧 admin4@arcticsiberia.com - Olga Smirnova (ID: ${admins[3].id})`)
  console.log(`   📧 admin5@arcticsiberia.com - Dmitri Ivanov (ID: ${admins[4].id})`)
  console.log('')
  
  console.log('👨‍🏫 INSTRUCTOR ACCOUNTS (5 users):')
  console.log(`   📧 instructor1@arcticsiberia.com - Dr. Dmitri Volkov (ID: ${instructors[0].id})`)
  console.log(`   📧 instructor2@arcticsiberia.com - Prof. Anna Smirnova (ID: ${instructors[1].id})`)
  console.log(`   📧 instructor3@arcticsiberia.com - Dr. Ivan Petrov (ID: ${instructors[2].id})`)
  console.log(`   📧 instructor4@arcticsiberia.com - Prof. Elena Kozlova (ID: ${instructors[3].id})`)
  console.log(`   📧 instructor5@arcticsiberia.com - Dr. Mikhail Romanov (ID: ${instructors[4].id})`)
  console.log('')
  
  console.log('🎓 STUDENT ACCOUNTS (5 users):')
  console.log(`   📧 student1@arcticsiberia.com - Andi Wijaya (ID: ${students[0].id})`)
  console.log(`   📧 student2@arcticsiberia.com - Sari Dewi (ID: ${students[1].id})`)
  console.log(`   📧 student3@arcticsiberia.com - Budi Santoso (ID: ${students[2].id})`)
  console.log(`   📧 student4@arcticsiberia.com - Maya Putri (ID: ${students[3].id})`)
  console.log(`   📧 student5@arcticsiberia.com - Reza Pratama (ID: ${students[4].id})`)
  console.log('')
  
  console.log('📚 COURSE BUILDER DEMO DATA:')
  console.log('   ✅ APPROVED: "Russian Alphabet Fundamentals" (4 sessions, mixed free/premium)')
  console.log('   ✅ APPROVED: "Russian Numbers and Time" (3 sessions, mixed content)')
  console.log('   ⏳ PENDING: "Business Russian for Professionals" (awaiting admin review)')
  console.log('   ❌ REJECTED: "Russian Conversation Basics" (with feedback for improvement)')
  console.log('   📝 DRAFT: "Advanced Russian Grammar" (empty course for testing)')
  console.log('')
  
  console.log('🎯 COURSE BUILDER FEATURES TO TEST:')
  console.log('   📝 Session-based course structure with multiple content types')
  console.log('   🎥 YouTube video integration')
  console.log('   📋 Interactive quizzes with questions and explanations')
  console.log('   📖 Text exercises and reading materials')
  console.log('   🔴 Live session scheduling with Zoom links')
  console.log('   📁 Document and audio material support')
  console.log('   🆓 Free content limits and premium gating')
  console.log('   💰 Revenue sharing system for instructors')
  console.log('')
  
  console.log('🚀 TESTING GUIDE:')
  console.log('   👑 Login as ADMIN to review pending courses and set revenue shares')
  console.log('   👨‍🏫 Login as INSTRUCTOR to use the Course Builder interface')
  console.log('   🎓 Login as STUDENT to experience the learning platform')
  console.log('')
  console.log('🎊 Ready to test the Arctic Siberia Course Management System!')
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