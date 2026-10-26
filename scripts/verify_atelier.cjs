const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8098;
const DIST = path.resolve(__dirname, '../dist');
const OUTPUT_DIR = path.resolve(__dirname, '../screenshots');
fs.makedirs = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
fs.makedirs(OUTPUT_DIR);

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

  const devices = [
    { name: 'Desktop 4K', width: 2560, height: 1440, isMobile: false },
    { name: 'MacBook Pro 14', width: 1512, height: 982, isMobile: false },
    { name: 'iPad Pro 11', width: 834, height: 1194, isMobile: false },
    { name: 'iPhone 15 Pro', width: 393, height: 852, isMobile: true }
  ];

  let totalErrors = 0;

  // 1. Multi-Device Layout & Console Audit
  for (const dev of devices) {
    const page = await browser.newPage({ viewport: { width: dev.width, height: dev.height } });
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    const hasOverflow = scrollWidth > innerWidth;

    console.log(`[VIEWPORT ${dev.name}] innerWidth=${innerWidth}, scrollWidth=${scrollWidth}, hasOverflow=${hasOverflow}, errors=${errors.length}`);
    if (errors.length > 0) {
      console.error(`Errors on ${dev.name}:`, errors);
      totalErrors += errors.length;
    }
    if (hasOverflow) {
      console.error(`FAIL: Horizontal scroll overflow detected on ${dev.name}`);
      totalErrors++;
    }

    if (dev.name === 'iPhone 15 Pro') {
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'atelier_iphone15_mobile.png') });
    }
    await page.close();
  }

  // 2. High-Resolution Visual Showcase Captures on MacBook Pro 14
  const page = await browser.newPage({ viewport: { width: 1512, height: 982 } });
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Capture 1: Default View (Liquid Mercury Trench)
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'atelier_hero_desktop.png') });
  console.log('[SCREENSHOT] Saved atelier_hero_desktop.png');

  // Capture 2: Switch to Prismatic Glass Corset (Tab 02)
  await page.click('button[data-index="1"]');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'atelier_corset_closeup.png') });
  console.log('[SCREENSHOT] Saved atelier_corset_closeup.png');

  // Capture 3: Cyber Prismatic Lighting Preset
  await page.click('button[data-preset="prismatic"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'atelier_prismatic_lighting.png') });
  console.log('[SCREENSHOT] Saved atelier_prismatic_lighting.png');

  // Capture 4: Activate Autonomous Director Reel Mode (Instagram Video Capture)
  await page.click('#btn-director-mode');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'atelier_director_mode.png') });
  console.log('[SCREENSHOT] Saved atelier_director_mode.png');

  // Exit Director Mode and Open Archive & CV Modal
  await page.click('#btn-exit-director');
  await page.waitForTimeout(500);
  await page.click('#btn-open-archive');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'atelier_archive_modal.png') });
  console.log('[SCREENSHOT] Saved atelier_archive_modal.png');

  await page.close();
  await browser.close();
  server.close();

  if (totalErrors === 0) {
    console.log('\n>>> ALL MULTI-MODAL AUDITS PASSED WITH ZERO CONSOLE ERRORS & ZERO OVERFLOW! <<<');
  } else {
    console.error(`\n>>> AUDIT FAILED WITH ${totalErrors} ISSUES <<<`);
    process.exit(1);
  }
}

runAudits();
