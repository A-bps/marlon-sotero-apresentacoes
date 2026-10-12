// Captura 360/768/1440 das rotas principais em screenshots/ (pasta ignorada pelo git).
// Uso: npm run build && npm start (outro terminal) && node scripts/screenshots.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] || "http://localhost:3000";
const routes = { hub: "/", imovel: "/imovel/empreendimento-exemplo", publico: "/p/empreendimento-exemplo" };
mkdirSync("screenshots", { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const w of [360, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width: w, height: w === 360 ? 780 : 900 } });
  page.on("console", (m) => m.type() === "error" && errors.push(`${w} ${m.text()}`));
  for (const [name, path] of Object.entries(routes)) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    const total = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < total; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(120); }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 15000 }).catch(() => errors.push(`${w} ${name}: imagens não carregaram`));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/${name}-${w}.png`, fullPage: true });
    if (w === 360) {
      const h = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0, k = 1; y < h; y += 1800, k++)
        await page.screenshot({ path: `screenshots/${name}-360-parte${k}.png`, fullPage: true, clip: { x: 0, y, width: 360, height: Math.min(1800, h - y) } });
    }
  }
  await page.close();
}
await browser.close();
console.log(errors.length ? errors.join("\n") : "sem erros de console");
