---
name: AET Connect
description: Annuaire panafricain des Anciens Enfants de Troupe ; vraies photos, vert profond et crème, or pour les actions, brun-roux pour le décor, formes organiques.
colors:
  vert: "#1D3B2A"
  vert-nuit: "#12261B"
  vert-carte: "#24452F"
  or: "#FFC000"
  terre: "#8B4A1E"
  creme: "#F4EEE2"
  blanc: "#FFFFFF"
  sable: "#DDD2BB"
  trait: "#7A887D"
  encre: "#14211A"
  olive: "#4D5E52"
  brume: "#C3D1C6"
  alerte: "#9C2A1E"
typography:
  display:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.25rem, 4.4vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: "clamp(1.75rem, 3.1vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Unbounded, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Familjen Grotesk, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Familjen Grotesk, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  champ: "12px"
  carte-interieure: "20px"
  photo: "24px"
  carte: "28px"
  coin-marque: "72px"
  pilule: "9999px"
spacing:
  unit: "4px"
  gutter-mobile: "20px"
  gutter: "32px"
  section-mobile: "80px"
  section: "112px"
  container: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.vert}"
    textColor: "{colors.or}"
    typography: "{typography.label}"
    rounded: "{rounded.pilule}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.vert-carte}"
  button-outline:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.vert}"
    rounded: "{rounded.pilule}"
    padding: "0 20px"
    height: "44px"
  input:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    rounded: "{rounded.champ}"
    padding: "0 16px"
    height: "48px"
  card-way:
    backgroundColor: "{colors.vert-carte}"
    textColor: "{colors.creme}"
    rounded: "{rounded.carte}"
    padding: "12px"
  card-way-featured:
    backgroundColor: "{colors.or}"
    textColor: "{colors.vert-nuit}"
    rounded: "{rounded.carte}"
    padding: "12px"
---

# Design System: AET Connect

## Overview

**Creative North Star: "Esprit de corps"**

AET Connect montre la fraternité d'armes en vraies photos (soldats, officiers, cérémonies, gestes d'entraide), en noir et blanc, posées sur un monde de formes organiques. Une trame de courbes de niveau, le langage des cartes d'état-major, court en fond tamisé. Un soleil aux neuf pétales, un par école, porte la marque. Le vert profond et le crème composent la palette ; l'or marque les actions, le brun-roux le décor.

La composition reprend la planche de référence du client (« must ») : un hero avec le texte à gauche et une mosaïque de photos à droite, un bandeau des écoles, une section avec un collage et des chiffres, une section verte à trois cartes dont celle du milieu est mise en avant, puis le formulaire et la confidentialité. Les formes organiques viennent des deux autres références du client : un soleil en papier découpé et des ondes topographiques.

Les photos sont d'illustration tant que l'association n'a pas fourni les siennes : de vrais soldats et officiers des pays des écoles, jamais présentés comme des membres.

**Key Characteristics:**
- Vraies photos en noir et blanc ; la couleur revient au survol.
- Vert profond et crème ; or pour les actions, brun-roux pour le décor.
- Trame topographique en fond tamisé ; soleil aux neuf pétales pour la marque.
- Titres en Unbounded (capitales larges et pleines), texte en Familjen Grotesk.
- Cadres arrondis à 24 px avec un coin plus arrondi (72 px) ; boutons en pilule.

## Colors

Une palette de terre et de végétation : vert profond et crème, avec deux accents aux rôles séparés, l'or pour agir et le brun-roux pour orner.

### Primary
- **Vert profond** (#1D3B2A) : sections profondes, bandeau des écoles, boutons principaux, titres sur fond clair, pétales du soleil sur fond clair.
- **Or** (#FFC000) : les actions. Texte des boutons verts (7,48:1), liens d'action sur le vert, carte mise en avant (texte vert de nuit), bouton pause du bandeau.
- **Brun-roux** (#8B4A1E) : le décor. Cœur du soleil, soulignement des liens sur crème, sélection de texte. Le texte brun-roux sur crème a un contraste de 5,87:1 ; sur le vert, il ne sert qu'en décor (1,8:1).

### Neutral
- **Vert de nuit** (#12261B) : pied de page.
- **Vert de carte** (#24452F) : cartes posées sur le vert ; survol des boutons verts.
- **Crème** (#F4EEE2) : fond clair principal ; texte sur vert et sur brun-roux ; pétales du soleil sur fond sombre.
- **Blanc** (#FFFFFF) : sections claires alternées, champs, fiche d'exemple.
- **Sable** (#DDD2BB) : filets et séparateurs, fond des cadres pendant le chargement.
- **Trait** (#7A887D) : contour des champs (3,2:1 sur crème, 3,7:1 sur blanc).
- **Encre** (#14211A) : texte principal sur clair.
- **Olive** (#4D5E52) : texte secondaire sur crème (5,98:1).
- **Brume** (#C3D1C6) : texte secondaire sur vert (7,75:1).
- **Alerte** (#9C2A1E) : messages d'erreur sur crème (6,58:1).

### Named Rules
**The Two Roles Rule.** L'or signale ce qu'on peut faire, le brun-roux orne. L'or n'est jamais décoratif et le brun-roux jamais une action. Un seul aplat d'or par écran, la carte mise en avant.

**The Real Faces Rule.** Les personnes à l'écran sont de vraies photos, jamais une illustration qui fait semblant. Une photo d'illustration n'est jamais légendée comme un membre.

## Typography

**Display Font:** Unbounded (avec ui-sans-serif)
**Body Font:** Familjen Grotesk (avec ui-sans-serif)

**Character:** Unbounded est large, plein et arrondi, avec l'énergie des grands rassemblements ; il répond aux formes organiques du soleil et de la trame. Familjen Grotesk est sobre et très lisible, avec juste assez de caractère pour ne pas paraître générique. Les deux polices sont servies par le site (next/font).

### Hierarchy
- **Display** (700, clamp(2.25rem, 4.4vw, 3.75rem), 1.06) : le titre du hero.
- **Headline** (700, clamp(1.75rem, 3.1vw, 2.6rem), 1.1) : titres de section.
- **Figure** (600, 2.5rem, 1) : chiffres réels, en chiffres tabulaires.
- **Title** (600, 1.125rem) : titres de carte, usages de l'annuaire, nom de la marque.
- **Body** (400, 1.125rem, 1.625) : paragraphes, entre 40 et 48 caractères par ligne.
- **Label** (600, 0.875–1rem) : libellés de champs, liens, boutons.

### Named Rules
**The No Eyebrow Rule.** Aucun sur-titre au-dessus d'un titre : le titre parle seul.

**The Wide Type Rule.** Unbounded est large : on ne dépasse pas 3,75rem, et les titres de carte restent à 1,125rem.

## Layout

Conteneur de 1280px de large au plus, avec des gouttières de 20px sur mobile et 32px à partir de 640px. Les sections alternent crème (avec la trame), blanc et vert profond, avec 80px de marge verticale sur mobile et 112px sur grand écran. Pas de barre au-dessus de la navigation.

Le hero est en deux colonnes (5/12 de texte, 7/12 de mosaïque) à partir de 1024px. La mosaïque garde une grille fixe : un grand portrait à gauche, abaissé de 64px, et trois cadres empilés à droite, entre 420 et 600px de haut. Le formulaire et le collage sont en deux colonnes à partir de 1024px, et les cartes de parcours en trois colonnes à partir de 768px. Sur mobile, tout passe en une colonne, le texte avant l'image.

## Elevation & Depth

Aucune ombre. La profondeur vient de l'alternance des fonds, des cartes vert de carte posées sur le vert, et d'une carte crème posée sur l'étoffe (le panneau de trame).

### Named Rules
**The Flat Fabric Rule.** Pas d'ombre, de flou ni de verre : des aplats, comme du papier découpé.

## Shapes

- **Arrondis :** tout est arrondi, sans angle vif. Les photos ont des coins de 24px, et un coin par cadre passe à 72px. Les cartes ont des coins de 28px, leurs blocs intérieurs 20px, les champs 12px ; les boutons sont des pilules.
- **Formes organiques :** les seules sont le soleil et les bandes de la trame.
- **Filets :** 2px, en sable.

## Components

### Buttons
- **Primary :** pilule vert profond, texte or semi-gras, 48px de haut, flèche à droite qui avance de 4px au survol ; au survol, le fond passe en vert de carte.
- **Outline :** pilule cerclée de vert (2px), texte vert ; au survol, elle se remplit de vert et le texte passe en or. Sert à « Se connecter » dans la navigation.
- **Text link :** sur crème, texte vert souligné de brun-roux (2px, décalé de 6px) ; sur vert, lien d'action en or souligné d'or translucide.

### Inputs / Fields
- **Style :** fond blanc, contour trait de 2px, coins de 12px, 48px de haut, texte encre ; les années en chiffres tabulaires.
- **Focus :** anneau vert sur fond clair, crème sur fond vert.
- **Error :** message en alerte, gras, annoncé (`role="alert"`) et relié au champ (`aria-describedby`, `aria-invalid`).
- **Formulaire sur l’étoffe :** une carte crème posée sur un panneau vert couvert de la trame (opacité 16 %).
- **Bouton d’envoi :** il nomme le résultat (« Trouver ma promo »), puis « Vérification… » pendant l’attente.

### Navigation
- **Barre :** posée directement sur la trame du hero, sans fond propre. La marque (le soleil et « AET Connect » en Unbounded), les ancres soulignées de brun-roux à partir de 1024px, et le bouton « Se connecter » (ou « Mon espace »).
- **Lien d’évitement :** « Aller au contenu », visible au focus clavier.
- **« Rejoindre ma promo » :** une seule fois par écran ; dans le premier écran, c'est le bouton du hero.

### Photo frame (signature)
Une photo de remplacement, en noir et blanc (`grayscale(1) contrast(1.06)`). Au survol ou au focus, la couleur revient et la photo grossit de 3 % (700ms, cubic-bezier(0.16, 1, 0.3, 1)). Un cadre ne porte jamais de légende ; la provenance est dans les crédits du pied de page.

### Cards / Containers
- **Carte de parcours :** vert de carte, 12px de marge intérieure, une photo de 16:10 puis le titre, le texte et le lien, sans bloc encadré à l’intérieur. La carte mise en avant est en or, texte vert de nuit, et inverse l’ordre (texte d’abord, photo ensuite).
- **Fiche d'exemple :** coins de 24px, contour sable, en-tête vert ; toujours étiquetée « Exemple de fiche ».

### Soleil aux neuf pétales (signature)
- **Le dessin :** neuf pétales, un par école, symétriques, qui s'élargissent vers l'extérieur et ondulent chacun à sa façon. Aucune rotation d'ensemble : le soleil ne doit jamais évoquer une roue tournante. Le cœur est légèrement irrégulier, comme découpé aux ciseaux. Il est généré par `scripts/motifs.mjs` dans `lib/soleil.ts`.
- **Les usages :**
  - la marque, à 36px ;
  - les séparateurs du bandeau des écoles, à 24px (pétales crème à 70 %) ;
  - un grand aplat dans le collage de la section « réseau », en crème sur vert.
- **Les couleurs :** cœur toujours brun-roux ; pétales verts sur fond clair, crème sur fond sombre.

### Trame topographique
- **Le dessin :** des courbes de niveau en larges bandes, raccordables sans couture (tuile de 1200px), générées par `scripts/motifs.mjs` dans `public/motifs/topo-*.svg`.
- **La pose :** toujours en fond tamisé, dans un pseudo-élément (classe `trame`) :
  - 6 % sur crème, derrière la navigation et le hero ;
  - 6 % sur vert, dans la section des parcours et le pied de page ;
  - 16 % pour l'étoffe du formulaire.

### Bandeau des écoles
Sigles et villes des écoles réelles sur le vert, en Unbounded, séparés par de petits soleils. Il défile en boucle (45s), se met en pause au survol et par un bouton (WCAG 2.2.2). Avec le mouvement réduit activé, il est immobile et montre toutes les écoles sur plusieurs lignes.

### Motion
- Le moment d'entrée : les cadres de la mosaïque s'ouvrent du bas vers le haut (clip-path, 1000ms, 130ms d'écart).
- Sinon, seulement des réponses au survol.
- Tout reste visible d'emblée quand le mouvement réduit est activé.

## Do's and Don'ts

### Do:
- **Do** montrer de vraies personnes en photo, en noir et blanc, dans des cadres arrondis.
- **Do** créditer chaque photo de remplacement dans le pied de page, et la remplacer dès que l'association fournit les siennes.
- **Do** garder l'or pour les actions et le brun-roux pour le décor, sans les échanger.
- **Do** poser la trame en fond tamisé, jamais à pleine force derrière du texte.
- **Do** n'afficher que des chiffres tirés de la base.
- **Do** donner aux champs un contour trait (#7A887D), jamais sable.
- **Do** dire chaque action une fois par écran, avec le même verbe partout (« Entrer mon code », « Se connecter »).
- **Do** écrire en typographie française : apostrophe ’, espace insécable avant « : » et « ? ».

### Don't:
- **Don't** ajouter une troisième couleur d'accent (corail, bleu, rouge vif).
- **Don't** répéter un même motif en frise : la trame et le soleil suffisent.
- **Don't** faire tourner les pétales du soleil dans un même sens.
- **Don't** montrer de mineurs, d'arme pointée ou de scène de combat.
- **Don't** légender une photo d'illustration comme un membre d'AET Connect.
- **Don't** poser un sur-titre au-dessus d'un titre.
- **Don't** ajouter d'ombre, de dégradé ou de verre.
- **Don't** imbriquer une carte dans une carte, ni poser une icône décorative à côté d'un chiffre.
- **Don't** recopier une image ou une étoffe existante : les motifs sont dessinés pour AET Connect.
- **Don't** inventer de pourcentages ou de statistiques.
