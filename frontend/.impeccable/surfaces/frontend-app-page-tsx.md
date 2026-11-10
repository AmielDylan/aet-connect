---
version: 1
slug: "frontend-app-page-tsx"
primary_target: "frontend/app/page.tsx"
related_targets: []
---

# Page d'accueil (/)

Mode : Persuade. Visiteur : un ancien qui découvre AET Connect (souvent arrivé par un ancien), ou un membre qui revient. Il doit d'abord trouver la page belle et juste, puis rejoindre sa promo ou se connecter. Preuve disponible : les neuf écoles réelles (nom, sigle, ville, pays, année, nombre réel d'anciens via GET /api/schools). Aucune photo, aucun témoignage, aucun chiffre inventé. À éviter : trop militaire, trop SaaS générique, trop institutionnel ; pas de cliché wax. Les motifs d'école définitifs seront fournis par le client.

## Direction contract

THESIS : le réseau des anciens se lit comme un plan. Une seule ligne, la ligne AET, relie les neuf écoles : c'est ce que fait le produit. Refuse la page de la catégorie (grande photo de diplômés, compteurs, grille d'avantages) et son opposé prévisible (un aplat de motifs ethniques plein écran).

OWN-WORLD : fond outremer #12307A plein cadre ; la ligne AET en safran #F2A900, seul rôle du safran (la ligne et le chemin vers l'action) ; stations en disques blancs cerclés d'outremer, un médaillon de motif par école (motifs géométriques provisoires, à remplacer) ; étiquettes de station en sans humaniste à taille fixe ; titres en capitales condensées de signalétique ; corail #FF6B4A réservé à l'action principale ; tracés uniquement à 45° et 90°, angles nets, filets de 2 px ; une seule grille de 8 px.

STORY : l'ancien reconnaît son école sur la ligne, comprend qu'on n'entre que par sa promo (un code d'un ancien, sinon une demande), choisit sa station et son année d'entrée, et entre ; le membre se connecte en un geste.

FIRST VIEWPORT : la carte occupe tout l'écran. Bureau : la ligne AET et ses neuf stations sur les deux tiers droits ; à gauche, la légende du plan : titre en capitales condensées, une phrase, le formulaire école + année (l'école se choisit aussi en touchant une station) et le bouton corail « Rejoindre ma promo » ; « Se connecter » dans le cartouche en haut à droite. Mobile : la légende d'abord, la ligne en bande verticale dessous. Interaction signature : survoler ou focaliser une station l'allume, la ligne s'épaissit jusqu'à elle et l'étiquette déplie ville, pays, année de création, nombre d'anciens ; la toucher la sélectionne dans le formulaire.

FORM : carte schématique des neuf écoles (7e de la liste ancrée, tirage relancé une fois), clé de tirage 6df44b13.

FINISH : unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
