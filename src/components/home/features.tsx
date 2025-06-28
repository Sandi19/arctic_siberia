"use client";

import {
  Video,
  FileText,
  BarChart3,
  Award, // ⬅️ menggantikan Certificate
  Headphones,
  MessageCircle,
  Clock,
  Smartphone,
  Users,
  Globe,
  BookOpen,
  Trophy
} from 'lucide-react';

const Features = () => {
  const mainFeatures = [
    {
      icon: Video,
      title: "Video Pembelajaran HD",
      description: "Akses ke ratusan video pembelajaran berkualitas tinggi dengan subtitle bahasa Indonesia dan Rusia",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: FileText,
      title: "Materi PDF Lengkap",
      description: "Download materi pembelajaran dalam format PDF untuk dipelajari offline kapan saja",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Pantau perkembangan belajar Anda dengan sistem tracking yang detail dan real-time",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Award, // ⬅️ Ikon pengganti
      title: "Sertifikat Resmi",
      description: "Dapatkan sertifikat yang diakui secara internasional setelah menyelesaikan kursus",
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  const additionalFeatures = [
    {
      icon: Headphones,
      title: "Audio Native Speaker",
      description: "Latihan pronunciation dengan audio dari native speaker Rusia"
    },
    {
      icon: MessageCircle,
      title: "Forum Diskusi",
      description: "Berinteraksi dengan sesama siswa dan instructor dalam forum"
    },
    {
      icon: Clock,
      title: "Akses 24/7",
      description: "Belajar kapan saja, di mana saja tanpa batasan waktu"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Platform yang responsive dan dapat diakses dari berbagai device"
    },
    {
      icon: Users,
      title: "Kelas Virtual",
      description: "Ikuti kelas live dengan instructor berpengalaman"
    },
    {
      icon: Globe,
      title: "Konten Budaya",
      description: "Pelajari budaya Rusia melalui konten multimedia yang menarik"
    },
    {
      icon: BookOpen,
      title: "Kamus Interaktif",
      description: "Akses kamus Rusia-Indonesia yang terintegrasi dalam platform"
    },
    {
      icon: Trophy,
      title: "Sistem Gamifikasi",
      description: "Dapatkan poin dan achievement untuk memotivasi pembelajaran"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Fitur Unggulan Platform Kami
          </h2>
          <p className="text-lg text-gray-600">
            Dilengkapi dengan teknologi terdepan dan metode pembelajaran yang terbukti efektif 
            untuk memberikan pengalaman belajar terbaik.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Fitur Lengkap untuk Pembelajaran Optimal
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan berbagai tools dan fitur pendukung untuk memastikan 
              perjalanan belajar bahasa Rusia Anda menjadi lebih mudah dan menyenangkan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Siap Memulai Perjalanan Belajar Anda?
            </h3>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan siswa yang telah merasakan pengalaman belajar 
              terbaik di Arctic Siberia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Coba Gratis Sekarang
              </button>
              <button className="border border-white/20 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-200">
                Lihat Demo Platform
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Features;
