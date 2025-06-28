import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import RegisterForm from '@/components/forms/register-form'

export const metadata: Metadata = {
  title: 'Daftar Akun - Arctic Siberia LMS',
  description: 'Bergabunglah dengan Arctic Siberia LMS dan mulai perjalanan belajar Anda',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-12 h-12">
              <Image
                src="/logo.png"
                alt="Arctic Siberia Logo"
                width={48}
                height={48}
                className="rounded-lg"
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-900">Arctic Siberia</span>
          </Link>
        </div>
      </div>

      {/* Register Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Dengan mendaftar, Anda menyetujui{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            Syarat & Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            Kebijakan Privasi
          </Link>{' '}
          kami.
        </p>
      </div>
    </div>
  )
}