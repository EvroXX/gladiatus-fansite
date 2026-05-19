// One-shot migration: rewrite docs/expeditions/<country>-expeditions/<slug>.md
// to <slug>.mdx that imports <Expedition slug="..."/>.
//
// Run with: node scripts/migrate-expeditions-to-mdx.js

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPEDITIONS_DIR = path.join(REPO_ROOT, 'docs', 'expeditions');

const COUNTRY_FOLDERS = [
  'italy-expeditions',
  'africa-expeditions',
  'germania-expeditions',
  'britannia-expeditions',
];

const IMPORT_LINE = "import Expedition from '@site/src/components/Expedition';";

let migrated = 0;
let skippedAlreadyMdx = 0;
let skippedCountryIndex = 0;
let skippedNoDescription = 0;

function transform(country, mdPath) {
  const filename = path.basename(mdPath, '.md');

  // Skip country index files (e.g. italy-expeditions.md).
  if (filename === country) {
    console.log(`skipped (country index): ${country}/${filename}.md`);
    skippedCountryIndex++;
    return;
  }

  // Skip if a sibling .mdx already exists.
  const mdxPath = path.join(path.dirname(mdPath), `${filename}.mdx`);
  if (fs.existsSync(mdxPath)) {
    console.log(`skipped (already .mdx exists): ${country}/${filename}.md`);
    skippedAlreadyMdx++;
    return;
  }

  const content = fs.readFileSync(mdPath, 'utf8');

  if (!content.startsWith('---\n') && !content.startsWith('---\r\n')) {
    throw new Error(`${mdPath}: file does not begin with frontmatter`);
  }

  const lines = content.split(/\r?\n/);
  let descIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '## Description') {
      descIdx = i;
      break;
    }
  }
  if (descIdx < 0) {
    console.log(`skipped (no ## Description): ${country}/${filename}.md`);
    skippedNoDescription++;
    return;
  }

  let frontmatterEnd = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      frontmatterEnd = i;
      break;
    }
  }
  if (frontmatterEnd < 0) {
    throw new Error(`${mdPath}: frontmatter is not closed`);
  }

  const frontmatter = lines.slice(0, frontmatterEnd + 1);
  const leadBlock = lines.slice(frontmatterEnd + 1, descIdx);

  while (leadBlock.length > 0 && leadBlock[0].trim() === '') leadBlock.shift();
  while (leadBlock.length > 0 && leadBlock[leadBlock.length - 1].trim() === '') leadBlock.pop();

  const slug = `${country}/${filename}`;
  const componentTag = `<Expedition slug="${slug}" />`;

  const parts = [
    frontmatter.join('\n'),
    '',
    IMPORT_LINE,
    '',
    ...(leadBlock.length > 0 ? [leadBlock.join('\n'), ''] : []),
    componentTag,
    '',
  ];
  const output = parts.join('\n');

  fs.writeFileSync(mdxPath, output, 'utf8');
  fs.unlinkSync(mdPath);
  console.log(`migrated: ${country}/${filename}.md -> ${filename}.mdx`);
  migrated++;
}

function main() {
  for (const country of COUNTRY_FOLDERS) {
    const dir = path.join(EXPEDITIONS_DIR, country);
    if (!fs.existsSync(dir)) {
      throw new Error(`Country folder not found: ${dir}`);
    }
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      if (!entry.endsWith('.md')) continue;
      transform(country, path.join(dir, entry));
    }
  }
  console.log('---');
  console.log(`Migrated ${migrated} files`);
  console.log(`Skipped ${skippedAlreadyMdx} (already migrated)`);
  console.log(`Skipped ${skippedCountryIndex} (country index)`);
  console.log(`Skipped ${skippedNoDescription} (no ## Description)`);
}

main();
