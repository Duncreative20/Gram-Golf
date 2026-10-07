// Tự kiểm full @gr/ds qua Storybook — 3 trục tu-kiem: Mắt (ảnh sáng/tối × 390/430 + state focus/hover/pressed THẬT),
// Số (getComputedStyle mọi phần tử: màu ∈ bộ token của scheme, font = MiSans, outline trần), a11y (axe-core từng story).
// Cần `pnpm -F @gr/ds storybook` chạy. Dùng: node scripts/audit-storybook.mjs <outDir> [filter-regex]
// Ra: <outDir>/<id>.<scheme>.<W>.png (+ .focus/.hover/.pressed ở 390), <outDir>/report.json, <outDir>/report.md
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [outDir = 'sb-audit', filter = '.'] = process.argv.slice(2);
const SB = process.env.SB_URL ?? 'http://localhost:6006';
const CHROME = process.env.CHROME ?? 'C:/Users/Duncr/AppData/Local/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-win64/chrome-headless-shell.exe';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
mkdirSync(outDir, { recursive: true });

// ---- bộ token màu theo scheme (đọc thẳng file generated, không cần TS) ----
const loadObj = (f) => {
  const src = readFileSync(join(ROOT, 'packages/ds/src/generated', f), 'utf8');
  const body = src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1).replace(/,\s*}/g, '}');
  return JSON.parse(body);
};
const hexToRgba = (h) => {
  const x = h.replace('#', '');
  const n = (i) => parseInt(x.slice(i, i + 2), 16);
  return [n(0), n(2), n(4), x.length === 8 ? Math.round((n(6) / 255) * 100) / 100 : 1];
};
const key = (rgba) => rgba.join(',');
const tokenSet = (files) => {
  const s = new Set(['0,0,0,0']);
  for (const f of files) for (const v of Object.values(loadObj(f))) if (typeof v === 'string' && v.startsWith('#')) s.add(key(hexToRgba(v)));
  return s;
};
const TOKENS = {
  light: tokenSet(['theme.light.ts', 'component.neutral.light.ts', 'component.brand.light.ts', 'primitives.colors.ts']),
  dark: tokenSet(['theme.dark.ts', 'component.neutral.dark.ts', 'component.brand.dark.ts', 'primitives.colors.ts']),
};
const AXE = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');

// ---- Chrome + CDP ----
const index = await (await fetch(`${SB}/index.json`)).json();
const ids = Object.values(index.entries).filter((e) => e.type === 'story' && new RegExp(filter).test(e.id)).map((e) => e.id);
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, '--window-size=390,900', 'about:blank'], { stdio: 'ignore' });
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
const evaluate = async (expression, awaitPromise = false) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise })).result?.value;
await send('Page.enable');
const MEASURE = `(()=>{const r=document.getElementById('storybook-root');const c=document.getElementById('sb-content')||r.firstElementChild;let h=c?c.getBoundingClientRect().bottom+window.scrollY:0;for(const el of r.querySelectorAll('*')){const cs=getComputedStyle(el);if(!(cs.overflowY==='auto'||cs.overflowY==='scroll'))continue;const b=el.getBoundingClientRect();if(el.scrollHeight>el.clientHeight+2&&b.bottom>=window.innerHeight-2)h=Math.max(h,b.top+window.scrollY+el.scrollHeight)}return Math.ceil(h)})()`;
// Cao theo NỘI DUNG: con đầu của root (không phải root — fonts.css đặt root height 100 %) + ScrollView flex:1 chạm đáy viewport → nới viewport bằng scrollHeight rồi mới chụp.
const H = 3000;
const shot = async (file) => {
  let h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32));
  if (h > H) { await send('Emulation.setDeviceMetricsOverride', { width: curW, height: h, deviceScaleFactor: 1, mobile: true }); await sleep(600); h = Math.min(20000, Math.max(200, ((await evaluate(MEASURE)) ?? 800) + 32)); }
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: curW, height: h, scale: 1 } });
  writeFileSync(join(outDir, file), Buffer.from(r.data, 'base64'));
};
let curW = 390;
const goto = async (sid, scheme, W) => {
  curW = W;
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: `${SB}/iframe.html?id=${sid}&viewMode=story&globals=theme:${scheme}` });
  for (let i = 0; i < 40; i++) { await sleep(500); if ((await evaluate('document.getElementById("storybook-root")?.children.length')) > 0) break; }
  await sleep(1200);
  return await evaluate('document.body.classList.contains("sb-show-errordisplay") ? (document.querySelector("#error-message")?.innerText || "error").slice(0, 200) : ""');
};

// Trục Số: quét computed style của mọi phần tử trong story
const SCAN = `(() => {
  const out = { colors: [], fonts: [], outline: [] };
  const seen = new Set();
  const parse = (c) => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(',').map((x) => parseFloat(x)); return [p[0], p[1], p[2], p.length > 3 ? Math.round(p[3] * 100) / 100 : 1].join(','); };
  const label = (el) => (el.tagName + (el.getAttribute('role') ? '[' + el.getAttribute('role') + ']' : '') + ' "' + (el.textContent || '').trim().slice(0, 24) + '"');
  for (const el of document.getElementById('storybook-root').querySelectorAll('*')) {
    if (['SVG', 'PATH', 'G', 'IMG', 'DEFS', 'LINEARGRADIENT', 'STOP', 'RECT', 'CIRCLE', 'CLIPPATH'].includes(el.tagName.toUpperCase())) continue;
    const cs = getComputedStyle(el);
    if (cs.opacity === '0' || cs.visibility === 'hidden') continue;
    const props = [['color', cs.color], ['backgroundColor', cs.backgroundColor]];
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(cs['border' + side + 'Width']) > 0 && cs['border' + side + 'Style'] !== 'none') props.push(['border' + side + 'Color', cs['border' + side + 'Color']]);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    for (const [p, v] of props) {
      if (p === 'color' && !hasText && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') continue;
      const k = parse(v); if (!k) continue;
      const sig = p + '|' + k; if (seen.has(sig)) continue; seen.add(sig);
      out.colors.push({ prop: p, rgba: k, css: v, el: label(el) });
    }
    if ((hasText || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && !/MiSans/.test(cs.fontFamily)) out.fonts.push({ font: cs.fontFamily, el: label(el) });
    if (el === document.activeElement && cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) out.outline.push({ outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor, el: label(el) });
  }
  return out;
})()`;
const AXE_RUN = `axe.run(document.getElementById('storybook-root'), { rules: { region: { enabled: false }, 'page-has-heading-one': { enabled: false }, 'landmark-one-main': { enabled: false } } }).then(r => JSON.stringify(r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sel: v.nodes.slice(0, 3).map(n => n.target.join(' ') + (n.any[0] && n.any[0].data && n.any[0].data.contrastRatio ? ' ' + n.any[0].data.fgColor + '/' + n.any[0].data.bgColor + '=' + n.any[0].data.contrastRatio : '')) }))))`;

const SEL_INPUT = 'input:not([disabled]):not([readonly]),textarea:not([disabled]):not([readonly])';
const SEL_PRESS = '[role=button]:not([aria-disabled=true]),[role=tab]:not([aria-disabled=true]),[role=switch]:not([aria-disabled=true]),[role=checkbox]:not([aria-disabled=true]),[role=radio]:not([aria-disabled=true]),[role=menuitem]';
const center = async (sel, i = 0) => await evaluate(`(()=>{const el=[...document.querySelectorAll('${sel}')].filter(e=>e.getBoundingClientRect().width>0)[${i}];if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
const mouse = (type, p, extra = {}) => send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: type === 'mouseMoved' ? 'none' : 'left', clickCount: 1, ...extra });

const report = [];
for (const sid of ids) {
  for (const scheme of ['light', 'dark']) {
    for (const W of [390, 430]) {
      const row = { sid, scheme, W, error: '', offToken: [], fonts: [], outline: [], axe: [], states: [] };
      row.error = await goto(sid, scheme, W);
      await shot(`${sid}.${scheme}.${W}.png`);
      const scan = await evaluate(SCAN);
      if (scan) {
        row.nColors = scan.colors.length;
        row.offToken = scan.colors.filter((c) => !TOKENS[scheme].has(c.rgba));
        row.fonts = scan.fonts;
        row.outline = scan.outline;
      }
      if (W === 390) {
        await evaluate(AXE);
        try { row.axe = JSON.parse((await evaluate(AXE_RUN, true)) || '[]'); } catch (e) { row.axe = [{ id: 'axe-error', help: String(e).slice(0, 100) }]; }
        // state THẬT: focus ô nhập, hover + giữ chuột lên control đầu tiên
        const inp = await center(SEL_INPUT);
        if (inp) {
          await mouse('mousePressed', inp); await mouse('mouseReleased', inp); await sleep(300);
          const o = await evaluate(SCAN); row.outline = o?.outline ?? [];
          await shot(`${sid}.${scheme}.${W}.focus.png`); row.states.push('focus');
          await evaluate('document.activeElement && document.activeElement.blur()');
        }
        const btn = await center(SEL_PRESS);
        if (btn) {
          await mouse('mouseMoved', btn); await sleep(300); await shot(`${sid}.${scheme}.${W}.hover.png`); row.states.push('hover');
          const hov = await evaluate(SCAN); row.offToken.push(...hov.colors.filter((c) => !TOKENS[scheme].has(c.rgba)).map((c) => ({ ...c, state: 'hover' })));
          await mouse('mousePressed', btn); await sleep(300); await shot(`${sid}.${scheme}.${W}.pressed.png`); row.states.push('pressed');
          const prs = await evaluate(SCAN); row.offToken.push(...prs.colors.filter((c) => !TOKENS[scheme].has(c.rgba)).map((c) => ({ ...c, state: 'pressed' })));
          await mouse('mouseReleased', btn);
        }
      }
      report.push(row);
      console.log(row.error ? 'ERROR' : 'ok', sid, scheme, W, `colors=${row.nColors ?? 0} off=${row.offToken.length} font=${row.fonts.length} outline=${row.outline.length} axe=${row.axe.length} states=${row.states.join('/')}`);
    }
  }
}
writeFileSync(join(outDir, 'report.json'), JSON.stringify(report, null, 1));
const bad = report.filter((r) => r.error || r.offToken.length || r.fonts.length || r.outline.length || r.axe.length);
const md = [`# Audit Storybook — ${ids.length} story × sáng/tối × 390/430 = ${report.length} lượt`, '', `| Story | Scheme | W | Lỗi render | Màu ngoài token | Font ≠ MiSans | Outline trần | axe | State |`, '| --- | --- | --- | --- | --- | --- | --- | --- | --- |'];
for (const r of bad) md.push(`| ${r.sid} | ${r.scheme} | ${r.W} | ${r.error} | ${r.offToken.slice(0, 4).map((c) => `${c.prop}${c.state ? '@' + c.state : ''}=${c.css} (${c.el})`).join('; ')}${r.offToken.length > 4 ? ` …+${r.offToken.length - 4}` : ''} | ${r.fonts.slice(0, 2).map((f) => `${f.font} (${f.el})`).join('; ')} | ${r.outline.map((o) => `${o.outline} (${o.el})`).join('; ')} | ${r.axe.map((a) => `${a.id}[${a.impact}]×${a.n}`).join('; ')} | ${r.states.join('/')} |`);
md.push('', `Sạch: ${report.length - bad.length}/${report.length} lượt.`);
writeFileSync(join(outDir, 'report.md'), md.join('\n'));
console.log('DONE', `${bad.length} lượt có finding / ${report.length}`);
ws.close(); chrome.kill();
