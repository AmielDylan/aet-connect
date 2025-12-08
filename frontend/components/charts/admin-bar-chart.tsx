'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface AdminBarChartProps {
  data: Array<{ school: string; count: number }>
}

export function AdminBarChart({ data }: AdminBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisateurs par École (Top 10)</CardTitle>
        <CardDescription>Écoles avec le plus de membres inscrits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="school"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                stroke="#e5e7eb"
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                stroke="#e5e7eb"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar 
                dataKey="count" 
                fill="#9ca3af"
                radius={[6, 6, 0, 0]}
              >
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  style={{ fill: '#1f2937', fontSize: 11, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
