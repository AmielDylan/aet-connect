'use client'

import { Button } from '@/components/ui/button'
import { LayoutGrid, List } from 'lucide-react'
import type { ViewMode } from '@/types/directory'

interface ViewToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

export function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={mode === 'grid' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onModeChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={mode === 'list' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onModeChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

