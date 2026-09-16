#!/usr/bin/env node
// Applies D1 seed SQL files (from the d1-data-v1 release asset, unzipped into populate/)
// in manifest order, respecting a global row budget for the D1 free-tier daily write limit.
// Usage: node scripts/apply-populate.mjs [max_rows]   (default 90000)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const maxRows = parseInt(process.argv[2] || '90000', 10);
const dir = 'populate';
const manifest = JSON.parse(fs.readFileSync(`${dir}/manifest.json`, 'utf8'));
const tables = ['states', 'districts', 'sub_districts', 'pincodes', 'villages'];

function run(args) {
  return execFileSync('npx', ['wrangler', 'd1', 'execute', 'pincode-india', '--remote', '--json', ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function parseJsonOut(out) {
  const start = out.indexOf('[');
  const end = out.lastIndexOf(']');
  if (start < 0 || end < 0) throw new Error('no JSON in wrangler output: ' + out.slice(0, 300));
  return JSON.parse(out.slice(start, end + 1));
}

function count(table) {
  const j = parseJsonOut(run(['--command', `SELECT COUNT(*) AS n FROM ${table}`]));
  return Number(j[0]?.results?.[0]?.n ?? 0);
}

const counts = {};
let total = 0;
for (const t of tables) {
  counts[t] = count(t);
  total += counts[t];
}
console.log('Current rows:', JSON.stringify(counts), 'total', total);

let budget = maxRows - total;
if (budget <= 0) {
  console.log(`Budget exhausted: DB already at ${total} rows (max ${maxRows}). Re-dispatch tomorrow with a higher max_rows after the UTC reset.`);
  process.exit(0);
}
console.log(`Budget for this run: ${budget} rows.`);

let applied = 0;
let stopped = null;
for (const f of manifest.files) {
  if (f.rows > budget) {
    stopped = f;
    break;
  }
  process.stdout.write(`Applying ${f.file} (${f.table}, ${f.rows} rows)... `);
  run(['--file', `${dir}/${f.file}`]);
  console.log('ok');
  applied += f.rows;
  budget -= f.rows;
}
console.log(`Applied ${applied} rows across files this run.`);
if (stopped) console.log(`Stopped before ${stopped.file} (${stopped.rows} rows needed, ${budget} left). Re-dispatch after UTC reset to continue.`);

for (const t of tables) counts[t] = count(t);
console.log('Final rows:', JSON.stringify(counts));
