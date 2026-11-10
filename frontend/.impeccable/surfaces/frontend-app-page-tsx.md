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

OWN-WORLD : la référence imposée est la planche « must » du client (`~/Downloads/AET Connect/must.jpg`), prise dans son ensemble.
- Palette : vert armée #1D3B2A et vert de nuit #12261B pour les fonds profonds et l'action principale ; or #FFC000 en accent (texte des boutons, motifs, onglet, focus), en grand fond seulement sur la carte mise en avant ; crème #F4EEE2 et blanc pour les fonds clairs.
- Photos : vraies photos en noir et blanc, dans des cadres arrondis à 24 px, chacun avec un coin plus arrondi (72 px). La couleur revient au survol.
- Motifs : frises et panneaux dessinés dans l'esprit du bogolan, d'après les planches du client (crème sur vert, brun sur crème), sans les recopier.
- Typographie : une seule famille, Archivo ; titres en gras semi-condensés (90 %), en minuscules et majuscules ; texte courant en largeur normale.
- Boutons : arrondis pleins (pilule).

STORY : l'ancien voit des visages et des uniformes qui lui parlent. Il lit qu'on retrouve sa promo, voit défiler les écoles et les vrais chiffres, comprend les trois façons d'entrer, choisit son école et son année, et entre. Le membre se connecte en un geste.

FIRST VIEWPORT : en haut, une barre vert de nuit, avec à droite un onglet or « Un ancien vous a envoyé un code ? Entrez-le ». Dessous, la navigation : marque, ancres, « Se connecter » et le bouton « Rejoindre ma promo ». À gauche, le titre « Retrouvez les anciens de votre promo », une phrase et deux actions ; à droite, une mosaïque de quatre photos en noir et blanc, un grand portrait et trois cadres empilés. Sur mobile, le texte vient d'abord, puis la mosaïque. Moment signature : les cadres de la mosaïque s'ouvrent l'un après l'autre ; au survol, une photo reprend sa couleur.

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
