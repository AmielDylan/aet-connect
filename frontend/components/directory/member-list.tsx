'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'
import type { DirectoryMember } from '@/types/directory'

interface MemberListProps {
  members: DirectoryMember[]
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="space-y-2">
      {members.map((member) => {
        const location = [member.current_city, member.current_country]
          .filter(Boolean)
          .join(', ')

        return (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                {member.avatar_url && (
                  <AvatarImage src={member.avatar_url} alt={member.first_name} />
                )}
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${member.id}`}>
                    <h3 className="font-semibold hover:underline cursor-pointer">
                      {member.first_name} {member.last_name}
                    </h3>
                  </Link>
                  {member.is_ambassador && (
                    <Badge variant="secondary" className="text-xs">
                      Ambassadeur
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {member.school_name} • Promo {member.entry_year}
                  {location && ` • ${location}`}
                </p>
              </div>
            </div>

            <Link href={`/profile/${member.id}`}>
              <Button variant="outline" size="sm">
                Voir profil
              </Button>
            </Link>
          </div>
        )
      })}
    </div>
  )
}

