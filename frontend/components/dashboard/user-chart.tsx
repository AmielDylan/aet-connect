'use client';

// ═══════════════════════════════════════════════════
// USER CHART COMPONENT
// Graphique bar chart des utilisateurs par école
// ═══════════════════════════════════════════════════

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UserChartProps {
  data: Array<{
    school_name: string;
    count: number;
  }>;
}

export function UserChart({ data }: UserChartProps) {
  // Take top 10 schools only
  const top10 = data.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisateurs par École (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={top10}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="school_name"
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

