"use client";

import { Play, Star, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-blue-50 via-white to-gray-50 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Star className="w-4 h-4 mr-2 fill-current" />
                #1 Platform Belajar Bahasa Rusia
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Kuasai Bahasa
                <span className="text-blue-600 block">Rusia Online</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg">
                Bergabunglah dengan ribuan siswa yang telah menguasai bahasa Rusia melalui metode pembelajaran interaktif dan modern kami.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">5,000+ Siswa Aktif</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">50+ Kursus</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-blue-600 fill-current" />
                <span className="text-sm text-gray-600">Rating 4.9/5</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200 text-center"
              >
                Mulai Belajar Gratis
              </Link>
              
              <button className="flex items-center justify-center space-x-2 border border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors duration-200">
                <Play className="w-5 h-5" />
                <span>Tonton Demo</span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="pt-8">
              <p className="text-sm text-gray-500 mb-4">Dipercaya oleh:</p>
              <div className="flex flex-wrap items-center gap-8 opacity-60">
                <div className="bg-gray-200 px-4 py-2 rounded text-gray-600 font-medium">
                  Universitas Indonesia
                </div>
                <div className="bg-gray-200 px-4 py-2 rounded text-gray-600 font-medium">
                  Moscow State University
                </div>
                <div className="bg-gray-200 px-4 py-2 rounded text-gray-600 font-medium">
                  Language Institute
                </div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="space-y-6">
                {/* Video Player Mockup */}
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                  <Play className="w-16 h-16 text-white opacity-80" />
                </div>
                
                {/* Course Info */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-900">Bahasa Rusia untuk Pemula</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.9</span>
                    </div>
                    <span className="text-sm text-gray-600">2,431 siswa</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium">
              ✓ Sertifikat Tersedia
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium">
              🎯 Akses Selamanya
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;