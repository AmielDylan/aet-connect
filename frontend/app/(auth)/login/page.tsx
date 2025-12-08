'use client'

// ═══════════════════════════════════════════════════
// LOGIN PAGE
// Page de connexion avec formulaire React Hook Form
// ═══════════════════════════════════════════════════

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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

// ═══════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Format d\'email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ═══════════════════════════════════════════════════
// LOGIN PAGE COMPONENT
// ═══════════════════════════════════════════════════

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loadUser } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Get redirect URL from query params or default to dashboard
  const redirectUrl = searchParams.get('redirect') || '/dashboard'

  // Note: La redirection si déjà authentifié est gérée par le proxy (middleware)
  // Pas besoin de useEffect ici car le proxy redirige automatiquement

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Submit handler
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      await loadUser()

      toast({
        title: 'Connexion réussie',
        description: 'Redirection en cours...',
      })

      const finalRedirect = redirectUrl ? decodeURIComponent(redirectUrl) : '/dashboard'
      window.location.href = finalRedirect

    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mb-2 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
              <span className="text-2xl font-bold text-primary-foreground">
                AET
              </span>
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            AET Connect
          </CardTitle>
          <CardDescription className="text-center">
            Connectez-vous à votre espace membre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="votre.email@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/register')}
            >
              S&apos;inscrire
            </Button>
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Comptes de test :</p>
            <p className="mt-1">
              <strong>Admin :</strong> test.admin@aetconnect.com
            </p>
            <p>
              <strong>Membre :</strong> test.membre@aetconnect.com
            </p>
            <p className="mt-1 text-xs">(Mot de passe : TestPass123!)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
