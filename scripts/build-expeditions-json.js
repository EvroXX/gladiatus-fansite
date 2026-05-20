// One-off conversion script: docs/expeditions/**/*.md + embedded PHP data
// -> static/data/expeditions.json
//
// Run with: npm run build:expeditions

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPEDITIONS_DIR = path.join(REPO_ROOT, 'docs', 'expeditions');
const OUTPUT_PATH = path.join(REPO_ROOT, 'static', 'data', 'expeditions.json');
const CDN_PREFIX = 'https://gladiatusfansite.blob.core.windows.net/images/';

// ===== Per-country metadata =====
const COUNTRY_META = {
  italy: {
    name: 'Italy',
    minLevel: 1,
    cost: 1250,
    levelRange: { min: 1, max: 75 },
    tagline: 'Home is where the heart is.',
    overviewImage: 'Expeditions/Italy/Italy_Overview.png',
    folder: 'italy-expeditions',
    expectedExpeditionCount: 7,
  },
  africa: {
    name: 'Africa',
    minLevel: 20,
    cost: 1250,
    levelRange: { min: 20, max: 95 },
    tagline: 'Be one of the first gladiators and proclaim the glory of Rome.',
    overviewImage: 'Expeditions/Africa/Africa_Overview.png',
    folder: 'africa-expeditions',
    expectedExpeditionCount: 8,
  },
  germania: {
    name: 'Germania',
    minLevel: 40,
    cost: 3000,
    levelRange: { min: 40, max: 120 },
    tagline: 'Prove yourself against the mighty Germanic tribes.',
    overviewImage: 'Expeditions/Germania/Germania_Overview.png',
    folder: 'germania-expeditions',
    expectedExpeditionCount: 9,
  },
  britannia: {
    name: 'Britannia',
    minLevel: 120,
    cost: 5500,
    levelRange: { min: 120, max: 200 },
    tagline: 'Subdue the British barbarians and prepare the land for the arrival of the Roman Empire.',
    overviewImage: 'Expeditions/Britannia/Britannia_Overview.png',
    folder: 'britannia-expeditions',
    expectedExpeditionCount: 9,
  },
};

const EXPEDITION_ORDER = {
  italy: [
    'grimwood', 'pirate-harbour', 'misty-mountains', 'wolf-cave',
    'ancient-temple', 'barbarian-village', 'bandit-camp',
  ],
  africa: [
    'voodoo-temple', 'bridge', 'blood-cave', 'lost-harbour',
    'umpokta-tribe', 'caravan', 'mesoai-oasis', 'cliff-jumper',
  ],
  germania: [
    'cave-temple', 'the-green-forest', 'cursed-village', 'death-hill',
    'vandal-village', 'mine', 'teuton-camp', 'koman-mountain', 'dragon-remains',
  ],
  britannia: [
    'bank-of-the-thames', 'forest-fortress', 'the-moor', 'camp-cassivellaunus',
    'kent', 'the-ford', 'camulodunum', 'cambria', 'mona-isle',
  ],
};

// ===== PHP data =====
// Transcribed from get_expeditionData.php ($expedition_npc_stats).
// Each inner array is one enemy:
//   [level, life, strength, skill(dex), agility, constitution, charisma,
//    intelligence, armor, damageMin, damageMax, critRaw, blockRaw, avoidCritRaw]
const PHP_DATA = {
  italy: [
    [[2,122,2,6,8,4,6,4,45,2,2,15,0,0],[4,248,6,13,16,7,12,5,100,4,5,13,0,0],[7,469,16,19,24,12,22,9,223,6,7,13,0,0],[9,577,35,15,25,27,25,14,488,13,17,9,0,0]],
    [[9,549,18,24,34,19,18,16,289,8,10,8,0,0],[12,728,16,24,42,26,37,26,416,12,15,6,8,0],[14,929,22,42,68,22,24,28,438,15,18,12,6,0],[17,1016,30,46,71,40,53,44,808,26,32,10,8,0]],
    [[15,972,42,30,42,42,26,21,508,16,19,5,5,0],[19,1134,30,42,79,41,66,34,703,23,28,9,0,0],[21,1363,50,68,51,54,110,16,1399,25,31,18,0,0],[23,1417,41,86,104,55,120,55,1608,35,43,15,5,0]],
    [[22,1402,48,33,46,57,46,13,2282,40,49,12,0,0],[26,1792,41,91,109,46,72,46,1793,48,58,20,0,0],[25,1678,55,93,113,50,105,45,1528,50,61,20,0,0],[29,1850,92,94,121,104,142,58,2516,66,82,18,0,0]],
    [[70,4613,154,140,196,140,122,70,6204,118,145,8,7,0],[72,4396,86,270,352,172,151,129,3605,133,163,17,0,0],[74,4425,266,148,129,296,336,59,3481,182,223,12,8,0],[78,4761,390,234,436,312,382,124,5261,192,235,18,12,0]],
    [[75,5192,180,168,236,165,157,45,4040,150,184,6,9,0],[76,5081,212,171,239,197,266,106,3741,140,172,8,9,0],[81,5543,243,303,226,226,226,113,2771,237,290,15,7,0],[81,5592,291,364,453,324,425,178,5792,162,199,15,10,0]],
    [[80,5571,176,180,252,160,140,64,7372,135,166,10,5,0],[84,5570,151,168,264,184,235,184,9547,142,174,8,5,0],[83,5664,116,415,493,83,145,182,3854,242,298,13,0,0],[88,5596,211,440,616,246,492,228,5100,230,282,12,9,0]],
  ],
  africa: [
    [[30,2049,30,97,115,54,73,36,1852,50,62,15,0,0],[32,1914,70,96,156,51,56,19,3601,54,66,15,0,0],[34,2235,102,59,59,170,95,27,3563,73,89,9,0,0],[38,2619,45,171,252,68,319,167,1225,105,129,13,7,0]],
    [[36,2520,50,72,100,72,189,72,1306,38,47,8,2,0],[38,2659,106,57,79,114,133,15,3546,87,107,12,0,0],[42,2725,109,178,264,92,102,75,2113,58,71,11,9,0],[41,2810,32,225,344,57,258,172,2053,113,139,11,9,0]],
    [[40,2463,72,110,126,80,112,56,1614,67,83,13,0,0],[41,2791,139,51,43,106,114,24,5325,88,108,8,0,0],[45,2820,27,202,189,72,204,162,1460,97,119,20,0,0],[48,2861,86,192,302,124,369,259,1694,73,90,17,0,0]],
    [[45,3057,99,90,110,90,78,27,4180,90,110,11,0,0],[49,3027,196,49,51,176,68,29,5658,98,120,8,9,0],[49,3234,176,147,102,147,85,78,5369,90,111,13,0,0],[51,3333,163,178,196,183,232,112,7588,125,154,14,0,0]],
    [[86,5206,172,193,270,189,180,103,5152,158,195,7,8,0],[86,5342,120,258,421,103,421,292,2006,92,113,15,5,0],[89,5656,160,155,124,356,249,71,22874,109,134,17,8,0],[92,6185,55,322,515,165,869,423,5236,283,347,14,9,0]],
    [[91,6074,127,295,350,182,222,145,2188,154,189,10,5,0],[91,5754,236,250,382,218,286,145,5018,112,137,8,12,0],[93,6017,204,418,651,223,195,130,2779,171,210,10,15,0],[96,6538,268,408,604,307,672,307,6250,162,199,12,8,0]],
    [[95,6353,228,142,166,171,232,152,8514,175,215,9,0,0],[96,6026,172,408,537,153,268,134,4832,133,163,14,0,0],[101,6722,242,378,565,202,459,161,10084,217,267,16,0,0],[100,6228,480,225,489,400,489,240,15005,292,359,11,0,0]],
    [[100,6222,140,350,489,180,315,140,6939,184,226,7,0,0],[104,6271,228,390,473,208,364,166,9143,192,235,12,0,0],[104,6636,104,364,509,208,509,416,7148,240,294,13,0,0],[105,6454,105,577,882,210,698,482,4488,339,416,14,8,0]],
  ],
  germania: [
    [[50,3088,90,100,140,90,140,50,5593,69,85,7,13,0],[54,3685,118,148,245,97,94,75,6486,74,91,5,15,0],[55,3551,121,165,269,132,154,77,7918,76,93,7,13,0],[57,3642,171,171,299,239,279,91,9464,140,172,13,0,0]],
    [[55,3798,121,96,134,132,115,44,4797,101,124,8,7,0],[58,4011,150,116,101,150,182,81,7128,89,109,5,15,0],[60,3887,108,195,378,84,252,144,1950,138,170,13,0,0],[63,4171,264,141,286,151,110,239,5987,271,333,16,0,0]],
    [[60,4104,108,165,231,108,168,96,3657,64,79,16,0,0],[61,4101,158,167,128,97,192,97,6174,112,138,9,0,0],[67,4560,201,117,140,174,304,80,6514,185,227,15,0,0],[66,4269,158,230,415,198,369,198,7641,142,174,12,0,0]],
    [[65,4060,156,81,227,143,182,65,4288,100,122,10,8,0],[68,4454,217,204,309,81,166,40,6386,125,154,5,15,0],[70,4705,112,227,196,182,392,238,2629,107,132,15,10,0],[72,4781,115,306,504,86,504,331,6714,144,176,10,15,0]],
    [[105,6630,252,236,477,210,294,126,8429,194,238,5,10,0],[108,7455,259,270,264,259,529,259,6207,249,306,10,5,0],[107,6606,428,401,374,214,636,149,15695,214,260,12,0,0],[109,6657,436,463,534,457,648,283,16464,285,350,16,0,0]],
    [[109,6552,218,327,457,305,343,174,9453,251,309,5,15,0],[112,7066,291,476,548,201,548,179,8049,258,317,11,9,0],[111,6639,399,166,310,666,310,44,22661,222,272,8,8,0],[113,6890,497,282,514,542,632,248,19903,330,405,15,0,0]],
    [[113,7123,293,395,553,271,355,90,8647,261,320,12,0,0],[114,7644,342,342,478,342,598,205,7530,228,280,13,7,0],[114,7449,342,456,798,273,758,296,8369,263,323,13,12,0],[117,7515,351,671,1144,327,858,397,9116,396,486,15,49,0]],
    [[117,8088,280,526,737,280,327,117,12177,270,331,9,0,0],[119,8187,309,624,666,238,541,190,11076,329,404,18,0,0],[118,7566,188,590,1032,141,619,283,15060,327,401,17,0,0],[120,7678,456,480,504,432,1092,480,21676,480,589,12,0,0]],
    [[121,8300,338,363,677,314,296,48,17947,354,434,0,0,0],[123,8500,124,713,1041,124,781,297,3244,381,468,0,0,0],[124,8600,150,656,743,200,743,444,9678,481,590,0,0,0],[125,8700,378,472,661,378,1234,504,24127,582,714,0,0,0]],
  ],
  britannia: [
    [[134,10945,402,837,984,670,703,455,23346,540,557,0,0,0],[136,11028,843,408,476,680,1094,108,35026,873,899,0,0,0],[138,11545,276,1104,1207,496,1110,1021,10740,658,678,0,0,0],[140,14123,812,630,1029,812,1127,504,37908,539,555,0,0,0]],
    [[142,9443,765,1168,1338,850,1091,453,11538,523,642,13,23,0],[144,8905,1492,323,201,1349,452,258,39904,729,895,8,36,0],[146,8948,759,803,1277,788,1124,525,52649,562,689,7,23,0],[147,9946,970,918,1697,676,514,970,28406,860,1055,13,15,0]],
    [[153,9991,703,879,1392,979,1017,581,55330,683,838,7,37,0],[156,10326,1435,896,928,904,1583,624,49081,696,855,5,45,0],[156,10414,1341,663,928,904,2074,624,33098,1129,1385,15,30,0],[157,10321,471,1256,1868,345,1868,1884,46207,725,890,10,47,0]],
    [[163,10166,1101,1376,2324,1068,1700,972,27946,640,805,16,28,0],[164,11241,1377,1352,2296,1082,1409,641,38085,1097,1380,8,44,0],[166,10968,1695,1330,756,1894,2385,431,25173,1111,1397,12,44,0],[168,10838,1713,1553,1763,1713,1646,1008,28549,818,1028,15,48,0]],
    null, // Kent
    null, // The Ford
    null, // Camulodunum
    null, // Cambria
    null, // Mona Isle
  ],
};

// ===== Cell parsers =====

function parseRangeCell(raw, opts) {
  opts = opts || {};
  // Strip trailing footnote markers like "74-84*" -> "74-84"
  const cell = String(raw).trim().replace(/\*+$/, '').trim();
  if (cell === '' || cell === '?' || cell === '???') return null;
  if (opts.kind === 'itemLevelDrop' && cell === '1') return null;

  const rangeMatch = cell.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    return { min: Number(rangeMatch[1]), max: Number(rangeMatch[2]) };
  }

  const singleMatch = cell.match(/^(\d+)$/);
  if (singleMatch) {
    const n = Number(singleMatch[1]);
    return { min: n, max: n };
  }

  throw new Error(`parseRangeCell: cannot parse "${raw}" (kind=${opts.kind || 'range'})`);
}

function parseDamageCell(raw) {
  const cell = String(raw).trim();
  if (cell === '' || cell === '?' || cell === '???') return null;

  if (cell.includes('/')) {
    const parts = cell.split('/');
    if (parts.length !== 2) {
      throw new Error(`parseDamageCell: expected one slash, got "${raw}"`);
    }
    const minSide = parseRangeCell(parts[0]);
    const maxSide = parseRangeCell(parts[1]);
    if (!minSide || !maxSide) {
      throw new Error(`parseDamageCell: empty side in "${raw}"`);
    }
    return { min: minSide, max: maxSide };
  }

  const rangeMatch = cell.match(/^(\d+)\s*-\s*(\d+)$/);
  if (rangeMatch) {
    const lo = Number(rangeMatch[1]);
    const hi = Number(rangeMatch[2]);
    return { min: { min: lo, max: lo }, max: { min: hi, max: hi } };
  }

  const singleMatch = cell.match(/^(\d+)$/);
  if (singleMatch) {
    const n = Number(singleMatch[1]);
    return { min: { min: n, max: n }, max: { min: n, max: n } };
  }

  throw new Error(`parseDamageCell: cannot parse "${raw}"`);
}

function parseNameCell(raw) {
  const m = raw.match(/playername"?\s*>\s*([^<]+?)\s*</);
  if (!m) {
    throw new Error(`parseNameCell: cannot extract name from "${raw}"`);
  }
  return m[1].trim();
}

function parseImageCell(raw) {
  const m = raw.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)/);
  if (!m) {
    throw new Error(`parseImageCell: no image URL in cell`);
  }
  const url = m[1];
  if (!url.startsWith(CDN_PREFIX)) {
    throw new Error(`parseImageCell: image URL "${url}" does not start with ${CDN_PREFIX}`);
  }
  return url.slice(CDN_PREFIX.length);
}

// ===== Table parser =====

const ROW_DEFS = [
  { pattern: /\*\*Name\*\*/,             key: 'name',           parser: 'name' },
  { pattern: /\*\*Image\*\*/,            key: 'image',          parser: 'image' },
  { pattern: /\*\*Level\*\*/,            key: 'level',          parser: 'level' },
  { pattern: /\*\*Gold\*\*/,             key: 'gold',           parser: 'gold' },
  { pattern: /\*\*Experience\*\*/,       key: 'experience',     parser: 'experience' },
  { pattern: /\*\*Honour\*\*/,           key: 'honour',         parser: 'honour' },
  { pattern: /\*\*Strength\*\*/,         key: 'strength',       parser: 'stat' },
  { pattern: /\*\*Dexterity\*\*/,        key: 'dexterity',      parser: 'stat' },
  { pattern: /\*\*Agility\*\*/,          key: 'agility',        parser: 'stat' },
  { pattern: /\*\*Constitution\*\*/,     key: 'constitution',   parser: 'stat' },
  { pattern: /\*\*Charisma\*\*/,         key: 'charisma',       parser: 'stat' },
  { pattern: /\*\*Intelligence\*\*/,     key: 'intelligence',   parser: 'stat' },
  { pattern: /\*\*Armour\*\*/,           key: 'armour',         parser: 'armour' },
  { pattern: /\*\*Damage\*\*/,           key: 'damage',         parser: 'damage' },
  { pattern: /\*\*Item Level Drop\*\*/,  key: 'itemLevelDrop',  parser: 'itemLevelDrop' },
];

function splitRow(row) {
  const trimmed = row.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
  return trimmed.split('|').map((c) => c.trim());
}

function parseEnemyTable(markdown) {
  const start = markdown.indexOf('## Enemies');
  if (start < 0) throw new Error('parseEnemyTable: no `## Enemies` heading');
  const after = markdown.slice(start);
  const endIdx = after.search(/\n##\s/);
  const section = endIdx > 0 ? after.slice(0, endIdx) : after;

  const lines = section.split(/\r?\n/).filter((l) => l.trim().startsWith('|'));
  if (lines.length < 3) throw new Error('parseEnemyTable: table too short');
  const dataRows = lines.slice(2);

  const enemies = Array.from({ length: 4 }, (_, i) => ({ isBoss: i === 3 }));

  for (const row of dataRows) {
    const cells = splitRow(row);
    if (cells.length !== 5) {
      throw new Error(`parseEnemyTable: row has ${cells.length} cells (expected 5): ${row.slice(0, 80)}...`);
    }
    const labelCell = cells[0];
    const enemyCells = cells.slice(1);

    const def = ROW_DEFS.find((d) => d.pattern.test(labelCell));
    if (!def) {
      console.warn(`parseEnemyTable: unknown row label "${labelCell.slice(0, 60)}" - skipping`);
      continue;
    }

    for (let i = 0; i < 4; i++) {
      const raw = enemyCells[i];
      let value;
      switch (def.parser) {
        case 'name':           value = parseNameCell(raw); break;
        case 'image':          value = parseImageCell(raw); break;
        case 'damage':         value = parseDamageCell(raw); break;
        case 'itemLevelDrop':  value = parseRangeCell(raw, { kind: 'itemLevelDrop' }); break;
        default:               value = parseRangeCell(raw, { kind: def.parser }); break;
      }
      enemies[i][def.key] = value;
    }
  }
  return enemies;
}

// ===== Body-meta + frontmatter =====

function stripWrappingQuotes(s) {
  if (s.length >= 2 && ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseFrontmatter(markdown) {
  const m = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error('parseFrontmatter: no frontmatter block');
  const block = m[1];
  const titleMatch = block.match(/^title:\s*(.+)$/m);
  const slugMatch = block.match(/^slug:\s*(.+)$/m);
  const imageMatch = block.match(/^image:\s*(.+)$/m);
  const title = titleMatch ? stripWrappingQuotes(titleMatch[1].trim()) : null;
  const slug = slugMatch ? stripWrappingQuotes(slugMatch[1].trim()) : null;
  const image = imageMatch ? stripWrappingQuotes(imageMatch[1].trim()) : null;
  if (!title || !slug) {
    throw new Error('parseFrontmatter: missing title or slug');
  }
  return { title, slug, image };
}

function parseDescription(markdown) {
  const lines = markdown.split(/\r?\n/);
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '## Description') {
      startIdx = i + 1;
      break;
    }
  }
  if (startIdx < 0) return null;

  const parts = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    if (/^\*\*Entry level:\*\*/.test(line.trim())) break;
    if (/^##\s/.test(line)) break;
    parts.push(line);
  }
  const text = parts.join('\n').trim();
  return text || null;
}

function parseAdditionalInfo(markdown) {
  const lines = markdown.split(/\r?\n/);
  let startIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('**Additional Info:**')) {
      startIdx = i;
      break;
    }
  }
  if (startIdx < 0) return null;

  const firstLine = lines[startIdx].replace(/.*\*\*Additional Info:\*\*\s*/, '');
  const parts = [firstLine.trim()];

  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*$/.test(line)) break;
    if (/^-{3,}/.test(line)) break;
    if (/^##\s/.test(line)) break;
    if (/^\*\*\w/.test(line)) break;
    parts.push(line.trim());
  }

  const text = parts.join(' ').trim();
  return text || null;
}

function parseBodyMeta(markdown) {
  const entryLevelMatch = markdown.match(/\*\*Entry level:\*\*\s*(\d+)/);
  const entryLevel = entryLevelMatch ? Number(entryLevelMatch[1]) : 0;

  const enemyLevelsMatch = markdown.match(/\*\*Enemy levels:\*\*\s*(\d+)\s*-\s*(\d+)/);
  const enemyLevels = enemyLevelsMatch
    ? { min: Number(enemyLevelsMatch[1]), max: Number(enemyLevelsMatch[2]) }
    : null;

  const realLevelMatch = markdown.match(/\*\*Real level to engage:\*\*\s*(\d+)/);
  const realLevelToEngage = realLevelMatch ? Number(realLevelMatch[1]) : entryLevel;

  function parseDungeonLine(label) {
    const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`);
    const m = markdown.match(re);
    if (!m) return { name: null, slug: null };
    const rest = m[1];
    if (/^\s*No\b/i.test(rest)) return { name: null, slug: null };
    const link = rest.match(/\[([^\]]+)\]\(\/([^)\s]+)/);
    if (link) {
      return { name: link[1].trim(), slug: link[2].trim() };
    }
    const bare = rest.replace(/^\s*Yes,?\s*/i, '').trim();
    return { name: bare || null, slug: null };
  }

  const dungeon = parseDungeonLine('Dungeon');
  const advanced = parseDungeonLine('Advanced Dungeon');

  return {
    entryLevel,
    enemyLevels,
    realLevelToEngage,
    dungeon: dungeon.name,
    dungeonSlug: dungeon.slug,
    advancedDungeon: advanced.name,
    advancedDungeonSlug: advanced.slug,
  };
}

function parseExpeditionFile(country, slug) {
  const meta = COUNTRY_META[country];
  const dir = path.join(EXPEDITIONS_DIR, meta.folder);
  let filepath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) {
    filepath = path.join(dir, `${slug}.md`);
  }
  const md = fs.readFileSync(filepath, 'utf8');

  // If the file has been migrated to use <Expedition/> and no longer carries
  // the raw enemies table, the script can't (re)derive the data from markdown.
  // Caller will fall back to the previous JSON entry.
  if (!md.includes('## Enemies')) {
    return null;
  }

  const fm = parseFrontmatter(md);
  const body = parseBodyMeta(md);
  const description = parseDescription(md);
  const additionalInfo = parseAdditionalInfo(md);
  const enemies = parseEnemyTable(md);

  let heroImage = fm.image || '';
  if (heroImage.startsWith(CDN_PREFIX)) heroImage = heroImage.slice(CDN_PREFIX.length);

  let enemyLevels = body.enemyLevels;
  if (!enemyLevels) {
    const lo = enemies[0].level ? enemies[0].level.min : 0;
    const hi = enemies[3].level ? enemies[3].level.max : 0;
    enemyLevels = { min: lo, max: hi };
  }

  return {
    name: fm.title,
    slug: fm.slug.replace(/^\//, '').replace(/^expeditions\//, ''),
    description,
    additionalInfo,
    entryLevel: body.entryLevel,
    enemyLevels,
    realLevelToEngage: body.realLevelToEngage,
    dungeon: body.dungeon,
    dungeonSlug: body.dungeonSlug,
    advancedDungeon: body.advancedDungeon,
    advancedDungeonSlug: body.advancedDungeonSlug,
    heroImage,
    enemies,
  };
}

// ===== PHP merge =====

function attachPhpFields(country, expeditionIndex, enemies) {
  const countryPhp = PHP_DATA[country];
  const expeditionPhp = countryPhp ? countryPhp[expeditionIndex] : null;
  for (let i = 0; i < 4; i++) {
    const row = expeditionPhp ? expeditionPhp[i] : null;
    if (!row) {
      enemies[i].life = null;
      enemies[i].critRaw = null;
      enemies[i].blockRaw = null;
      enemies[i].avoidCritRaw = null;
    } else {
      enemies[i].life = row[1];
      enemies[i].critRaw = row[11];
      enemies[i].blockRaw = row[12];
      enemies[i].avoidCritRaw = row[13];
    }
  }
}

// ===== Validation =====

function validate(data) {
  const errors = [];
  for (const country of Object.keys(COUNTRY_META)) {
    const expected = COUNTRY_META[country].expectedExpeditionCount;
    const actual = data[country].expeditions.length;
    if (actual !== expected) {
      errors.push(`${country}: expected ${expected} expeditions, got ${actual}`);
    }
    for (const exp of data[country].expeditions) {
      if (exp.enemies.length !== 4) {
        errors.push(`${country}/${exp.name}: expected 4 enemies, got ${exp.enemies.length}`);
      }
      if (!exp.enemies[3].isBoss) {
        errors.push(`${country}/${exp.name}: 4th enemy is not flagged as boss`);
      }
      for (let i = 0; i < exp.enemies.length; i++) {
        const e = exp.enemies[i];
        const required = ['name', 'image', 'level', 'gold', 'experience',
          'honour', 'strength', 'dexterity', 'agility', 'constitution',
          'charisma', 'intelligence', 'armour', 'damage'];
        for (const field of required) {
          if (e[field] === undefined || e[field] === null) {
            errors.push(`${country}/${exp.name}/enemy[${i}] (${e.name || '?'}): missing required field "${field}"`);
          }
        }
      }
    }
  }
  if (errors.length > 0) {
    console.error('Validation failed:');
    for (const err of errors) console.error('  - ' + err);
    process.exit(1);
  }
}

// ===== Main =====
function main() {
  console.log('build-expeditions-json: starting');

  // Preserve entries for expeditions whose markdown has been migrated to the
  // <Expedition/> component (no `## Enemies` table to re-parse from).
  let previousData = null;
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      previousData = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    } catch {
      previousData = null;
    }
  }

  function findPrevious(country, slug) {
    if (!previousData || !previousData[country]) return null;
    const newForm = `${COUNTRY_META[country].folder}/${slug}`;
    // Tolerate historic buggy slug forms with leading slash, expeditions/ prefix,
    // and/or wrapping quotes (Africa originally shipped with quoted slugs).
    const candidates = previousData[country].expeditions.filter((e) => {
      const normalised = stripWrappingQuotes(String(e.slug))
        .replace(/^\//, '')
        .replace(/^expeditions\//, '');
      return normalised === newForm;
    });
    if (candidates.length === 0) return null;
    // Carry the previous JSON entry forward, but re-read the canonical name
    // from the current MDX frontmatter so renames and old quoting bugs in the
    // stored JSON get cleaned up automatically. Falls back to the previous
    // name if the MDX can't be read.
    let refreshedName = candidates[0].name;
    const mdxPath = path.join(EXPEDITIONS_DIR, COUNTRY_META[country].folder, `${slug}.mdx`);
    try {
      const md = fs.readFileSync(mdxPath, 'utf8');
      const fm = parseFrontmatter(md);
      if (fm.title) refreshedName = fm.title;
    } catch {
      // keep previous name
    }
    return { ...candidates[0], name: refreshedName, slug: newForm };
  }

  const data = {};
  for (const country of Object.keys(COUNTRY_META)) {
    const meta = COUNTRY_META[country];
    const expeditions = [];
    const slugs = EXPEDITION_ORDER[country];
    for (let i = 0; i < slugs.length; i++) {
      const slug = slugs[i];
      console.log(`  parsing ${country}/${slug}...`);
      let exp = parseExpeditionFile(country, slug);
      if (exp === null) {
        const prev = findPrevious(country, slug);
        if (!prev) {
          throw new Error(`${country}/${slug}: markdown is component-migrated (no enemies table) and no previous JSON entry exists`);
        }
        console.log(`    -> migrated to component, preserving previous JSON entry`);
        exp = prev;
      } else {
        attachPhpFields(country, i, exp.enemies);
      }
      expeditions.push(exp);
    }
    data[country] = {
      name: meta.name,
      minLevel: meta.minLevel,
      cost: meta.cost,
      levelRange: meta.levelRange,
      tagline: meta.tagline,
      overviewImage: meta.overviewImage,
      expeditions,
    };
  }

  console.log('build-expeditions-json: validating...');
  validate(data);

  console.log('build-expeditions-json: writing output...');
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n');

  const sizeKb = (fs.statSync(OUTPUT_PATH).size / 1024).toFixed(1);
  console.log(`build-expeditions-json: wrote ${OUTPUT_PATH} (${sizeKb} KB)`);
}

main();
