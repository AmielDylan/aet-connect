'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MapPin, School, Calendar, Linkedin, Star, Phone, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PublicProfilePage() {
  const params = useParams()
  const userId = params.id as string
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: () => apiClient.getPublicProfile(userId),
  })
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }
  
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Profil non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              Ce profil n'existe pas ou a été supprimé.
            </p>
            <Link href="/dashboard/directory">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'annuaire
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header avec retour */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/directory">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'annuaire
            </Button>
          </Link>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Carte profil principale */}
        <Card className="overflow-hidden shadow-lg">
          {/* Bannière colorée */}
          <div className="h-32 bg-gradient-to-r from-gray-400 to-gray-600"></div>
          
          <CardContent className="relative pt-0">
            {/* Avatar positionné sur la bannière */}
            <div className="flex flex-col items-center -mt-16 mb-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-4xl bg-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Nom et badge */}
              <div className="text-center mt-4 mb-2">
                <h1 className="text-3xl font-bold mb-2">
                  {user.first_name} {user.last_name}
                </h1>
                {user.is_ambassador && (
                  <Badge className="gap-1 bg-gray-100 text-gray-800 border-gray-300">
                    <Star className="h-3 w-3 fill-gray-600" />
                    Ambassadeur
                  </Badge>
                )}
              </div>
            </div>

            {/* Informations principales */}
            <div className="space-y-4 mb-6">
              {/* École */}
              {user.schools && (
                <div className="flex items-center justify-center gap-2 text-lg">
                  <School className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">
                    {user.schools.flag} {user.schools.acronym || user.schools.name_fr}
                  </span>
                  {user.privacy?.show_entry_year !== false && user.entry_year && (
                    <>
                      <Separator orientation="vertical" className="h-5" />
                      <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Promo {user.entry_year}
                      </span>
                    </>
                  )}
                </div>
              )}
              
              {/* Localisation */}
              {user.privacy?.show_current_location !== false && user.current_city && (
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{user.current_city}{user.current_country && `, ${user.current_country}`}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Boutons de contact */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {user.privacy?.show_email !== false && user.email && (
                <a href={`mailto:${user.email}`} className="flex-1 min-w-[140px] max-w-[200px]">
                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                </a>
              )}
              
              {user.privacy?.show_phone !== false && user.phone && (
                <a href={`tel:${user.phone}`} className="flex-1 min-w-[140px] max-w-[200px]">
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Button>
                </a>
              )}
              
              {user.privacy?.show_linkedin !== false && user.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] max-w-[200px]"
                >
                  <Button variant="outline" className="w-full gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Bio */}
        {user.privacy?.show_bio !== false && user.bio && (
          <Card className="mt-6 shadow-lg">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                À propos
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
