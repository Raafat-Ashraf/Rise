/**
 * Seeds the Sanity dataset with the demo portfolio.
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in
 * .env.local. Idempotent: documents use deterministic IDs and `createOrReplace`,
 * and uploaded images are looked up by hash first, so re-running costs nothing
 * and never duplicates.
 */

import { createClient } from '@sanity/client';
import { createReadStream } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

import { demoAgents, demoProperties } from '../lib/demo-data';
import type { Agent, Property } from '../lib/types';

// ── Env ────────────────────────────────────────────────────────────────────

function loadEnv() {
  // Minimal .env.local reader — avoids adding dotenv just for one script.
  const file = path.join(process.cwd(), '.env.local');
  return readFile(file, 'utf8')
    .then((contents) => {
      contents.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (!match) return;
        const key = match[1];
        let value = (match[2] ?? '').trim();
        if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
        if (!(key in process.env)) process.env[key] = value;
      });
    })
    .catch(() => {
      // No .env.local — fall back to whatever is already in the environment.
    });
}

// ── Helpers ────────────────────────────────────────────────────────────────

const IMAGE_ROOT = path.join(process.cwd(), 'public');

/** Stable, human-readable document IDs so re-seeding replaces in place. */
const agentId = (agent: Agent) =>
  `agent-${agent.email?.split('@')[0] ?? agent.name.en.toLowerCase().replace(/\s+/g, '-')}`;
const propertyId = (property: Property) => `property-${property.slug}`;

async function main() {
  await loadEnv();

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production';
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() || '2024-10-01';

  if (!projectId || !token) {
    console.error(
      [
        '',
        '  Missing Sanity credentials.',
        '',
        '  1. Copy .env.example to .env.local',
        '  2. Set NEXT_PUBLIC_SANITY_PROJECT_ID (sanity.io/manage → your project)',
        '  3. Set SANITY_API_WRITE_TOKEN (sanity.io/manage → API → Tokens → Editor)',
        '',
      ].join('\n'),
    );
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(`\n  Seeding "${dataset}" in project ${projectId}…\n`);

  // Upload each distinct image once, even though several properties share files.
  const assetCache = new Map<string, string>();

  async function uploadImage(publicPath: string): Promise<string> {
    const cached = assetCache.get(publicPath);
    if (cached) return cached;

    const filePath = path.join(IMAGE_ROOT, publicPath.replace(/^\//, ''));
    const buffer = await readFile(filePath);
    // Sanity dedupes by content hash; check before spending an upload.
    const sha1 = createHash('sha1').update(buffer).digest('hex');

    const existing = await client.fetch<{ _id: string } | null>(
      '*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]{_id}',
      { sha1 },
    );

    if (existing?._id) {
      assetCache.set(publicPath, existing._id);
      console.log(`    ↺ reused  ${publicPath}`);
      return existing._id;
    }

    const asset = await client.assets.upload('image', createReadStream(filePath), {
      filename: path.basename(filePath),
    });
    assetCache.set(publicPath, asset._id);
    console.log(`    ↑ uploaded ${publicPath}`);
    return asset._id;
  }

  // ── Advisors ─────────────────────────────────────────────
  console.log('  Advisors');
  const agentIds = new Map<string, string>();
  for (const agent of demoAgents) {
    const _id = agentId(agent);
    await client.createOrReplace({
      _id,
      _type: 'agent',
      name: agent.name,
      role: agent.role,
      phone: agent.phone,
      whatsapp: agent.whatsapp,
      email: agent.email,
    });
    agentIds.set(agent.email ?? agent.name.en, _id);
    console.log(`    ✓ ${agent.name.en}`);
  }

  // ── Properties ───────────────────────────────────────────
  console.log('\n  Properties');
  for (const property of demoProperties) {
    const gallery = [];
    for (const [index, image] of property.gallery.entries()) {
      const assetId = await uploadImage(image.url);
      gallery.push({
        _type: 'galleryImage',
        _key: `${property.slug}-img-${index}`,
        asset: { _type: 'reference', _ref: assetId },
        alt: image.alt,
      });
    }

    const linkedAgentId = property.agent
      ? agentIds.get(property.agent.email ?? property.agent.name.en)
      : undefined;

    await client.createOrReplace({
      _id: propertyId(property),
      _type: 'property',
      title: property.title,
      slug: { _type: 'slug', current: property.slug },
      description: property.description,
      type: property.type,
      status: property.status,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
      location: property.location,
      gallery,
      features: property.features.map((feature, index) => ({
        ...feature,
        _type: 'feature',
        _key: `${property.slug}-feat-${index}`,
      })),
      featured: property.featured,
      reference: property.reference,
      publishedAt: property.publishedAt,
      ...(linkedAgentId
        ? { agent: { _type: 'reference', _ref: linkedAgentId } }
        : {}),
    });

    console.log(`    ✓ ${property.title.en}`);
  }

  console.log(
    `\n  Done — ${demoAgents.length} advisors, ${demoProperties.length} properties.`,
  );
  console.log('  Open http://localhost:3000/studio to edit them.\n');
}

main().catch((error) => {
  console.error('\n  Seed failed:\n', error);
  process.exit(1);
});
