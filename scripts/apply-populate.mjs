#!/usr/bin/env node
// Applies D1 seed SQL files (from the d1-data-v1 release asset, unzipped into populate/)
// in manifest order. Tracks applied files in a `seed_applied` table so daily re-runs
// (D1 free tier = ~100k row writes/day per database) continue where they left off.
// Target DB: pincode-india-db (apac location hint — closest available region to India).
// Usage: node scripts/apply-populate.mjs [max_rows_to_write_this_run]   (default 90000)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const maxRows = parseInt(process.argv[2] || '90000', 10);
const DB = process.env.D1_DB || 'pincode-india-db';
const dir = 'populate';
const manifest = JSON.parse(fs.readFileSync(`${dir}/manifest.json`, 'utf8'));
const tables = ['states', 'districts', 'sub_districts', 'pincodes', 'villages'];

function run(args) {
  return execFileSync('npx', ['wrangler', 'd1', 'execute', DB, '--remote', '--json', ...args], {
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

// 1. tracking table
run(['--command', 'CREATE TABLE IF NOT EXISTS seed_applied (file TEXT PRIMARY KEY, rows INTEGER, applied_at TEXT DEFAULT (datetime(\'now\')))']);

// 2. already-applied files
const appliedSet = new Set(
  parseJsonOut(run(['--command', 'SELECT file FROM seed_applied']))[0]?.results?.map((r) => r.file) ?? []
);

let budget = maxRows;
let applied = 0;
let stoppedAt = null;
for (const f of manifest.files) {
  if (appliedSet.has(f.file)) continue;
  if (f.rows > budget) { stoppedAt = f; break; }
  process.stdout.write(`Applying ${f.file} (${f.table}, ${f.rows} rows)... `);
  run(['--file', `${dir}/${f.file}`]);
  run(['--command', `INSERT OR IGNORE INTO seed_applied (file, rows) VALUES ('${f.file}', ${f.rows})`]);
  console.log('ok');
  applied += f.rows;
  budget -= f.rows;
}

console.log(`Wrote ${applied} rows across files this run (daily write limit guard: ${maxRows}). Target DB: ${DB}`);
if (stoppedAt) console.log(`Stopped before ${stoppedAt.file} — re-run after the UTC daily reset to continue.`);
if (applied === 0 && !stoppedAt) console.log('All seed files applied. You can remove the d1-apply schedule now.');

const counts = {};
for (const t of tables) counts[t] = count(t);
console.log('Current rows:', JSON.stringify(counts));
