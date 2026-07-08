// =============================================================
// Nova Wood — Database Seeder
// Seeds initial data: admin user, settings, categories
// =============================================================
import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.info('🌱 Seeding Nova Wood database...');

  // ---- 1. Admin User ----
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@novawoodeg.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe@12345';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
      profile: {
        create: {
          firstName: 'Nova',
          lastName: 'Admin',
          preferredLocale: 'ar',
        },
      },
    },
  });
  console.info(`✅ Admin user: ${admin.email}`);

  // ---- 2. Site Settings ----
  const settings = [
    // General
    { key: 'site.name', value: 'Nova Wood', type: 'STRING', group: 'general', label: 'Site Name', isPublic: true },
    { key: 'site.tagline', value: 'Premium Furniture & Handcrafted Wood', type: 'STRING', group: 'general', label: 'Tagline', isPublic: true },
    { key: 'site.logo', value: '', type: 'IMAGE', group: 'general', label: 'Logo', isPublic: true },
    { key: 'site.favicon', value: '', type: 'IMAGE', group: 'general', label: 'Favicon', isPublic: true },
    { key: 'site.defaultLocale', value: 'ar', type: 'STRING', group: 'general', label: 'Default Language', isPublic: true },
    { key: 'site.currency', value: 'EGP', type: 'STRING', group: 'general', label: 'Currency', isPublic: true },
    { key: 'site.phone', value: '+20 100 000 0000', type: 'STRING', group: 'contact', label: 'Phone Number', isPublic: true },
    { key: 'site.email', value: 'info@novawoodeg.com', type: 'STRING', group: 'contact', label: 'Email Address', isPublic: true },
    { key: 'site.address', value: 'Cairo, Egypt', type: 'STRING', group: 'contact', label: 'Address', isPublic: true },
    // Theme Colors (all configurable from admin)
    { key: 'theme.primaryColor', value: '#8B4513', type: 'COLOR', group: 'theme', label: 'Primary Color', isPublic: true },
    { key: 'theme.secondaryColor', value: '#D2691E', type: 'COLOR', group: 'theme', label: 'Secondary Color', isPublic: true },
    { key: 'theme.accentColor', value: '#F5DEB3', type: 'COLOR', group: 'theme', label: 'Accent Color', isPublic: true },
    { key: 'theme.textColor', value: '#1A1A1A', type: 'COLOR', group: 'theme', label: 'Text Color', isPublic: true },
    { key: 'theme.bgColor', value: '#FAFAF8', type: 'COLOR', group: 'theme', label: 'Background Color', isPublic: true },
    // SEO
    { key: 'seo.defaultTitle', value: 'Nova Wood - Premium Office Furniture & Handcrafted Wood', type: 'STRING', group: 'seo', label: 'Default Page Title', isPublic: true },
    { key: 'seo.titleTemplate', value: '%s | Nova Wood', type: 'STRING', group: 'seo', label: 'Title Template', isPublic: true },
    { key: 'seo.defaultDescription', value: 'Discover Nova Wood\'s premium handcrafted furniture collection. High quality office furniture, living room sets, and custom wood products.', type: 'STRING', group: 'seo', label: 'Default Meta Description', isPublic: true },
    { key: 'seo.googleAnalyticsId', value: '', type: 'STRING', group: 'seo', label: 'Google Analytics ID', isPublic: false },
    // Social Media
    { key: 'social.facebook', value: 'https://facebook.com/novawoodeg', type: 'STRING', group: 'social', label: 'Facebook URL', isPublic: true },
    { key: 'social.instagram', value: 'https://instagram.com/novawoodeg', type: 'STRING', group: 'social', label: 'Instagram URL', isPublic: true },
    { key: 'social.tiktok', value: '', type: 'STRING', group: 'social', label: 'TikTok URL', isPublic: true },
    { key: 'social.whatsapp', value: '+20 100 000 0000', type: 'STRING', group: 'social', label: 'WhatsApp Number', isPublic: true },
    { key: 'social.youtube', value: '', type: 'STRING', group: 'social', label: 'YouTube URL', isPublic: true },
    // Shipping
    { key: 'shipping.freeThreshold', value: '500', type: 'NUMBER', group: 'shipping', label: 'Free Shipping Threshold (EGP)', isPublic: true },
    { key: 'shipping.standardCost', value: '50', type: 'NUMBER', group: 'shipping', label: 'Standard Shipping Cost (EGP)', isPublic: true },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting as any,
    });
  }
  console.info(`✅ ${settings.length} settings seeded`);

  // ---- 3. Root Categories ----
  const categories = [
    {
      slug: 'office-furniture',
      ar: { name: 'أثاث مكتبي', description: 'أثاث مكتبي عالي الجودة للمنزل والشركات' },
      en: { name: 'Office Furniture', description: 'Premium office furniture for home and businesses' },
    },
    {
      slug: 'living-room',
      ar: { name: 'غرفة المعيشة', description: 'أثاث غرف المعيشة الفاخرة' },
      en: { name: 'Living Room', description: 'Luxurious living room furniture' },
    },
    {
      slug: 'bedroom',
      ar: { name: 'غرفة النوم', description: 'أثاث غرف النوم الراقية' },
      en: { name: 'Bedroom', description: 'Elegant bedroom furniture' },
    },
    {
      slug: 'dining-room',
      ar: { name: 'غرفة الطعام', description: 'أثاث غرف الطعام المميزة' },
      en: { name: 'Dining Room', description: 'Distinguished dining room furniture' },
    },
    {
      slug: 'outdoor',
      ar: { name: 'أثاث خارجي', description: 'أثاث للحدائق والمساحات الخارجية' },
      en: { name: 'Outdoor', description: 'Garden and outdoor space furniture' },
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        slug: cat.slug,
        isActive: true,
        isFeatured: true,
        translations: {
          create: [
            {
              locale: 'ar',
              name: cat.ar.name,
              description: cat.ar.description,
              metaTitle: cat.ar.name + ' | نوفا وود',
            },
            {
              locale: 'en',
              name: cat.en.name,
              description: cat.en.description,
              metaTitle: cat.en.name + ' | Nova Wood',
            },
          ],
        },
      },
    });
  }
  console.info(`✅ ${categories.length} categories seeded`);

  // ---- 4. Default Shipping Zone ----
  await prisma.shippingZone.upsert({
    where: { id: 'default-egypt' },
    update: {},
    create: {
      id: 'default-egypt',
      name: 'Egypt - Standard',
      countries: JSON.stringify(['EG']),
      isActive: true,
      rates: {
        create: [
          {
            name: 'Standard Delivery',
            price: 50,
            freeShippingThreshold: 500,
            estimatedDays: '3-5 business days',
            isActive: true,
          },
          {
            name: 'Express Delivery',
            price: 120,
            estimatedDays: '1-2 business days',
            isActive: true,
          },
        ],
      },
    },
  });
  console.info('✅ Default shipping zone seeded');

  console.info('\n🎉 Database seeding complete!');
  console.info(`📧 Admin login: ${adminEmail}`);
  console.info('🔑 Admin password: [as configured in .env]');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
