'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'

const orgTypes = [
  'Environmental NGO',
  'Community Center',
  'Municipality',
  'School/University',
  'Animal Shelter',
  'Other',
]

export default function CreateOrganizationPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [orgType, setOrgType] = useState('')
  const [website, setWebsite] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from('organizations').insert({
        owner_id: user.id,
        name,
        description,
        org_type: orgType,
        website: website || null,
        location_city: city || null,
        location_country: country || null,
      })

      if (error) throw error

      // Update user role to organization
      await supabase
        .from('profiles')
        .update({ role: 'organization' })
        .eq('id', user.id)

      toast.success('Organization created successfully!')
      router.push('/organization')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create organization')
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
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Create Organization</h1>
        <p className="text-muted-foreground">Set up your organization to create tasks</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Green Earth Foundation"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your organization..."
            rows={3}
            required
          />
        </div>

        <div className="space-y-3">
          <Label>Organization Type *</Label>
          <div className="grid grid-cols-2 gap-2">
            {orgTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrgType(type)}
                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                  orgType === type
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
            placeholder="https://example.org"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="USA"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading || !name || !description || !orgType}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Organization
        </Button>
      </form>
    </div>
  )
}
