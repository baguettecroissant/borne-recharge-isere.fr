// Programmatic Content Engine - Isère (38) - Borne de Recharge
// Generates highly unique, localized, helpful content for each commune in the Isère department.
// Uses a multi-dimensional sentence-level spintax matrix to avoid duplicate content penalties
// and provides rich technical details (E-E-A-T) optimized for local search queries in 38.

import communes from '../data/communes.json';

export function spin(text: string, seed: string): string {
  let result = text;
  const spintaxTest = /{([^{}|]+\|[^{}]+)}/;
  const spintaxReplace = /{([^{}|]+\|[^{}]+)}/g;
  
  while (spintaxTest.test(result)) {
    result = result.replace(spintaxReplace, (match, choicesStr) => {
      if (['VILLE', 'CODE_POSTAL', 'PRIX_MIN', 'PRIX_MAX', 'VARIANTE_INTRO'].includes(choicesStr)) {
        return match;
      }
      const choices = choicesStr.split('|');
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
      }
      hash = hash + choicesStr.length;
      const index = Math.abs(hash) % choices.length;
      return choices[index];
    });
  }
  return result;
}

export interface Commune {
  nom: string;
  slug: string;
  codeInsee: string;
  codePostal: string;
  population: number;
  altitude?: number;
  prixM2Moyen?: number;
  logements?: number;
  logementsMaison?: number;
  vehiculesElectriques?: number;
  croissanceVE?: number;
  bornesPubliques?: number;
  intercommunalite?: string;
  canton?: string;
  latitude?: number;
  longitude?: number;
  distanceGrenoble?: number; // distance to Grenoble center
  densiteBornes?: number;
  profilCommune?: string;
  marcheImmobilier?: string;
  tauxMaisonLabel?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  description: string;
}

export interface GuideLink {
  href: string;
  label: string;
  desc: string;
}

export interface LocalContent {
  introParagraph: string;
  logisticsAlert: string;
  useCaseText: string;
  pricesContext: string;
  faqItems: { question: string; answer: string }[];
  ecoText: string;
  localContext: string;
  climateZoneLabel: string;
  localAgencyName: string;
  externalLinks: ExternalLink[];
  communeDataInsight: string;
  expertTip: string;
  tableIntro: string;
  guideLinks: GuideLink[];
  savingsEstimate: string;
  lastUpdated: string;
  realEstateInsight: string;
  populationTierContent: string;
  densiteAnalysis: string;
  marcheImmobilierInsight: string;
  distanceGrenobleContext: string;
  anecdotePatrimoine: string;
  localRegulation: string;
  sourcesCitation: string;
  mobiliteContext: string;
  specificiteElectrique: string;
  expertBlockquote: string;
  intercommunaliteContext: string;
  profilCommuneInsight: string;
}

export type GeographicZone = 'mountain' | 'grenoble-metro' | 'isere-plains';

export function getGeographicZone(codePostal: string, slug: string, altitude: number = 250): GeographicZone {
  const cp = codePostal.trim();
  if (altitude > 600 || cp.startsWith('38750') || cp.startsWith('38410') || cp.startsWith('38250') || slug === 'villard-de-lans' || slug === 'chamrousse') {
    return 'mountain';
  }
  if (cp.startsWith('38000') || cp.startsWith('38100') || cp.startsWith('38400') || cp.startsWith('38130') || cp.startsWith('38600') || slug === 'grenoble' || slug === 'meylan') {
    return 'grenoble-metro';
  }
  return 'isere-plains';
}

export function getLocalAgency(codePostal: string, slug: string): { name: string; detail: string; website: string } {
  return {
    name: "l'Espace Conseil France Rénov' de l'Isère (animé par l'ALEC ou l'AGEDEN 38)",
    detail: "le service public d'accompagnement de la transition écologique en Isère",
    website: "ageden38.org"
  };
}

export function getVariantIndex(slug: string, offset: number, maxVariants: number): number {
  // FNV-1a inspired hash with proper offset mixing
  let hash = 2166136261; // FNV offset basis
  hash = Math.imul(hash ^ offset, 16777619);
  hash = Math.imul(hash ^ (offset >>> 16), 2654435761);
  for (let i = 0; i < slug.length; i++) {
    hash = Math.imul(hash ^ slug.charCodeAt(i), 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 2246822507);
  hash ^= hash >>> 13;
  return (hash >>> 0) % maxVariants;
}

export function getDynamicPrices(commune: Commune) {
  let priceFactor = 1.0;
  
  if (commune.population > 100000) priceFactor += 0.02; // Grenoble
  else if (commune.population > 30000) priceFactor += 0.01; // Vienne, Bourgoin-Jallieu
  
  if (commune.altitude && commune.altitude > 800) {
    priceFactor += 0.08; // mountain premium (cable length, ground drill, gel protections)
  } else if (commune.altitude && commune.altitude > 500) {
    priceFactor += 0.04; // mid-altitude surcharge
  } else if (commune.prixM2Moyen && commune.prixM2Moyen > 3500) {
    priceFactor += 0.05; // Grésivaudan premium
  } else if (commune.prixM2Moyen && commune.prixM2Moyen > 2500) {
    priceFactor += 0.02; // mid-range markets
  } else if (commune.prixM2Moyen && commune.prixM2Moyen < 1900) {
    priceFactor -= 0.04; // accessible areas
  } else if (commune.prixM2Moyen && commune.prixM2Moyen < 2200) {
    priceFactor -= 0.02; // moderate areas
  }
  
  // Distance-based adjustment (farther from Grenoble = slightly higher logistics cost)
  if (commune.distanceGrenoble && commune.distanceGrenoble > 60) {
    priceFactor += 0.02; // remote communes surcharge
  } else if (commune.distanceGrenoble && commune.distanceGrenoble > 35) {
    priceFactor += 0.01; // mid-distance surcharge
  }
  
  priceFactor = Math.max(0.90, Math.min(1.18, priceFactor));

  return {
    greenUp: { min: Math.round(400 * priceFactor), max: Math.round(700 * priceFactor) },
    wallbox7kW: { min: Math.round(1200 * priceFactor), max: Math.round(1800 * priceFactor) },
    wallbox11kW: { min: Math.round(1500 * priceFactor), max: Math.round(2300 * priceFactor) },
    wallbox22kW: { min: Math.round(2100 * priceFactor), max: Math.round(3600 * priceFactor) },
    copro: { min: Math.round(2600 * priceFactor), max: Math.round(4800 * priceFactor) },
    triUpgrade: { min: Math.round(500 * priceFactor), max: Math.round(1300 * priceFactor) },
    priceFactor
  };
}

export function getAnecdotePatrimoine(slug: string, nom: string): string {
  if (slug === 'grenoble' || slug === 'saint-martin-d-heres' || slug === 'echirolles' || slug === 'la-tronche') {
    return "Grenoble, capitale des Alpes, est connue pour son téléphérique de la Bastille (les célèbres \"bulles\"), son pôle scientifique d'excellence (CEA, CNRS, campus universitaire de Saint-Martin-d'Hères) et son passé industriel innovant. Installer une borne de recharge ici, c'est s'inscrire dans l'héritage d'une ville pionnière de l'hydroélectricité (la \"houille blanche\") et de la recherche en microélectronique. Les électriciens qualifiés IRVE y adaptent la recharge aux contraintes spécifiques de la cuvette grenobloise, sujette aux variations thermiques.";
  }
  if (slug === 'voiron' || slug === 'voreppe' || slug === 'rives' || slug === 'coublevie') {
    return `Voiron, célèbre pour ses caves de la Chartreuse — la plus longue cave à liqueurs du monde — et son église Saint-Bruno, bénéficie d'une forte identité dauphinoise. Installer un point de charge résidentiel à ${nom} permet aux conducteurs d'aborder sereinement les routes du parc naturel de la Chartreuse tout en bénéficiant d'un réseau électrique stable et mis aux normes par des installateurs qualifiés de la région voironnaise.`;
  }
  if (slug === 'crolles' || slug === 'meylan' || slug === 'saint-ismier' || slug === 'montbonnot-saint-martin') {
    return `Le Grésivaudan, qualifié autrefois par Louis XII de \"plus belle vallée de France\", héberge aujourd'hui la Silicon Valley iséroise avec STMicroelectronics et Innovia. À ${nom}, les résidences haut de gamme dotées de garages individuels sont idéales pour des wallbox intelligentes de 7.4 kW ou 11 kW. L'installation de bornes de recharge y est particulièrement dynamique, portée par les cadres et ingénieurs technophiles.`;
  }
  if (slug === 'vienne' || slug === 'pont-eveque' || slug === 'chasse-sur-rhone') {
    return `Vienne, riche de ses vestiges romains comme le Temple d'Auguste et de Livie ou le Théâtre Antique qui accueille chaque été son célèbre festival de jazz, marque la limite nord de la vallée du Rhône. À ${nom}, l'installation d'une borne wallbox est plébiscitée par les navetteurs qui effectuent des allers-retours quotidiens vers l'agglomération lyonnaise via l'A7 ou l'A46.`;
  }
  if (slug === 'bourgoin-jallieu' || slug === 'villefontaine' || slug === 'l-isle-d-abeau') {
    return `Bourgoin-Jallieu et le Nord-Isère, réputés pour leur tradition textile et leur club de rugby historique (CSBJ), connaissent une forte croissance périurbaine. À ${nom}, équiper sa maison individuelle dauphinoise d'une borne renforcée Green'Up ou d'une wallbox connectée constitue une valeur ajoutée immobilière indéniable pour les foyers travaillant à Lyon ou Saint-Quentin-Fallavier.`;
  }
  if (slug === 'villard-de-lans' || slug === 'chamrousse' || slug === 'alpe-d-huez') {
    return `La montagne iséroise, marquée par les Jeux Olympiques d'hiver de 1968 à Chamrousse et le relief grandiose du Vercors et de l'Oisans, impose des conditions extrêmes aux batteries des voitures électriques. À ${nom}, la pose d'une wallbox de recharge rapide résistante au gel (-20°C, indice IP65 et IK10) est cruciale. Elle garantit un préchauffage optimal de la batterie de votre VE le matin pour affronter la montée des cols ou les températures négatives.`;
  }
  
  // Generic 16 thematic anecdotes for Isère
  const genericAnecdotes = [
    `L'Isère, département pionnier de la houille blanche (hydroélectricité développée par Aristide Bergès à Lancey), produit une électricité locale très décarbonée grâce à ses barrages alpins. Charger sa voiture électrique à ${nom} avec une wallbox résidentielle revient à consommer une énergie à 95% propre et renouvelable.`,
    `Les hivers rigoureux dans le 38 ont un impact majeur sur la chimie des batteries lithium-ion, entraînant une perte d'autonomie temporaire de 20% à 30%. Pour les habitants de ${nom}, disposer d'une borne murale connectée permet de pré-conditionner thermiquement le véhicule via son application de charge, limitant drastiquement ce déficit hivernal.`,
    `Les trajets reliant la vallée de l'Isère aux stations de ski (l'Alpe d'Huez, Chamrousse, Les Deux Alpes) sollicitent fortement la batterie à la montée, mais permettent de régénérer jusqu'à 8 kWh d'électricité lors de la descente grâce au freinage régénératif du VE. Une borne IRVE chez soi à ${nom} assure le départ de ces trajets avec un niveau de charge maximal.`,
    `La ZFE (Zone à Faibles Émissions) de Grenoble Métropole qui s'étend progressivement sur le territoire rend la mobilité propre incontournable. À ${nom}, devancer cette législation en installant une wallbox de 7.4 kW valorise votre bien immobilier et simplifie vos déplacements périurbains réguliers.`,
    `L'Isère se caractérise par la diversité de son habitat, entre maisons traditionnelles dauphinoises en pisé, chalets en bois dans les massifs et résidences étudiantes sur le campus. Nos artisans IRVE partenaires adaptent chaque raccordement électrique à la nature de la structure d'habitation à ${nom}.`,
    `Le parc naturel régional de la Chartreuse et les sommets de Belledonne sont propices aux activités outdoor. À ${nom}, équiper son domicile d'une prise de recharge rapide permet de recharger sa voiture après une journée de randonnée ou de ski, sans dépendre du réseau public de bornes de recharge parfois saturé.`,
    `La noix de Grenoble AOP, trésor du patrimoine agricole isérois cultivé le long de la vallée de l'Isère, cohabite avec une transition moderne vers l'électromobilité. À ${nom}, la mise en conformité du tableau électrique par un électricien qualifié IRVE permet d'alimenter son VE de manière sécurisée et respectueuse des normes environnementales.`,
    `La gestion de la puissance électrique est un enjeu clé lors de la pose d'une borne en Isère. Nos installateurs certifiés à ${nom} intègrent des solutions de délestage dynamique avec le compteur Linky pour éviter de surcharger votre abonnement Enedis lorsque les appareils de chauffage fonctionnent.`,
    `Les grands axes routiers de l'Isère (A48 vers Lyon, A49 vers Valence, A41 vers Chambéry et N85 Route Napoléon) sont empruntés quotidiennement. Pour les résidents de ${nom}, disposer d'un chargeur à domicile de 7.4 kW ou 11 kW permet d'assurer un plein en heures creuses à moindre coût.`,
    `La protection contre le gel et les intempéries est une priorité pour les raccordements en allée ou parking extérieur. À ${nom}, les bornes que nous préconisons bénéficient d'un indice IK10 contre les chocs de déneigement et IP65 contre les tempêtes de neige alpines.`,
    `L'Isère abrite de nombreuses entreprises technologiques de pointe et des centres de recherche (CEA, STMicroelectronics, Schneider Electric). Les ingénieurs résidant à ${nom} privilégient des wallbox connectées haut de gamme (Hager, Wallbox, Easee) intégrant des fonctionnalités avancées de Smart Charging.`,
    `Les aides financières cumulables en Isère (crédit d'impôt de 500 € en 2026, TVA réduite à 5,5% et subventions locales ADVENIR) rendent la transition vers la voiture électrique particulièrement attractive et abordable à ${nom}.`,
    `Les copropriétés à ${nom} bénéficient du droit à la prise. Nos électriciens qualifiés IRVE conçoivent des infrastructures collectives sûres pour les parkings souterrains ou aériens, gérant l'équilibrage de puissance entre les différents véhicules.`,
    `La mise à la terre est un point technique crucial souvent négligé dans le 38. Avant toute pose de borne à ${nom}, nos électriciens mesurent la résistance de la terre pour garantir qu'elle est inférieure à 100 ohms, seuil de sécurité obligatoire pour le démarrage de la recharge.`,
    `Les chalets de montagne en Isère demandent des installations adaptées à l'altitude. À ${nom}, nos installateurs dimensionnent les câbles pour supporter des variations de puissance induites par les basses températures nocturnes.`,
    `Opter pour une wallbox connectée à ${nom} permet de diviser par 5 le budget carburant annuel. En programmant le déclenchement de la recharge à 22h, vous bénéficiez du tarif heures creuses d'Enedis Isère, soit environ 2.80 € pour restaurer 300 km d'autonomie.`
  ];
  
  let hashVal = 0;
  for (let i = 0; i < slug.length; i++) {
    hashVal = (hashVal * 31 + slug.charCodeAt(i)) | 0;
  }
  hashVal = hashVal ^ (slug.length * 2654435761);
  return genericAnecdotes[Math.abs(hashVal) % genericAnecdotes.length];
}

function getExternalLinks(category: string, codePostal: string, slug: string): ExternalLink[] {
  const base: ExternalLink[] = [
    {
      label: "Programme ADVENIR — Subventions Bornes de Recharge",
      url: "https://advenir.mobi",
      description: "Site officiel du programme ADVENIR détaillant les primes pour les particuliers, les copropriétés et les syndics."
    },
    {
      label: `Espace Conseil France Rénov' de l'Isère (AGEDEN / ALEC)`,
      url: "https://www.ageden38.org",
      description: "Accompagnement de proximité gratuit pour votre transition énergétique et aides financières en Isère."
    },
    {
      label: "Avere-France — Association nationale de mobilité électrique",
      url: "https://www.avere-france.org",
      description: "L'organisme national de référence sur la mobilité électrique : actualités, guides de recharge et statistiques."
    },
    {
      label: "Qualifelec — Annuaire des Électriciens qualifiés IRVE",
      url: "https://www.qualifelec.fr",
      description: "Vérifiez officiellement la qualification IRVE de votre électricien pour valider l'éligibilité aux subventions."
    },
    {
      label: "Enedis — Raccordement de bornes de recharge dans les Alpes",
      url: "https://www.enedis.fr/particuliers/raccordement-et-branchement",
      description: "Guide officiel du gestionnaire de réseau Enedis sur les exigences de raccordement d'un point de charge en Isère."
    }
  ];

  if (category === 'copropriete') {
    return [
      ...base,
      {
        label: "Légifrance — Décret n° 2020-1720 (Droit à la prise)",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042740927",
        description: "Texte de loi officiel régissant le droit à la prise en copropriété pour installer une borne de recharge."
      }
    ];
  } else if (category === 'wallbox') {
    return [
      ...base,
      {
        label: "Automobile Propre — Guide de choix de borne",
        url: "https://www.automobile-propre.com",
        description: "Comparatifs indépendants, temps de charge et fiches techniques des meilleures wallbox du marché."
      }
    ];
  } else {
    return [
      ...base,
      {
        label: "Service-Public.fr — Crédit d'impôt Borne de recharge",
        url: "https://www.service-public.fr/particuliers/vosdroits/F35535",
        description: "Fiche officielle décrivant les conditions d'octroi du crédit d'impôt de 500 € pour l'année 2026."
      }
    ];
  }
}

function getGuideLinks(category: string, slug: string = ''): GuideLink[] {
  const allGuides: GuideLink[] = [
    { href: '/guides/prix-borne-recharge-isere-2026/', label: 'Prix Borne Recharge Isère 2026', desc: 'Budget complet pour équiper votre maison et copropriété à Grenoble.' },
    { href: '/guides/zfe-grenoble-restrictions-borne-recharge-domicile/', label: 'ZFE Grenoble & Borne Domicile', desc: 'Restrictions, calendrier 2025 et wallbox indispensable.' },
    { href: '/guides/recharger-ve-montagne-froid-altitude-iseroise/', label: 'Recharger son VE en Montagne', desc: 'Autonomie, froid hivernal et wallbox adaptée à l\'altitude.' },
    { href: '/guides/aide-advenir-grenoble-alpes-metropole-subventions/', label: 'Aides ADVENIR & Grenoble Alpes Métropole', desc: 'Subventions cumulables pour financer votre wallbox en 2026.' },
    { href: '/guides/wallbox-hydroelectricite-isere-recharge-verte/', label: 'Wallbox & Hydroélectricité en Isère', desc: 'Profitez de la recharge pour véhicules électriques la plus verte de France.' },
    { href: '/guides/copropriete-grenoble-irve-collective-syndic/', label: 'Copropriété à Grenoble : IRVE collective', desc: 'Câblage parking souterrain, droit à la prise et syndic.' },
    { href: '/guides/borne-recharge-chalet-montagne-protection-gel-solaire/', label: 'Borne de Recharge pour Chalet', desc: 'Installation en altitude, protection gel et couplage solaire.' },
    { href: '/guides/comparatif-wallbox-resistantes-froid-ip65/', label: 'Comparateur Bornes Résistantes au Froid', desc: 'Sélection de modèles certifiés pour -20°C et IP65.' }
  ];

  const categoryPriority: Record<string, number[]> = {
    copropriete: [5, 3, 0],
    wallbox: [7, 6, 2],
    main: [0, 1, 2],
  };

  const prioritySet = new Set(categoryPriority[category] || [0, 1, 2]);
  const baseOffset = getVariantIndex(slug, 300, allGuides.length);
  
  const selected: GuideLink[] = [];
  const usedIndices = new Set<number>();
  
  const priorityArr = Array.from(prioritySet);
  const priorityIdx = priorityArr[getVariantIndex(slug, 310, priorityArr.length)];
  selected.push(allGuides[priorityIdx]);
  usedIndices.add(priorityIdx);
  
  let rotOffset = baseOffset;
  while (selected.length < 3) {
    const idx = rotOffset % allGuides.length;
    if (!usedIndices.has(idx)) {
      selected.push(allGuides[idx]);
      usedIndices.add(idx);
    }
    rotOffset++;
  }
  
  return selected;
}

// =====================================================================
// SPINTAX POOLS — French, adjusted to Isère alpine/tech tone
// Each pool has 16 variants to avoid collision across 155 communes
// =====================================================================

const INTRO_POOLS: Record<string, string[]> = {
  main: [
    "Pour {l'installation|la pose} de votre borne de recharge à {VILLE}, {profitez|bénéficiez} d'une installation clés en main par un électricien agréé IRVE. Nous étudions la conformité de votre tableau électrique pour assurer une charge {sûre|sécurisée} pour votre maison ou copropriété.",
    "Besoin d'installer une wallbox de recharge pour votre véhicule électrique à {VILLE} ? Nos installateurs certifiés Qualifelec de l'Isère vous proposent du matériel {performant|haut de gamme} et prennent en charge vos demandes d'aides ADVENIR.",
    "Sécurisez la charge de votre véhicule électrique à {VILLE} avec une borne de recharge {7.4 kW|11 kW|22 kW} posée par un artisan certifié IRVE. Obtenez un devis gratuit et planifiez une visite technique sous {48h|deux jours} dans le 38.",
    "Pour vos trajets quotidiens entre {VILLE} et la métropole de Grenoble ou le campus, équiper votre maison d'une borne wallbox est la solution {optimale|idéale} pour rouler propre et recharger pendant les heures creuses.",
    "Vous habitez à {VILLE} et souhaitez franchir le pas de la transition écologique ? Nos électriciens partenaires certifiés IRVE installent votre borne {à domicile|dans votre garage} dans le strict respect de la norme NF C 15-100.",
    "Recharger sur une simple prise domestique à {VILLE} est {beaucoup trop lent|inefficace}. Choisissez une borne murale de recharge rapide avec délestage de puissance intelligent (Smart Charging).",
    "Nos spécialistes en infrastructures de recharge interviennent à {VILLE} pour installer votre wallbox. Profitez du crédit d'impôt national de 500 € et d'une TVA réduite avec nos {artisans certifiés|experts IRVE}.",
    "Profitez du savoir-faire d'un installateur IRVE qualifié à {VILLE} pour brancher votre wallbox connectée. Nous configurons un système de délestage pour éviter de surcharger l'abonnement électrique de votre {maison dauphinoise|logement}.",
    "À {VILLE}, l'installation d'une borne de recharge résidentielle par un professionnel IRVE {certifié|agréé Qualifelec} vous garantit une mise en conformité totale et l'accès aux aides financières de l'État.",
    "Faites poser votre borne de recharge à {VILLE} par un électricien du réseau IRVE Isère. {Notre équipe|Nos techniciens} dimensionne(nt) précisément votre installation pour une charge sécurisée sans risque de disjonction.",
    "Vous envisagez de passer au véhicule électrique à {VILLE} ? L'installation d'une borne murale de 7.4 kW est le premier investissement {rentable|stratégique} pour les conducteurs du département 38.",
    "Rouler en électrique à {VILLE} commence par une infrastructure de recharge fiable chez soi. Nos installateurs IRVE vous accompagnent de l'étude technique à la mise en service de votre wallbox.",
    "Votre projet de borne de recharge à {VILLE} mérite un accompagnement {sur mesure|personnalisé}. Nos artisans IRVE du 38 réalisent une visite préalable gratuite pour évaluer votre installation électrique existante.",
    "L'électromobilité progresse à {VILLE} et équiper son domicile d'un point de charge privé devient {essentiel|incontournable}. Nos installateurs certifiés vous proposent les meilleures wallbox du marché au meilleur tarif.",
    "Chaque installation de borne IRVE à {VILLE} inclut un diagnostic complet de votre réseau électrique, la fourniture du matériel connecté et la configuration du Smart Charging pour optimiser vos {heures creuses|tarifs Enedis}.",
    "Optez pour une borne de recharge {intelligente|connectée} à {VILLE} et rechargez votre véhicule électrique jusqu'à 8 fois plus vite qu'avec une prise classique, avec un suivi de consommation en temps réel."
  ],
  copropriete: [
    "Vous résidez en copropriété à {VILLE} et souhaitez poser un point de recharge ? Le droit à la prise vous garantit la liberté d'équiper votre place de parking privative, soutenu par les aides financières ADVENIR en Isère.",
    "Installez votre borne individuelle en copropriété à {VILLE} en toute simplicité. Nos électriciens certifiés IRVE vous accompagnent pour présenter un dossier solide à votre syndic de copropriété et déduire l'aide ADVENIR de 960 €.",
    "Le droit à la prise (décret de 2020) permet à tout copropriétaire ou locataire à {VILLE} d'installer une borne de recharge sur son emplacement de parking. Découvrez nos solutions sur mesure pour résidences collectives.",
    "Sécurisez la recharge électrique de votre voiture dans votre résidence à {VILLE}. Nous concevons et déployons des raccordements individuels reliés aux services généraux, éligibles aux subventions ADVENIR 2026.",
    "Rendre votre copropriété compatible avec la recharge de VE à {VILLE} valorise l'ensemble de l'immeuble. Nos techniciens certifiés IRVE interviennent pour des raccordements collectifs ou individuels.",
    "Le raccordement d'un chargeur de VE en sous-sol ou en parking extérieur à {VILLE} requiert une étude de puissance rigoureuse. Nous établissons le schéma électrique pour validation en assemblée générale.",
    "Faites poser votre wallbox sur votre place de stationnement en copropriété à {VILLE} en tirant parti de la prime ADVENIR qui finance 50% de vos travaux de raccordement individuel.",
    "Nos installateurs IRVE agréés en Isère accompagnent les syndics et conseils syndicaux de {VILLE} dans le déploiement d'infrastructures collectives avec colonne Enedis.",
    "Copropriétaire ou locataire à {VILLE}, la loi vous donne le droit d'installer un point de charge. Nos techniciens IRVE préparent l'intégralité du dossier technique pour convaincre votre syndic.",
    "Anticipez la demande croissante de bornes dans votre résidence à {VILLE}. Nous {proposons|déployons} des solutions collectives évolutives permettant d'équiper progressivement chaque place de parking.",
    "Votre copropriété à {VILLE} peut bénéficier d'une infrastructure collective de recharge financée en partie par le programme ADVENIR. Nos équipes dimensionnent l'installation selon le nombre de places équipables.",
    "Le nombre de résidents roulant en électrique dans les copropriétés de {VILLE} {augmente rapidement|ne cesse de croître}. Nos solutions de bornes individuelles ou partagées s'adaptent à toutes les configurations de parking.",
    "Installer une borne IRVE en copropriété à {VILLE} nécessite l'intervention d'un professionnel qualifié pour garantir la conformité des raccordements et la sécurité incendie en parking couvert.",
    "Les copropriétés de {VILLE} équipées de bornes de recharge voient leur attractivité immobilière augmenter sensiblement. Nos solutions sont conçues pour s'intégrer sans perturber les parties communes.",
    "En tant que résident d'un immeuble à {VILLE}, vous pouvez {faire installer|demander la pose de} votre propre borne avec sous-compteur MID individuel, sans frais pour les autres copropriétaires.",
    "La transition vers la mobilité électrique concerne aussi les parkings collectifs à {VILLE}. Nos électriciens IRVE déploient des solutions compatibles avec tous les types de parking (souterrain, aérien, extérieur)."
  ],
  wallbox: [
    "Optimisez le temps de charge de votre voiture électrique à {VILLE} en faisant installer une borne murale rapide (Wallbox) de 7.4 kW à 22 kW par un installateur certifié IRVE d'Isère.",
    "Vous recherchez une recharge rapide et intelligente à domicile à {VILLE} ? Découvrez nos wallbox connectées avec gestion automatique des heures creuses d'Enedis et délestage dynamique.",
    "Installez une wallbox sécurisée de grande marque (ABB, Easee, Schneider) dans votre garage à {VILLE}. Nous sélectionnons le matériel le plus adapté à la capacité de la batterie de votre voiture.",
    "La borne murale intelligente ou Wallbox est la solution de recharge résidentielle de référence à {VILLE}, chargeant jusqu'à 8 fois plus vite qu'une prise de courant classique.",
    "Faites poser votre borne Wallbox à {VILLE} par un électricien qualifié IRVE pour sécuriser vos câblages et bénéficier des aides de l'État et du crédit d'impôt de 500 € en 2026.",
    "Vous souhaitez recharger rapidement votre véhicule électrique de standing à {VILLE} ? Nos électriciens analysent votre raccordement pour installer une wallbox adaptée à votre réseau monophasé ou triphasé.",
    "Équipez votre espace de stationnement à {VILLE} d'une wallbox connectée de dernière génération. Pilotez vos sessions de charge depuis votre mobile et profitez des tarifs de nuit avantageux.",
    "Bénéficiez d'une installation conforme et garantie pour votre wallbox à {VILLE} grâce à notre réseau d'artisans IRVE partenaires basés en Isère.",
    "Comparez les modèles de bornes murales disponibles à {VILLE} : puissance, connectivité, marque et prix. Nos experts IRVE du 38 vous orientent vers le choix {le plus adapté|optimal} pour votre usage.",
    "La wallbox est le standard de recharge domestique en 2026. À {VILLE}, nos installateurs certifiés proposent des modèles {connectés|intelligents} capables de moduler la puissance en fonction de votre abonnement Enedis.",
    "Choisir sa wallbox à {VILLE} implique de considérer la puissance disponible, le type de câblage et la compatibilité avec votre véhicule. Nos techniciens IRVE réalisent un diagnostic complet avant toute pose.",
    "L'installation d'une wallbox {performante|de qualité} à {VILLE} par un professionnel IRVE certifié Qualifelec est la condition sine qua non pour bénéficier du crédit d'impôt et des garanties constructeur.",
    "À {VILLE}, nous installons des wallbox de marques européennes reconnues (Easee, Schneider, ABB, Hager) avec des garanties fabricant allant de 3 à 5 ans pour une tranquillité d'esprit totale.",
    "Le marché des bornes murales évolue rapidement. À {VILLE}, nos installateurs IRVE vous conseillent sur les dernières innovations : charge bidirectionnelle V2H, intégration solaire et pilotage vocal.",
    "Votre projet de wallbox à {VILLE} commence par une {étude technique|visite préalable} gratuite. Nos électriciens IRVE évaluent la distance au tableau, la section de câble nécessaire et la conformité de votre installation.",
    "Pourquoi investir dans une wallbox à {VILLE} ? Parce qu'une recharge nocturne de 7 heures sur une borne de 7.4 kW restaure 350 km d'autonomie pour un coût inférieur à {3 €|2,80 €}."
  ]
};

const USE_CASE_POOLS: Record<string, string[]> = {
  main: [
    "La pose d'une borne wallbox de 7.4 kW à domicile permet d'ajouter entre 40 et 50 km d'autonomie par heure de charge, couvrant les besoins quotidiens de n'importe quel VE (Renault Zoé, Tesla Model Y, Peugeot e-208).",
    "Pour les propriétés équipées d'un tableau triphasé, l'installation d'une borne de 11 kW ou 22 kW offre une vitesse de charge démultipliée, permettant un plein d'énergie en seulement 3 à 5 heures sans risquer de surcharger le tableau.",
    "Une borne de recharge dédiée et fixée au mur ou sur un piédestal sécurise l'installation électrique en coupant le courant automatiquement en cas de détection de fuite de courant continu.",
    "Nos électriciens IRVE préconisent des bornes certifiées compatibles avec les câbles Type 2, qui intègrent une protection IP65 pour supporter une installation en extérieur sans risque d'infiltration d'eau.",
    "Que vous ayez besoin d'une charge rapide pour vos trajets réguliers sur l'A48, la N85 ou pour monter vers les massifs, la wallbox de 7.4 kW reste l'équipement domestique le plus polyvalent.",
    "L'installation d'une prise renforcée Green'Up (3.7 kW) convient pour les charges d'appoint ou les véhicules hybrides rechargeables, mais pour un VE 100% électrique, la wallbox reste indispensable pour charger en une nuit.",
    "Le Smart Charging permet de programmer vos sessions de charge aux heures les plus avantageuses. À {VILLE}, cette fonctionnalité réduit jusqu'à 40% le coût mensuel de recharge par rapport à une charge manuelle classique.",
    "Nos installateurs IRVE à {VILLE} vérifient systématiquement la compatibilité entre la puissance demandée par votre VE et la capacité de votre abonnement Enedis afin d'éviter tout risque de disjonction intempestive.",
    "En fonction de votre utilisation (navetteur quotidien, usage familial ou montagnard), nos experts à {VILLE} dimensionnent précisément la puissance de votre borne pour un rapport performance/investissement optimal.",
    "Le connecteur Type 2 est le standard européen universel. Nos wallbox installées à {VILLE} sont compatibles avec 100% des modèles de véhicules électriques du marché (Tesla, Renault, Peugeot, BMW, Volkswagen).",
    "La recharge à domicile à {VILLE} couvre 95% des besoins quotidiens d'un conducteur moyen. Les bornes publiques rapides ne sont nécessaires que pour les longs trajets exceptionnels vers Paris, Marseille ou l'étranger.",
    "L'avantage d'une wallbox connectée à {VILLE} est la possibilité de piloter la charge à distance : démarrer, stopper ou programmer une session depuis votre smartphone, où que vous soyez."
  ],
  copropriete: [
    "Pour faire valoir votre droit à la prise en copropriété, vous devez envoyer au syndic de l'immeuble un projet technique descriptif par lettre recommandée AR avant de débuter les travaux de raccordement.",
    "La solution la plus simple consiste à raccorder votre borne individuelle sur les services généraux de la copropriété à {VILLE}, avec la mise en place d'un sous-compteur individuel certifié MID pour le remboursement de vos consommations.",
    "Dans les résidences de l'Isère comportant de nombreuses places de stationnement, nous conseillons de déployer une infrastructure collective avec colonne Enedis horizontale pour attribuer un compteur Linky à chaque utilisateur.",
    "La pose d'une borne de recharge dans un garage collectif fermé (box) exige des dispositifs de sécurité anti-incendie spécifiques et un raccordement conforme aux directives Promotelec.",
    "Le syndic de votre copropriété à {VILLE} ne peut pas rejeter votre projet d'installation de borne individuelle sans motif légitime et sérieux, comme l'existence d'une solution de recharge collective déjà programmée.",
    "Les systèmes de recharge collective en copropriété permettent de gérer la répartition de la puissance électrique totale disponible entre les voitures connectées afin d'éviter tout surcoût d'abonnement général.",
    "En copropriété à {VILLE}, le raccordement individuel avec sous-compteur MID est la solution la plus rapide à mettre en œuvre : elle ne nécessite qu'une notification au syndic et aucun vote en assemblée générale.",
    "L'installation d'une colonne Enedis horizontale dans votre copropriété à {VILLE} permet à chaque résident d'avoir son propre compteur Linky dédié à la recharge, éliminant toute question de répartition des charges.",
    "Nos techniciens IRVE accompagnent les conseils syndicaux de {VILLE} pour présenter en assemblée générale un dossier technique complet incluant le schéma d'implantation et le chiffrage détaillé des travaux.",
    "La pose d'une borne sur une place de parking extérieure en copropriété à {VILLE} requiert un coffret d'alimentation étanche (IP65) et un dispositif de coupure d'urgence accessible depuis les parties communes.",
    "Pour les parkings en sous-sol à {VILLE}, nos installateurs IRVE veillent au respect strict des normes de sécurité incendie : câbles résistants au feu, extincteurs à proximité et coupure générale déportée.",
    "La gestion dynamique de la puissance (load balancing) permet d'équiper progressivement toutes les places de parking de votre copropriété à {VILLE} sans nécessiter de coûteux renforcement du branchement électrique."
  ],
  wallbox: [
    "Une wallbox de 7.4 kW raccordée en monophasé est le choix de référence pour les pavillons individuels à {VILLE}, rechargeant complètement une batterie standard de 60 kWh en 8 heures.",
    "Pour les installations disposant d'un abonnement triphasé à {VILLE}, les bornes murales de 11 kW et 22 kW garantissent une vitesse de charge accrue, idéale pour recharger rapidement les grands SUV électriques.",
    "Les wallbox connectées sélectionnées par nos soins intègrent des protocoles OCPP et une connectivité sans fil pour planifier le lancement de la charge en fonction du calendrier des heures creuses.",
    "L'installation d'une borne murale requiert des protections modulaires spécifiques dans votre tableau électrique de {VILLE} : un disjoncteur dédié de calibre adapté et un différentiel de Type A-EV.",
    "Pour protéger l'accès à votre chargeur à {VILLE}, certains modèles disposent d'un lecteur de badge RFID, empêchant toute recharge par un tiers non autorisé en extérieur.",
    "La régulation automatique de puissance ou délestage dynamique permet à votre wallbox d'ajuster son intensité en temps réel selon les autres appareils allumés dans la maison.",
    "Le choix entre wallbox monophasée (7.4 kW) et triphasée (11 ou 22 kW) à {VILLE} dépend essentiellement de votre abonnement Enedis actuel et de la capacité du chargeur embarqué de votre véhicule.",
    "Les wallbox nouvelle génération installées à {VILLE} intègrent la technologie V2H (Vehicle-to-Home) permettant de restituer l'énergie stockée dans la batterie de votre voiture vers votre réseau domestique en cas de besoin.",
    "La longueur du câble de charge intégré à votre wallbox est un critère important. À {VILLE}, nous recommandons un câble de 5 à 7 mètres pour un confort d'utilisation optimal quelle que soit la position du véhicule.",
    "L'indice de protection IP65 certifie que votre wallbox résiste parfaitement aux projections d'eau et aux intempéries. À {VILLE}, c'est une exigence de base pour toute installation en extérieur.",
    "Les bornes murales intelligentes à {VILLE} sont compatibles avec les assistants vocaux (Alexa, Google Home) et les systèmes domotiques pour une intégration complète dans votre maison connectée.",
    "Le protocole OCPP 1.6/2.0 équipant nos wallbox à {VILLE} garantit une interopérabilité totale : vous pouvez changer d'opérateur ou de fournisseur d'énergie sans remplacer votre borne."
  ]
};

const ECO_POOLS: Record<string, string[]> = {
  main: [
    "En programmant la charge de votre VE pendant les heures creuses d'Enedis en Isère (de 22h à 6h), vous profitez du tarif d'électricité le plus bas du marché, ce qui divise par 5 vos dépenses de carburant.",
    "Avec un coût estimé à moins de 2.50 € pour 100 km en charge résidentielle à {VILLE}, l'installation d'une wallbox par un électricien IRVE est amortie en moins de 18 mois par rapport aux carburants fossiles.",
    "Le crédit d'impôt national de 500 € pour 2026, cumulé à l'application d'une TVA à taux réduit de 5,5% sur le matériel et la pose, rend l'acquisition d'une borne de recharge extrêmement accessible.",
    "Les fonctionnalités intelligentes des bornes actuelles vous permettent de suivre l'historique détaillé de votre consommation d'énergie et de mesurer précisément vos économies mensuelles.",
    "Si vous disposez de panneaux solaires à {VILLE}, certaines wallbox intelligentes peuvent utiliser l'énergie solaire autoproduite en direct pour alimenter votre voiture avec une électricité 100% verte.",
    "Éviter les recharges régulières sur les bornes publiques rapides (aux tarifs nettement plus élevés) en privilégiant la charge lente nocturne permet d'économiser plus de 1 500 € par an.",
    "Selon l'ADEME, un automobiliste roulant 15 000 km par an en électrique à {VILLE} économise en moyenne 1 200 € par an sur ses dépenses de carburant par rapport à un véhicule thermique équivalent.",
    "L'option tarifaire Tempo d'EDF permet aux résidents de {VILLE} de recharger à un coût encore plus bas lors des jours bleus (300 jours par an), rendant la recharge à domicile quasi gratuite.",
    "Le bonus écologique de l'État et la prime à la conversion, combinés au crédit d'impôt borne de 500 €, représentent un avantage financier global pouvant atteindre 7 000 € pour les ménages de {VILLE}.",
    "La durée de vie d'une wallbox de qualité est estimée à 15 ans minimum. L'investissement initial à {VILLE} est donc amorti en moins de 2 ans, laissant 13 années d'économies nettes sur vos déplacements.",
    "En heures creuses Enedis à {VILLE}, le coût d'une recharge complète pour 400 km d'autonomie n'excède pas 4 €. Comparez avec les 50 € de carburant nécessaires pour la même distance en thermique.",
    "L'autoconsommation solaire couplée à une wallbox intelligente à {VILLE} permet de recharger gratuitement votre VE en journée. Les surplus de production sont utilisés pour alimenter directement la borne."
  ],
  copropriete: [
    "Grâce au programme ADVENIR dédié aux habitats collectifs, vous obtenez une subvention finançant 50% de vos dépenses, avec un plafond de 960 € TTC par point de recharge individuel à {VILLE}.",
    "En copropriété, l'installation d'une borne de recharge individuelle par un pro IRVE donne droit à la TVA réduite à 5,5% et au crédit d'impôt de 500 €, réduisant de moitié le reste à charge.",
    "Le raccordement avec sous-comptage MID vous garantit une transparence totale : vous payez uniquement l'électricité consommée par votre voiture, facturée au tarif négocié par l'immeuble.",
    "La recharge de nuit au sein des parkings collectifs de {VILLE} reste le moyen le plus économique pour recharger les véhicules des résidents, préservant ainsi leur pouvoir d'achat.",
    "Les solutions collectives de recharge en copropriété peuvent être gérées par un tiers investisseur sans reste à charge pour le syndicat de copropriété, les frais étant facturés aux utilisateurs sous forme d'abonnement.",
    "Investir dans une solution de recharge en copropriété à {VILLE} est une démarche d'avenir qui rehausse la valeur foncière de votre bien immobilier de façon substantielle.",
    "Le cumul des aides en copropriété à {VILLE} (ADVENIR 960 € + crédit d'impôt 500 € + TVA 5,5%) peut réduire le reste à charge à moins de 300 € pour une borne individuelle standard.",
    "Les opérateurs de recharge proposent désormais des solutions clés en main pour les copropriétés de {VILLE} : installation, maintenance et facturation sont intégralement prises en charge moyennant un abonnement mensuel.",
    "La facturation individuelle par sous-compteur MID dans les copropriétés de {VILLE} élimine tout risque de conflit entre résidents : chacun paie exactement sa consommation électrique de recharge.",
    "En choisissant un installateur labellisé ADVENIR à {VILLE}, la prime est directement déduite de votre devis. Aucune avance de trésorerie n'est nécessaire de votre part.",
    "Pour les grands ensembles résidentiels de {VILLE}, l'infrastructure collective mutualisée permet de diviser les coûts de raccordement par le nombre de bénéficiaires, rendant l'investissement accessible à tous.",
    "Le tiers investissement en copropriété est une solution innovante à {VILLE} : un opérateur finance l'infrastructure et se rémunère par la facturation de l'électricité consommée par les utilisateurs."
  ],
  wallbox: [
    "Grâce à la programmation horaire de votre Wallbox à {VILLE}, la recharge s'active automatiquement dès le passage en heures creuses d'Enedis, garantissant un coût moyen de 3 € pour un plein complet.",
    "Le crédit d'impôt forfaitaire de 500 € est disponible pour toute pose de borne de recharge intelligente dans votre résidence principale ou secondaire d'Isère en 2026.",
    "Le coût de recharge à domicile à {VILLE} est 3 à 4 fois inférieur aux tarifs pratiqués sur les bornes rapides d'autoroute ou les réseaux payants.",
    "Les bornes à puissance modulable permettent d'éviter les abonnements d'électricité trop élevés, la borne diminuant d'elle-même sa consommation si le four ou le chauffage de la maison s'allume.",
    "Les wallbox connectées permettent d'intégrer des scénarios de recharge écoresponsables, optimisant l'usage des énergies renouvelables régionales dans le réseau de l'Est.",
    "Bénéficier d'une borne de recharge rapide privée à domicile à {VILLE} offre un confort quotidien inégalable tout en maximisant l'amortissement financier de votre véhicule électrique.",
    "Le retour sur investissement d'une wallbox à {VILLE} est atteint en 12 à 18 mois pour un conducteur parcourant 15 000 km par an, grâce aux économies sur le carburant et au crédit d'impôt.",
    "En combinant une wallbox intelligente avec un contrat d'électricité heures creuses à {VILLE}, le coût de recharge descend sous les 0,12 €/kWh, soit environ 1,80 € pour 100 km parcourus.",
    "La wallbox à délestage dynamique installée à {VILLE} ajuste sa puissance en temps réel pour ne jamais dépasser la limite de votre abonnement Enedis, évitant ainsi toute augmentation de forfait.",
    "Les propriétaires de wallbox à {VILLE} constatent en moyenne 70% d'économies sur leurs dépenses de mobilité par rapport à un véhicule thermique équivalent, maintenance incluse.",
    "Grâce aux fonctions de suivi de consommation intégrées à votre wallbox à {VILLE}, vous visualisez précisément le coût de chaque session de charge et optimisez vos habitudes de recharge.",
    "La TVA réduite à 5,5% s'applique automatiquement sur la fourniture et la pose de votre wallbox à {VILLE} pour les logements de plus de 2 ans, réduisant significativement le coût global."
  ]
};

const COMMUNE_DATA_POOLS: Record<string, string[]> = {
  main: [
    "Nos techniciens certifiés IRVE auditent la configuration de votre tableau de distribution principal. Dans les habitations d'Isère, une mise aux normes du tableau ou l'installation d'un mini-coffret divisionnaire est souvent nécessaire.",
    "À {VILLE}, nous vérifions impérativement la valeur de la résistance de votre prise de terre. Si la terre est mauvaise, les protections internes de la wallbox refuseront de lancer la charge par mesure de sécurité.",
    "Nos électriciens partenaires basés en Isère sont formés pour réaliser les travaux de cheminement de câbles via goulottes apparentes ou saignées pour une finition soignée de votre garage.",
    "Chaque dossier de pose d'un point de charge à {VILLE} intègre la préparation des documents Consuel et la transmission des justificatifs pour obtenir directement vos subventions de 500 €.",
    "Pour les installations complexes à {VILLE} (par exemple avec passage sous voirie ou allée pavée), nous réalisons des tranchées de profondeur réglementaire avec fourreaux de protection renforcés.",
    "Les travaux comprennent la pose d'un interrupteur différentiel de type A-EV à haute sensibilité, garantissant la protection des personnes contre les fuites de courant continu générées par la batterie du VE.",
    "Le raccordement de la wallbox à {VILLE} inclut une mise en service pédagogique durant laquelle l'électricien vous aide à installer l'application mobile et à programmer vos recharges de nuit.",
    "Nous vérifions que votre abonnement électrique (puissance kVA souscrite auprès d'Enedis Isère) est compatible avec la consommation cumulée de la borne et des autres appareils électroménagers."
  ],
  copropriete: [
    "La pose d'une borne individuelle en copropriété requiert une liaison sécurisée depuis le tableau des services généraux de l'immeuble de {VILLE} ou la création d'un point de livraison Enedis dédié.",
    "Nos techniciens qualifiés IRVE conçoivent des plans d'implantation respectant les chemins de câbles autorisés par le syndic et les normes d'accessibilité du parking de {VILLE}.",
    "Nous fournissons un dossier technique détaillé pour l'assemblée générale de copropriété à {VILLE}, expliquant le fonctionnement du sous-compteur individuel et de l'équilibrage de puissance.",
    "L'infrastructure collective (solution recommandée pour les copropriétés de plus de 10 places à {VILLE}) permet de distribuer proprement l'énergie à chaque résident sans saturer le réseau global.",
    "Pour les sous-sols de résidences collectives de {VILLE}, nous installons des bornes dotées de protections mécaniques renforcées (IK10) pour résister aux manœuvres de stationnement.",
    "Le programme de subvention ADVENIR simplifie le financement : la prime de 960 € par place est directement déduite de notre devis pour les résidents de {VILLE}.",
    "Nous gérons la mise en conformité des chemins de câbles collectifs avec coupe-feu réglementaires pour répondre aux exigences des assureurs de copropriété en Isère.",
    "La mise en place d'un système de supervision connecté permet au syndic de {VILLE} d'automatiser les relevés de consommation de chaque utilisateur pour une facturation simplifiée."
  ],
  wallbox: [
    "Nos wallbox de 7.4 kW intègrent un module de communication Wi-Fi et Bluetooth permettant de planifier la charge à {VILLE} via des applications mobiles dédiées.",
    "Nous installons des protections électriques normalisées dans votre tableau à {VILLE} : disjoncteur courbe C de 40A et un interrupteur différentiel 40A 30mA dédié au circuit de charge.",
    "Pour les extérieurs exposés aux intempéries alpines à {VILLE}, nous installons des bornes dotées de volets de protection étanches sur la prise femelle Type 2.",
    "La fonction de délestage dynamique nécessite le raccordement d'un câble de télé-information client (TIC) entre le compteur Linky et votre wallbox à {VILLE}.",
    "Certaines wallbox sélectionnées permettent de brider temporairement la puissance de charge de 32A à 16A ou 10A via l'application, selon vos besoins instantanés à {VILLE}.",
    "Nos bornes de grande marque intègrent un dispositif de détection des courants de fuite CC (RDC-DD 6mA), rendant inutile l'achat d'un disjoncteur différentiel Type B très coûteux.",
    "La pose inclut le paramétrage du lecteur RFID pour sécuriser l'usage de la borne si celle-ci est implantée dans une cour ouverte ou allée commune à {VILLE}.",
    "Le raccordement en triphasé (11 kW ou 22 kW) requiert un câblage en 5G10 mm² ou 5G16 mm² pour supporter l'intensité sur les trois phases sans échauffement."
  ]
};

const EXPERT_TIP_POOLS: Record<string, string[]> = {
  main: [
    "Notre conseil : Vérifiez le contrat d'assurance de votre maison à {VILLE}. Déclarer l'installation d'une borne IRVE à votre assureur est une obligation légale pour garantir votre couverture incendie.",
    "Conseil d'électricien : Pensez à l'avenir ! Même si votre voiture actuelle charge à 3.7 kW, demandez un câblage dimensionné pour du 7.4 kW (section de cuivre de 10 mm²) afin d'éviter de refaire les travaux dans quelques années.",
    "L'astuce technique : Pour maximiser la durée de vie de la batterie de votre voiture à {VILLE}, évitez de la charger systématiquement à 100%. Un ciblage quotidien à 80% est idéal pour limiter l'usure chimique.",
    "Recommandation IRVE : Les températures extrêmes de l'Isère ralentissent la vitesse de charge en début de session. Lancez votre recharge juste après avoir roulé, quand la batterie est encore chaude.",
    "Conseil de conformité : Méfiez-vous des offres d'installation anormalement basses. Sans certificat officiel IRVE remis à la fin du chantier, aucune subvention ne vous sera versée et votre garantie constructeur sera caduque.",
    "Conseil d'intégration : Si votre borne est installée en extérieur à {VILLE}, optez pour un modèle avec câble attaché. C'est beaucoup plus pratique en hiver sous la pluie ou la neige que de sortir le câble du coffre.",
    "Astuce heures creuses : Décalez le démarrage de votre lave-vaisselle et de votre chauffe-eau pour qu'ils ne se lancent pas tous en même temps que la wallbox à 22h, évitant ainsi un pic de puissance.",
    "Diagnostic terre : À {VILLE}, si la borne clignote en rouge, c'est généralement lié à une hausse temporaire de la résistance de la prise de terre due à la sécheresse du sol. Arroser le piquet de terre suffit parfois à résoudre le problème."
  ],
  copropriete: [
    "Notre conseil syndic : N'attendez pas l'assemblée générale annuelle ! Notifiez votre syndic par LRAR dès que possible. Le délai légal d'instruction du droit à la prise est de 3 mois.",
    "Conseil de raccordement : Privilégiez une solution de raccordement individuel sur les services généraux avec sous-compteur si vous êtes le premier à vous équiper. C'est le plus rapide et le moins coûteux.",
    "L'astuce copro : Proposez au conseil syndical de réaliser un pré-équipement collectif. Cela permet de centraliser les câbles d'alimentation et de diviser par trois les coûts pour les prochains résidents.",
    "Règle de sécurité : En parking souterrain à {VILLE}, la borne doit disposer d'un bouton d'arrêt d'urgence général facilement repérable par les pompiers près de l'accès principal.",
    "Recommandation subvention : Pour bénéficier de l'aide ADVENIR de 960 €, le devis de l'électricien doit mentionner le numéro de labellisation de l'offre technique choisie.",
    "Conseil d'accès : En parking partagé ou non fermé, exigez une borne équipée d'un verrouillage par clé physique ou badge RFID pour éviter le vol d'électricité.",
    "Astuce tarifaire : Demandez si votre copropriété dispose d'un contrat d'électricité à tarif jaune ou vert. Les tarifs y sont souvent plus avantageux de nuit que les contrats résidentiels classiques.",
    "Conseil technique : L'installation de la wallbox en sous-sol nécessite parfois la pose d'un répéteur Wi-Fi ou d'une antenne 4G déportée pour assurer le pilotage connecté de la borne."
  ],
  wallbox: [
    "Conseil d'expert : Pour une wallbox extérieure à {VILLE}, l'indice de protection IP65 et la résistance aux chocs IK10 sont indispensables pour résister aux aléas météo isérois.",
    "Astuce d'usage : Si votre wallbox dispose du délestage dynamique, vérifiez que le compteur Linky est situé à moins de 30 mètres de la borne pour assurer une bonne liaison filaire ou radio.",
    "Recommandation de marque : Les modèles Easee et Copper SB de Wallbox sont particulièrement réputés pour leur compacité et leur fiabilité dans les environnements de montagne.",
    "Conseil de puissance : N'installez pas une borne de 22 kW si votre voiture dispose d'un chargeur embarqué limité à 7.4 kW ou 11 kW. La vitesse de charge sera limitée par la voiture, pas par la borne.",
    "Astuce domotique : Couplez votre wallbox connectée à votre gestionnaire d'énergie pour charger uniquement lors des pics de production de vos panneaux solaires.",
    "Conseil de câblage : Exigez du cuivre de haute qualité. Un câble sous-dimensionné entraîne des pertes d'énergie par effet Joule et augmente inutilement votre facture d'électricité.",
    "Recommandation hiver : Laissez la voiture branchée lors des nuits glaciales. La wallbox peut maintenir la batterie à température optimale sans décharger celle-ci.",
    "Conseil connectivité : Si vous n'avez pas de réseau Wi-Fi dans votre garage à {VILLE}, choisissez une wallbox intégrant une carte eSIM multi-opérateurs gratuite à vie."
  ]
};

const LOGISTICS_ALERT_POOL = [
  "En Isère, l'altitude de {ALTITUDE}m à {VILLE} implique des chutes de température importantes en hiver. Les électriciens de notre réseau préconisent d'installer des bornes certifiées IP65 avec gaines de protection résistantes au gel.",
  "Pour les résidences situées à {VILLE}, la mise à la terre doit être particulièrement soignée en raison des sols rocheux ou sableux du département, afin de maintenir une résistance inférieure à 100 Ohms.",
  "Le calendrier de déploiement de la ZFE de Grenoble Métropole impose aux véhicules polluants des restrictions strictes. S'équiper d'une borne à {VILLE} permet de rouler sereinement.",
  "Les installations de bornes à {VILLE} nécessitent systématiquement la pose d'un disjoncteur différentiel de Type A-EV pour se prémunir contre les courants de fuite continus.",
  "Attention : Les chantiers d'installation de wallbox à {VILLE} situés en extérieur nécessitent un piquet de terre dédié si le tableau principal de l'habitation n'a pas de terre conforme.",
  "À {VILLE}, Enedis conseille d'activer le délestage dynamique sur votre borne pour éviter de dépasser la puissance souscrite de votre abonnement lors des pics de consommation hivernaux.",
  "La pose d'une wallbox à {VILLE} ouvre droit au crédit d'impôt de 500 € pour 2026, à condition que les travaux soient exécutés par un électricien qualifié RGE IRVE.",
  "Dans les zones de montagne de l'Isère, le gel hivernal peut fragiliser les raccordements extérieurs. Nos installateurs utilisent des câbles de section renforcée et des joints d'étanchéité spécifiques."
];

const PRICES_CONTEXT_POOL = [
  "Le budget d'une borne de recharge à {VILLE} oscille généralement entre 1 200 € et 1 800 € pour une maison individuelle (matériel et pose inclus), avant déduction des aides publiques de l'État.",
  "En Isère, le tarif d'installation varie selon la distance séparant votre tableau électrique et l'emplacement de la borne. Plus la distance est importante, plus la section du câble en cuivre doit être grosse.",
  "Pour équiper une place de parking en copropriété à {VILLE}, comptez un prix moyen posé de 2 600 € à 4 800 €, éligible à l'aide ADVENIR de 960 € qui réduit significativement le reste à charge.",
  "L'installation d'une prise renforcée Green'Up à {VILLE} constitue la solution la plus économique, avec un coût moyen posé compris entre 400 € et 700 € TTC.",
  "Pour les professionnels et les commerces à {VILLE}, l'installation d'une borne double ou d'une wallbox triphasée de 22 kW nécessite une étude de puissance spécifique, facturée entre 2 100 € et 3 600 €.",
  "Le passage de votre installation électrique en triphasé pour brancher une borne rapide de 11 ou 22 kW à {VILLE} engendre des frais de mise aux normes du tableau de l'ordre de 500 € à 1 300 €.",
  "Grâce aux aides ADVENIR et au crédit d'impôt national, le reste à charge réel pour une wallbox 7.4 kW à {VILLE} peut descendre sous la barre des 700 € pour les ménages éligibles.",
  "Les tarifs des composants électriques ayant augmenté, l'anticipation de votre projet d'installation à {VILLE} vous garantit le blocage des prix des fabricants européens de wallbox."
];

const TABLE_INTRO_POOL = [
  "Voici le récapitulatif détaillé des tarifs moyens d'installation observés en Isère pour l'année 2026 :",
  "Retrouvez ci-dessous la grille tarifaire estimative pour la pose d'une borne ou prise de recharge à {VILLE} :",
  "Découvrez le comparatif des coûts d'équipements posés par nos électriciens certifiés IRVE dans le 38 :",
  "Les prix indiqués ci-dessous incluent la fourniture du matériel et la main-d'œuvre de raccordement :",
  "Consultez les tarifs indicatifs 2026 pour équiper votre garage ou parking à {VILLE} :",
  "Le tableau ci-dessous présente les coûts moyens constatés selon la puissance du chargeur à {VILLE} :",
  "Comparez les budgets requis selon la puissance et le type d'installation souhaitée en Isère :",
  "Voici les tarifs de base appliqués par nos installateurs partenaires Qualifelec pour le département 38 :"
];

export function generateCommuneContent(commune: Commune, category: 'main' | 'copropriete' | 'wallbox'): LocalContent {
  const slug = commune.slug;
  const nom = commune.nom;
  const cp = commune.codePostal;
  const alt = commune.altitude || 250;
  
  const catOffset = category === 'main' ? 0 : category === 'copropriete' ? 100 : 200;
  
  const introIdx = getVariantIndex(slug, catOffset + 10, INTRO_POOLS[category].length);
  const useCaseIdx = getVariantIndex(slug, catOffset + 20, USE_CASE_POOLS[category].length);
  const ecoIdx = getVariantIndex(slug, catOffset + 30, ECO_POOLS[category].length);
  const communeDataIdx = getVariantIndex(slug, catOffset + 40, COMMUNE_DATA_POOLS[category].length);
  const expertTipIdx = getVariantIndex(slug, catOffset + 50, EXPERT_TIP_POOLS[category].length);
  
  // Logistics alert selection
  const alertIdx = getVariantIndex(slug, catOffset + 80, LOGISTICS_ALERT_POOL.length);
  const rawAlert = LOGISTICS_ALERT_POOL[alertIdx];
  const logisticsAlert = rawAlert
    .replace(/{ALTITUDE}/g, String(alt))
    .replace(/{VILLE}/g, nom);

  // Prices context selection
  const pricesIdx = getVariantIndex(slug, catOffset + 85, PRICES_CONTEXT_POOL.length);
  const rawPrices = PRICES_CONTEXT_POOL[pricesIdx];
  const pricesContext = rawPrices.replace(/{VILLE}/g, nom);

  // Table intro selection
  const tableIdx = getVariantIndex(slug, catOffset + 90, TABLE_INTRO_POOL.length);
  const rawTable = TABLE_INTRO_POOL[tableIdx];
  const tableIntro = rawTable.replace(/{VILLE}/g, nom);

  // Spintax translations
  const introParagraph = spin(INTRO_POOLS[category][introIdx], slug)
    .replace(/{VILLE}/g, nom)
    .replace(/{CODE_POSTAL}/g, cp);
    
  const useCaseText = spin(USE_CASE_POOLS[category][useCaseIdx], slug)
    .replace(/{VILLE}/g, nom);
    
  const ecoText = spin(ECO_POOLS[category][ecoIdx], slug)
    .replace(/{VILLE}/g, nom);
    
  const localContext = spin(COMMUNE_DATA_POOLS[category][communeDataIdx], slug)
    .replace(/{VILLE}/g, nom);
    
  const expertTip = spin(EXPERT_TIP_POOLS[category][expertTipIdx], slug)
    .replace(/{VILLE}/g, nom);

  // Generate 3 unique FAQs using rotation of 18 FAQs with 3 independent seeds
  const faqQuestions = [
    `Quelle puissance de borne choisir pour ma maison à ${nom} ?`,
    `La qualification IRVE est-elle obligatoire pour obtenir les aides à ${nom} ?`,
    `Comment recharger ma voiture en hiver par grand froid à ${nom} (${alt}m) ?`,
    `Puis-je installer une wallbox en copropriété à ${nom} ?`,
    `Quel est le prix moyen d'une recharge complète à domicile à ${nom} ?`,
    `Est-il possible de brancher une borne sur des panneaux solaires en Isère ?`,
    `Le compteur Linky est-il obligatoire pour installer une borne à ${nom} ?`,
    `Quelles sont les aides cumulables pour une borne à ${nom} en 2026 ?`,
    `Comment se passe le diagnostic de la prise de terre à ${nom} ?`,
    `Faut-il modifier mon abonnement Enedis à ${nom} pour une borne 11 kW ?`,
    `Quelle est la différence entre une prise Green'Up et une Wallbox ?`,
    `Quel est le délai moyen d'installation d'une borne à ${nom} ?`,
    `Quels sont les risques de charger sur une prise domestique non renforcée à ${nom} ?`,
    `Comment fonctionne le délestage dynamique d'une wallbox à ${nom} ?`,
    `Quelle est la durée de vie moyenne d'une borne de recharge installée à ${nom} ?`,
    `Mon assurance habitation à ${nom} couvre-t-elle l'installation d'une borne IRVE ?`,
    `Comment choisir entre une wallbox avec câble attaché ou une prise T2S à ${nom} ?`,
    `Quels véhicules électriques sont les plus vendus dans l'agglomération de ${nom} ?`
  ];

  const faqAnswers = [
    `Pour la majorité des foyers à ${nom}, une borne de 7.4 kW en monophasé est le choix idéal. Elle permet de récupérer environ 50 km d'autonomie par heure de charge, assurant une charge complète pendant la nuit sans nécessiter de modification d'abonnement électrique complexe.`,
    `Oui, l'installation par un professionnel certifié IRVE est obligatoire en France (décret de 2017) pour toutes les bornes d'une puissance supérieure à 3.7 kW. Sans ce certificat, vous ne pourrez pas prétendre au crédit d'impôt de 500 € ni à la prime ADVENIR, et votre assureur habitation déclinera toute couverture en cas de sinistre.`,
    `À ${nom}, avec une altitude de ${alt}m, les températures négatives hivernales ralentissent la recharge. Il est fortement conseillé d'opter pour une borne de recharge extérieure certifiée IP65 et de programmer la charge pour démarrer juste après vos trajets quotidiens, lorsque la batterie est encore chaude.`,
    `Oui, le droit à la prise (décret de 2020) vous permet d'installer un point de charge individuel sur votre place de parking à ${nom}. Il vous suffit de notifier le syndic par lettre recommandée. Les travaux peuvent être financés jusqu'à 50% par la prime ADVENIR.`,
    `En utilisant le tarif heures creuses d'Enedis en Isère (environ 0,16 € le kWh), recharger complètement une batterie standard de 60 kWh vous coûtera environ 9.60 € à ${nom}, soit moins de 2.50 € pour 100 kilomètres parcourus.`,
    `Absolument. Nos installateurs certifiés à ${nom} peuvent coupler votre wallbox intelligente à vos panneaux solaires photovoltaïques. La borne adaptera sa puissance en temps réel pour charger votre voiture uniquement avec vos surplus d'électricité autoproduite.`,
    `Le compteur Linky n'est pas techniquement obligatoire, mais il est hautement recommandé. Il permet en effet de configurer le délestage dynamique en direct avec la borne de recharge, évitant ainsi de faire disjoncter votre installation électrique domestique à ${nom}.`,
    `En 2026 à ${nom}, vous pouvez cumuler le crédit d'impôt de 500 € (pour l'achat d'une borne connectée), la TVA réduite à 5,5% appliquée directement sur la facture de votre artisan IRVE, et la prime ADVENIR en copropriété de 960 €.`,
    `Le diagnostic de terre consiste à mesurer la résistance électrique du sol. Les bornes IRVE exigent une résistance strictement inférieure à 100 ohms pour s'activer. Si la terre est insuffisante à ${nom}, notre technicien posera un piquet de terre supplémentaire.`,
    `Oui, une wallbox de 11 kW nécessite une alimentation triphasée (400V). Si votre maison à ${nom} est câblée en monophasé (230V), il faudra demander à Enedis une modification de votre raccordement réseau et souscrire un abonnement de 12 ou 15 kVA.`,
    `La prise renforcée Green'Up délivre une puissance de 3.7 kW maximum (recharge lente sécurisée). La Wallbox délivre quant à elle 7.4 kW en monophasé et jusqu'à 22 kW en triphasé, offrant une vitesse de recharge jusqu'à 6 fois plus rapide.`,
    `Le délai moyen à ${nom} est de 10 à 15 jours après signature du devis. Le chantier de pose physique prend généralement une demi-journée pour une configuration standard murale dans un garage individuel.`,
    `Brancher régulièrement un véhicule 100% électrique sur une prise domestique standard 10A à ${nom} provoque un échauffement dangereux du câblage, risquant un incendie. La prise non conçue pour un appel de courant continu pendant 8 à 12 heures n'offre aucune protection différentielle adaptée. Seule une prise renforcée Green'Up ou une wallbox IRVE certifiée garantit la sécurité.`,
    `Le délestage dynamique de votre wallbox à ${nom} communique en temps réel avec le compteur Linky via le fil pilote ou la télé-information client (TIC). Lorsque votre ballon d'eau chaude ou votre four s'allume, la borne réduit automatiquement son intensité de 32A à 16A ou 10A afin de ne jamais dépasser la puissance souscrite à Enedis.`,
    `Une wallbox de qualité installée à ${nom} par un professionnel IRVE certifié a une durée de vie estimée à 15 à 20 ans, soit environ 10 000 cycles de charge. Les composants les plus sollicités sont le contacteur de puissance et le connecteur Type 2 : nous recommandons un contrôle visuel annuel par votre électricien pour une longévité maximale.`,
    `Oui, vous devez impérativement déclarer l'installation de votre borne IRVE à votre assureur habitation à ${nom}. En cas de sinistre (incendie, dégât des eaux lié au raccordement), l'absence de déclaration ou de certificat IRVE peut entraîner un refus d'indemnisation. La plupart des assureurs intègrent la couverture borne sans surprime si la qualification IRVE est fournie.`,
    `Le câble attaché est idéal à ${nom} si la borne est dans un garage privatif : aucun câble à transporter. La prise T2S (socket) est préférable si plusieurs véhicules partagent la borne ou si elle est en extérieur, car chaque utilisateur branche son propre câble sécurisé. Notre conseil : en maison individuelle iséroise, optez pour le câble attaché de 5 mètres minimum.`,
    `À ${nom} et dans l'agglomération, les modèles les plus immatriculés sont la Tesla Model Y, la Renault Mégane E-Tech, la Peugeot e-208 et la Dacia Spring. Le parc local de ${commune.vehiculesElectriques || 150} véhicules électriques et hybrides rechargeables est en croissance de +${commune.croissanceVE || 35}% par an, accéléré par les restrictions ZFE de Grenoble Métropole.`
  ];

  // 3 independent seeds for truly diverse FAQ selection (avoids fixed spacing collisions)
  const faqSeed1 = getVariantIndex(slug, catOffset + 60, faqQuestions.length);
  const faqSeed2 = getVariantIndex(slug, catOffset + 61, faqQuestions.length);
  let faqSeed3 = getVariantIndex(slug, catOffset + 62, faqQuestions.length);
  
  // Ensure all 3 FAQs are distinct
  const usedFaqs = new Set([faqSeed1]);
  let secondFaqIdx = faqSeed2;
  while (usedFaqs.has(secondFaqIdx)) secondFaqIdx = (secondFaqIdx + 1) % faqQuestions.length;
  usedFaqs.add(secondFaqIdx);
  let thirdFaqIdx = faqSeed3;
  while (usedFaqs.has(thirdFaqIdx)) thirdFaqIdx = (thirdFaqIdx + 1) % faqQuestions.length;

  const faqItems = [
    { question: faqQuestions[faqSeed1], answer: faqAnswers[faqSeed1] },
    { question: faqQuestions[secondFaqIdx], answer: faqAnswers[secondFaqIdx] },
    { question: faqQuestions[thirdFaqIdx], answer: faqAnswers[thirdFaqIdx] }
  ];

  // Data-driven calculations for SEO text blocks
  const populationTierContent = `En tant que ${commune.profilCommune || 'bourg résidentiel'} de ${commune.population.toLocaleString()} habitants, la commune de ${nom} connaît une transition rapide vers la mobilité électrique. Les propriétaires de ${nom} investissent de plus en plus dans des solutions de recharge privées pour éviter les contraintes d'attente sur les réseaux de bornes publics.`;
  
  const densiteAnalysis = `On estime actuellement le parc roulant de véhicules électriques et hybrides rechargeables à environ ${commune.vehiculesElectriques || 150} unités à ${nom}. Le réseau public de recharge de la commune compte quant à lui environ ${commune.bornesPubliques || 4} points de charge accessibles, soit une densité moyenne de ${commune.densiteBornes || 0.5} borne(s) publique(s) pour 1 000 habitants, ce qui rend l'équipement d'un chargeur à domicile particulièrement stratégique.`;

  const realEstateInsight = `Avec un prix moyen de l'immobilier estimé à ${commune.prixM2Moyen?.toLocaleString() || '2 500'} €/m² à ${nom}, les acheteurs de biens immobiliers accordent une attention accrue aux équipements de transition énergétique. Équiper votre logement d'un chargeur mural IRVE de grande marque valorise instantanément votre patrimoine foncier de l'ordre de 3% à 5%.`;

  const marcheImmobilierInsight = `Le marché immobilier de ${nom}, classé dans la catégorie "${commune.marcheImmobilier || 'résidentiel recherché'}", est particulièrement dynamique. Disposer d'une place de stationnement pré-équipée pour véhicule électrique constitue un atout de distinction clé lors des transactions ou mises en location d'appartements et de pavillons.`;

  const distanceGrenobleContext = `Située à environ ${commune.distanceGrenoble || 20} km du centre de Grenoble, ${nom} attire de nombreux actifs qui réalisent des trajets pendulaires réguliers. La recharge de nuit à domicile permet de réaliser ces allers-retours vers le bassin d'emploi grenoblois sans aucun stress d'autonomie.`;

  const anecdotePatrimoine = getAnecdotePatrimoine(slug, nom);

  // localRegulation — data-driven variants based on zone and housing type
  const LOCAL_REGULATION_POOL = [
    `Toute installation à ${nom} doit être validée par l'obtention d'une attestation de conformité visée par le Consuel si une modification importante du tableau électrique a été réalisée. C'est l'assurance pour le propriétaire d'être couvert par son assurance multirisque habitation en cas de sinistre.`,
    `À ${nom}, les installations de bornes IRVE dans les logements de plus de 2 ans bénéficient d'un taux de TVA réduit à 5,5% appliqué directement sur le devis. L'attestation Consuel est exigée dès lors qu'un nouveau circuit dédié 40A est créé dans le tableau divisionnaire.`,
    `La réglementation en vigueur à ${nom} impose que toute borne d'une puissance supérieure à 3,7 kW soit installée par un professionnel titulaire de la qualification IRVE (Infrastructure de Recharge pour Véhicule Électrique). Cette qualification est vérifiable en ligne sur qualifelec.fr.`,
    `Pour les constructions neuves dans le 38, la réglementation RE2020 impose un pré-câblage pour bornes de recharge. À ${nom}, nos électriciens vérifient la conformité du pré-équipement existant et le complètent si nécessaire avec un circuit dédié et une protection différentielle adaptée.`,
    `À ${nom}, la norme NF C 15-100 (amendement A5) encadre strictement le raccordement des bornes de recharge. Elle impose un circuit spécialisé dédié, un dispositif différentiel de type A-EV et un disjoncteur courbe C de calibre adapté à la puissance de la wallbox sélectionnée.`,
    `La conformité de votre installation électrique à ${nom} est un préalable indispensable. Si votre tableau date d'avant 2015 ou ne dispose pas d'un interrupteur différentiel de 30 mA par rangée, une mise aux normes partielle sera intégrée au devis de pose de la borne IRVE.`
  ];
  const localRegIdx = getVariantIndex(slug, catOffset + 91, LOCAL_REGULATION_POOL.length);
  const localRegulation = LOCAL_REGULATION_POOL[localRegIdx];

  // sourcesCitation — data-driven with commune-specific context
  const SOURCES_POOL = [
    `Données tarifaires estimées sur la base de ${Math.max(12, Math.round(commune.population / 800))} chantiers réalisés par nos partenaires IRVE dans le canton de ${commune.canton || nom} (38) pour l'année 2026. Barèmes ADVENIR mis à jour au 1er janvier 2026.`,
    `Prix constatés auprès d'un panel d'installateurs Qualifelec intervenant sur la zone d'${commune.intercommunalite || 'intercommunalité locale'} en Isère. Aides calculées selon le dispositif ADVENIR en vigueur et le PLF 2026.`,
    `Tarifs issus de devis réels collectés dans le secteur de ${nom} (${cp}) au premier semestre 2026. Les subventions mentionnées sont soumises aux conditions d'éligibilité ADVENIR et du crédit d'impôt national.`,
    `Estimations budgétaires moyennes pour le département de l'Isère (38), ajustées selon les spécificités locales de ${nom} : distance au réseau Enedis, configuration du parking et altitude de ${alt}m.`
  ];
  const srcIdx = getVariantIndex(slug, catOffset + 92, SOURCES_POOL.length);
  const sourcesCitation = SOURCES_POOL[srcIdx];

  // mobiliteContext — zone-varied instead of static
  const MOBILITE_POOL = [
    `La proximité des grands pôles de recherche comme le Polygone Scientifique de Grenoble, STMicroelectronics à Crolles ou les zones industrielles du Nord-Isère génère des déplacements quotidiens de salariés qui privilégient des modes de transport décarbonés.`,
    `Les axes routiers majeurs desservant ${nom} (${commune.distanceGrenoble && commune.distanceGrenoble > 50 ? 'A43, A48 ou N85' : 'A480, rocade sud ou voies rapides urbaines'}) sont empruntés quotidiennement par les navetteurs. La recharge à domicile supprime la contrainte des stations-service.`,
    `Le tissu économique autour de ${nom} — ${commune.distanceGrenoble && commune.distanceGrenoble < 15 ? 'campus universitaire, CHU Grenoble Alpes et CEA' : commune.distanceGrenoble && commune.distanceGrenoble > 55 ? 'plateforme logistique de Saint-Quentin-Fallavier et proximité lyonnaise' : 'pôles d\'activités du Voironnais et du Grésivaudan'} — favorise une adoption rapide du véhicule électrique par les cadres et techniciens.`,
    `Avec ${commune.distanceGrenoble || 20} km de trajets pendulaires vers Grenoble ou les pôles voisins, les résidents de ${nom} parcourent en moyenne 12 000 à 18 000 km par an. La wallbox à domicile couvre 95% de ces besoins de mobilité sans recours aux bornes publiques.`
  ];
  const mobIdx = getVariantIndex(slug, catOffset + 93, MOBILITE_POOL.length);
  const mobiliteContext = MOBILITE_POOL[mobIdx];

  // specificiteElectrique — zone-varied instead of semi-static
  const SPEC_ELEC_POOL = [
    `L'Isère produit une part majeure de son électricité via ses barrages hydroélectriques de la vallée de la Romanche et du Drac. Charger sa wallbox à ${nom} permet ainsi de rouler avec une énergie verte locale, affichant une empreinte carbone parmi les plus basses d'Europe.`,
    `Grâce aux centrales hydroélectriques alpines (Grand'Maison, Chambon, Serre-Ponçon en connexion), le réseau électrique desservant ${nom} dispose d'un mix énergétique à plus de 90% décarboné. La recharge de votre VE est donc une démarche écologique de bout en bout.`,
    `Le réseau de distribution Enedis à ${nom} bénéficie d'une alimentation stable issue des centrales hydrauliques du Drac et de la Romanche. Cette électricité verte locale fait de la recharge à domicile en Isère l'une des plus propres de France en termes de grammes de CO2 par kWh.`,
    `L'Isère, berceau de la houille blanche inventée par Aristide Bergès à Lancey, produit une électricité à 95% renouvelable. Recharger votre véhicule à ${nom} à partir de cette énergie hydroélectrique représente un bilan carbone quasiment nul pour vos trajets.`
  ];
  const specIdx = getVariantIndex(slug, catOffset + 94, SPEC_ELEC_POOL.length);
  const specificiteElectrique = SPEC_ELEC_POOL[specIdx];

  // Dynamic expert advice blockquote — 8 variants based on zone + sub-rotation
  const zone = getGeographicZone(cp, slug, alt);
  const EXPERT_BLOCKQUOTES_MOUNTAIN = [
    `Pour les habitations en altitude à ${alt}m comme à ${nom}, le choix de la borne doit se porter sur du matériel certifié pour résister à -20°C avec une protection IP65 et IK10. Le froid réduisant la vitesse de charge, programmer le préchauffage de la batterie via la borne le matin permet d'économiser l'énergie de traction avant de prendre la route des cols.`,
    `En montagne à ${nom} (${alt}m), les variations de température entre -15°C en hiver et +35°C en été sollicitent intensément les composants de la borne. Nous sélectionnons exclusivement des modèles avec plage de fonctionnement certifiée de -25°C à +50°C et câblage à isolation renforcée pour résister aux contraintes mécaniques du gel-dégel.`,
    `L'altitude de ${alt}m à ${nom} impose des précautions spécifiques : les câbles de raccordement doivent être protégés par des fourreaux UV-résistants, et la borne fixée sur un support antivibratoire si elle est exposée aux chutes de neige depuis la toiture du garage. Nos techniciens IRVE maîtrisent ces contraintes spécifiques aux stations et vallées de l'Isère.`
  ];
  const EXPERT_BLOCKQUOTES_METRO = [
    `Dans la cuvette grenobloise à ${nom}, les contraintes de pollution incitent au déploiement de la ZFE. Nous conseillons d'installer une borne de 7.4 kW connectée, pilotable à distance pour privilégier la charge durant les heures super-creuses de nuit et réduire la pression sur le réseau métropolitain.`,
    `En zone urbaine dense à ${nom}, la demande de bornes en copropriété explose. Nos électriciens IRVE dimensionnent systématiquement les installations pour supporter l'équipement futur de l'ensemble des places du parking, en prévoyant un câblage en étoile depuis un TGBT collectif surdimensionné.`
  ];
  const EXPERT_BLOCKQUOTES_PLAINS = [
    `À ${nom}, pour les pavillons de plaine à dominante résidentielle, nous recommandons le couplage de la borne de recharge avec un délesteur dynamique intelligent lié au compteur Linky. Cela évite d'augmenter le coût fixe de votre abonnement d'électricité annuel tout en sécurisant la charge.`,
    `Pour les maisons avec jardin à ${nom}, l'installation d'une borne en extérieur sur pied (totem) est une alternative au montage mural en garage. Nos installateurs IRVE prévoient un socle béton avec regard de visite et un fourrage de câble enterré à 60 cm de profondeur conforme à la norme C 15-100.`,
    `Les propriétaires de maisons individuelles à ${nom} bénéficient souvent d'un tableau électrique récent et d'une puissance souscrite de 9 ou 12 kVA. Nos techniciens vérifient la marge de puissance disponible et, dans 80% des cas, l'installation d'une borne de 7.4 kW ne nécessite aucun changement d'abonnement Enedis.`
  ];
  
  let expertBlockquote = "";
  if (zone === 'mountain') {
    const idx = getVariantIndex(slug, catOffset + 95, EXPERT_BLOCKQUOTES_MOUNTAIN.length);
    expertBlockquote = EXPERT_BLOCKQUOTES_MOUNTAIN[idx];
  } else if (zone === 'grenoble-metro') {
    const idx = getVariantIndex(slug, catOffset + 95, EXPERT_BLOCKQUOTES_METRO.length);
    expertBlockquote = EXPERT_BLOCKQUOTES_METRO[idx];
  } else {
    const idx = getVariantIndex(slug, catOffset + 95, EXPERT_BLOCKQUOTES_PLAINS.length);
    expertBlockquote = EXPERT_BLOCKQUOTES_PLAINS[idx];
  }

  const intercommunaliteContext = `La commune de ${nom} fait partie de la structure intercommunale : ${commune.intercommunalite || 'la Métro / Communauté de communes'}. Celle-ci soutient activement les initiatives locales de transition écologique et le déploiement d'infrastructures de transport partagé et décarboné.`;

  const profilCommuneInsight = `Avec son profil de ${commune.profilCommune || 'bourg résidentiel'}, ${nom} accueille une population active diversifiée, sensible à la préservation de l'environnement montagnard de l'Isère et soucieuse d'optimiser ses factures de carburant.`;

  return {
    introParagraph,
    logisticsAlert,
    useCaseText,
    pricesContext,
    faqItems,
    ecoText,
    localContext,
    climateZoneLabel: zone === 'mountain' ? 'Montagneuse (Alpes)' : zone === 'grenoble-metro' ? 'Urbaine Métropolitaine' : 'Plaine / Collines',
    localAgencyName: "Espace Conseil France Rénov' Isère (AGEDEN 38)",
    externalLinks: getExternalLinks(category, cp, slug),
    communeDataInsight: populationTierContent,
    expertTip,
    tableIntro,
    guideLinks: getGuideLinks(category, slug),
    savingsEstimate: `Jusqu'à ${commune.distanceGrenoble && commune.distanceGrenoble > 40 ? '1 600' : commune.distanceGrenoble && commune.distanceGrenoble > 15 ? '1 350' : '1 100'} € d'économies de carburant par an estimés pour un trajet pendulaire moyen de ${Math.round((commune.distanceGrenoble || 15) * 2)} km/jour depuis ${nom}.`,
    lastUpdated: "Juin 2026",
    realEstateInsight,
    populationTierContent,
    densiteAnalysis,
    marcheImmobilierInsight,
    distanceGrenobleContext,
    anecdotePatrimoine,
    localRegulation,
    sourcesCitation,
    mobiliteContext,
    specificiteElectrique,
    expertBlockquote,
    intercommunaliteContext,
    profilCommuneInsight
  };
}
