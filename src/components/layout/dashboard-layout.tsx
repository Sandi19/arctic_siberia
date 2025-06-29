// src/components/layout/dashboard-layout.tsx
import React from 'react'
import DashboardNavbar from './dashboard-navbar'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT'
  title?: string
  className?: string
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  role, 
  title,
  className = '' 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar role={role} />
      
      {/* Page Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout