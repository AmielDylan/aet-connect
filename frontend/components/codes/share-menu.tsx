'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Share2, Copy, Mail, MessageCircle, Check } from 'lucide-react'

interface ShareMenuProps {
  code: string
  schoolName: string
  entryYear: string
}

export function ShareMenu({ code, schoolName, entryYear }: ShareMenuProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  // Utiliser l'URL du frontend depuis window.location ou variable d'environnement
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
  
  const inviteUrl = `${baseUrl}/register/with-code?code=${code}`
  
  const message = `Rejoins le réseau AET Connect !

Tu as fait ${schoolName} (Promo ${entryYear}) ? Inscris-toi avec ce lien :

${inviteUrl}

A tres bientot sur la plateforme !`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      toast({
        title: 'Copié !',
        description: 'Le lien a été copié dans le presse-papier',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien',
        variant: 'destructive',
      })
    }
  }

  const handleEmail = () => {
    const subject = encodeURIComponent('Invitation AET Connect')
    const body = encodeURIComponent(message)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(message)
    window.open(`https://wa.me/?text=${text}`)
  }

  const handleSMS = () => {
    const text = encodeURIComponent(message)
    window.open(`sms:?body=${text}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copier le lien
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmail}>
          <Mail className="mr-2 h-4 w-4" />
          Partager par email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsApp}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Partager sur WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSMS}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Partager par SMS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

