import Link from 'next/link'
import { ArrowRight, Leaf, Map, Camera, Coins, Users, Globe, TreePine, Waves, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

async function getGlobalStats() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('global_stats')
    .select('*')
    .single()
  
  // If no stats, return defaults
  return data || {
    total_tasks_completed: 0,
    total_trash_kg: 0,
    total_volunteers: 0,
    total_tokens_distributed: 0,
  }
}

async function getRecentTasks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('id, title, category, location_name, token_reward, latitude, longitude')
    .eq('status', 'available')
    .limit(6)
  
  return data || []
}

export default async function WelcomePage() {
  const stats = await getGlobalStats()
  const recentTasks = await getRecentTasks()

  const features = [
    {
      icon: Map,
      title: 'Discover Tasks',
      description: 'Find cleanup and community tasks near you on our global impact map',
    },
    {
      icon: Camera,
      title: 'Capture Impact',
      description: 'Take before & after photos to document your real-world contribution',
    },
    {
      icon: Coins,
      title: 'Earn Rewards',
      description: 'Get Impact Tokens verified by AI for every completed good deed',
    },
    {
      icon: Users,
      title: 'Join Community',
      description: 'Connect with volunteers worldwide making a positive difference',
    },
  ]

  const categories = [
    { icon: TreePine, label: 'Parks', color: 'bg-green-500/20 text-green-400' },
    { icon: Waves, label: 'Rivers', color: 'bg-blue-500/20 text-blue-400' },
    { icon: TreePine, label: 'Forests', color: 'bg-emerald-500/20 text-emerald-400' },
    { icon: Heart, label: 'Community', color: 'bg-pink-500/20 text-pink-400' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-20">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance mb-4">
              Make a Difference.{' '}
              <span className="text-primary">Get Rewarded.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 text-pretty">
              Join the global network of people earning rewards for real-world environmental 
              cleanup and community impact, verified by AI.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/map">
                  <Globe className="w-5 h-5" />
                  Explore Impact Map
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href="/auth/sign-up">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard 
              value={stats.total_tasks_completed.toLocaleString()} 
              label="Tasks Completed" 
            />
            <StatCard 
              value={`${stats.total_trash_kg.toLocaleString()} kg`} 
              label="Trash Removed" 
            />
            <StatCard 
              value={stats.total_volunteers.toLocaleString()} 
              label="Volunteers" 
            />
            <StatCard 
              value={stats.total_tokens_distributed.toLocaleString()} 
              label="Tokens Distributed" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-sm text-muted-foreground mb-2">Step {index + 1}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Task Categories
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Choose from various environmental and community impact categories
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.label}
                className={`flex items-center gap-2 px-6 py-3 rounded-full ${cat.color} transition-transform hover:scale-105`}
              >
                <cat.icon className="w-5 h-5" />
                <span className="font-medium">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Tasks Preview */}
      {recentTasks.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold">
                Available Tasks
              </h2>
              <Button asChild variant="ghost" className="gap-2">
                <Link href="/tasks">
                  View All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTasks.map((task) => (
                <Link 
                  key={task.id} 
                  href={`/tasks/${task.id}`}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                      <Coins className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary">{task.token_reward}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {task.location_name || 'Location available'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of volunteers earning rewards for real-world good deeds.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/auth/sign-up">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            <span className="font-semibold">Good Deeds Network</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Proof of Good Deeds - Verified by AI
          </p>
        </div>
      </footer>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
