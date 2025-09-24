import './globals.css'
import type { Metadata } from 'next'
import { AuthProvider } from '@/modules/auth/AuthContext'

export const metadata: Metadata = {
  title: 'DevFlow System',
  description: 'Sistema integral self-hosted para desarrollo web completo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
