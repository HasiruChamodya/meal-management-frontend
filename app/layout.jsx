import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"

// TypeScript types are removed for plain JS

export const metadata = {
  title: "Hospital Meal Management System",
  description: "Professional meal planning and logistics system for hospital staff",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}