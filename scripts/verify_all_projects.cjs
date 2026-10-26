const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8099;
const DIST = path.resolve(__dirname, '../dist');
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath.endsWith('/')) reqPath += 'index.html';
  let filePath = path.join(DIST, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found: ' + reqPath);
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.glb': 'model/gltf-binary',
    '.blend': 'application/octet-stream'
  }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

async function runAudits() {
  server.listen(PORT);
  console.log(`[DIST SERVER] Listening at http://localhost:${PORT}`);

  const browser = await chromium.launch({
    args: ['--enable-webgl', '--use-gl=swiftshader']
  });

  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Capture Project 01: Couture Atelier
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'shot_proj1_couture.png') });
  console.log('[SCREENSHOT] Saved shot_proj1_couture.png');

  // 2. Switch & Capture Project 02: Kinetic Monolith
  await page.click('button[data-project="1"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'shot_proj2_monolith.png') });
  console.log('[SCREENSHOT] Saved shot_proj2_monolith.png');

  // 3. Switch & Capture Project 03: Tourbillon Watch
  await page.click('button[data-project="2"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'shot_proj3_tourbillon.png') });
  console.log('[SCREENSHOT] Saved shot_proj3_tourbillon.png');

  // 4. Switch & Capture Project 04: Bioluminescent Flora
  await page.click('button[data-project="3"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'shot_proj4_flora.png') });
  console.log('[SCREENSHOT] Saved shot_proj4_flora.png');

  // 5. Switch & Capture Project 05: Ferrofluid Orb
  await page.click('button[data-project="4"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'shot_proj5_ferrofluid.png') });
  console.log('[SCREENSHOT] Saved shot_proj5_ferrofluid.png');

  // 6. Test Director Reel Mode on Ferrofluid Orb
  await page.click('#btn-director-mode');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'shot_director_ferrofluid.png') });
  console.log('[SCREENSHOT] Saved shot_director_ferrofluid.png');

  await page.close();
  await browser.close();
  server.close();

  console.log(`\n>>> ALL 5 PROJECTS TESTED AND CAPTURED WITH ${errors.length} ERRORS! <<<`);
}

runAudits();
