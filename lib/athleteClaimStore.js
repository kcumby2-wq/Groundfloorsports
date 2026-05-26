import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const claimsFilePath = path.join(process.cwd(), 'data', 'athlete_claims.json');

async function ensureClaimsFile() {
  await mkdir(path.dirname(claimsFilePath), { recursive: true });
  try {
    await readFile(claimsFilePath, 'utf8');
  } catch {
    await writeFile(claimsFilePath, '[]\n', 'utf8');
  }
}

export async function readAthleteClaims() {
  await ensureClaimsFile();
  const raw = await readFile(claimsFilePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function upsertAthleteClaim(claim) {
  const claims = await readAthleteClaims();
  const next = [claim, ...claims.filter((item) => item.userId !== claim.userId)];
  await writeFile(claimsFilePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return claim;
}

export async function getAthleteClaimForUser(userId) {
  const claims = await readAthleteClaims();
  return claims.find((claim) => claim.userId === userId) || null;
}
