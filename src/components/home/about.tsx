"use client";

import { Target, Heart, Globe, Award } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Mengapa Memilih Arctic Siberia?
          </h2>
          <p className="text-lg text-gray-600">
            Kami menghadirkan metode pembelajaran bahasa Rusia yang revolusioner, 
            menggabungkan teknologi modern dengan pendekatan yang telah terbukti efektif.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Platform Pembelajaran Terdepan
              </h3>
              <p className="text-gray-600 mb-6">
                Arctic Siberia hadir sebagai solusi pembelajaran bahasa Rusia yang komprehensif. 
                Kami memahami tantangan dalam mempelajari bahasa yang memiliki alfabet Cyrillic 
                dan tata bahasa yang kompleks.
              </p>
              <p className="text-gray-600">
                Dengan pengalaman lebih dari 5 tahun dalam bidang pendidikan bahasa, 
                kami telah membantu ribuan siswa dari berbagai latar belakang mencapai 
                kemahiran berbahasa Rusia dengan percaya diri.
              </p>
            </div>

            {/* Key Points */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pembelajaran Terarah</h4>
                  <p className="text-gray-600 text-sm">
                    Kurikulum yang dirancang khusus untuk speaker bahasa Indonesia
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Pendekatan Personal</h4>
                  <p className="text-gray-600 text-sm">
                    Setiap siswa mendapat perhatian dan bimbingan yang disesuaikan
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Konteks Budaya</h4>
                  <p className="text-gray-600 text-sm">
                    Belajar bahasa sekaligus memahami budaya dan tradisi Rusia
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white">
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-2xl font-bold mb-2">5 Tahun Pengalaman</h4>
                  <p className="opacity-90">Melayani siswa dari seluruh Indonesia</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">5,000+</div>
                    <div className="text-sm opacity-90">Siswa Aktif</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">95%</div>
                    <div className="text-sm opacity-90">Tingkat Kepuasan</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-sm opacity-90">Kursus Tersedia</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Dukungan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 border">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Akreditasi Resmi</div>
                  <div className="text-sm text-gray-600">Diakui secara internasional</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gray-50 rounded-2xl p-8 lg:p-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Misi Kami
          </h3>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Membuka pintu peluang global bagi setiap individu melalui penguasaan bahasa Rusia. 
            Kami percaya bahwa bahasa adalah jembatan yang menghubungkan budaya, membuka peluang karir, 
            dan memperluas wawasan dunia. Komitmen kami adalah memberikan pendidikan berkualitas tinggi 
            yang accessible dan enjoyable untuk semua.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;