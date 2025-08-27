import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import HeroSection from "@/components/Hero"
import AuthHandler from "@/components/auth-handler"
import Marketplace from "@/components/marketplace"
// Loading component for Suspense fallback
function PageLoading() {
  return (
    <main className="min-h-screen bg-[#0F0C14] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#D3A8FF] mx-auto mb-4" />
        <p className="text-white">Loading...</p>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<PageLoading />}>
        <AuthHandler />
      </Suspense>
      <HeroSection />
      <Marketplace />
    </>
  )
}
