---
name: AET Connect
description: Annuaire panafricain des Anciens Enfants de Troupe, dessiné comme un plan de réseau.
colors:
  outremer: "#12307A"
  outremer-nuit: "#0C2159"
  safran: "#F2A900"
  corail: "#FF6B4A"
  savane: "#2BA36B"
  craie: "#FFFFFF"
  brume: "#C9D3F0"
  encre: "#0B1640"
typography:
  display:
    fontFamily: "Big Shoulders, ui-sans-serif, sans-serif"
    fontSize: "clamp(3rem, 7vw, 5.75rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Big Shoulders, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.9
  title:
    fontFamily: "Big Shoulders, ui-sans-serif, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
  station:
    fontFamily: "Big Shoulders, ui-sans-serif, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.03em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  caption:
    fontFamily: "Atkinson Hyperlegible Next, ui-sans-serif, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  none: "0px"
  station: "9999px"
spacing:
  unit: "8px"
  gutter-mobile: "20px"
  gutter: "32px"
  section-mobile: "80px"
  section: "112px"
  container: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.corail}"
    textColor: "{colors.encre}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "52px"
  button-outline:
    backgroundColor: "{colors.outremer}"
    textColor: "{colors.craie}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.craie}"
    textColor: "{colors.outremer}"
  input:
    backgroundColor: "{colors.outremer-nuit}"
    textColor: "{colors.craie}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "48px"
  station:
    backgroundColor: "{colors.craie}"
    textColor: "{colors.outremer}"
    rounded: "{rounded.station}"
    size: "56px"
  station-active:
    backgroundColor: "{colors.safran}"
    textColor: "{colors.encre}"
---

# Design System: AET Connect

## Overview

**Creative North Star: "La ligne AET"**

AET Connect se dessine comme un plan de réseau : les écoles sont des stations, et une seule ligne safran les relie sur un fond outremer. Le plan ne fait que des segments à 0°, 45° et 90°, ses stations sont des disques blancs, ses noms sont écrits en lettres de signalétique condensées. Tout ce qui n'est pas la ligne, une station ou une action se tait.

Le système est plat, franc et lisible de loin, comme un plan affiché dans une station. Il refuse trois pentes : le registre militaire (insignes, camouflage, galons), le SaaS générique (cartes arrondies, ombres douces, dégradés) et l'institutionnel (blasons, sceaux, bleu-gris administratif). Le motif africain passe par les disques des stations, un motif par école, jamais par un tissu plaqué en fond : le wax est écarté.

La ligne ne représente qu'un fait vrai : AET Connect réunit ces écoles dans un même réseau. Elle n'invente ni trajet ni liaison entre elles.

**Key Characteristics:**
- Fond outremer plein, sans texture ni dégradé.
- Une seule ligne safran, octilinéaire, épaisse ; c'est la signature.
- Stations : disques blancs cerclés d'outremer, chacun porteur du motif de son école.
- Lettres de signalétique condensées en capitales pour les noms, humaniste très lisible pour tout le reste.
- Angles vifs partout ; le cercle est réservé aux stations.
- Un seul mouvement : la ligne se trace, les stations s'allument.

## Colors

Une palette de plan de réseau : un fond profond, une couleur de ligne, une couleur d'action, et des neutres froids.

### Primary
- **Outremer** (#12307A) : le fond du plan, du hero et du pied de page ; la couleur du texte sur fond blanc. C'est le monde.
- **Safran de ligne** (#F2A900) : la ligne et le chemin vers l'action, c'est-à-dire le tracé du plan, les embranchements, le soulignement des liens, l'anneau de focus et la station sélectionnée. Contraste 6,0 sur outremer.

### Secondary
- **Corail d'action** (#FF6B4A) : uniquement le fond du bouton d'action principal, avec un texte encre (contraste 6,2).

### Tertiary
- **Vert savane** (#2BA36B) : signe « visible » dans les réglages de confidentialité, sur fond blanc uniquement. Jamais pour du texte sur outremer (contraste 3,8).

### Neutral
- **Outremer de nuit** (#0C2159) : sections secondaires et fond des champs de saisie ; donne la profondeur sans ombre.
- **Craie** (#FFFFFF) : texte principal sur outremer, disques des stations, sections claires.
- **Brume** (#C9D3F0) : texte secondaire sur outremer (villes, descriptions, aides de champ). Contraste 8,1.
- **Encre** (#0B1640) : texte posé sur safran ou corail.

### Named Rules
**The One Line Rule.** Le safran appartient à la ligne et au chemin vers l'action. Il ne colore jamais un logo, un titre, un fond de section ou une décoration.

**The One Action Rule.** Le corail ne sert qu'à l'action principale de l'écran. S'il apparaît deux fois dans la même vue, l'un des deux est de trop.

## Typography

**Display Font:** Big Shoulders 800 (avec ui-sans-serif)
**Body Font:** Atkinson Hyperlegible Next (avec ui-sans-serif)

**Character:** des lettres de signalétique condensées, pour les noms de stations et les titres, face à une humaniste conçue pour la lisibilité. La première se lit de loin, la seconde se lit sans effort.

Les deux polices sont téléchargées au build et servies par le site (next/font).

### Hierarchy
- **Display** (800, clamp(3rem, 7vw, 5.75rem), 0.88) : le titre du hero, en capitales, équilibré (`text-wrap: balance`).
- **Headline** (800, clamp(2.25rem, 4.5vw, 4rem), 0.9) : titres de section, en capitales, 14 à 16 caractères par ligne au plus.
- **Title** (800, 1.875rem, 1) : actions nommées, comme les terminus des trois parcours, en capitales.
- **Station** (800, 1.25rem, 1, +0.03em) : sigle d'une école sur le plan, en capitales.
- **Body** (400, 1.125rem, 1.375) : paragraphes, entre 34 et 52 caractères par ligne (`text-wrap: pretty`).
- **Label** (600, 0.875rem) : libellés de champs, liens d'en-tête et de pied de page.
- **Caption** (600, 0.75rem) : ville et pays sous un nom de station.

### Named Rules
**The Signage Rule.** Big Shoulders ne s'écrit qu'en capitales et ne descend pas sous 1.25rem ; en dessous, c'est Atkinson.

## Layout

Grille de 8px. Conteneur de 1440px de large au plus, avec des gouttières de 20px sur mobile et 32px à partir de 640px ; toutes les sections partagent ce bord. Les sections respirent : 80px de marge verticale sur mobile, 112px sur grand écran.

Le hero occupe au moins toute la hauteur de l'écran. Sur grand écran (1024px et plus), une colonne de légende de 320 à 400px porte l'offre et le formulaire, et le plan occupe le reste. Le plan dessiné s'affiche à partir de 768px ; en dessous, il devient une bande verticale : une barre safran continue, les stations en liste, les noms à droite.

Le plan est positionné en pourcentages d'un repère de 1000 × 660 : chaque station est un point sans taille, son disque et son étiquette s'y ancrent à distance fixe.

## Elevation & Depth

Aucune ombre. La profondeur vient de deux bleus (outremer et outremer de nuit) et de l'ordre d'empilement : la ligne est sous les stations, les stations sous les étiquettes. Un élément au premier plan se signale par sa couleur (safran) et une légère mise à l'échelle (1.1), jamais par une ombre.

### Named Rules
**The Flat Map Rule.** Un plan de réseau est imprimé, pas extrudé : pas d'ombre, pas de flou, pas de biseau, pas de verre.

## Shapes

Angles vifs (0px) sur les boutons, champs, fiches et sections. Le cercle (9999px) est réservé aux stations et aux terminus des embranchements. Les traits sont épais et pleins : 2px pour les contours de champs et de boutons, 4px pour le cercle d'une station et le cadre d'une fiche, 10 unités pour la ligne. Les segments de ligne ne sont que horizontaux, verticaux ou à 45°, avec des coudes arrondis.

### Named Rules
**The Octilinear Rule.** Toute ligne dessinée suit 0°, 45° ou 90°. Une courbe libre ou un angle quelconque casse le plan.

## Components

### Buttons
- **Shape:** angles vifs (0px).
- **Primary:** fond corail, texte encre gras en 1.125rem, 52px de haut, 20px de marge intérieure, flèche à droite. Un seul par vue.
- **Hover / Focus:** le corail s'éclaircit de 12 %, la flèche avance de 4px (200ms, ease-out) ; au clic, le bouton descend d'1px. Focus : anneau safran de 3px.
- **Outline:** contour craie de 2px, texte label, 44px de haut ; au survol, il se remplit de craie et le texte passe en outremer. Sert à « Se connecter » / « Mon espace ».

### Inputs / Fields
- **Style:** fond outremer de nuit, contour craie de 2px, angles vifs, 48px de haut, texte craie, indication en brume. Les années s'écrivent en chiffres tabulaires.
- **Select:** même champ, chevron safran dessiné à droite.
- **Focus:** anneau safran de 3px.
- **Error:** message en safran, gras, annoncé (`role="alert"`) et relié au champ.

### Navigation
- **Style:** un cartouche de plan. Le nom « AET Connect » en Big Shoulders à gauche, en craie ; le bouton outline à droite. Pas de menu.
- **Liens:** texte craie souligné safran (2px, décalé de 4px) ; au survol, le texte passe en safran. Zone de clic de 44px.

### Cards / Containers
- **Exemple de fiche:** cadre outremer de 4px, angles vifs, en-tête outremer qui dit ce qu'est l'exemple, lignes séparées par un filet de 2px. Un exemple est toujours étiqueté comme tel.

### Station (signature)
Disque craie de 56px, cerclé de 4px d'outremer, qui porte le motif de son école en outremer. Au survol, au focus ou une fois sélectionné, il passe en safran et grandit de 10 %, et un trait blanc parcourt la ligne depuis la première station jusqu'à lui (500ms, ease-out) ; l'étiquette révèle alors l'année de création et le nombre d'anciens. Toucher une station choisit l'école dans le formulaire. L'étiquette se place du côté qui ne couvre pas la ligne.

### Embranchement
La ligne se divise en branches à angle droit, chacune terminée par un disque craie cerclé de safran ; chaque terminus est une action. Sur mobile, les branches deviennent une ligne verticale continue qui relie leurs terminus.

### Motion
Un seul mouvement d'entrée : la ligne se trace en 1600ms (cubic-bezier(0.16, 1, 0.3, 1)), puis les stations s'allument une à une, à 150ms d'intervalle. Uniquement sans préférence de mouvement réduit ; sinon tout est visible d'emblée.

## Do's and Don'ts

### Do:
- **Do** garder le safran pour la ligne, les liens et le focus (The One Line Rule).
- **Do** réserver le corail à un seul bouton d'action par vue.
- **Do** dessiner les nouveaux éléments graphiques comme des parties du plan : segments octilinéaires, stations, embranchements, terminus.
- **Do** écrire les noms en Big Shoulders capitales et tout le reste en Atkinson.
- **Do** étiqueter tout exemple de donnée comme un exemple.
- **Do** garder le texte brume pour le secondaire sur outremer, et la craie pour le principal.

### Don't:
- **Don't** utiliser d'insignes, galons, camouflage, blasons ou sceaux, même stylisés.
- **Don't** plaquer un tissu wax ou un motif en fond de section ; les motifs vivent dans les stations.
- **Don't** ajouter d'ombre, de dégradé, de verre ou d'angle arrondi hors des stations.
- **Don't** poser un sur-titre au-dessus d'un titre ; une action se nomme d'abord, sa condition vient dessous.
- **Don't** marquer un élément d'une barre de couleur sur le côté ; une ligne relie, elle ne souligne pas.
- **Don't** écrire du texte en vert savane sur outremer.
- **Don't** présenter une image générée comme une photo réelle d'anciens ou d'école.
