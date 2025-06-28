"use client";

import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  BookOpen,
  Users,
  Award,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Tentang Kami", href: "#about" },
      { name: "Kursus", href: "#courses" },
      { name: "Fitur", href: "#features" },
      { name: "Harga", href: "#pricing" },
      { name: "Blog", href: "/blog" }
    ],
    support: [
      { name: "Pusat Bantuan", href: "/help" },
      { name: "FAQ", href: "/faq" },
      { name: "Kontak Support", href: "/contact" },
      { name: "Live Chat", href: "#" },
      { name: "Tutorial", href: "/tutorial" }
    ],
    legal: [
      { name: "Syarat & Ketentuan", href: "/terms" },
      { name: "Kebijakan Privasi", href: "/privacy" },
      { name: "Kebijakan Cookie", href: "/cookies" },
      { name: "Kebijakan Refund", href: "/refund" }
    ],
    courses: [
      { name: "Bahasa Rusia Pemula", href: "/courses/beginner" },
      { name: "Percakapan Rusia", href: "/courses/conversation" },
      { name: "Tata Bahasa Rusia", href: "/courses/grammar" },
      { name: "Rusia Bisnis", href: "/courses/business" }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "#", name: "Facebook" },
    { icon: Twitter, href: "#", name: "Twitter" },
    { icon: Instagram, href: "#", name: "Instagram" },
    { icon: Youtube, href: "#", name: "YouTube" }
  ];

  const achievements = [
    { icon: Users, text: "5,000+ Siswa Aktif" },
    { icon: BookOpen, text: "50+ Kursus Tersedia" },
    { icon: Award, text: "Sertifikat Resmi" },
    { icon: Heart, text: "95% Kepuasan Siswa" }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Achievement Strip */}
      <div className="bg-blue-600 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 text-white">
                <achievement.icon className="w-6 h-6 flex-shrink-0" />
                <span className="text-sm font-medium">{achievement.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <Image 
                  src="/logo.png" 
                  alt="Arctic Siberia" 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-2xl font-bold">Arctic Siberia</span>
              </div>
              
              <p className="text-gray-300 max-w-md">
                Platform pembelajaran bahasa Rusia #1 di Indonesia. 
                Kami berkomitmen untuk memberikan pendidikan berkualitas tinggi 
                yang accessible dan enjoyable untuk semua.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>info@arcticsiberia.com</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>+62 21 1234 5678</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <Link 
                    key={index}
                    href={social.href}
                    className="bg-gray-800 hover:bg-blue-600 p-3 rounded-lg transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Courses Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Kursus</h3>
              <ul className="space-y-3">
                {footerLinks.courses.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Dukungan</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-semibold mb-2">
                Dapatkan Tips Belajar Bahasa Rusia
              </h3>
              <p className="text-gray-300">
                Berlangganan newsletter kami untuk mendapatkan tips, materi gratis, dan update terbaru.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-96">
              <input 
                type="email" 
                placeholder="Masukkan email Anda"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 whitespace-nowrap">
                Berlangganan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center lg:text-left">
              © {currentYear} Arctic Siberia. Semua hak dilindungi undang-undang.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span>🇮🇩 Bahasa Indonesia</span>
              <span>💳 Pembayaran Aman</span>
              <span>🔒 SSL Terenkripsi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;