// Đi hết một luồng chức năng trên web (react-native-web) bằng Chrome headless + CDP: bấm như người dùng, kiểm chữ mong đợi — chứng minh bàn
// giao giữa màn và giữa 2 vai trò. Bước "shot" là ĐIỂM KIỂM: ảnh CDP vào $TMPDIR/flow-<Fxx>/ để tự soát. Storyboard thật sinh từ story
// (scripts/shot-storybook.mjs → docs/flows/<Fxx>/<story-id>.<light|dark>.png); cuối lượt script kiểm mỗi bước "shot" "<nn>-<slug>" có story
// "<fxx>--b-<nn>-<slug>" + đủ 2 ảnh, rồi ghi bảng bước + bảng story biến thể vào docs/flows/<Fxx>.md (giữa 2 dấu steps:start/end).
// Dùng: CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node scripts/flow-web.mjs docs/flows/F04/steps.json
// Cần Metro web: pnpm -F golf exec expo start --web --port 8081 (cổng khác → METRO_URL=http://localhost:<cổng>) và Storybook app:
// pnpm storybook:app --no-open (cổng khác → SB_URL). "storyboard": false trong steps.json bỏ phần kiểm story (kịch bản thử script).
// Dữ liệu mock sống trong MỘT lần tải trang: chỉ `start` và bước `open` tải URL (kèm ?as=<id> để đăng nhập nhanh); mọi bước khác bấm trong app;
// đổi tài khoản bằng bước `switch` (Hồ sơ của tôi → Cài đặt → Dev → tên hồ sơ) để dữ liệu giữa 2 vai trò không mất.
// Bước (mỗi bước đúng 1 khoá chính):
//   { "click": "<chữ hoặc aria-label>", "role"?: "tab|button|…", "nth"?: 0, "contains"?: true, "settle"?: ms }
//       bấm phần tử nhìn thấy, không bị Dialog/BottomSheet che; contains = khớp một phần (chữ hoặc aria-label)
//   { "type": "<chữ>", "into": "<aria-label | placeholder>" ("^…" = bắt đầu bằng), "append"?: true }   xoá ô rồi gõ (append: gõ tiếp)
//   { "key": "Enter" } · { "wait": ms } · { "back": true } · { "expect": "<chữ>", "timeout"?: ms } · { "expectNot": "<chữ>" }
//   { "switch": "<tên hồ sơ>" } · { "open": "<route>" } · { "read": "<regex>", "as": "<biến>" } → "${biến}" ở bước sau
//   mọi bước nhận thêm "account"?: "<nhãn>" — đổi cột Tài khoản từ bước đó (vd tài khoản vừa tạo trong luồng, open ?as=…)
//   { "shot": "<nn>-<tên>", "do": "<thao tác>", "see": "<kết quả mong đợi>", "settle"?: ms }   (nn hai chữ số, tên chữ thường không dấu)
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const file = process.argv[2];
if (!file) {
  console.log('Dùng: node scripts/flow-web.mjs docs/flows/<Fxx>/steps.json');
  process.exit(1);
}
const spec = JSON.parse(readFileSync(file, 'utf8'));
const outDir = dirname(file);
const mdPath = join(dirname(outDir), `${spec.flow}.md`);
const BASE = process.env.METRO_URL ?? 'http://localhost:8081';
const SB = process.env.SB_URL ?? 'http://localhost:6007';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const checkDir = join(tmpdir(), `flow-${spec.flow}`); // ảnh điểm kiểm CDP — không vào docs/
mkdirSync(checkDir, { recursive: true });
const sid = (shot) => `${spec.flow.toLowerCase()}--b-${shot}`; // story của bước shot (export B<nn><Slug>, xem plan "Cách chạy một task luồng")
const W = 390;
const H = 844;
const port = 9222 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--window-size=${W},${H}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50 && !targets; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  } catch {
    await sleep(200);
  }
}
const page = targets?.find((t) => t.type === 'page');
if (!page) {
  chrome.kill();
  throw new Error('Chrome không mở trang CDP');
}
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let seq = 0;
const pending = new Map();
const crashes = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.method === 'Runtime.exceptionThrown') crashes.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result ?? m.error);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) => new Promise((r) => { pending.set(++seq, r); ws.send(JSON.stringify({ id: seq, method, params })); });
const inPage = async (fn, ...args) => (await send('Runtime.evaluate', { expression: `(${fn})(...${JSON.stringify(args)})`, returnByValue: true })).result?.value;
const media = (scheme) => send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
const quit = (code) => {
  ws.close();
  chrome.kill();
  process.exit(code);
};
async function waitFor(probe, message, timeout = 6000) {
  for (let t = 0; t <= timeout; t += 250) {
    const v = await probe();
    if (v) return v;
    await sleep(250);
  }
  throw new Error(message);
}

// ── chạy trong trang ──
// Phần tử nhìn thấy, không bị lớp khác che, khớp chữ (đúng, hoặc chứa nếu contains) hoặc aria-label; role → leo lên [role=…] gần nhất.
function FIND(q, role, nth, contains) {
  const xp = contains ? `//*[contains(normalize-space(.), ${JSON.stringify(q)})]` : `//*[normalize-space(text())=${JSON.stringify(q)}]`;
  const it = document.evaluate(xp, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  const byText = [];
  for (let i = 0; i < it.snapshotLength; i++) byText.push(it.snapshotItem(i));
  const hits = contains ? byText.filter((el) => !byText.some((o) => o !== el && el.contains(o))) : byText; // contains: chỉ giữ phần tử sâu nhất
  document.querySelectorAll('[aria-label]').forEach((el) => {
    const a = el.getAttribute('aria-label');
    if (contains ? a.includes(q) : a === q) hits.push(el);
  });
  const shown = hits
    .map((el) => (role ? el.closest(`[role="${role}"]`) : el))
    .filter((el, i, all) => el && all.indexOf(el) === i)
    .filter((el) => {
      if (!el.checkVisibility()) return false;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!top && (top === el || el.contains(top) || top.contains(el));
    });
  const el = shown[nth ?? 0];
  if (!el) return null;
  el.scrollIntoView({ block: 'center' });
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
// Ô nhập theo aria-label hoặc placeholder ("^…" = bắt đầu bằng): focus, xoá giá trị kiểu React nhận được (trừ khi append).
function FOCUS(label, append) {
  const match = (v) => (label.startsWith('^') ? (v ?? '').startsWith(label.slice(1)) : v === label);
  const el = [...document.querySelectorAll('input,textarea')].find((x) => x.checkVisibility() && (match(x.getAttribute('aria-label')) || match(x.getAttribute('placeholder'))));
  if (!el) return false;
  el.scrollIntoView({ block: 'center' });
  el.focus();
  if (append) el.setSelectionRange(el.value.length, el.value.length);
  else {
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, '');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return true;
}
function HAS(q) {
  return document.body.innerText.includes(q) || [...document.querySelectorAll('[aria-label]')].some((el) => el.checkVisibility() && el.getAttribute('aria-label').includes(q));
}
function READ(re) {
  const r = new RegExp(re);
  const it = document.evaluate('//*[text()]', document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0; i < it.snapshotLength; i++) {
    const el = it.snapshotItem(i);
    if (el.checkVisibility() && r.test(el.textContent.trim())) return el.textContent.trim();
  }
  return null;
}

// ── chạy ở Node ──
async function click(q, opt = {}) {
  const p = await waitFor(() => inPage(FIND, q, opt.role ?? null, opt.nth ?? 0, !!opt.contains), `không thấy "${q}"${opt.role ? ` (role ${opt.role})` : ''}`);
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: p.x, y: p.y, button: 'left', clickCount: 1 });
}
const visibleNow = (q) => inPage(FIND, q, null, 0, false);
async function switchTo(name) {
  for (let i = 0; ; i++) {
    if (await visibleNow('Dùng tài khoản mẫu')) {
      await click('Dùng tài khoản mẫu');
      break;
    }
    if (await visibleNow('Hồ sơ của tôi')) {
      await click('Hồ sơ của tôi');
      await sleep(700);
      await click('Cài đặt', { role: 'button' });
      await sleep(700);
      await click('Dev');
      break;
    }
    if (i > 6 || !(await visibleNow('Quay lại'))) throw new Error('không có đường tới Cài đặt › Dev từ màn này');
    await click('Quay lại');
    await sleep(700);
  }
  await sleep(700);
  await click(name);
  await sleep(1500);
}
async function open(route) {
  await send('Page.navigate', { url: `${BASE}${route}` });
  await waitFor(() => inPage(() => (document.body?.innerText.trim().length ?? 0) > 10), `trang ${route} không vẽ chữ`, 150000);
  await sleep(1000);
}
async function capture(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(checkDir, `${name}.png`), Buffer.from(data, 'base64'));
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: true });
await media('light');
const vars = {};
const fill = (v) => (typeof v === 'string' ? v.replace(/\$\{(\w+)\}/g, (_, k) => vars[k] ?? `\${${k}}`) : v);
let account = spec.account ?? '—';
const rows = [];
await open(spec.start);
for (const [i, raw] of spec.steps.entries()) {
  const s = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, fill(v)]));
  if (s.account) account = s.account;
  try {
    if ('click' in s) {
      await click(s.click, s);
      await sleep(s.settle ?? 700);
    } else if ('type' in s) {
      await waitFor(() => inPage(FOCUS, s.into, !!s.append), `không thấy ô "${s.into}"`);
      if (s.type) await send('Input.insertText', { text: s.type });
      await sleep(300);
    } else if ('key' in s) {
      await send('Input.dispatchKeyEvent', { type: 'keyDown', key: s.key, code: s.key, windowsVirtualKeyCode: s.key === 'Enter' ? 13 : 0, ...(s.key === 'Enter' ? { text: '\r' } : {}) });
      await send('Input.dispatchKeyEvent', { type: 'keyUp', key: s.key, code: s.key, windowsVirtualKeyCode: s.key === 'Enter' ? 13 : 0 });
      await sleep(500);
    } else if ('expect' in s) await waitFor(() => inPage(HAS, s.expect), `không thấy chữ "${s.expect}"`, s.timeout ?? 6000);
    else if ('expectNot' in s) {
      await sleep(600);
      if (await inPage(HAS, s.expectNot)) throw new Error(`vẫn còn chữ "${s.expectNot}"`);
    } else if ('wait' in s) await sleep(s.wait);
    else if ('back' in s) {
      await click('Quay lại');
      await sleep(800);
    } else if ('switch' in s) {
      await switchTo(s.switch);
      account = s.switch;
    } else if ('open' in s) {
      await open(s.open);
    } else if ('read' in s) vars[s.as] = await waitFor(() => inPage(READ, s.read), `không đọc được chữ khớp /${s.read}/`);
    else if ('shot' in s) {
      if (!/^\d\d-[a-z0-9-]+$/.test(s.shot)) throw new Error(`tên shot "${s.shot}" phải là <nn>-<chữ thường không dấu>`);
      await sleep(s.settle ?? 400);
      await capture(s.shot);
      // Bảng chỉ ghi giá trị cố định giữa các lần chạy: route bỏ query (?as=, ?draft=…), id newId (<tiền tố>-<Date.now base36>-<n>) → <tiền tố>-<id>;
      // thao tác / kết quả lấy bản gốc trong steps.json, biến "${code}" ghi thành "‹mã vừa tạo›" (không chép mã mời ngẫu nhiên của lần chạy này).
      const route = (await inPage(() => location.pathname)).replace(/\b([a-z]+)-[0-9a-z]{8}-[0-9a-z]+\b/g, '$1-<id>');
      const img = `[sáng](${spec.flow}/${sid(s.shot)}.light.png) · [tối](${spec.flow}/${sid(s.shot)}.dark.png)`;
      const text = (t) => t.replace(/\$\{\w+\}/g, '‹mã vừa tạo›'); // ponytail: mọi biến hiện là mã mời; thêm nhãn riêng khi có loại biến khác
      rows.push({ shot: s.shot, row: `| ${s.shot.slice(0, 2)} | ${account} | \`${route}\` | ${text(raw.do)} | ${text(raw.see)} | ${img} |` });
    } else throw new Error('bước không có khoá hợp lệ');
    console.log(`✓ ${i + 1} ${JSON.stringify(raw)}`);
  } catch (err) {
    const failShot = join(tmpdir(), `${spec.flow}-FAIL.png`);
    const { data } = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(failShot, Buffer.from(data, 'base64'));
    console.log(`✗ ${i + 1} ${JSON.stringify(raw)} — ${err.message}\n  ảnh lúc lỗi: ${failShot}`);
    quit(1);
  }
}
if (crashes.length) {
  console.log(`✗ lỗi runtime trong trang:\n${crashes.join('\n')}`);
  quit(1);
}
// Storyboard: mỗi bước shot ↔ story fxx--b-<shot> + 2 ảnh; story còn lại của luồng = biến thể (trạng thái khó tới), liệt kê riêng.
let extra = [];
if (spec.storyboard !== false) {
  let entries;
  try {
    entries = Object.values((await (await fetch(`${SB}/index.json`)).json()).entries).filter((e) => e.type === 'story' && e.id.startsWith(`${spec.flow.toLowerCase()}--`));
  } catch {
    console.log(`✗ không đọc được ${SB}/index.json — chạy pnpm storybook:app --no-open`);
    quit(1);
  }
  const has = (id) => ['light', 'dark'].every((m) => existsSync(join(outDir, `${id}.${m}.png`)));
  const missing = rows.filter((r) => !entries.some((e) => e.id === sid(r.shot)) || !has(sid(r.shot))).map((r) => sid(r.shot));
  if (missing.length) {
    console.log(`✗ thiếu story hoặc ảnh storyboard: ${missing.join(', ')}\n  viết story (export B<nn><Slug>) rồi chạy shot-storybook.mjs ${outDir} '^${spec.flow.toLowerCase()}--' 390 844`);
    quit(1);
  }
  extra = entries.filter((e) => !rows.some((r) => sid(r.shot) === e.id));
  const noImg = extra.filter((e) => !has(e.id)).map((e) => e.id);
  if (noImg.length) {
    console.log(`✗ story chưa có ảnh: ${noImg.join(', ')} — chạy lại shot-storybook.mjs`);
    quit(1);
  }
}
const START = '<!-- steps:start -->';
const END = '<!-- steps:end -->';
const table = [
  '| # | Tài khoản | Màn (route) | Thao tác | Kết quả mong đợi | Ảnh (story) |',
  '|---|---|---|---|---|---|',
  ...rows.map((r) => r.row),
  ...(extra.length
    ? ['', '**Trạng thái khác (story biến thể, xem ở Storybook app › `Luồng/' + spec.flow + '`):**', '', '| Story | Ảnh |', '|---|---|', ...extra.map((e) => `| ${e.name} | [sáng](${spec.flow}/${e.id}.light.png) · [tối](${spec.flow}/${e.id}.dark.png) |`)]
    : []),
].join('\n');
const md = existsSync(mdPath) ? readFileSync(mdPath, 'utf8') : `# ${spec.flow} — ${spec.title}\n`;
writeFileSync(mdPath, md.includes(START) ? md.replace(new RegExp(`${START}[\\s\\S]*?${END}`), `${START}\n${table}\n${END}`) : `${md}\n${START}\n${table}\n${END}\n`);
console.log(`PASS ${spec.flow}: ${spec.steps.length} bước, ${rows.length} bước chụp, ${extra.length} story biến thể → ${mdPath}`);
quit(0);
