// File: src/components/ui/avatar.tsx

'use client'

import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// ✅ Avatar Container Component
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10', 
      lg: 'h-12 w-12',
      xl: 'h-16 w-16'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Avatar.displayName = 'Avatar'

// ✅ Avatar Image Component
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt?: string
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt = 'Avatar', ...props }, ref) => {
    if (!src) return null

    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        fill
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

// ✅ Avatar Fallback Component
interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, delayMs, children, ...props }, ref) => {
    const [canRender, setCanRender] = React.useState(!delayMs)

    React.useEffect(() => {
      if (delayMs) {
        const timer = setTimeout(() => setCanRender(true), delayMs)
        return () => clearTimeout(timer)
      }
    }, [delayMs])

    if (!canRender) return null

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium text-sm select-none',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AvatarFallback.displayName = 'AvatarFallback'

// ✅ Utility function untuk generate initials
export const getInitials = (name: string): string => {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

// ✅ Complete Avatar dengan built-in fallback logic
interface CompleteAvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackClassName?: string
}

export const CompleteAvatar: React.FC<CompleteAvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  fallbackClassName
}) => {
  const [imageError, setImageError] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  return (
    <Avatar size={size} className={className}>
      {src && !imageError && (
        <AvatarImage 
          src={src} 
          alt={name || 'User Avatar'}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      <AvatarFallback className={fallbackClassName}>
        {name ? getInitials(name) : '?'}
      </AvatarFallback>
    </Avatar>
  )
}

export default Avatar
export { AvatarImage, AvatarFallback }