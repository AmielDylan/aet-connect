'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, User } from 'lucide-react'
import type { DirectoryMember } from '@/types/directory'

interface MemberCardProps {
  member: DirectoryMember
}

export function MemberCard({ member }: MemberCardProps) {
  const location = [member.current_city, member.current_country]
    .filter(Boolean)
    .join(', ')

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-20 w-20">
            {member.avatar_url && (
              <AvatarImage src={member.avatar_url} alt={member.first_name} />
            )}
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <CardHeader className="p-0">
              <Link href={`/profile/${member.id}`}>
                <CardTitle className="hover:underline cursor-pointer text-lg">
                  {member.first_name} {member.last_name}
                </CardTitle>
              </Link>
            </CardHeader>
            <p className="text-sm text-muted-foreground">
              {member.school_name} • Promo {member.entry_year}
            </p>
          </div>

          {location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}

          {member.is_ambassador && (
            <Badge variant="secondary">Ambassadeur</Badge>
          )}

          <Link href={`/profile/${member.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              Voir profil
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

