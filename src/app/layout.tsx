import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: {
    default: 'OpenGravity | Agent Workspace',
    template: '%s | OpenGravity',
  },
  description: 'Private operator dashboard for OpenGravity agent workflows, research and startup simulations.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: 'website',
    title: 'OpenGravity | Agent Workspace',
    description: 'Private operator dashboard for OpenGravity agent workflows.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
