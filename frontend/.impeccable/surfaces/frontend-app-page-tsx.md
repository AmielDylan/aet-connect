---
version: 2
slug: "frontend-app-page-tsx"
primary_target: "frontend/app/page.tsx"
related_targets: []
---

# Page d'accueil (/)

Mode : Persuade. Visiteur : un ancien qui découvre AET Connect (souvent arrivé par un ancien), ou un membre qui revient. Il doit d'abord trouver la page belle et juste, puis rejoindre sa promo ou se connecter. Preuves disponibles : les neuf écoles réelles (sigle, ville, pays, année de création) via GET /api/schools, et des photos libres de droits de soldats et d'officiers des pays des écoles. Aucun témoignage, aucun chiffre inventé.

Historique : une première direction, « la ligne AET » (plan de réseau schématique, sans photo), a été livrée puis écartée par le client le 10 novembre 2026, parce qu'elle était trop abstraite et ne montrait pas de vraies images.

## Direction contract

THESIS : la fraternité d'armes se montre en vraies photos. Des soldats, des officiers, des cérémonies et de l'entraide, en noir et blanc, encadrent un réseau sobre où l'on retrouve sa promo.

OWN-WORLD : la planche « must » du client pour la composition ; deux autres références du client (un soleil en papier découpé, des ondes topographiques vert profond sur crème) pour la matière et la palette.
- Palette : vert profond #1D3B2A, crème #F4EEE2 et un seul accent, le brun-roux #8B4A1E (choix du client : plus d'or).
- Photos : vraies photos en noir et blanc, dans des cadres arrondis à 24 px avec un coin à 72 px.
- Motifs : une trame topographique en fond tamisé (6 %) et le soleil aux neuf pétales, un par école, comme marque. Tous deux sont dessinés pour AET Connect (`scripts/motifs.mjs`).
- Typographie (choix du client, essai « C · Le défilé ») : Unbounded pour les titres, Familjen Grotesk pour le texte.
- Navigation : pas de barre au-dessus ; « Se connecter » en bouton cerclé. « Rejoindre ma promo » n'apparaît qu'une fois dans le premier écran.

STORY : l'ancien voit des visages et des uniformes qui lui parlent. Il lit qu'on retrouve sa promo, voit défiler les écoles et les vrais chiffres, comprend les trois façons d'entrer, choisit son école et son année, et entre. Le membre se connecte en un geste.

FIRST VIEWPORT : la navigation posée sur la trame (le soleil et « AET Connect », les ancres, « Se connecter »). À gauche, le titre « Retrouvez les anciens de votre promo », une phrase et deux actions ; à droite, une mosaïque de quatre photos en noir et blanc, un grand portrait et trois cadres empilés. Sur mobile, le texte vient d'abord, puis la mosaïque. Moment signature : les cadres de la mosaïque s'ouvrent l'un après l'autre ; au survol, une photo reprend sa couleur.

FORM : planche « must » imposée par le client (« le hero section me convient parfaitement », puis « toute la planche peut être inspirante, il suffit de bien harmoniser »). Il n'y a pas eu de tirage de concept : la référence est un choix du client, pas un tirage. Écarts voulus :
- la petite phrase au-dessus du titre (« Elevate your brand ») est retirée, car interdite par les règles de qualité ;
- le badge circulaire est retiré, à la demande du client ;
- les barres de pourcentage deviennent trois piliers, sans chiffre inventé ;
- les étincelles deviennent des motifs or.

Contraintes du client :
- adultes seulement sur les photos ;
- palette vert armée, or et crème ;
- photos en noir et blanc.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
