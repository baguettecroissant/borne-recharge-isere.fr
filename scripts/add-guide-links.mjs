/**
 * Script to add internal links to all guide articles
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const guidesDir = resolve(__dirname, '../src/content/guides');

// Link blocks to add at the end of each guide (contextual to the article topic)
const linkBlocks = {
  'zfe-grenoble-restrictions-borne-recharge-domicile.md': `

### Installez votre borne dans une commune de la ZFE

Les 49 communes de la métropole grenobloise sont toutes concernées par la ZFE. Trouvez un installateur IRVE local :
- [Borne de recharge Grenoble](/installateur-borne-recharge-grenoble/) · [Copropriété Grenoble](/borne-recharge-copropriete-grenoble/)
- [Borne de recharge Échirolles](/installateur-borne-recharge-echirolles/) · [Wallbox Échirolles](/wallbox-echirolles/)
- [Borne de recharge Saint-Martin-d'Hères](/installateur-borne-recharge-saint-martin-d-heres/)
- [Borne de recharge Fontaine](/installateur-borne-recharge-fontaine/) · [Meylan](/installateur-borne-recharge-meylan/)
- [Voir toutes les communes (38)](/communes/) · [Tarifs détaillés](/tarifs/)
- Découvrez aussi nos guides : [Prix borne recharge Isère 2026](/guides/prix-borne-recharge-isere-2026/) · [Aides ADVENIR](/guides/aide-advenir-grenoble-alpes-metropole-subventions/)
`,

  'recharger-ve-montagne-froid-altitude-iseroise.md': `

### Installez votre borne en altitude

Nos techniciens IRVE interviennent dans les communes de montagne de l'Isère :
- [Borne de recharge Vizille](/installateur-borne-recharge-vizille/) · [Wallbox Vizille](/wallbox-vizille/)
- [Borne de recharge Pontcharra](/installateur-borne-recharge-pontcharra/)
- [Borne de recharge Crolles](/installateur-borne-recharge-crolles/) · [Wallbox Crolles](/wallbox-crolles/)
- [Voir toutes les communes (38)](/communes/) · [Tarifs détaillés](/tarifs/)
- Guides complémentaires : [Borne pour chalet montagne](/guides/borne-recharge-chalet-montagne-protection-gel-solaire/) · [Comparatif wallbox résistantes au froid](/guides/comparatif-wallbox-resistantes-froid-ip65/)
`,

  'aide-advenir-grenoble-alpes-metropole-subventions.md': `

### Demandez votre devis avec simulation d'aides

Estimez vos aides ADVENIR et crédit d'impôt dans votre commune :
- [Installateur Grenoble](/installateur-borne-recharge-grenoble/) · [Copropriété Grenoble](/borne-recharge-copropriete-grenoble/)
- [Installateur Saint-Égrève](/installateur-borne-recharge-saint-egreve/) · [Copropriété Seyssinet-Pariset](/borne-recharge-copropriete-seyssinet-pariset/)
- [Copropriété Échirolles](/borne-recharge-copropriete-echirolles/) · [Copropriété Meylan](/borne-recharge-copropriete-meylan/)
- [Voir toutes les communes (38)](/communes/) · [Page Aides ADVENIR](/aides-advenir/)
- Guides liés : [Prix borne recharge Isère 2026](/guides/prix-borne-recharge-isere-2026/) · [Copropriété Grenoble IRVE collective](/guides/copropriete-grenoble-irve-collective-syndic/)
`,

  'wallbox-hydroelectricite-isere-recharge-verte.md': `

### Rechargez vert dans votre commune iséroise

L'hydroélectricité du Drac et de la Romanche alimente tout le département. Installez votre wallbox verte :
- [Wallbox Grenoble](/wallbox-grenoble/) · [Wallbox Voiron](/wallbox-voiron/)
- [Wallbox Crolles](/wallbox-crolles/) · [Wallbox Saint-Ismier](/wallbox-saint-ismier/)
- [Wallbox Vizille](/wallbox-vizille/) · [Wallbox Pontcharra](/wallbox-pontcharra/)
- [Voir toutes les communes (38)](/communes/) · [Tarifs détaillés](/tarifs/)
- Guides liés : [Recharger en montagne](/guides/recharger-ve-montagne-froid-altitude-iseroise/) · [Prix borne recharge Isère](/guides/prix-borne-recharge-isere-2026/)
`,

  'copropriete-grenoble-irve-collective-syndic.md': `

### Trouvez un installateur copropriété dans votre commune

Nos électriciens IRVE sont spécialisés dans les raccordements collectifs en copropriété :
- [Copropriété Grenoble](/borne-recharge-copropriete-grenoble/) · [Copropriété Saint-Martin-d'Hères](/borne-recharge-copropriete-saint-martin-d-heres/)
- [Copropriété Échirolles](/borne-recharge-copropriete-echirolles/) · [Copropriété Fontaine](/borne-recharge-copropriete-fontaine/)
- [Copropriété Meylan](/borne-recharge-copropriete-meylan/) · [Copropriété Seyssinet-Pariset](/borne-recharge-copropriete-seyssinet-pariset/)
- [Voir toutes les communes (38)](/communes/) · [Aides ADVENIR](/aides-advenir/)
- Guides liés : [Aides ADVENIR Grenoble](/guides/aide-advenir-grenoble-alpes-metropole-subventions/) · [Prix borne recharge Isère](/guides/prix-borne-recharge-isere-2026/)
`,

  'borne-recharge-chalet-montagne-protection-gel-solaire.md': `

### Faites installer votre borne chalet en Isère

Nos installateurs IRVE interviennent dans les communes de montagne et les stations :
- [Installateur Vizille](/installateur-borne-recharge-vizille/) · [Wallbox Vizille](/wallbox-vizille/)
- [Installateur Villard-Bonnot](/installateur-borne-recharge-villard-bonnot/) · [Wallbox Pontcharra](/wallbox-pontcharra/)
- [Installateur Crolles](/installateur-borne-recharge-crolles/) · [Wallbox Crolles](/wallbox-crolles/)
- [Voir toutes les communes (38)](/communes/) · [Guide technique d'installation](/guide-installation/)
- Guides liés : [Comparatif wallbox résistantes au froid](/guides/comparatif-wallbox-resistantes-froid-ip65/) · [Hydroélectricité et recharge verte](/guides/wallbox-hydroelectricite-isere-recharge-verte/)
`,

  'comparatif-wallbox-resistantes-froid-ip65.md': `

### Comparez les prix de wallbox dans votre commune

Trouvez la wallbox idéale pour votre logement en Isère :
- [Wallbox Grenoble](/wallbox-grenoble/) · [Wallbox Voiron](/wallbox-voiron/)
- [Wallbox Bourgoin-Jallieu](/wallbox-bourgoin-jallieu/) · [Wallbox Vienne](/wallbox-vienne/)
- [Wallbox Meylan](/wallbox-meylan/) · [Wallbox Saint-Égrève](/wallbox-saint-egreve/)
- [Voir toutes les communes (38)](/communes/) · [Tarifs détaillés](/tarifs/)
- Guides liés : [Borne pour chalet montagne](/guides/borne-recharge-chalet-montagne-protection-gel-solaire/) · [Recharger en montagne](/guides/recharger-ve-montagne-froid-altitude-iseroise/)
`
};

let updatedCount = 0;

for (const [filename, linkBlock] of Object.entries(linkBlocks)) {
  const filepath = resolve(guidesDir, filename);
  const content = readFileSync(filepath, 'utf-8');
  
  // Only add if not already containing internal links
  if (!content.includes('/installateur-borne-recharge-') && !content.includes('/wallbox-')) {
    writeFileSync(filepath, content.trimEnd() + linkBlock);
    updatedCount++;
    console.log(`✅ Updated: ${filename}`);
  } else {
    console.log(`⬜ Already has links: ${filename}`);
  }
}

console.log(`\nTotal guides updated: ${updatedCount}/7`);
