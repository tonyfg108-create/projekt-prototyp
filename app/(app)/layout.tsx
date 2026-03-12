import { AuthProvider } from '@/components/auth-provider'
import { AppHeader } from '@/components/app-header'
import { BottomNav } from '@/components/bottom-nav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
