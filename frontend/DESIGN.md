---
name: AET Connect
description: Annuaire panafricain des Anciens Enfants de Troupe ; vraies photos, vert armée et or.
colors:
  vert: "#1D3B2A"
  vert-nuit: "#12261B"
  vert-carte: "#24452F"
  or: "#FFC000"
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
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "clamp(2.5rem, 5.2vw, 4.25rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 90"
  headline:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "clamp(2rem, 3.8vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.012em"
    fontVariation: "'wdth' 90"
  figure:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: 1
    fontVariation: "'wdth' 90"
  title:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    fontVariation: "'wdth' 90"
  body:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Archivo, ui-sans-serif, sans-serif"
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
  button-light:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.vert}"
    rounded: "{rounded.pilule}"
    padding: "0 20px"
    height: "44px"
  tab-code:
    backgroundColor: "{colors.or}"
    textColor: "{colors.vert-nuit}"
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

AET Connect montre la fraternité d'armes en vraies photos : des soldats, des officiers, des cérémonies, des gestes d'entraide, en noir et blanc, posés dans des cadres arrondis sur un fond crème. Le vert armée porte les sections profondes et l'action principale ; l'or ne sert qu'à l'accent. Des frises de motifs dessinées dans l'esprit du bogolan relient les sections, comme une bordure d'étoffe.

La composition reprend la planche de référence du client : une barre du haut sombre avec un onglet d'accent, un hero où le texte est à gauche et une mosaïque de photos à droite, un bandeau défilant, une section avec un collage de photos et des chiffres, puis une section verte avec trois cartes, dont celle du milieu est mise en avant en or. Le système est calme et soigné. L'émotion vient des photos, pas des effets.

Les photos sont d'illustration tant que l'association n'a pas fourni les siennes : de vrais soldats et officiers des pays des écoles, jamais présentés comme des membres.

**Key Characteristics:**
- Vraies photos en noir et blanc ; la couleur revient au survol.
- Vert armée en fond profond et pour l'action, or en accent, crème en fond clair.
- Cadres arrondis à 24 px, avec un coin plus arrondi (72 px) qui donne le mouvement.
- Une seule famille, Archivo : titres gras semi-condensés, texte en largeur normale.
- Frises et panneaux de motifs en traits, dans l'esprit du bogolan.
- Boutons en pilule.

## Colors

Vert armée, or et crème, sans autre couleur vive.

### Primary
- **Vert armée** (#1D3B2A) : fonds des sections profondes, bandeau des écoles, boutons principaux, titres sur fond clair.
- **Or de galon** (#FFC000) : l'accent. Texte des boutons verts, onglet « Entrez votre code », motifs et repères, soulignement des liens, anneau de focus sur fond vert. En grand fond, seulement pour la carte mise en avant.

### Neutral
- **Vert de nuit** (#12261B) : barre du haut et pied de page.
- **Vert de carte** (#24452F) : cartes posées sur le vert armée ; survol des boutons verts.
- **Crème** (#F4EEE2) : fond clair principal.
- **Blanc** (#FFFFFF) : sections claires alternées, champs, fiche d'exemple.
- **Sable** (#DDD2BB) : filets, séparateurs, fond des cadres pendant le chargement. Jamais le contour d'un champ.
- **Trait** (#7A887D) : contour des champs (3,2:1 sur crème, 3,7:1 sur blanc).
- **Encre** (#14211A) : texte principal sur crème et blanc.
- **Olive** (#4D5E52) : texte secondaire sur crème (5,98:1).
- **Brume** (#C3D1C6) : texte secondaire sur vert (7,75:1).
- **Alerte** (#9C2A1E) : messages d'erreur sur crème (6,58:1).

### Named Rules
**The Gold Accent Rule.** L'or est un accent : texte, motif, onglet, focus. Un seul grand aplat d'or par écran, la carte mise en avant.

**The Real Faces Rule.** Les personnes à l'écran sont de vraies photos, jamais une illustration qui fait semblant. Une photo d'illustration n'est jamais légendée comme un membre.

## Typography

**Display Font:** Archivo (avec ui-sans-serif), axe de largeur à 90 %
**Body Font:** Archivo, largeur normale

**Character:** une grotesque robuste, un peu industrielle. Semi-condensée et grasse, elle a la tenue d'un uniforme ; en largeur normale, elle reste chaleureuse et très lisible.

### Hierarchy
- **Display** (700, clamp(2.5rem, 5.2vw, 4.25rem), 1.02) : le titre du hero, 16 caractères par ligne au plus, équilibré.
- **Headline** (700, clamp(2rem, 3.8vw, 3.25rem), 1.05) : titres de section.
- **Figure** (700, 2.75rem, 1) : chiffres réels, en chiffres tabulaires.
- **Title** (700, 1.25rem) : titres de carte, marque.
- **Body** (400, 1.125rem, 1.625) : paragraphes en olive, 44 à 52 caractères par ligne.
- **Label** (600, 0.875–1rem) : libellés de champs, liens, boutons.

### Named Rules
**The No Eyebrow Rule.** Aucun sur-titre au-dessus d'un titre : le titre parle seul.

## Layout

Conteneur de 1280px de large au plus, avec des gouttières de 20px sur mobile et 32px à partir de 640px. Les sections alternent crème, blanc et vert armée, avec 80px de marge verticale sur mobile et 112px sur grand écran.

Le hero est en deux colonnes (5/12 de texte, 7/12 de mosaïque) à partir de 1024px. La mosaïque garde une grille fixe : un grand portrait à gauche, abaissé de 64px, et trois cadres empilés à droite, entre 420 et 600px de haut. Les sections à collage et les formulaires sont en deux colonnes égales à partir de 1024px. Les cartes de parcours sont en trois colonnes à partir de 768px. Sur mobile, tout passe en une colonne, le texte avant l'image.

## Elevation & Depth

Aucune ombre. La profondeur vient de l'alternance des fonds (crème, blanc, vert, vert de nuit), de cartes vert de carte posées sur le vert, et de petites cartes crème posées sur un panneau de motifs.

### Named Rules
**The Flat Fabric Rule.** Pas d'ombre, de flou ni de verre : les surfaces sont des aplats, comme une étoffe.

## Shapes

Tout est arrondi, sans angle vif. Les photos ont des coins de 24px, et un coin par cadre passe à 72px : en haut à gauche ou en bas à droite dans la mosaïque, en bas à gauche ou en haut à droite dans les collages. Les cartes ont des coins de 28px et leurs blocs intérieurs de 20px ; les champs, de 12px ; les boutons sont des pilules. Les filets font 2px, en sable.

## Components

### Buttons
- **Primary :** pilule vert armée, texte or semi-gras, 48px de haut, flèche à droite qui avance de 4px au survol ; au survol, le fond passe en vert de carte.
- **Light :** pilule crème au texte vert, sur fond vert (« J'ai déjà un compte »).
- **Text link :** texte vert ou crème souligné d'or (2px, décalé de 6px).

### Inputs / Fields
- **Style :** fond blanc, contour trait de 2px, coins de 12px, 48px de haut, texte encre ; les années en chiffres tabulaires.
- **Focus :** contour vert armée et anneau de focus.
- **Error :** message en alerte, gras, annoncé (`role="alert"`) et relié au champ (`aria-describedby`, `aria-invalid`).
- **Formulaire sur l’étoffe :** le formulaire d’entrée est une carte crème posée sur un panneau de motifs vert ; le panneau sert de cadre, jamais de simple décor.
- **Bouton d’envoi :** il nomme le résultat (« Trouver ma promo »), puis « Vérification… » pendant l’attente.

### Navigation
- **Barre du haut :** vert de nuit, une phrase en brume à gauche, l'onglet or à droite (coin bas-gauche arrondi).
- **Barre principale :** sur crème ; la marque (disque vert portant deux galons or pointés vers le haut, puis le nom), les ancres au soulignement or (à partir de 1024px), « Se connecter » et le bouton principal.
- **Lien d’évitement :** « Aller au contenu », visible au focus clavier.

### Photo frame (signature)
Une photo de remplacement, en noir et blanc (`grayscale(1) contrast(1.06)`). Au survol ou au focus, la couleur revient et la photo grossit de 3 % (700ms, cubic-bezier(0.16, 1, 0.3, 1)). Un cadre ne porte jamais de légende ; la provenance est dans les crédits du pied de page.

### Cards / Containers
- **Carte de parcours :** vert de carte, 12px de marge intérieure, une photo de 16:10 puis le titre, le texte et le lien, sans bloc encadré à l’intérieur ; la carte mise en avant est en or et inverse l’ordre (texte d’abord, photo ensuite).
- **Fiche d'exemple :** coins de 24px, contour sable, en-tête vert ; toujours étiquetée « Exemple de fiche ».

### Bogolan
Frises de 32px de haut (zigzag, échelle, points, chevrons, spirale carrée) en or sur le vert, au haut et au bas des sections vertes et au haut du pied de page. Panneaux pleins (rangées de motifs) en or ou en crème translucide sur le vert. Trait rond de 3px, une seule couleur. Signes isolés (chevrons, losange, échelle, spirale) comme repères et séparateurs.

### Bandeau des écoles
Sigles et villes des écoles réelles sur le vert, séparés par des signes or. Il défile en boucle (45s), se met en pause au survol et par un bouton (WCAG 2.2.2). Avec le mouvement réduit activé, il est immobile et montre toutes les écoles sur plusieurs lignes.

### Motion
- Le moment d'entrée : les cadres de la mosaïque s'ouvrent du bas vers le haut (clip-path, 1000ms, 130ms d'écart).
- Sinon, seulement des réponses au survol.
- Tout reste visible d'emblée quand le mouvement réduit est activé.

## Do's and Don'ts

### Do:
- **Do** montrer de vraies personnes en photo, en noir et blanc, dans des cadres arrondis.
- **Do** créditer chaque photo de remplacement dans le pied de page, et la remplacer dès que l'association fournit les siennes.
- **Do** garder l'or pour l'accent : texte des boutons verts, motifs, onglet, soulignement.
- **Do** n'afficher que des chiffres tirés de la base.
- **Do** donner aux champs un contour trait (#7A887D), jamais sable.
- **Do** dire chaque action une fois par section, avec le même verbe partout (« Entrer mon code », « Se connecter »).
- **Do** écrire en typographie française : apostrophe ’, espace insécable avant « : » et « ? ».

### Don't:
- **Don't** montrer de mineurs, d'arme pointée ou de scène de combat.
- **Don't** légender une photo d'illustration comme un membre d'AET Connect.
- **Don't** poser un sur-titre au-dessus d'un titre.
- **Don't** ajouter d'ombre, de dégradé ou de verre.
- **Don't** recopier une étoffe ou une planche existante : les motifs sont dessinés pour AET Connect.
- **Don't** inventer de pourcentages ou de statistiques.
- **Don't** imbriquer une carte dans une carte.
- **Don't** poser une icône décorative à côté d’un chiffre, ni un ornement flottant sans fonction.
- **Don't** remplacer un usage concret par une valeur abstraite (« Fraternité », « Confiance ») : dites ce que l’annuaire permet.
