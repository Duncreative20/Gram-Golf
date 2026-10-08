// Chụp MỌI story của một Storybook (sáng + tối) bằng Chrome headless + CDP.
// Storybook phải đang chạy: DS `pnpm -F @gr/ds storybook` (6006, mặc định) hoặc màn app `pnpm storybook:app --no-open` (SB_URL=http://localhost:6007).
// Dùng: node scripts/shot-storybook.mjs <outDir> [filter-regex] [W=390] [H]
//   không có H: ảnh cao theo nội dung (tối đa 20000) — story DS;
//   có H (vd 844): khung cố định W×H như màn điện thoại — storyboard màn app (390×844).
// Chờ story vẽ + play xong (phase của StoryRender) rồi mới chụp. Mỗi lần chụp tối đa 60 s: treo thì khởi động lại Chrome, thử lại 1 lần.
// Ảnh: <outDir>/<story-id>.<light|dark>.png. Log: ok|ERROR <id> <scheme> <W>x<h> [lỗi story] [| exception / console.error của trang].
// Máy Mac phải đặt CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome".
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
const [outDir = 'sb-shots', filter = '.', W = '390', FIXED] = process.argv.slice(2);
const SB = process.env.SB_URL ?? 'http://localhost:6006';
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
mkdirSync(outDir, { recursive: true });
const index = await (await fetch(`${SB}/index.json`)).json();
const ids = Object.values(index.entries).filter((e) => e.type === 'story' && new RegExp(filter).test(e.id)).map((e) => e.id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let chrome, ws, seq = 0, pending = new Map(), errs = [];
const send = (method, params = {}) => new Promise((r) => { pending.set(++seq, r); ws.send(JSON.stringify({ id: seq, method, params })); });
const evaluate = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true })).result?.value;
async function start() {
  const port = 9222 + Math.floor(Math.random() * 500);
  chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--window-size=${W},900`, 'about:blank'], { stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 50 && !targets; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`, { signal: AbortSignal.timeout(2000) })).json(); } catch { await sleep(200); } }
  const page = targets.find((t) => t.type === 'page' && t.url === 'about:blank') ?? targets.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  pending = new Map();
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); }
    else if (m.method === 'Runtime.exceptionThrown') errs.push('EXC ' + (m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).split('\n')[0]);
    else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push('ERR ' + m.params.args.map((a) => a.value ?? a.description).join(' ').split('\n')[0]);
  };
  await send('Page.enable');
  await send('Runtime.enable');
}
const stop = () => { try { ws.close(); } catch {} try { chrome.kill('SIGKILL'); } catch {} };
process.on('exit', stop);
process.on('uncaughtException', (e) => { console.error('LỖI', e); stop(); process.exit(1); });
const MEASURE = `(()=>{const r=document.getElementById('storybook-root');const c=document.getElementById('sb-content')||r.firstElementChild;let h=c?c.getBoundingClientRect().bottom+window.scrollY:0;for(const el of r.querySelectorAll('*')){const cs=getComputedStyle(el);if(!(cs.overflowY==='auto'||cs.overflowY==='scroll'))continue;const b=el.getBoundingClientRect();if(el.scrollHeight>el.clientHeight+2&&b.bottom>=window.innerHeight-2)h=Math.max(h,b.top+window.scrollY+el.scrollHeight)}return Math.ceil(h)})()`;
// Sẵn sàng = có chữ VÀ StoryRender đã vẽ + chạy xong play (phase storybook 10.6: … playing → played → completing → completed → afterEach).
const READY = `(()=>{const n=document.body?document.body.innerText.trim().length:0;const p=window.__STORYBOOK_PREVIEW__?.currentRender?.phase;return n>3&&['completed','afterEach','finished','errored','aborted'].includes(p)})()`;
// Không có H: viewport cao để ScrollView (flex:1) trải hết nội dung rồi clip theo chiều cao thật. Có H: đúng khung điện thoại.
const H = FIXED ? +FIXED : 3000;
async function shoot(sid, scheme) {
  errs = [];
  await send('Emulation.setDeviceMetricsOverride', { width: +W, height: H, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `${SB}/iframe.html?id=${sid}&viewMode=story&globals=theme:${scheme}` });
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) { await sleep(500); ready = !!(await evaluate(READY)); }
  await sleep(600); // Dialog / sheet / toast mờ dần vào
  const err = await evaluate('document.body.classList.contains("sb-show-errordisplay") ? (document.querySelector("#error-message")?.innerText || "error") : ""');
  let h = H;
  if (!FIXED) {
    h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32));
    if (h > H) { await send('Emulation.setDeviceMetricsOverride', { width: +W, height: h, deviceScaleFactor: 1, mobile: true }); await sleep(600); h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32)); }
  }
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !FIXED, clip: { x: 0, y: 0, width: +W, height: h, scale: 1 } });
  writeFileSync(`${outDir}/${sid}.${scheme}.png`, Buffer.from(shot.data, 'base64'));
  const page = [...new Set(errs)].filter((x) => !/shadow\*/.test(x)); // cảnh báo "shadow*" của DS: không phải lỗi màn
  console.log(err || !ready ? 'ERROR' : 'ok', sid, scheme, `${W}x${h}`, err ? err.slice(0, 200) : ready ? '' : 'story chưa vẽ xong sau 30 s', page.length ? `| ${page.join(' | ').slice(0, 400)}` : '');
}
await start();
for (const sid of ids) {
  for (const scheme of ['light', 'dark']) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const r = await Promise.race([shoot(sid, scheme).then(() => 'done'), sleep(60000).then(() => 'timeout')]);
      if (r === 'done') break;
      console.log('TIMEOUT', sid, scheme, `lần ${attempt}`);
      stop();
      await sleep(500);
      await start();
    }
  }
}
stop();
process.exit(0);
