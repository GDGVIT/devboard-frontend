import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import LoginContent from "@/components/login-content"
import LoginAuthHandler from "@/components/login-auth-handler"

// Loading component for Suspense fallback
function LoginLoading() {
  return (
    <main className="min-h-screen bg-[#0F0C14] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D3A8FF] mx-auto mb-4" />
        <p className="text-white">Loading...</p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={<LoginLoading />}>
        <LoginAuthHandler />
      </Suspense>
      <LoginContent />
    </>
  )
}
