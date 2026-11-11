---
name: AET Connect
description: Annuaire panafricain des Anciens Enfants de Troupe ; vraies photos, vert profond et crème, or et brun-roux pour mettre un texte en valeur, formes organiques.
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
    fontSize: "clamp(2.1rem, 4vw, 3.4rem)"
    fontWeight: 700
    lineHeight: 1.14
    letterSpacing: "-0.015em"
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
    fontFamily: "Figtree, ui-sans-serif, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Figtree, ui-sans-serif, sans-serif"
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
    textColor: "{colors.creme}"
    typography: "{typography.label}"
    rounded: "{rounded.pilule}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.vert-carte}"
  input:
    backgroundColor: "{colors.blanc}"
    textColor: "{colors.encre}"
    rounded: "{rounded.champ}"
    padding: "0 16px"
    height: "48px"
  card-way:
    backgroundColor: "{colors.creme}"
    textColor: "{colors.encre}"
    rounded: "{rounded.carte}"
    padding: "12px"
---

# Design System: AET Connect

## Overview

**Creative North Star: "Esprit de corps"**

AET Connect montre la fraternité d'armes en vraies photos (soldats, officiers, cérémonies, gestes d'entraide), en noir et blanc, posées sur un monde de formes organiques. Une trame de courbes de niveau, le langage des cartes d'état-major, court en fond tamisé. Un soleil aux neuf pétales, un par école, porte la marque. Le vert profond et le crème composent la palette ; l'or et le brun-roux ne servent qu'à mettre un texte en valeur ou à orner.

La composition reprend la planche de référence du client (« must ») : un hero avec le texte à gauche et une mosaïque de photos à droite, un bandeau des écoles, une section « AET un jour, AET toujours » avec un collage et des chiffres, une section verte à trois cartes crème de même importance, puis le formulaire, et un pied de page signé d'« AET Connect » en très grand. Les formes organiques viennent des deux autres références du client : un soleil en papier découpé et des ondes topographiques.

Les photos sont d'illustration tant que l'association n'a pas fourni les siennes : de vrais soldats et officiers des pays des écoles, jamais présentés comme des membres.

**Key Characteristics:**
- Vraies photos en noir et blanc ; la couleur revient au survol.
- Vert profond et crème ; l'or met un texte en valeur sur le vert, le brun-roux sur le crème.
- Trame topographique en fond tamisé ; soleil aux neuf pétales pour la marque.
- Titres en Unbounded (capitales larges et pleines), texte en Figtree.
- Cadres arrondis à 24 px avec un coin plus arrondi (72 px) ; boutons en pilule.

## Colors

Une palette de terre et de végétation : vert profond et crème, avec deux accents qui mettent un texte en valeur, l'or sur le vert et le brun-roux sur le crème.

### Primary
- **Vert profond** (#1D3B2A) : sections profondes, bandeau des écoles, boutons principaux, titres sur fond clair, pétales du soleil sur fond clair.
- **Or** (#FFC000) : l'accent des fonds verts, pour un texte mis en valeur : survol des liens du pied de page, « Se connecter » dans le menu mobile, « Connect » dans le grand nom du pied de page (7,48:1). Jamais dans un bouton ni en aplat.
- **Brun-roux** (#8B4A1E) : l'accent des fonds beige : survol des liens sur crème (5,87:1), sélection de texte. C'est aussi le cœur du soleil, partout (décor, y compris sur le vert).

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
**The Highlight Rule.** L'accent dépend du fond : or sur le vert, brun-roux sur le beige. Les liens sont en graisse normale et ont la couleur du texte au repos ; au survol, ils prennent l'accent du fond (flèche dans les cartes, soulignement ailleurs). Les boutons restent vert et crème ; aucun aplat d'or. Le cœur du soleil, lui, est toujours brun-roux.

**The Real Faces Rule.** Les personnes à l'écran sont de vraies photos, jamais une illustration qui fait semblant. Une photo d'illustration n'est jamais légendée comme un membre.

## Typography

**Display Font:** Unbounded (avec ui-sans-serif)
**Body Font:** Figtree (avec ui-sans-serif)

**Character:** Unbounded est large, plein et arrondi, avec l'énergie des grands rassemblements ; il répond aux formes organiques du soleil et de la trame. Figtree, ronde et amicale, en reprend l'esprit en plus léger et reste très lisible dans les formulaires et l'annuaire. Les deux polices sont servies par le site (next/font).

### Hierarchy
- **Display** (700, clamp(2.1rem, 4vw, 3.4rem), 1.14, letter-spacing -0.015em) : le titre du hero.
- **Headline** (700, clamp(1.75rem, 3.1vw, 2.6rem), 1.1) : titres de section.
- **Figure** (600, 2.5rem, 1) : chiffres réels, en chiffres tabulaires.
- **Title** (600, 1.125rem) : titres de carte, usages de l'annuaire, nom de la marque.
- **Body** (400, 1.125rem, 1.625) : paragraphes, entre 40 et 48 caractères par ligne.
- **Label** (600, 0.875–1rem) : libellés de champs, liens, boutons.

### Named Rules
**The No Eyebrow Rule.** Aucun sur-titre au-dessus d'un titre : le titre parle seul.

**The Wide Type Rule.** Unbounded est large : on ne dépasse pas 3,75rem, et les titres de carte restent à 1,125rem.

## Layout

Conteneur de 1280px de large au plus, avec des gouttières de 20px sur mobile et 32px à partir de 640px. Les sections alternent crème (avec la trame), blanc et vert profond, sans filets de séparation à l'intérieur, avec 80px de marge verticale sur mobile et 112px sur grand écran. Pas de barre au-dessus de la navigation.

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
- **Primary :** pilule vert profond, texte crème semi-gras, 48px de haut, flèche à droite qui avance de 4px au survol ; au survol, le fond passe en vert de carte.
- **Lien fléché** (`LienFleche`) : graisse normale, encre au repos ; au survol ou au focus, il passe en brun-roux et une flèche glisse en place, sans décaler la mise en page. Un lien n'est jamais pris dans une phrase : il est seul, donc reconnaissable sans soulignement.
- **Lien secondaire du hero** (« Comment rejoindre ») : encre au repos ; au survol, brun-roux et souligné (2px, décalé de 6px), sans flèche.
- **Liens du pied de page :** crème au repos ; au survol ou au focus, ils passent en or et se soulignent (or, 2px).

### Inputs / Fields
- **Style :** fond blanc, contour trait de 2px, coins de 12px, 48px de haut, texte encre ; les années en chiffres tabulaires.
- **Liste déroulante :** même champ, avec une flèche vers le bas (ChevronDown, 20px, vert) à droite.
- **Focus :** anneau vert sur fond clair, crème sur fond vert.
- **Error :** message en alerte, gras, annoncé (`role="alert"`) et relié au champ (`aria-describedby`, `aria-invalid`).
- **Formulaire sur l’étoffe :** une carte crème posée sur un panneau vert couvert de la trame (opacité 16 %) ; son coin haut-gauche est exagéré (48px, 56px sur mobile) pour suivre celui du panneau (72px).
- **Bouton d’envoi :** il nomme le résultat (« Trouver ma promo »), puis « Vérification… » pendant l’attente.

### Navigation
- **Barre :** posée directement sur la trame du hero, sans fond propre. La marque (le soleil et « AET Connect » en Unbounded) ; à partir de 1024px, les liens « Le réseau », « Comment rejoindre » et « Se connecter » (ou « Mon espace »). Ce dernier est un lien comme les autres, sans icône ni gras, distingué seulement par le vert. Tous passent en brun-roux au survol.
- **Menu mobile (sous 1024px) :** un bouton plein « Menu » / « Fermer » (icône et texte, `aria-expanded`) ouvre un panneau vert aux coins de 24px sous la barre : les ancres en Unbounded, puis « Se connecter » en or. Il se ferme par Échap (le focus revient au bouton) ou au choix d’un lien.
- **Lien d’évitement :** « Aller au contenu », visible au focus clavier.
- **« Rejoindre ma promo » :** une seule fois par écran ; dans le premier écran, c'est le bouton du hero.

### Photo frame (signature)
Une photo de remplacement, en noir et blanc (`grayscale(1) contrast(1.06)`). Au survol ou au focus, la couleur revient et la photo grossit de 3 % (700ms, cubic-bezier(0.16, 1, 0.3, 1)). Un cadre ne porte jamais de légende ; la provenance est dans les crédits du pied de page.

### Formulaire de connexion (`LoginForm`)
- Libellés visibles, champ email typé (`autocomplete="email"`, sans correcteur), mot de passe avec un bouton « Afficher / Masquer » (`aria-pressed`), « Mot de passe oublié ? » à côté du libellé.
- Les erreurs s'affichent sous les champs (`role="alert"`), en français, sur un ton qui explique sans reprocher (« Il manque votre mot de passe », « Cet email et ce mot de passe ne correspondent à aucun compte… »). Jamais de toast pour une erreur de formulaire.
- La redirection après connexion n'accepte qu'un chemin interne (`safeRedirect`).
- En dessous, les deux chemins pour qui n'est pas encore membre, chaque lien seul sur sa ligne.

### Diaporama (`PhotoDiaporama`)
- Quatre photos d'illustration en noir et blanc, en fondu toutes les 6 s.
- En bas à droite, discrets : la légende (scène, lieu, année ; jamais l'identité des personnes), en petit texte crème avec une ombre portée, sans pastille, juste au-dessus des repères. Sur ordinateur, la légende n'apparaît qu'au survol ou au focus ; sur mobile, elle reste visible.
- Repères : de simples points crème posés sur la photo, un court trait pour la photo active. Pas de bouton pause : le défilement s'arrête au survol, au focus et dès qu'on choisit une photo, et reste immobile en mouvement réduit (WCAG 2.2.2).
- Sur la connexion, un petit cartouche « AET un jour, AET toujours » en bas à gauche (le texte disparaît sous 360px, le soleil reste).

### Page de connexion
Proposition « Le portrait » choisie par le client : sur ordinateur, le diaporama encadré à gauche (coin haut-droit à 72px), le formulaire à droite sur crème et trame ; sur mobile, le formulaire d'abord, le diaporama dessous, pour que la photo ne prenne pas le pas sur le formulaire.

### Cards / Containers
- **Carte de parcours :** crème sur le fond vert (jamais vert sur vert), 12px de marge intérieure, une photo de 16:10 puis le titre vert, le texte olive et le lien, sans bloc encadré à l’intérieur. Les trois cartes ont la même couleur. Sur mobile, l’image reste en haut pour les trois cartes. À partir de 768px, celle du milieu inverse l’ordre (texte d’abord, photo ensuite) pour le rythme.

### Soleil aux neuf pétales (signature)
- **Le dessin :** neuf pétales, un par école, symétriques, qui s'élargissent vers l'extérieur et ondulent chacun à sa façon. Aucune rotation d'ensemble : le soleil ne doit jamais évoquer une roue tournante. Le cœur est légèrement irrégulier, comme découpé aux ciseaux. Il est généré par `scripts/motifs.mjs` dans `lib/soleil.ts`.
- **Les usages :**
  - la marque, à 36px ;
  - les séparateurs du bandeau des écoles, à 24px (pétales crème à 70 %) ;
  - un grand aplat dans le collage de la section « réseau », en crème sur vert.
- **Les couleurs :** cœur toujours brun-roux ; pétales verts sur fond beige, crème sur fond vert.

### Trame topographique
- **Le dessin :** des courbes de niveau en larges bandes, raccordables sans couture (tuile de 1200px), générées par `scripts/motifs.mjs` dans `public/motifs/topo-*.svg`.
- **La pose :** toujours en fond tamisé, dans un pseudo-élément (classe `trame`) :
  - 6 % sur crème, derrière la navigation et le hero ;
  - 6 % sur vert, dans la section des parcours et le pied de page ;
  - 16 % pour l'étoffe du formulaire.

### Pied de page
Vert de nuit avec la trame. En haut, le soleil, la phrase « Annuaire panafricain des Anciens Enfants de Troupe » et les liens, crème au repos, or et soulignés au survol. Au milieu, « AET Connect » en Unbounded sur toute la largeur du conteneur (clamp(1.75rem, 11.2vw, 9.7rem), 93 à 99 % de la largeur, sans débordement dès 320px), « Connect » en or. Dessous, les crédits photo repliés.

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
- **Do** réserver l'or et le brun-roux à la mise en valeur d'un texte : l'or sur le vert, le brun-roux sur le crème.
- **Do** poser la trame en fond tamisé, jamais à pleine force derrière du texte.
- **Do** n'afficher que des chiffres tirés de la base.
- **Do** donner aux champs un contour trait (#7A887D), jamais sable.
- **Do** dire chaque action une fois par écran, avec le même verbe partout : on « rejoint » le réseau et sa promo (jamais « entrer »), on « entre son code », on « se connecte ».
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
- **Don't** poser des cartes vertes sur un fond vert, ni mettre du texte or dans un bouton.
- **Don't** séparer les éléments d'une section par des filets : l'espace suffit.
- **Don't** souligner un lien au repos, ni faire de « Se connecter » un bouton (plein ou à contour).
- **Don't** recopier une image ou une étoffe existante : les motifs sont dessinés pour AET Connect.
- **Don't** inventer de pourcentages ou de statistiques.

## Écrans de connexion

Le système visuel ci-dessus décrit d’abord la page d’accueil. Les écrans d’authentification actuels utilisent encore un style hérité : fond blanc, Cal Sans, bouton charbon, champs de 36px et ombres. Cette apparence est un état existant, pas une extension des règles AET.

La direction visuelle de la page de connexion reste à définir lors d’une prochaine revue. Le formulaire actuel propose la connexion, la récupération du mot de passe et la création de compte. Toute photo d’illustration doit rester créditée et ne pas être présentée comme un membre.
