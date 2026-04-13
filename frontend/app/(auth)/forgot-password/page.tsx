'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createBrowserClient } from '@supabase/ssr'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)
    try {
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setEmailSent(true)
    } finally {
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
        <h1 className="font-cal text-[28px] text-[#111111]">Mot de passe oublié</h1>
        <p className="mt-1.5 text-sm text-[#898989] text-center">
          Saisissez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl bg-white p-6 shadow-cal-card">
        {emailSent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-[#f5f5f5] p-4">
              <CheckCircle2 className="h-4 w-4 text-[#242424] shrink-0 mt-0.5" />
              <p className="text-sm text-[#111111]">
                Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans les prochaines minutes. Vérifiez vos spams si nécessaire.
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="w-full h-9 rounded-lg bg-[#242424] text-sm font-medium text-white transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
              style={{ boxShadow: 'rgba(255,255,255,0.15) 0px 2px 0px inset, rgba(34,42,53,0.20) 0px 1px 3px 0px' }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à la connexion
            </button>
          </div>
        ) : (
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
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 rounded-lg bg-[#242424] text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ boxShadow: 'rgba(255,255,255,0.15) 0px 2px 0px inset, rgba(34,42,53,0.20) 0px 1px 3px 0px' }}
              >
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isLoading ? 'Envoi...' : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full text-sm text-[#898989] hover:text-[#111111] transition-colors flex items-center justify-center gap-1.5 pt-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Retour à la connexion
              </button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
