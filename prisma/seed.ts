import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ──────────────────────────────────────────
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@quickbite.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@quickbite.com',
      phone: '555-000-0000',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('  ✅ Admin user created:', admin.email);

  // ─── Sample Customer ─────────────────────────────────────
  const customerPassword = await hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-111-1111',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
    },
  });
  console.log('  ✅ Customer user created:', customer.email);

  // ─── Sample Driver ───────────────────────────────────────
  const driverPassword = await hash('driver123', 12);
  const driver = await prisma.user.upsert({
    where: { email: 'driver@quickbite.com' },
    update: {},
    create: {
      name: 'Mike Driver',
      email: 'driver@quickbite.com',
      phone: '555-222-2222',
      passwordHash: driverPassword,
      role: 'DRIVER',
    },
  });
  console.log('  ✅ Driver user created:', driver.email);

  // ─── Customer Address ────────────────────────────────────
  await prisma.address.upsert({
    where: { id: 'addr-default' },
    update: {},
    create: {
      id: 'addr-default',
      userId: customer.id,
      label: 'Home',
      street: '456 Oak Avenue',
      city: 'Downtown',
      postalCode: '10002',
      lat: 40.7128,
      lng: -74.006,
      isDefault: true,
    },
  });

  // ─── Categories ──────────────────────────────────────────
  const categories = [
    { name: 'Burgers', slug: 'burgers', sortOrder: 1 },
    { name: 'Chicken', slug: 'chicken', sortOrder: 2 },
    { name: 'Sides', slug: 'sides', sortOrder: 3 },
    { name: 'Drinks', slug: 'drinks', sortOrder: 4 },
    { name: 'Desserts', slug: 'desserts', sortOrder: 5 },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }
  console.log('  ✅ Categories created:', categories.length);

  // ─── Menu Items ──────────────────────────────────────────
  const menuItems = [
    // Burgers
    {
      name: 'Classic Smash Burger',
      description: 'Juicy smashed beef patty with lettuce, tomato, pickles, and our signature sauce',
      price: 8.99,
      categoryId: createdCategories['burgers'],
      customizations: [
        {
          name: 'Size',
          type: 'RADIO',
          isRequired: true,
          options: [
            { label: 'Single', priceModifier: 0 },
            { label: 'Double', priceModifier: 3.0 },
            { label: 'Triple', priceModifier: 5.0 },
          ],
        },
        {
          name: 'Add-ons',
          type: 'CHECKBOX',
          isRequired: false,
          options: [
            { label: 'Extra Cheese', priceModifier: 1.0 },
            { label: 'Bacon', priceModifier: 1.5 },
            { label: 'Jalapeños', priceModifier: 0.5 },
            { label: 'Fried Egg', priceModifier: 1.5 },
          ],
        },
      ],
    },
    {
      name: 'BBQ Bacon Burger',
      description: 'Smoky BBQ sauce, crispy bacon, cheddar cheese, and onion rings',
      price: 11.49,
      categoryId: createdCategories['burgers'],
      customizations: [
        {
          name: 'Size',
          type: 'RADIO',
          isRequired: true,
          options: [
            { label: 'Single', priceModifier: 0 },
            { label: 'Double', priceModifier: 3.0 },
          ],
        },
      ],
    },
    {
      name: 'Mushroom Swiss Burger',
      description: 'Sautéed mushrooms and melted Swiss cheese on a toasted brioche bun',
      price: 10.99,
      categoryId: createdCategories['burgers'],
      customizations: [],
    },
    {
      name: 'Spicy Jalapeño Burger',
      description: 'Pepper jack cheese, fresh jalapeños, spicy mayo, and crispy onions',
      price: 10.49,
      categoryId: createdCategories['burgers'],
      customizations: [],
    },

    // Chicken
    {
      name: 'Crispy Chicken Sandwich',
      description: 'Buttermilk fried chicken breast with pickles and spicy mayo',
      price: 9.49,
      categoryId: createdCategories['chicken'],
      customizations: [
        {
          name: 'Spice Level',
          type: 'RADIO',
          isRequired: true,
          options: [
            { label: 'Mild', priceModifier: 0 },
            { label: 'Medium', priceModifier: 0 },
            { label: 'Hot', priceModifier: 0 },
            { label: 'Extra Hot', priceModifier: 0.5 },
          ],
        },
      ],
    },
    {
      name: 'Chicken Tenders',
      description: '5 pieces of golden crispy chicken tenders with your choice of dipping sauce',
      price: 7.99,
      categoryId: createdCategories['chicken'],
      customizations: [
        {
          name: 'Dipping Sauce',
          type: 'RADIO',
          isRequired: false,
          options: [
            { label: 'Ranch', priceModifier: 0 },
            { label: 'BBQ', priceModifier: 0 },
            { label: 'Honey Mustard', priceModifier: 0 },
            { label: 'Buffalo', priceModifier: 0 },
          ],
        },
      ],
    },
    {
      name: 'Grilled Chicken Wrap',
      description: 'Grilled chicken, mixed greens, tomato, and caesar dressing in a flour tortilla',
      price: 8.49,
      categoryId: createdCategories['chicken'],
      customizations: [],
    },

    // Sides
    {
      name: 'French Fries',
      description: 'Crispy golden fries seasoned with our house blend',
      price: 3.49,
      categoryId: createdCategories['sides'],
      customizations: [
        {
          name: 'Size',
          type: 'RADIO',
          isRequired: true,
          options: [
            { label: 'Regular', priceModifier: 0 },
            { label: 'Large', priceModifier: 1.5 },
          ],
        },
      ],
    },
    {
      name: 'Onion Rings',
      description: 'Thick-cut, beer-battered onion rings',
      price: 4.49,
      categoryId: createdCategories['sides'],
      customizations: [],
    },
    {
      name: 'Loaded Nachos',
      description: 'Tortilla chips loaded with cheese, jalapeños, sour cream, and salsa',
      price: 6.99,
      categoryId: createdCategories['sides'],
      customizations: [],
    },
    {
      name: 'Coleslaw',
      description: 'Creamy homestyle coleslaw',
      price: 2.99,
      categoryId: createdCategories['sides'],
      customizations: [],
    },

    // Drinks
    {
      name: 'Classic Milkshake',
      description: 'Thick and creamy milkshake made with real ice cream',
      price: 5.49,
      categoryId: createdCategories['drinks'],
      customizations: [
        {
          name: 'Flavor',
          type: 'RADIO',
          isRequired: true,
          options: [
            { label: 'Vanilla', priceModifier: 0 },
            { label: 'Chocolate', priceModifier: 0 },
            { label: 'Strawberry', priceModifier: 0 },
            { label: 'Oreo', priceModifier: 0.5 },
          ],
        },
      ],
    },
    {
      name: 'Fountain Soda',
      description: 'Your choice of refreshing fountain drink',
      price: 2.49,
      categoryId: createdCategories['drinks'],
      customizations: [
        {
          name: 'Size',
          type: 'RADIO',
          isRequired: true,
          options: [
            { label: 'Regular', priceModifier: 0 },
            { label: 'Large', priceModifier: 0.75 },
          ],
        },
      ],
    },
    {
      name: 'Fresh Lemonade',
      description: 'Freshly squeezed lemonade with a hint of mint',
      price: 3.99,
      categoryId: createdCategories['drinks'],
      customizations: [],
    },

    // Desserts
    {
      name: 'Chocolate Brownie',
      description: 'Warm fudge brownie topped with vanilla ice cream and chocolate drizzle',
      price: 5.99,
      categoryId: createdCategories['desserts'],
      customizations: [],
    },
    {
      name: 'Apple Pie',
      description: 'Classic apple pie with a flaky golden crust, served warm',
      price: 4.49,
      categoryId: createdCategories['desserts'],
      customizations: [],
    },
    {
      name: 'Churros',
      description: '5 cinnamon sugar churros with chocolate dipping sauce',
      price: 4.99,
      categoryId: createdCategories['desserts'],
      customizations: [],
    },
  ];

  for (const item of menuItems) {
    const { customizations, ...itemData } = item;
    const createdItem = await prisma.menuItem.create({
      data: itemData,
    });

    for (let i = 0; i < customizations.length; i++) {
      const cust = customizations[i];
      await prisma.itemCustomization.create({
        data: {
          menuItemId: createdItem.id,
          name: cust.name,
          type: cust.type,
          isRequired: cust.isRequired,
          sortOrder: i,
          options: {
            create: cust.options.map((opt, j) => ({
              label: opt.label,
              priceModifier: opt.priceModifier,
              sortOrder: j,
            })),
          },
        },
      });
    }
  }
  console.log('  ✅ Menu items created:', menuItems.length);

  // ─── Sample Deal ─────────────────────────────────────────
  const burgerItem = await prisma.menuItem.findFirst({
    where: { name: 'Classic Smash Burger' },
  });
  const friesItem = await prisma.menuItem.findFirst({
    where: { name: 'French Fries' },
  });
  const drinkItem = await prisma.menuItem.findFirst({
    where: { name: 'Fountain Soda' },
  });

  if (burgerItem && friesItem && drinkItem) {
    await prisma.deal.create({
      data: {
        name: 'Classic Combo',
        description: 'Classic Smash Burger + Fries + Drink — Save $3!',
        dealPrice: 11.99,
        items: {
          create: [
            { menuItemId: burgerItem.id },
            { menuItemId: friesItem.id },
            { menuItemId: drinkItem.id },
          ],
        },
      },
    });
    console.log('  ✅ Sample deal created');
  }

  // ─── Delivery Zone ───────────────────────────────────────
  await prisma.deliveryZone.create({
    data: {
      name: 'Downtown',
      radiusKm: 10,
      baseFee: 2.99,
      perKmFee: 0.5,
    },
  });
  console.log('  ✅ Delivery zone created');

  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('   Admin:    admin@quickbite.com / admin123');
  console.log('   Customer: john@example.com / customer123');
  console.log('   Driver:   driver@quickbite.com / driver123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
