// Chụp màn gallery @gr/ds qua web (react-native-web) bằng Chrome headless + CDP, không cần Playwright.
// Cần Metro đang chạy (pnpm -F golf start). Dùng: MSYS_NO_PATHCONV=1 node scripts/shot-web.mjs "/(dev)/ds/icon" dark out.png [390] [844]
// Chrome: đường dẫn chrome-headless-shell của Playwright (đổi CHROME nếu máy khác).
import { spawn } from 'node:child_process';
const [route, scheme = 'light', out = 'shot.png', W = '390', H = '844', full = '1'] = process.argv.slice(2);
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: +H, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
const nav = await send('Page.navigate', { url: `${process.env.METRO_URL ?? 'http://localhost:8081'}${route}` }); console.log('navigate', JSON.stringify(nav));
// chờ bundle + fonts: tới khi body có chữ, tối đa 150s
let len = 0;
for (let i = 0; i < 75; i++) {
  await sleep(2000);
  const r = await send('Runtime.evaluate', { expression: 'document.body ? document.body.innerText.trim().length : 0', returnByValue: true });
  len = r.result?.value ?? 0; if (len > 10) { console.log('text after', (i + 1) * 2, 's, len', len); break; }
}
if (len <= 10) { const d = await send('Runtime.evaluate', { expression: 'location.href + " | " + document.readyState + " | " + document.documentElement.outerHTML.slice(0, 400)', returnByValue: true }); console.log('WARN: no text rendered', JSON.stringify(d)); }
await sleep(1500);
let clip;
if (full === '1') {
  const r = await send('Runtime.evaluate', { expression: 'Math.min(20000, document.documentElement.scrollHeight)', returnByValue: true });
  const h = r.result?.value ?? +H;
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: h, deviceScaleFactor: 1, mobile: true });
  await sleep(800);
  clip = { x: 0, y: 0, width: +W, height: h, scale: 1 };
}
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, ...(clip ? { clip } : {}) });
const { writeFileSync } = await import('node:fs');
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('wrote', out, clip ? `${clip.width}x${clip.height}` : `${W}x${H}`);
ws.close(); chrome.kill();
