/**
 * Génère les icônes PWA (192 px et 512 px) à partir du logo officiel
 * assets/logo/logo_v1.svg : logo clair centré sur fond bleu nuit arrondi.
 * Relançable avec `npm run icons` si le logo change.
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";

const LOGO_PATH = "assets/logo/logo_v1.svg";
const BG = "#0e131d"; // fond de l'app (thème sombre)
const FILL = "#dfeefc"; // logo clair, lisible sur le fond sombre

const svg = readFileSync(LOGO_PATH, "utf8");
// Le SVG source n'a pas de fill : on en force un sur la racine, hérité par tous les tracés.
const colored = svg.replace("<svg id=\"logo\"", `<svg id=\"logo\" fill=\"${FILL}\"`);

async function generateIcon(size) {
  // Fond aux coins arrondis (les systèmes appliquent leur propre masque pour "maskable").
  const corner = Math.round(size * 0.2);
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="100%" height="100%" rx="${corner}" fill="${BG}"/>` +
      `</svg>`,
  );

  // Logo à ~62 % du canevas : dans la zone sûre "maskable" (80 %).
  const logo = await sharp(Buffer.from(colored), { density: 1200 })
    .resize(Math.round(size * 0.62))
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`public/pwa-${size}x${size}.png`);

  console.log(`Icône générée : public/pwa-${size}x${size}.png`);
}

await generateIcon(192);
await generateIcon(512);
