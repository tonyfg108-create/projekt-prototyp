import Link from 'next/link'
import { Leaf, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Check Your Email</h1>
          <p className="text-muted-foreground mt-2">
            {"We've sent you a confirmation link. Click it to activate your account."}
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild variant="outline" className="w-full gap-2">
            <Link href="/auth/login">
              <ArrowRight className="w-4 h-4" />
              Go to Login
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full gap-2">
            <Link href="/map">
              <Leaf className="w-4 h-4" />
              Explore Map While Waiting
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
