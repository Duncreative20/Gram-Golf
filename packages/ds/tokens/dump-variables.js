// use_figma — read-only. Server cắt output ở 20KB → trả tuple gọn, phân trang.
// Sửa TARGET / OFFSET / LIMIT rồi chạy. Kết quả: { pages: { "<slug>.<mode>": [[name, value], ...] }, next: offset|null }
// Alias = "slug.path.path" (không ngoặc); màu = "#rrggbb[aa]"; số/chuỗi giữ nguyên.
// Lưu từng kết quả vào tokens/compact/<slug>.<mode>.<offset>.json, rồi `node tokens/compact-to-dtcg.mjs`.
const TARGET = ['Global Dimensions', 'Spacing', 'Corner Radius'];
const OFFSET = 0, LIMIT = 400;
const SLUG = { 'Global Colors': 'global-colors', 'Global Dimensions': 'global-dimensions', 'Base Colors (Golf Relax)': 'base-colors', 'Mode Colors (Semantic)': 'semantic', 'Component Colors (Theme)': 'component', 'Component Size': 'component-size', 'Spacing': 'spacing', 'Corner Radius': 'radius', 'Emphasis Level': 'emphasis', 'Breakpoint & Grids': 'breakpoints', 'Typography Configuration': 'typography' };
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hex = c => { const h = n => Math.round(n * 255).toString(16).padStart(2, '0'); return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 1 ? h(c.a) : ''); };
const colls = await figma.variables.getLocalVariableCollectionsAsync();
const vars = await figma.variables.getLocalVariablesAsync();
const byId = new Map(vars.map(v => [v.id, v])); const collById = new Map(colls.map(c => [c.id, c]));
const rows = [];
for (const c of colls) { if (!TARGET.includes(c.name)) continue;
  for (const m of c.modes) for (const v of vars) { if (v.variableCollectionId !== c.id) continue;
    const raw = v.valuesByMode[m.modeId]; let val;
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') { const t = byId.get(raw.id); val = SLUG[collById.get(t.variableCollectionId).name] + '.' + t.name.split('/').join('.'); }
    else val = v.resolvedType === 'COLOR' ? hex(raw) : raw;
    rows.push([SLUG[c.name] + '.' + slugify(m.name), v.name, val, v.resolvedType]);
  } }
const page = rows.slice(OFFSET, OFFSET + LIMIT); const pages = {};
for (const [k, n, v, t] of page) (pages[k] = pages[k] || []).push([n, v, t]);
return { pages, total: rows.length, next: OFFSET + LIMIT < rows.length ? OFFSET + LIMIT : null };
