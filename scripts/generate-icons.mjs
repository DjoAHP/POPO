/**
 * Génère toutes les icônes PWA à partir du logo officiel assets/logo/logo_v1.svg.
 * Icônes générées :
 * - pwa-192x192.png, pwa-512x512.png (standard)
 * - pwa-512x512-maskable.png (zone sûre 40% pour maskable)
 * - apple-touch-icon-180x180.png (iOS home screen)
 * - apple-splash-*.png (écrans de démarrage iOS, portrait + landscape)
 *
 * Relançable avec `npm run icons` si le logo change.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const LOGO_PATH = "assets/logo/logo_v1.svg";
const BG = "#0e131d"; // fond de l'app (thème sombre)
const FILL = "#dfeefc"; // logo clair, lisible sur le fond sombre

const svg = readFileSync(LOGO_PATH, "utf8");
// Force le fill sur la racine pour qu'il soit hérité par tous les tracés.
const colored = svg.replace('<svg id="logo"', `<svg id="logo" fill="${FILL}"`);

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const APPLE_SIZES = [180]; // iOS home screen

async function generateIcon(size, isMaskable = false) {
  const corner = Math.round(size * 0.2); // coins arrondis ~20%
  const padding = isMaskable ? 0.4 : 0.62; // maskable = zone sûre 40%, normal = 62%
  const logoSize = Math.round(size * padding);

  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="100%" height="100%" rx="${corner}" fill="${BG}"/>` +
      `</svg>`,
  );

  const logo = await sharp(Buffer.from(colored), { density: 1200 })
    .resize(logoSize)
    .png()
    .toBuffer();

  const filename = isMaskable
    ? `public/pwa-${size}x${size}-maskable.png`
    : `public/pwa-${size}x${size}.png`;

  await sharp(background)
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(filename);

  console.log(`Icône générée : ${filename}`);
  return filename;
}

async function generateAppleTouchIcon(size) {
  const corner = Math.round(size * 0.2);
  const logoSize = Math.round(size * 0.62);

  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="100%" height="100%" rx="${corner}" fill="${BG}"/>` +
      `</svg>`,
  );

  const logo = await sharp(Buffer.from(colored), { density: 1200 })
    .resize(logoSize)
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(`public/apple-touch-icon-${size}x${size}.png`);

  console.log(`Apple touch icon généré : public/apple-touch-icon-${size}x${size}.png`);
}

/**
 * Génère les splash screens iOS (portrait + landscape).
 * Basé sur les tailles standard Apple.
 */
async function generateSplashScreens() {
  const screens = [
    // iPhone SE (1st gen) - 320x568
    { width: 320, height: 568, name: "iphone-se" },
    // iPhone 8/SE 2/3 - 375x667
    { width: 375, height: 667, name: "iphone-8" },
    // iPhone 8 Plus - 414x736
    { width: 414, height: 736, name: "iphone-8-plus" },
    // iPhone X/11 Pro - 375x812
    { width: 375, height: 812, name: "iphone-x" },
    // iPhone 11/XR - 414x896
    { width: 414, height: 896, name: "iphone-xr" },
    // iPhone 12/13/14 - 390x844
    { width: 390, height: 844, name: "iphone-12" },
    // iPhone 12/13/14 Pro Max - 428x926
    { width: 428, height: 926, name: "iphone-12-pro-max" },
    // iPad Mini - 768x1024
    { width: 768, height: 1024, name: "ipad-mini" },
    // iPad Air/Pro 11" - 834x1194
    { width: 834, height: 1194, name: "ipad-air" },
    // iPad Pro 12.9" - 1024x1366
    { width: 1024, height: 1366, name: "ipad-pro" },
  ];

  const logoSizeRatio = 0.3; // logo à 30% de la hauteur

  for (const screen of screens) {
    // Portrait
    await generateSplashScreen(
      screen.width,
      screen.height,
      `public/apple-splash-${screen.width}x${screen.height}.png`,
      logoSizeRatio,
    );
    // Landscape (inversé)
    await generateSplashScreen(
      screen.height,
      screen.width,
      `public/apple-splash-${screen.height}x${screen.width}.png`,
      logoSizeRatio,
    );
  }
}

async function generateSplashScreen(width, height, filename, logoSizeRatio) {
  const logoSize = Math.round(Math.min(width, height) * logoSizeRatio);

  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<rect width="100%" height="100%" fill="${BG}"/>` +
      `</svg>`,
  );

  const logo = await sharp(Buffer.from(colored), { density: 1200 })
    .resize(logoSize)
    .png()
    .toBuffer();

  await sharp(background)
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(filename);

  console.log(`Splash screen générée : ${filename}`);
}

async function main() {
  console.log("=== Génération icônes PWA standards ===");
  for (const size of ICON_SIZES) {
    await generateIcon(size);
  }

  console.log("\n=== Génération icônes maskable (zone sûre 40%) ===");
  await generateIcon(512, true); // maskable principal

  console.log("\n=== Génération Apple touch icons ===");
  for (const size of APPLE_SIZES) {
    await generateAppleTouchIcon(size);
  }

  console.log("\n=== Génération splash screens iOS ===");
  await generateSplashScreens();

  console.log("\n✅ Toutes les icônes générées dans public/");
}

main().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});