// src/app/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import Hero from '@/components/home/hero'
import Features from '@/components/home/features'
import PopularCourses from '@/components/home/popular-courses'
import About from '@/components/home/about'
import CTASection from '@/components/home/cta-section'
import Alert from '@/components/ui/alert'

const HomePage = () => {
  const searchParams = useSearchParams()
  const [showLogoutAlert, setShowLogoutAlert] = React.useState(false)

  useEffect(() => {
    // Check for logout success parameter
    const logoutSuccess = searchParams.get('logout')
    if (logoutSuccess === 'success') {
      setShowLogoutAlert(true)
      
      // Remove URL parameter after showing alert
      const url = new URL(window.location.href)
      url.searchParams.delete('logout')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Logout Success Alert */}
      {showLogoutAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert
            type="success"
            title="Logout Berhasil"
            message="Anda telah berhasil keluar dari sistem. Terima kasih telah menggunakan Arctic Siberia!"
            onClose={() => setShowLogoutAlert(false)}
            autoClose={true}
            autoCloseDelay={6000}
            className="shadow-lg"
          />
        </div>
      )}

      <Navbar />
      <Hero />
      <Features />
      <PopularCourses />
      <About />
      <CTASection />
      <Footer />
    </div>
  )
}

export default HomePage