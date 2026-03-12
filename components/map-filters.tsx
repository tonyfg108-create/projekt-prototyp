'use client'

import { useState } from 'react'
import { Filter, X, TreePine, Waves, Trees, Heart, Hammer, Bird } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { TaskCategory } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'

const CategoryIcon: Record<TaskCategory, React.ElementType> = {
  park_cleanup: Trees,
  forest_cleanup: TreePine,
  river_cleanup: Waves,
  community_help: Heart,
  environmental_building: Hammer,
  wildlife_support: Bird,
}

const categories: TaskCategory[] = [
  'park_cleanup',
  'forest_cleanup', 
  'river_cleanup',
  'community_help',
  'environmental_building',
  'wildlife_support',
]

export function MapFilters() {
  const [selectedCategories, setSelectedCategories] = useState<TaskCategory[]>([])
  const [open, setOpen] = useState(false)

  const toggleCategory = (cat: TaskCategory) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-card/50 border-b border-border overflow-x-auto">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 shrink-0">
            <Filter className="w-4 h-4" />
            Filters
            {selectedCategories.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {selectedCategories.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-2xl">
          <SheetHeader className="text-left pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Filter Tasks</SheetTitle>
              {selectedCategories.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-3">Categories</div>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = CategoryIcon[cat]
                  const isSelected = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{CATEGORY_LABELS[cat]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <Button className="w-full" onClick={() => setOpen(false)}>
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Quick filter chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.slice(0, 4).map((cat) => {
          const Icon = CategoryIcon[cat]
          const isSelected = selectedCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-3 h-3" />
              {CATEGORY_LABELS[cat]}
            </button>
          )
        })}
      </div>

      {selectedCategories.length > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="shrink-0 h-7 px-2"
          onClick={clearFilters}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
