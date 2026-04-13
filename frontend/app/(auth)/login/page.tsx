'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email:    z.string().min(1, "L'email est requis").email("Format d'email invalide"),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loadUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const redirectUrl = searchParams.get('redirect') || '/dashboard'

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      await loadUser()
      toast({ title: 'Connexion réussie', description: 'Redirection en cours...' })
      window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : '/dashboard'
    } catch (error: any) {
      toast({ title: 'Erreur de connexion', description: error.message, variant: 'destructive' })
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#242424] mb-4">
          <span className="text-sm font-bold text-white leading-none">AET</span>
        </div>
        <h1 className="font-cal text-[28px] text-[#111111]">AET Connect</h1>
        <p className="mt-1.5 text-sm text-[#898989]">Connectez-vous à votre espace membre</p>
      </div>

      {/* Card */}
      <div className="rounded-xl bg-white p-6 shadow-cal-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#111111]">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="votre.email@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-9 text-sm border-[rgba(34,42,53,0.2)] focus-visible:ring-[#242424]/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-[#111111]">Mot de passe</FormLabel>
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-xs text-[#898989] hover:text-[#111111] transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="h-9 text-sm border-[rgba(34,42,53,0.2)] focus-visible:ring-[#242424]/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-9 rounded-lg bg-[#242424] text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ boxShadow: 'rgba(255,255,255,0.15) 0px 2px 0px inset, rgba(34,42,53,0.20) 0px 1px 3px 0px' }}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </Form>

        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(34,42,53,0.08)' }}>
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="w-full h-9 rounded-lg bg-white text-sm font-medium text-[#242424] transition-colors hover:bg-[#f5f5f5] shadow-cal-ring"
          >
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  )
}
