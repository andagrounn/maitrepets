/**
 * One-time migration: SQLite dev.db → Neon PostgreSQL
 * Run: node prisma/migrate-sqlite-to-pg.mjs
 */
import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlitePath = path.join(__dirname, 'dev.db');

const sqlite = new Database(sqlitePath, { readonly: true });
const pg     = new PrismaClient();

async function main() {
  console.log('Reading from SQLite:', sqlitePath);

  const users  = sqlite.prepare('SELECT * FROM User').all();
  const images = sqlite.prepare('SELECT * FROM Image').all();
  const orders = sqlite.prepare('SELECT * FROM "Order"').all();

  console.log(`  Users:  ${users.length}`);
  console.log(`  Images: ${images.length}`);
  console.log(`  Orders: ${orders.length}`);

  // Users
  console.log('\nMigrating users…');
  for (const u of users) {
    await pg.user.upsert({
      where: { id: u.id },
      update: {},
      create: {
        id:        u.id,
        email:     u.email,
        password:  u.password,
        name:      u.name || null,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
    });
  }
  console.log('  ✓ Users done');

  // Images
  console.log('Migrating images…');
  for (const img of images) {
    await pg.image.upsert({
      where: { id: img.id },
      update: {},
      create: {
        id:           img.id,
        userId:       img.userId,
        originalUrl:  img.originalUrl,
        generatedUrl: img.generatedUrl || null,
        style:        img.style,
        status:       img.status,
        prompt:       img.prompt || null,
        createdAt:    new Date(img.createdAt),
      },
    });
  }
  console.log('  ✓ Images done');

  // Orders
  console.log('Migrating orders…');
  for (const o of orders) {
    await pg.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id:               o.id,
        userId:           o.userId,
        imageId:          o.imageId,
        productType:      o.productType,
        size:             o.size,
        price:            o.price,
        status:           o.status,
        printfulId:       o.printfulId   || null,
        stripeId:         o.stripeId     || null,
        shippingName:     o.shippingName || null,
        shippingAddress:  o.shippingAddress  || null,
        shippingAddress2: o.shippingAddress2 || null,
        shippingCity:     o.shippingCity  || null,
        shippingState:    o.shippingState || null,
        shippingZip:      o.shippingZip   || null,
        shippingCountry:  o.shippingCountry || null,
        shippingPhone:    o.shippingPhone  || null,
        shippingMethod:   o.shippingMethod || 'STANDARD',
        trackingNumber:   o.trackingNumber || null,
        trackingUrl:      o.trackingUrl   || null,
        digitalCopy:      !!o.digitalCopy,
        extraCopy:        !!o.extraCopy,
        createdAt:        new Date(o.createdAt),
        updatedAt:        new Date(o.updatedAt),
      },
    });
  }
  console.log('  ✓ Orders done');

  console.log('\n✅ Migration complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { pg.$disconnect(); sqlite.close(); });
