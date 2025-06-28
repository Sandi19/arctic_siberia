"use client";

import { Star, Clock, Users, Play, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PopularCourses = () => {
  const courses = [
    {
      id: 1,
      title: "Bahasa Rusia untuk Pemula",
      description: "Mulai perjalanan belajar bahasa Rusia dari dasar. Pelajari alfabet Cyrillic, kata-kata dasar, dan frasa sehari-hari.",
      level: "Pemula",
      duration: "8 minggu",
      students: 2431,
      rating: 4.9,
      price: "Rp 299.000",
      originalPrice: "Rp 399.000",
      image: "/api/placeholder/400/250",
      features: ["Video HD", "PDF Materi", "Audio Native", "Sertifikat"],
      instructor: "Dr. Natasha Volkov",
      progress: 0,
      isPopular: true
    },
    {
      id: 2,
      title: "Percakapan Bahasa Rusia",
      description: "Tingkatkan kemampuan speaking Anda dengan praktek percakapan intensif dan roleplay situasi nyata.",
      level: "Menengah",
      duration: "6 minggu",
      students: 1892,
      rating: 4.8,
      price: "Rp 449.000",
      originalPrice: "Rp 599.000",
      image: "/api/placeholder/400/250",
      features: ["Live Session", "Speaking Practice", "Feedback Personal", "Sertifikat"],
      instructor: "Igor Petrov",
      progress: 0,
      isPopular: false
    },
    {
      id: 3,
      title: "Tata Bahasa Rusia Lengkap",
      description: "Pelajari tata bahasa Rusia secara sistematis mulai dari kasus, konjugasi kata kerja, hingga struktur kalimat kompleks.",
      level: "Menengah",
      duration: "10 minggu",
      students: 1567,
      rating: 4.7,
      price: "Rp 549.000",
      originalPrice: "Rp 749.000",
      image: "/api/placeholder/400/250",
      features: ["Materi Detail", "Latihan Soal", "Quiz Interaktif", "Sertifikat"],
      instructor: "Prof. Elena Smirnova",
      progress: 0,
      isPopular: false
    },
    {
      id: 4,
      title: "Bahasa Rusia Bisnis",
      description: "Kuasai bahasa Rusia untuk keperluan bisnis dan profesional. Termasuk email bisnis, presentasi, dan negosiasi.",
      level: "Lanjutan",
      duration: "12 minggu",
      students: 934,
      rating: 4.9,
      price: "Rp 799.000",
      originalPrice: "Rp 999.000",
      image: "/api/placeholder/400/250",
      features: ["Case Study", "Business Vocab", "Presentation Skills", "Sertifikat"],
      instructor: "Dmitri Kozlov",
      progress: 0,
      isPopular: false
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Pemula':
        return 'bg-green-100 text-green-800';
      case 'Menengah':
        return 'bg-blue-100 text-blue-800';
      case 'Lanjutan':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section id="courses" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Kursus Populer
          </h2>
          <p className="text-lg text-gray-600">
            Pilih kursus yang sesuai dengan level dan kebutuhan Anda. 
            Semua kursus dirancang oleh ahli bahasa Rusia berpengalaman.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {courses.map((course, index) => (
            <div key={course.id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              {/* Course Image */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 h-48 flex items-center justify-center">
                  <Play className="w-16 h-16 text-blue-600 opacity-60" />
                </div>
                
                {course.isPopular && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🔥 Populer
                  </div>
                )}
                
                <div className={`absolute top-4 right-4 ${getLevelColor(course.level)} px-3 py-1 rounded-full text-sm font-medium`}>
                  {course.level}
                </div>
              </div>

              <div className="p-6">
                {/* Course Info */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {course.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Instruktur: <span className="font-medium">{course.instructor}</span>
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()} siswa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {course.features.map((feature, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {course.price}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {course.originalPrice}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Hemat {Math.round((1 - parseInt(course.price.replace(/\D/g, '')) / parseInt(course.originalPrice.replace(/\D/g, ''))) * 100)}%
                    </div>
                  </div>
                  
                  <Link 
                    href={`/courses/${course.id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    Mulai Belajar
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Courses */}
        <div className="text-center">
          <Link 
            href="/courses"
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Lihat Semua Kursus
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Learning Path Section */}
        <div className="mt-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Jalur Pembelajaran yang Terstruktur
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ikuti jalur pembelajaran yang telah dirancang khusus untuk memaksimalkan 
              hasil belajar Anda dari pemula hingga mahir.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Dasar</h4>
              <p className="text-gray-600 text-sm">
                Mulai dengan alfabet Cyrillic, kata-kata dasar, dan frasa sehari-hari
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Menengah</h4>
              <p className="text-gray-600 text-sm">
                Tingkatkan kemampuan dengan tata bahasa dan percakapan yang lebih kompleks
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Lanjutan</h4>
              <p className="text-gray-600 text-sm">
                Kuasai bahasa Rusia untuk keperluan profesional dan akademik
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCourses;