import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { menu } = require('../Menu/hibafood_menu.js');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding HibaFood database...');

  // ─── Users ───────────────────────────────────────────────
  const adminPassword = await hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@hibafood.fr' },
    update: {},
    create: {
      name: 'Admin HibaFood',
      email: 'admin@hibafood.fr',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('  ✅ Admin user ready');

  const customerPassword = await hash('customer123', 12);
  await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Client Test',
      email: 'client@example.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    },
  });
  console.log('  ✅ Test customer ready');

  // ─── Menu ─────────────────────────────────────────────────
  console.log('\n  📋 Seeding menu...');

  for (let catIndex = 0; catIndex < menu.categories.length; catIndex++) {
    const cat = menu.categories[catIndex];

    // Upsert category
    const dbCat = await prisma.category.upsert({
      where: { slug: cat.id },
      update: { name: cat.name, emoji: cat.emoji, description: cat.description ?? null, imageUrl: cat.image ?? null, sortOrder: catIndex },
      create: {
        slug: cat.id,
        name: cat.name,
        emoji: cat.emoji,
        description: cat.description ?? null,
        imageUrl: cat.image ?? null,
        sortOrder: catIndex,
        isActive: true,
      },
    });
    console.log(`    📁 ${cat.emoji} ${cat.name}`);

    // Build subcategory ID map
    const subIdMap: Record<string, string> = {};
    const subcategories = cat.subcategories ?? [];

    for (let subIndex = 0; subIndex < subcategories.length; subIndex++) {
      const sub = subcategories[subIndex];

      // Delete existing subcategory to re-create cleanly (upsert not simple without unique constraint)
      const existing = await prisma.subcategory.findFirst({
        where: { categoryId: dbCat.id, slug: sub.id },
      });

      let dbSub;
      if (existing) {
        dbSub = await prisma.subcategory.update({
          where: { id: existing.id },
          data: { name: sub.name, imageUrl: sub.image ?? null, sortOrder: subIndex },
        });
      } else {
        dbSub = await prisma.subcategory.create({
          data: {
            categoryId: dbCat.id,
            slug: sub.id,
            name: sub.name,
            imageUrl: sub.image ?? null,
            sortOrder: subIndex,
          },
        });
      }
      subIdMap[sub.id] = dbSub.id;
    }

    // Products
    const products = cat.products ?? [];
    for (let pIndex = 0; pIndex < products.length; pIndex++) {
      const product = products[pIndex];

      // Delete old data for this product slug (clean re-seed)
      const existingProduct = await prisma.product.findUnique({ where: { slug: product.id } });
      if (existingProduct) {
        // Cascade deletes variations, optionGroups, extras
        await prisma.product.delete({ where: { slug: product.id } });
      }

      const dbProduct = await prisma.product.create({
        data: {
          slug: product.id,
          categoryId: dbCat.id,
          subcategoryId: product.subcategory ? (subIdMap[product.subcategory] ?? null) : null,
          name: product.name,
          description: product.description ?? null,
          basePrice: product.basePrice,
          maxPrice: product.maxPrice ?? null,
          imageUrl: product.image ?? null,
          isAvailable: true,
          isBestSeller: product.bestSeller === true,
          note: product.note ?? null,
          sortOrder: pIndex,
        },
      });

      // Seed variations (e.g. pizza sizes: Junior / Senior / Mega)
      const variations = product.variations ?? [];
      for (let vIndex = 0; vIndex < variations.length; vIndex++) {
        const v = variations[vIndex];
        await prisma.productVariation.create({
          data: {
            productId: dbProduct.id,
            name: v.name,
            price: v.price,
            sortOrder: vIndex,
          },
        });
      }

      // Seed required option groups (e.g. tacos: Viande, Sauces)
      const requiredOptions = product.requiredOptions ?? [];
      for (let gIndex = 0; gIndex < requiredOptions.length; gIndex++) {
        const group = requiredOptions[gIndex];
        const dbGroup = await prisma.requiredOptionGroup.create({
          data: {
            productId: dbProduct.id,
            name: group.name,
            maxSelect: group.max ?? 1,
            sortOrder: gIndex,
          },
        });

        const choices = group.choices ?? [];
        for (let cIndex = 0; cIndex < choices.length; cIndex++) {
          const choice = choices[cIndex];
          await prisma.optionChoice.create({
            data: {
              groupId: dbGroup.id,
              name: choice.name,
              priceAdd: choice.priceAdd ?? 0,
              sortOrder: cIndex,
            },
          });
        }
      }

      // Seed optional extras (e.g. pizza extras: +€1.50/€0.70)
      const extras = product.extras ?? [];
      for (let eIndex = 0; eIndex < extras.length; eIndex++) {
        const extra = extras[eIndex];
        await prisma.productExtra.create({
          data: {
            productId: dbProduct.id,
            name: extra.name,
            priceAdd: extra.priceAdd ?? 0,
            sortOrder: eIndex,
          },
        });
      }
    }

    console.log(`    └─ ${products.length} products seeded`);
  }

  const totalProducts = await prisma.product.count();
  const totalCategories = await prisma.category.count();
  console.log(`\n  ✅ Done! ${totalCategories} categories, ${totalProducts} products in database.`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
