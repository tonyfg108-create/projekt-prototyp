'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'

const sponsorTypes = [
  'Corporation',
  'Foundation',
  'City/Municipality',
  'Small Business',
  'Individual',
  'Other',
]

export default function CreateSponsorPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sponsorType, setSponsorType] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from('sponsors').insert({
        owner_id: user.id,
        name,
        description,
        sponsor_type: sponsorType,
        website: website || null,
      })

      if (error) throw error

      // Update user role to sponsor
      await supabase
        .from('profiles')
        .update({ role: 'sponsor' })
        .eq('id', user.id)

      toast.success('Sponsor profile created!')
      router.push('/sponsor')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create sponsor profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 page-transition">
      <Link 
        href="/profile" 
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Link>

      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Become a Sponsor</h1>
        <p className="text-muted-foreground">Fund environmental campaigns and earn recognition</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Sponsor Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="EcoTech Corporation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your sponsorship goals..."
            rows={3}
            required
          />
        </div>

        <div className="space-y-3">
          <Label>Sponsor Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            {sponsorTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSponsorType(type)}
                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                  sponsorType === type
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading || !name || !description || !sponsorType}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Sponsor Profile
        </Button>
      </form>
    </div>
  )
}
