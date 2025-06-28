#!/bin/bash

# Ganti ke folder proyek kamu
cd ~/Documents/arctic_siberia || exit

# Buat folder dan subfolder
mkdir -p \
  public/sample-pdf \
  prisma/migrations \
  src/app/auth/login \
  src/app/auth/register \
  src/app/auth/forgot-password \
  src/app/auth/reset-password \
  src/app/dashboard/student \
  src/app/dashboard/admin \
  src/app/courses/[id] \
  src/app/payments \
  src/app/api/auth/login \
  src/app/api/auth/register \
  src/app/api/auth/me \
  src/app/api/courses/[id] \
  src/app/api/files/upload \
  src/app/api/payments/create \
  src/app/api/payments/verify \
  src/components/layout \
  src/components/ui \
  src/components/forms \
  src/components/course \
  src/lib \
  src/context \
  src/hooks \
  src/styles

# Buat file-file utama
touch \
  prisma/schema.prisma \
  prisma/seed.ts \
  public/sample-pdf/contoh.pdf \
  src/app/layout.tsx \
  src/app/page.tsx \
  src/styles/globals.css \
  src/components/layout/navbar.tsx \
  src/components/layout/footer.tsx \
  src/components/layout/sidebar.tsx \
  src/components/layout/dashboard-layout.tsx \
  src/components/layout/auth-layout.tsx \
  src/components/ui/button.tsx \
  src/components/ui/input.tsx \
  src/components/ui/card.tsx \
  src/components/ui/modal.tsx \
  src/components/ui/badge.tsx \
  src/components/ui/index.ts \
  src/components/forms/login-form.tsx \
  src/components/forms/register-form.tsx \
  src/components/forms/course-form.tsx \
  src/components/forms/file-upload-form.tsx \
  src/components/course/course-card.tsx \
  src/components/course/video-player.tsx \
  src/components/course/file-list.tsx \
  src/lib/auth.ts \
  src/lib/db.ts \
  src/lib/youtube.ts \
  src/lib/upload.ts \
  src/context/auth-context.tsx \
  src/context/modal-context.tsx \
  src/hooks/use-auth.tsx \
  src/hooks/use-courses.tsx \
  src/hooks/use-modal.tsx \
  src/app/auth/login/page.tsx \
  src/app/auth/register/page.tsx \
  src/app/auth/forgot-password/page.tsx \
  src/app/auth/reset-password/page.tsx \
  src/app/dashboard/student/page.tsx \
  src/app/dashboard/admin/page.tsx \
  src/app/courses/page.tsx \
  src/app/courses/[id]/page.tsx \
  src/app/payments/page.tsx \
  src/app/api/auth/login/route.ts \
  src/app/api/auth/register/route.ts \
  src/app/api/auth/me/route.ts \
  src/app/api/courses/route.ts \
  src/app/api/courses/[id]/route.ts \
  src/app/api/files/upload/route.ts \
  src/app/api/payments/create/route.ts \
  src/app/api/payments/verify/route.ts

echo "✅ Struktur folder arctic_siberia berhasil dibuat!"