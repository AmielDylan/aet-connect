'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth-store'
import { GenerateCodeDialog } from '@/components/codes/generate-code-dialog'
import { CodeCard } from '@/components/codes/code-card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertCircle, Info } from 'lucide-react'

export default function CodesPage() {
  const { user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-codes'],
    queryFn: () => apiClient.getMyCodes(),
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['codes-history'],
    queryFn: () => apiClient.getCodesHistory(),
  })

  const allCodes = data?.codes || []
  const history = historyData?.codes || []
  
  // ✅ Séparer actifs et utilisés
  const activeCodes = allCodes.filter((code: any) => code.current_uses === 0)
  const usedCodesCount = allCodes.length - activeCodes.length
  
  const codesGenerated = allCodes.length
  
  // Calculer la limite effective selon le rôle et le statut ambassadeur
  const getEffectiveLimit = () => {
    if (user?.role === 'admin') return 999
    if (user?.is_ambassador) return 15
    return 3
  }
  
  const effectiveLimit = getEffectiveLimit()

  // Mapper les codes actifs pour extraire school_name et entry_year
  const mappedCodes = activeCodes.map((code: any) => {
    // Le backend retourne schools: { name_fr } dans la relation
    // On doit extraire ces données
    const schoolName = code.schools?.name_fr || 'Non spécifiée'
    const entryYear = code.entry_year || user?.entry_year || 'N/A'
    
    return {
      ...code,
      id: code.id || code.code, // Utiliser code comme id si id n'existe pas
      schoolName,
      entryYear,
    }
  })

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes codes d'invitation</h1>
            <p className="text-muted-foreground">
              {effectiveLimit === 999 
                ? `${codesGenerated} code${codesGenerated > 1 ? 's' : ''} généré${codesGenerated > 1 ? 's' : ''}`
                : `${codesGenerated} / ${effectiveLimit} codes générés`
              }
            </p>
          </div>
          <GenerateCodeDialog />
        </div>

        {/* Info alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Comment ça marche ?</AlertTitle>
          <AlertDescription>
            Générez des codes pour inviter des membres de votre école et promotion.
            Chaque code peut être utilisé 1 fois (inscription unique). 
            Partagez-les par email, WhatsApp ou SMS.
          </AlertDescription>
        </Alert>

        {/* Limite atteinte */}
        {codesGenerated >= effectiveLimit && effectiveLimit !== 999 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Limite atteinte</AlertTitle>
            <AlertDescription>
              Vous avez atteint votre limite de {effectiveLimit} code{effectiveLimit > 1 ? 's' : ''}.
              {user?.role === 'alumni' && !user?.is_ambassador && (
                <> Contactez un administrateur pour devenir ambassadeur et augmenter votre limite.</>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Onglets */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Actifs ({activeCodes.length})</TabsTrigger>
            <TabsTrigger value="history">Historique ({history.length})</TabsTrigger>
          </TabsList>

          {/* Onglet Actifs */}
          <TabsContent value="active" className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>
                  Impossible de charger vos codes d'invitation
                </AlertDescription>
              </Alert>
            ) : activeCodes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {usedCodesCount > 0 
                    ? 'Tous vos codes ont été utilisés' 
                    : 'Vous n\'avez pas encore généré de code d\'invitation'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur "Générer un code" pour commencer
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mappedCodes.map((code: any) => (
                  <CodeCard
                    key={code.id || code.code}
                    code={code}
                    schoolName={code.schoolName}
                    entryYear={code.entryYear}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Onglet Historique */}
          <TabsContent value="history" className="space-y-4">
            {historyLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Aucun code utilisé pour le moment
              </div>
            ) : (
              <>
                {/* Version desktop */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr className="text-left text-sm">
                        <th className="px-4 py-3 font-medium">Code</th>
                        <th className="px-4 py-3 font-medium">École • Promotion</th>
                        <th className="px-4 py-3 font-medium">Utilisé par</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {history.map((code: any) => (
                        <tr 
                          key={code.id} 
                          className="hover:bg-muted/50 transition-colors text-sm"
                        >
                          <td className="px-4 py-3">
                            <code className="font-mono font-semibold">
                              {code.code}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {code.school_name} • Promo {code.entry_year}
                          </td>
                          <td className="px-4 py-3">
                            {code.used_by ? (
                              <div>
                                <p className="font-medium">
                                  {code.used_by.first_name} {code.used_by.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {code.used_by.email}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(code.used_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                            <br />
                            <span className="text-xs">
                              {new Date(code.used_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Version mobile */}
                <div className="md:hidden space-y-2">
                  {history.map((code: any) => (
                    <div key={code.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <code className="font-mono font-semibold">{code.code}</code>
                        <Badge variant="secondary">Utilisé</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {code.school_name} • Promo {code.entry_year}
                      </p>
                      {code.used_by && (
                        <div className="text-sm">
                          <p className="font-medium">
                            {code.used_by.first_name} {code.used_by.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {code.used_by.email}
                          </p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(code.used_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

