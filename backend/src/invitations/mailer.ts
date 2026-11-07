// Seam « email » du module Code d'invitation.
// Adapters : InMemoryMailer (tests) et ManualDeliveryMailer (prod, tant qu'aucun
// domaine d'envoi n'est vérifié : le message est rendu à l'admin, qui le transmet).

export interface InvitationEmail {
  to: string
  subject: string
  text: string
}

export interface Mailer {
  /** Renvoie true si le message est parti, false s'il doit être transmis à la main. */
  send(email: InvitationEmail): Promise<boolean>
}

export class InMemoryMailer implements Mailer {
  readonly sent: InvitationEmail[] = []

  async send(email: InvitationEmail) {
    this.sent.push(email)
    return true
  }
}

export class ManualDeliveryMailer implements Mailer {
  async send() {
    return false
  }
}
