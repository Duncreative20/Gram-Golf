import { CLUB_TYPES, type ClubType, type SwingMetrics, type Vendor } from './domain';
import { ydToM } from './format';
import { SWING_FIELDS, validateSwingMetrics } from './validation';

export interface CsvRow { line: number; club: string; value: SwingMetrics | null; errors: string[] }
export interface CsvResult { vendor: Vendor | null; rows: CsvRow[] }

const COLS: Record<Vendor, { sep: string; club: string; map: Record<keyof SwingMetrics, string>; carryYards: boolean }> = {
  trackman: { sep: ',', club: 'Club', carryYards: true, map: { clubSpeedMph: 'Club Speed [mph]', ballSpeedMph: 'Ball Speed [mph]', smash: 'Smash Factor', spinRpm: 'Spin Rate [rpm]', launchDeg: 'Launch Angle [deg]', carryM: 'Carry [yds]' } },
  foresight: { sep: ';', club: 'Club', carryYards: false, map: { clubSpeedMph: 'ClubSpeed (mph)', ballSpeedMph: 'BallSpeed (mph)', smash: 'Smash', spinRpm: 'BackSpin (rpm)', launchDeg: 'VLA (deg)', carryM: 'Carry (m)' } },
};

export function parseLaunchMonitorCsv(text: string): CsvResult {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0] ?? '';
  const vendor = (Object.keys(COLS) as Vendor[]).find((v) => head.split(COLS[v].sep).includes(COLS[v].map.clubSpeedMph)) ?? null;
  if (!vendor) return { vendor: null, rows: [] };
  const spec = COLS[vendor];
  const header = head.split(spec.sep);
  const rows = lines.slice(1).map((ln, i) => {
    const cells = ln.split(spec.sep);
    const get = (col: string) => cells[header.indexOf(col)] ?? '';
    const raw = Object.fromEntries(Object.entries(spec.map).map(([k, col]) => [k, get(col)])) as Record<keyof SwingMetrics, string>;
    if (spec.carryYards && raw.carryM.trim()) raw.carryM = String(Math.round(ydToM(Number(raw.carryM))));
    const r = validateSwingMetrics(raw);
    return { line: i + 2, club: get(spec.club), value: r.value, errors: SWING_FIELDS.filter((f) => r.errors[f.key]).map((f) => `${f.label}: ${r.errors[f.key]}`) };
  });
  return { vendor, rows };
}

const NUMBERED: Record<string, string> = { wood: 'Gỗ', hybrid: 'Hybrid', iron: 'Sắt' };
const WEDGES: Record<string, ClubType> = { p: 'PW', g: 'GW', s: 'SW', l: 'LW', pitching: 'PW', gap: 'GW', sand: 'SW', lob: 'LW' };
/** Tên gậy ở cột Club của máy đo ("Driver", "3 Wood", "7 Iron", "PW", "Sand Wedge") → loại gậy trong app; không có → undefined. */
export function clubTypeFromCsv(name: string): ClubType | undefined {
  const s = name.trim().toLowerCase();
  if (s === 'driver') return 'Driver';
  if (s === 'putter') return 'Putter';
  const n = s.match(/^(\d)\s*(wood|hybrid|iron)$/);
  if (n) return CLUB_TYPES.find((t) => t === `${NUMBERED[n[2]]} ${n[1]}`);
  const w = s.match(/^(p|g|s|l|pitching|gap|sand|lob)\s*w(edge)?$/);
  return w ? WEDGES[w[1]] : undefined;
}
