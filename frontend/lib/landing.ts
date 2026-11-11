// Données de la page d'accueil : les écoles réelles et les photographies d'illustration.

export type LandingSchool = {
  id: string
  name_fr: string
  acronym?: string | null
  city: string
  country: string
  established_year: number | null
  total_members: number
}

/** Les écoles référencées (celles qui ont un sigle), dans l'ordre de leur création */
export function realSchools(schools: LandingSchool[]) {
  return schools
    .filter((s) => Boolean(s.acronym))
    .sort((a, b) => (a.established_year ?? 9999) - (b.established_year ?? 9999))
}

export function schoolFacts(schools: LandingSchool[]) {
  const real = realSchools(schools)
  const oldest = real.find((s) => s.established_year)
  return {
    count: real.length,
    countries: new Set(real.map((s) => s.country)).size,
    oldest: oldest ? { year: oldest.established_year as number, city: oldest.city } : null,
  }
}

// Photographies d'illustration, sous licence libre (Wikimedia Commons).
// Ce sont de vrais soldats et officiers des pays des écoles, jamais présentés comme des membres
// d'AET Connect : elles seront remplacées par les photos de l'association.
export type Photo = {
  src: string
  width: number
  height: number
  alt: string
  /** Légende courte et factuelle : la scène, le lieu, l'année (jamais l'identité des personnes) */
  caption: string
  by: string
  licence: string
  licenceUrl: string
  page: string
  note?: string
}

const PD = 'https://creativecommons.org/publicdomain/mark/1.0/'

export const PHOTOS = {
  medailles: {
    src: '/images/accueil/medailles.jpg', width: 1160, height: 1440,
    alt: 'Une militaire béninoise en béret bleu porte un coussin de médailles lors d’une cérémonie',
    caption: 'Remise de médailles à des Casques bleus béninois',
    by: 'MONUSCO Photos', licence: 'CC BY-SA 2.0', licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
    page: 'https://commons.wikimedia.org/wiki/File:Deux_casques_bleus_b%C3%A9ninois_tiennent_pr%C3%AAts_les_m%C3%A9dailles_destin%C3%A9es_aux_soldats_r%C3%A9cipiendaires._(23940317611).jpg',
    note: 'recadrée, diffusée sous la même licence',
  },
  gardeHonneur: {
    src: '/images/accueil/garde-honneur.jpg', width: 1600, height: 939,
    alt: 'Deux soldats burkinabè en béret rouge, l’un portant le drapeau, lors d’une garde d’honneur',
    caption: 'Garde d’honneur, Burkina Faso, 2019',
    by: 'U.S. Embassy Ouagadougou', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:Burkinabe_honor_guards_-_2019.jpg',
  },
  officier: {
    src: '/images/accueil/officier.jpg', width: 1600, height: 1066,
    alt: 'Un officier supérieur africain prend la parole lors d’une conférence militaire',
    caption: 'Colloque des forces terrestres africaines, 2021',
    by: 'U.S. Army SETAF-AF, Pfc. Jacob Bradford', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:African_Land_Forces_Colloquium_2021_(6855659).jpg',
  },
  portage: {
    src: '/images/accueil/portage.jpg', width: 1600, height: 792,
    alt: 'Des soldats maliens portent chacun un camarade sur les épaules pendant un entraînement',
    caption: 'Entraînement au portage, Loumbila (Burkina Faso), 2019',
    by: 'USAFRICOM, Spc. Peter Seidler', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:Malian_Soldiers_practice_the_firemen%E2%80%99s_carry_in_Loumbila,_Burkina_Faso_during_exercise_Flintlock_2019.jpg',
  },
  promo: {
    src: '/images/accueil/promo.jpg', width: 1300, height: 620,
    alt: 'Photo de groupe de soldats burkinabè, nigériens et sénégalais à la fin d’une formation',
    caption: 'Fin de formation, Pô (Burkina Faso), 2019',
    by: 'U.S. Army, Sgt. 1st Class Mary S. Katzenberger', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:Burkinabe,_Nigerien_and_Senegalese_soldiers_and_marines_pose_for_a_photo_after_an_outstation_closing_ceremony_for_Exercise_Flintlock_2019_near_Po,_Burkina_Faso,_Feb._27,_2019.jpg',
  },
  promoGrand: {
    src: '/images/accueil/promo-grand.jpg', width: 1500, height: 900,
    alt: 'Photo de groupe de soldats burkinabè, nigériens et sénégalais à la fin d’une formation',
    caption: 'Fin de formation, Pô (Burkina Faso), 2019',
    by: 'U.S. Army, Sgt. 1st Class Mary S. Katzenberger', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:Burkinabe,_Nigerien_and_Senegalese_soldiers_and_marines_pose_for_a_photo_after_an_outstation_closing_ceremony_for_Exercise_Flintlock_2019_near_Po,_Burkina_Faso,_Feb._27,_2019.jpg',
    note: 'recadrage plus large de la même photo',
  },
  secours: {
    src: '/images/accueil/secours.jpg', width: 1600, height: 1062,
    alt: 'Des soldats burkinabè aident un camarade à descendre d’un véhicule pendant un exercice de secours',
    caption: 'Exercice de secours, Burkina Faso, 2017',
    by: 'Spc. Britany Slessman', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:Medical_training_during_Flintlock_2017_in_Burkina_Faso_170310-A-ZF167-136.jpg',
  },
  ceremonie: {
    src: '/images/accueil/ceremonie.jpg', width: 1600, height: 966,
    alt: 'Une garde d’honneur burkinabè au garde-à-vous devant le drapeau, un officier salue',
    caption: 'Cérémonie au drapeau, Burkina Faso, 2017',
    by: 'Spc. Britany Slessman', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:Flintlock_2017_closing_ceremony_in_Burkina_Faso_170316-A-ZF167-018.jpg',
  },
  ecusson: {
    src: '/images/accueil/ecusson.jpg', width: 1600, height: 1066,
    alt: 'Gros plan sur l’écusson du Gabon cousu sur la manche d’un uniforme',
    caption: 'Écusson du Gabon sur un uniforme',
    by: 'U.S. Army, Sgt. 1st Class Andrew Mallett', licence: 'Domaine public', licenceUrl: PD,
    page: 'https://commons.wikimedia.org/wiki/File:African_Lion_partner_nations_participate_in_an_academics_graduation_(9042937).jpg',
  },
  defile: {
    src: '/images/accueil/defile.jpg', width: 1600, height: 1066,
    alt: 'Un officier nigérien défile en gants blancs devant les troupes alignées',
    caption: 'Cérémonie d’ouverture, Niger, 2018',
    by: 'USAFRICOM', licence: 'CC BY 2.0', licenceUrl: 'https://creativecommons.org/licenses/by/2.0/',
    page: 'https://commons.wikimedia.org/wiki/File:Flintlock_2018_Opening_Ceremony_(27523527268).jpg',
  },
} satisfies Record<string, Photo>
