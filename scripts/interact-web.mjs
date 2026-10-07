// Click (hay giữ = pressed) phần tử theo chữ rồi chụp 390×844. Dùng: MSYS_NO_PATHCONV=1 node scripts/interact-web.mjs "/(dev)/ds/feedback" dark out.png "Mở Dialog" [1=giữ]
import { spawn } from 'node:child_process';
const [route, scheme = 'light', out = 'shot.png', text = '', hold = '0'] = process.argv.slice(2);
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
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
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
await send('Page.navigate', { url: `${process.env.METRO_URL ?? 'http://localhost:8081'}${route}` });
for (let i = 0; i < 75; i++) { await sleep(2000); const r = await send('Runtime.evaluate', { expression: 'document.body ? document.body.innerText.trim().length : 0', returnByValue: true }); if ((r.result?.value ?? 0) > 10) break; }
await sleep(1500);
const find = `(() => { const it = document.evaluate('//*[normalize-space(text())=${JSON.stringify(text)}]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue; if (!it) return null; it.scrollIntoView({ block: 'center' }); const r = it.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`;
await sleep(300);
const pos = (await send('Runtime.evaluate', { expression: find, returnByValue: true })).result?.value;
if (!pos) { console.log('NOT FOUND:', text); ws.close(); chrome.kill(); process.exit(1); }
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pos.x, y: pos.y });
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pos.x, y: pos.y, button: 'left', clickCount: 1 });
if (hold !== '1') { await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pos.x, y: pos.y, button: 'left', clickCount: 1 }); await sleep(1200); } else { await sleep(300); }
const shot = await send('Page.captureScreenshot', { format: 'png' });
const { writeFileSync } = await import('node:fs');
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('wrote', out, hold === '1' ? '(pressed)' : '(after click)', 'at', Math.round(pos.x), Math.round(pos.y));
ws.close(); chrome.kill();
