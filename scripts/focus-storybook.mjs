// Focus thật (Tab / click) vào <input>/<textarea> thứ N của một story Storybook rồi chụp — kiểm state focus trên web.
// Dùng: node scripts/focus-storybook.mjs <story-id> <light|dark> out.png [index=0] [W=390]
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const [sid, scheme = 'light', out = 'focus.png', idx = '0', W = '390'] = process.argv.slice(2);
const SB = process.env.SB_URL ?? 'http://localhost:6006';
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--window-size=${W},900`, 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { chrome.kill(); } catch {} });
process.on('uncaughtException', (e) => { console.error('LỖI', e); process.exit(1); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;
const MEASURE = `(()=>{const r=document.getElementById('storybook-root');const c=document.getElementById('sb-content')||r.firstElementChild;let h=c?c.getBoundingClientRect().bottom+window.scrollY:0;for(const el of r.querySelectorAll('*')){const cs=getComputedStyle(el);if(!(cs.overflowY==='auto'||cs.overflowY==='scroll'))continue;const b=el.getBoundingClientRect();if(el.scrollHeight>el.clientHeight+2&&b.bottom>=window.innerHeight-2)h=Math.max(h,b.top+window.scrollY+el.scrollHeight)}return Math.ceil(h)})()`;
// Cao theo NỘI DUNG: con đầu của root (không phải root — fonts.css đặt root height 100 %) + ScrollView flex:1 chạm đáy viewport → nới viewport bằng scrollHeight rồi mới chụp.
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +W, height: 900, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url: `${SB}/iframe.html?id=${sid}&viewMode=story&globals=theme:${scheme}` });
for (let i = 0; i < 40; i++) { await sleep(500); if ((await evaluate('document.querySelectorAll("input,textarea").length')) > +idx) break; }
await sleep(800);
// click thật vào giữa ô → :focus-visible như người dùng bấm/tab
const box = await evaluate(`(()=>{const el=document.querySelectorAll("input,textarea")[${idx}];const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: box.x, y: box.y, button: 'left', clickCount: 1 });
await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x, y: box.y, button: 'left', clickCount: 1 });
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
await sleep(400);
const info = await evaluate(`(()=>{const el=document.activeElement;const cs=getComputedStyle(el);let p=el.parentElement;while(p&&parseFloat(getComputedStyle(p).borderTopWidth)===0)p=p.parentElement;return {tag:el.tagName,outline:cs.outlineStyle+' '+cs.outlineWidth+' '+cs.outlineColor,border:p?getComputedStyle(p).borderColor:'none'}})()`);
const h = Math.min(3000, ((await evaluate(MEASURE)) ?? 800) + 32);
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: +W, height: h, scale: 1 } });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('focused', JSON.stringify(info), 'wrote', out);
ws.close(); chrome.kill();
