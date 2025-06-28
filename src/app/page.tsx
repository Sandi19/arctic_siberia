import React from 'react';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import PopularCourses from '@/components/home/popular-courses';
import About from '@/components/home/about';
import CTASection from '@/components/home/cta-section';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      <Hero />
      <Features />
      <PopularCourses />
      <About />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;