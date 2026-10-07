// Chụp MỌI story trong Storybook @gr/ds (sáng + tối) bằng một Chrome headless + CDP.
// Cần `pnpm -F @gr/ds storybook` đang chạy. Dùng: node scripts/shot-storybook.mjs <outDir> [filter-regex] [W=390]
// Ảnh: <outDir>/<story-id>.<light|dark>.png, cao theo nội dung (tối đa 6000).
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const [outDir = 'sb-shots', filter = '.', W = '390'] = process.argv.slice(2);
const SB = process.env.SB_URL ?? 'http://localhost:6006';
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
mkdirSync(outDir, { recursive: true });
const index = await (await fetch(`${SB}/index.json`)).json();
const ids = Object.values(index.entries).filter((e) => e.type === 'story' && new RegExp(filter).test(e.id)).map((e) => e.id);
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--window-size=${W},900`, 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { chrome.kill(); } catch {} });
process.on('uncaughtException', (e) => { console.error('LỖI', e); process.exit(1); });
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
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;
const MEASURE = `(()=>{const r=document.getElementById('storybook-root');const c=document.getElementById('sb-content')||r.firstElementChild;let h=c?c.getBoundingClientRect().bottom+window.scrollY:0;for(const el of r.querySelectorAll('*')){const cs=getComputedStyle(el);if(!(cs.overflowY==='auto'||cs.overflowY==='scroll'))continue;const b=el.getBoundingClientRect();if(el.scrollHeight>el.clientHeight+2&&b.bottom>=window.innerHeight-2)h=Math.max(h,b.top+window.scrollY+el.scrollHeight)}return Math.ceil(h)})()`;
// Cao theo NỘI DUNG: con đầu của root (không phải root — fonts.css đặt root height 100 %) + ScrollView flex:1 chạm đáy viewport → nới viewport bằng scrollHeight rồi mới chụp.
const H = 3000; // viewport cao để ScrollView (flex:1) trải hết nội dung; clip theo chiều cao thật
for (const sid of ids) {
  for (const scheme of ['light', 'dark']) {
    await send('Emulation.setDeviceMetricsOverride', { width: +W, height: H, deviceScaleFactor: 1, mobile: true });
    await send('Page.navigate', { url: `${SB}/iframe.html?id=${sid}&viewMode=story&globals=theme:${scheme}` });
    let len = 0;
    for (let i = 0; i < 40; i++) { await sleep(500); len = (await evaluate('document.body ? document.body.innerText.trim().length : 0')) ?? 0; if (len > 3) break; }
    await sleep(1200);
    const err = await evaluate('document.body.classList.contains("sb-show-errordisplay") ? (document.querySelector("#error-message")?.innerText || "error") : ""');
    let h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32));
    if (h > H) { await send('Emulation.setDeviceMetricsOverride', { width: +W, height: h, deviceScaleFactor: 1, mobile: true }); await sleep(600); h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32)); }
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: +W, height: h, scale: 1 } });
    const out = `${outDir}/${sid}.${scheme}.png`;
    writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log(err ? 'ERROR' : 'ok', sid, scheme, `${W}x${h}`, `text=${len}`, err ? err.slice(0, 200) : '');
  }
}
ws.close(); chrome.kill();
