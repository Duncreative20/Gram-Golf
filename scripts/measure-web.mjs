// Đo getComputedStyle qua CDP (Chrome headless) để đối chiếu token. Dùng: MSYS_NO_PATHCONV=1 node scripts/measure-web.mjs "/(dev)/ds/input3" light '[{"label":"x","find":{"placeholder":"…"},"up":1,"props":["height"]}]'
// check: { label, find: { placeholder | text | role }, up: n (số cấp cha), props: [...] }
import { spawn } from 'node:child_process';
const [route, scheme = 'light', checksJson = '[]'] = process.argv.slice(2);
const checks = JSON.parse(checksJson);
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, '--window-size=390,3000', 'about:blank'], { stdio: 'ignore' });
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
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 3000, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
await send('Page.navigate', { url: `${process.env.METRO_URL ?? 'http://localhost:8081'}${route}` });
for (let i = 0; i < 75; i++) { await sleep(2000); const r = await send('Runtime.evaluate', { expression: 'document.body ? document.body.innerText.trim().length : 0', returnByValue: true }); if ((r.result?.value ?? 0) > 10) break; }
await sleep(1500);
const expr = `(${function (checks) {
  const out = [];
  for (const c of checks) {
    let el = null;
    if (c.find.placeholder) el = document.querySelector(`[placeholder="${c.find.placeholder}"]`);
    else if (c.find.text) { const it = document.evaluate(`//*[normalize-space(text())="${c.find.text}"]`, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); el = it.snapshotItem(c.find.nth ?? 0); }
    else if (c.find.role) { el = document.querySelectorAll(`[role="${c.find.role}"]`)[c.find.nth ?? 0]; }
    for (let i = 0; i < (c.up ?? 0) && el; i++) el = el.parentElement;
    if (!el) { out.push({ label: c.label, error: 'not found' }); continue; }
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    const v = { label: c.label, w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100 };
    for (const p of c.props ?? []) v[p] = cs[p];
    out.push(v);
  }
  return out;
}})(${JSON.stringify(checks)})`;
const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
console.log(JSON.stringify(r.result?.value ?? r, null, 1));
ws.close(); chrome.kill();
