# Kit réseaux sociaux · AET Connect

Ce dossier contient tout ce qu'il faut pour parler d'AET Connect sur les réseaux sociaux et inviter d'autres AET : des visuels prêts à publier, les textes qui vont avec, un calendrier de publication et la charte de la marque.

Pour voir tous les visuels d'un coup, ouvrez **`apercu.html`** dans un navigateur (double-clic).

## Ce que contient le dossier

| Dossier ou fichier | Contenu |
|---|---|
| `apercu.html` | Tous les visuels sur une seule page, avec leur usage |
| `TEXTES.md` | Les textes à publier avec chaque visuel, par réseau, le calendrier sur quatre semaines et des messages d'invitation |
| `visuels/` | Les visuels des publications, rangés par thème |
| `profils-et-couvertures/` | Photos de profil et images de couverture des pages et des groupes |
| `marque/` | Logos sur fond transparent et charte (`CHARTE.md`) |

### Les thèmes

1. **Lancement** : « AET un jour, AET toujours », l'annuaire est en ligne.
2. **Retrouver sa promo** : « Votre promo vous attend ».
3. **Les neuf écoles** : un visuel d'ensemble, puis un visuel par école (EMPT, PMS, CME, PMK Kati, PMB, PMK, PMN, LMJF-GMK, PML).
4. **Ambassadeurs** : ouvrir la voie quand personne de sa promo n'est encore inscrit.
5. **Entraide** : « Un AET dans chaque ville ».
6. **Carrousel « Rejoindre AET Connect »** : cinq images à publier ensemble, dans l'ordre, sur Instagram ou LinkedIn.
7. **Devise** : « AET un jour, AET toujours », en typographie seule.

## Quel format pour quel réseau

Chaque visuel existe dans plusieurs formats ; le nom du fichier se termine par le format.

| Fin du nom | Taille | Où l'utiliser |
|---|---|---|
| `-carre` | 1080 × 1080 | Publication Facebook, Instagram, LinkedIn |
| `-portrait` | 1080 × 1350 | Publication Instagram et Facebook (prend plus de place dans le fil) |
| `-story` | 1080 × 1920 | Story Instagram ou Facebook, statut WhatsApp |
| `-paysage` | 1200 × 627 | Publication LinkedIn ou X, image d'un lien partagé |

Profils et couvertures :

| Fichier | Où l'utiliser |
|---|---|
| `photo-de-profil-vert.png` | Photo de profil de la page ou du groupe (se recadre en rond) |
| `photo-de-profil-creme.png` | Variante claire |
| `couverture-facebook.png` | Couverture de la page Facebook |
| `couverture-groupe.png` | Couverture d'un groupe Facebook ou WhatsApp |
| `banniere-linkedin-profil.png` | Bannière de profil LinkedIn (la photo de profil se pose à gauche, le texte reste visible) |
| `couverture-linkedin-page.png` | Couverture d'une page entreprise LinkedIn |
| `banniere-x.png` | Bannière X (Twitter) |

## Les règles à respecter

**Le ton.** Chaleureux, fier, sobre. On s'adresse aux AET avec « vous ». On préfère l'indicatif et « vous pouvez » aux ordres : « Vous pouvez retrouver votre promo » plutôt que « Retrouvez votre promo ! ». Pas de points d'exclamation en série, pas d'emoji en cascade (un ou deux au plus).

**Le vocabulaire.**
- On **rejoint** AET Connect (jamais « entrer » ou « s'inscrire gratuitement »).
- Les membres sont des **AET** (Anciens Enfants de Troupe). « Ancien » seul désigne un aîné : on ne l'emploie pas pour parler des membres.
- On est invité par un **collègue de promotion**.
- Une **promo**, c'est une école et une année d'entrée.
- L'annuaire est **sur invitation** : chaque membre a été invité par un collègue de sa promo, ou validé par un administrateur.

**Les photos.** Ce sont des photos d'illustration (domaine public, ou images créées pour AET Connect). Elles ne montrent **pas** des membres : on n'écrit jamais « nos membres » ou « la promo 1999 » sous une photo. Elles restent en noir et blanc, sans filtre ni recadrage.

**Les visuels.** On ne modifie pas les couleurs, on n'ajoute pas de texte par-dessus, on ne déforme pas le logo. Pour un besoin nouveau (un événement, une annonce), demandez un visuel à l'équipe technique : il sortira dans le même style.

**Les chiffres.** On n'annonce pas de nombre de membres sans l'avoir vérifié auprès de l'équipe (la page d'administration du site le donne).

## L'adresse à partager

**https://aet-connect.vercel.app**

Les AET qui ont reçu un code d'un collègue le saisissent directement. Les autres peuvent demander un code, ou demander l'accès si personne de leur promo n'est encore inscrit.

## Pour l'équipe technique

Les visuels sont générés à partir du design du site (couleurs, polices, soleil, drapeaux, photos). Après un changement de design ou d'adresse, il suffit de relancer :

```sh
cd frontend && npx tsx scripts/kit-reseaux.tsx
```
