'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

interface AdminPieChartProps {
  data: Array<{ role: string; count: number }>
}

export function AdminPieChart({ data }: AdminPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  const colors = {
    'Alumni': '#9ca3af',
    'Modérateur': '#6b7280', 
    'Admin': '#4b5563'
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par Rôle</CardTitle>
        <CardDescription>Distribution des utilisateurs par rôle</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = ((item.count / total) * 100).toFixed(0)
            const color = colors[item.role as keyof typeof colors] || '#6b7280'
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.role}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{item.count}</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
