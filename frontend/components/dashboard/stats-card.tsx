import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({ title, value, description, icon: Icon }: StatsCardProps) {
  return (
    <div
      className="rounded-xl bg-white p-5"
      style={{
        boxShadow:
          'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px 0px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-[#898989]">{title}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f5f5]">
          <Icon className="h-4 w-4 text-[#242424]" />
        </div>
      </div>
      <p className="font-cal text-[28px] text-[#111111]">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-[#898989]">{description}</p>
      )}
    </div>
  )
}
