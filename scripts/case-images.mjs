#!/usr/bin/env node
/**
 * Bildpipeline för case.
 *
 * Oskar ska inte behöva röra koden för att lägga upp en skärmbild. Lägg filen i
 * `public/case/` och döp den till casets slug:
 *
 *   public/case/socialcard.jpg
 *   public/case/nextwatch.png
 *   public/case/jj-bygg/cover.webp     (undermapp funkar också)
 *
 * Skriptet körs som `prebuild`, läser varje bilds verkliga mått och en
 * suddig miniatyr, och skriver `lib/caseImages.generated.ts`. Måtten behövs
 * för att `next/image` ska kunna reservera ytan (annars flyttar sig sidan när
 * bilden landar — CLS), och miniatyren används som `placeholder="blur"` så att
 * hero-bandet aldrig är en tom ruta medan bilden hämtas.
 *
 * Saknas bild för en slug renderas den genererade gradienten precis som förut.
 *
 * `sharp` följer med `next` och används när den finns. Går den inte att ladda
 * faller skriptet tillbaka på en egen headerläsare — då blir det inga suddiga
 * platshållare, men måtten stämmer och bygget går igenom.
 */

import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CASE_DIR = path.join(ROOT, "public", "case");
const OUT_FILE = path.join(ROOT, "lib", "caseImages.generated.ts");

const EXTENSIONS = [".avif", ".webp", ".jpg", ".jpeg", ".png"];
/** Vinner vid krock: en .avif slår en .jpg med samma slug. */
const PRIORITY = new Map(EXTENSIONS.map((ext, i) => [ext, i]));

// ---------------------------------------------------------------- sharp

/** @returns {Promise<import('sharp').default | null>} */
async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

// ------------------------------------------------- mått utan sharp

/**
 * Minimal headerläsare för PNG, JPEG och WebP. Räcker som skyddsnät när sharp
 * inte går att ladda. AVIF utelämnas medvetet — boxstrukturen är för snårig för
 * att vara värd femtio rader skyddsnätskod.
 * @param {Buffer} buf
 * @returns {{ width: number, height: number } | null}
 */
function readDimensions(buf) {
  // PNG: IHDR ligger alltid först, bredd och höjd som big-endian uint32.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG: hoppa mellan segment tills en SOF-markör dyker upp.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buf[offset + 1];
      // SOF0–SOF15, utom DHT (c4), JPG (c8) och DAC (cc).
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
        continue;
      }
      offset += 2 + buf.readUInt16BE(offset + 2);
    }
    return null;
  }

  // WebP: RIFF-container med tre möjliga chunkar.
  if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return {
        width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)),
        height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)),
      };
    }
    if (chunk === "VP8 ") {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L") {
      const bits = buf.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
  }

  return null;
}

// ---------------------------------------------------------------- scan

/**
 * Hittar en bild per slug. Både `public/case/<slug>.<ext>` och
 * `public/case/<slug>/cover.<ext>` accepteras.
 * @returns {Promise<Map<string, string>>} slug → absolut filsökväg
 */
async function findImages() {
  /** @type {Map<string, string>} */
  const found = new Map();
  if (!existsSync(CASE_DIR)) return found;

  /** @param {string} slug @param {string} file */
  const offer = (slug, file) => {
    const current = found.get(slug);
    if (!current) {
      found.set(slug, file);
      return;
    }
    const a = PRIORITY.get(path.extname(file).toLowerCase()) ?? 99;
    const b = PRIORITY.get(path.extname(current).toLowerCase()) ?? 99;
    if (a < b) found.set(slug, file);
  };

  for (const entry of await readdir(CASE_DIR)) {
    if (entry.startsWith(".")) continue;
    const full = path.join(CASE_DIR, entry);
    const info = await stat(full);

    if (info.isDirectory()) {
      for (const inner of await readdir(full)) {
        const ext = path.extname(inner).toLowerCase();
        if (path.basename(inner, ext) !== "cover" || !EXTENSIONS.includes(ext)) continue;
        offer(entry, path.join(full, inner));
      }
      continue;
    }

    const ext = path.extname(entry).toLowerCase();
    if (!EXTENSIONS.includes(ext)) continue;
    offer(path.basename(entry, ext), full);
  }

  return found;
}

// ---------------------------------------------------------------- kör

async function main() {
  const sharp = await loadSharp();
  const images = await findImages();
  const slugs = [...images.keys()].sort();

  /** @type {string[]} */
  const entries = [];
  const skipped = [];
  const warnings = [];

  for (const slug of slugs) {
    const file = images.get(slug);
    const src = "/" + path.relative(path.join(ROOT, "public"), file).split(path.sep).join("/");

    let width = 0;
    let height = 0;
    let blurDataURL = "";

    if (sharp) {
      try {
        const pipeline = sharp(file);
        const meta = await pipeline.metadata();
        width = meta.width ?? 0;
        height = meta.height ?? 0;

        // 16 px bred miniatyr — några hundra byte, precis nog för att antyda
        // kompositionen bakom Next:s egen blur-filter.
        const tiny = await sharp(file).resize(16, null, { fit: "inside" }).webp({ quality: 45 }).toBuffer();
        blurDataURL = `data:image/webp;base64,${tiny.toString("base64")}`;
      } catch (error) {
        skipped.push(`${slug}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
    } else {
      const dims = readDimensions(await readFile(file));
      if (!dims) {
        skipped.push(`${slug}: kunde inte läsa måtten utan sharp (${path.extname(file)})`);
        continue;
      }
      width = dims.width;
      height = dims.height;
    }

    if (!width || !height) {
      skipped.push(`${slug}: saknar mått`);
      continue;
    }

    // Hero-bandet går till 100vw. Under 1600 px blir det synligt mjukt på en
    // vanlig laptopskärm, och en portfölj som visar suddiga skärmbilder säljer
    // sämre än en som visar gradienter. Varning, inte fel — bilden används ändå.
    if (width < 1600) {
      warnings.push(`${slug}: bara ${width} px bred, hero-bandet vill ha minst 1600`);
    }

    entries.push(
      `  "${slug}": {\n` +
        `    src: "${src}",\n` +
        `    width: ${width},\n` +
        `    height: ${height},\n` +
        (blurDataURL ? `    blurDataURL: "${blurDataURL}",\n` : "") +
        `  },`
    );
  }

  const body = entries.length ? `\n${entries.join("\n")}\n` : "";
  const source = `// GENERERAD FIL — redigera inte för hand.
// Skapas av \`scripts/case-images.mjs\`, som körs som \`prebuild\`.
// Lägg till en bild genom att lägga filen i \`public/case/<slug>.<jpg|png|webp|avif>\`.

export interface CaseImage {
  src: string;
  width: number;
  height: number;
  /** Saknas om sharp inte var tillgänglig när filen genererades. */
  blurDataURL?: string;
}

export const caseImages: Record<string, CaseImage> = {${body}};
`;

  const previous = existsSync(OUT_FILE) ? await readFile(OUT_FILE, "utf8") : "";
  if (previous !== source) await writeFile(OUT_FILE, source, "utf8");

  const engine = sharp ? "sharp" : "headerläsare (inga blur-platshållare)";
  console.log(`case-images: ${entries.length} bild(er) via ${engine}`);
  for (const note of warnings) console.warn(`case-images: ${note}`);
  for (const note of skipped) console.warn(`case-images: hoppade över ${note}`);

  // En bild vars filnamn inte matchar någon slug är nästan alltid ett stavfel,
  // och tystnad gör felet svårt att hitta — bilden syns bara aldrig.
  const known = new Set(
    (await readFile(path.join(ROOT, "lib", "projects.ts"), "utf8"))
      .matchAll(/^\s*slug:\s*"([^"]+)"/gm)
  );
  const knownSlugs = new Set([...known].map((m) => m[1]));
  if (knownSlugs.size) {
    for (const slug of slugs) {
      if (!knownSlugs.has(slug)) {
        console.warn(`case-images: "${slug}" matchar inget case i lib/projects.ts — bilden visas inte`);
      }
    }
  }
}

main().catch((error) => {
  console.error("case-images misslyckades:", error);
  process.exit(1);
});
