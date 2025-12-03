'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  id: string
  label: string
  type?: 'text' | 'email' | 'password' | 'textarea'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  description?: string
}

export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  description,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {type === 'textarea' ? (
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        />
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        />
      )}
      
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}




