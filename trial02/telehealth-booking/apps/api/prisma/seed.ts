import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('DemoPass1', 12);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@medconnect.demo' },
    update: {},
    create: {
      email: 'admin@medconnect.demo',
      passwordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'PLATFORM_ADMIN',
      emailVerified: true,
    },
  });

  const drSmith = await prisma.user.upsert({
    where: { email: 'dr.smith@medconnect.demo' },
    update: {},
    create: {
      email: 'dr.smith@medconnect.demo',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Smith',
      role: 'USER',
      emailVerified: true,
    },
  });

  const drJones = await prisma.user.upsert({
    where: { email: 'dr.jones@medconnect.demo' },
    update: {},
    create: {
      email: 'dr.jones@medconnect.demo',
      passwordHash,
      firstName: 'Michael',
      lastName: 'Jones',
      role: 'USER',
      emailVerified: true,
    },
  });

  const patient = await prisma.user.upsert({
    where: { email: 'patient@medconnect.demo' },
    update: {},
    create: {
      email: 'patient@medconnect.demo',
      passwordHash,
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'USER',
      emailVerified: true,
    },
  });

  // Create practice
  const practice = await prisma.practice.upsert({
    where: { slug: 'demo-clinic' },
    update: {},
    create: {
      name: 'Demo Health Clinic',
      slug: 'demo-clinic',
      category: 'PRIMARY_CARE',
      timezone: 'America/New_York',
      currency: 'USD',
      phone: '+1-555-0100',
      email: 'info@democlinic.demo',
      address: '123 Health St, Medical City, MC 12345',
      subscriptionTier: 'PRACTICE',
    },
  });

  // Create memberships
  await prisma.tenantMembership.upsert({
    where: { practiceId_userId: { practiceId: practice.id, userId: admin.id } },
    update: {},
    create: { userId: admin.id, practiceId: practice.id, role: 'OWNER' },
  });

  await prisma.tenantMembership.upsert({
    where: { practiceId_userId: { practiceId: practice.id, userId: drSmith.id } },
    update: {},
    create: { userId: drSmith.id, practiceId: practice.id, role: 'PROVIDER' },
  });

  await prisma.tenantMembership.upsert({
    where: { practiceId_userId: { practiceId: practice.id, userId: drJones.id } },
    update: {},
    create: { userId: drJones.id, practiceId: practice.id, role: 'PROVIDER' },
  });

  // Create provider profiles
  const smithProfile = await prisma.providerProfile.upsert({
    where: { practiceId_userId: { practiceId: practice.id, userId: drSmith.id } },
    update: {},
    create: {
      userId: drSmith.id,
      practiceId: practice.id,
      specialties: ['PRIMARY_CARE', 'MENTAL_HEALTH'],
      credentials: 'MD, Board Certified Family Medicine',
      bio: 'Dr. Smith has 15 years of experience in family medicine and mental health.',
      languages: ['en', 'es'],
      consultationTypes: ['VIDEO', 'IN_PERSON'],
    },
  });

  const jonesProfile = await prisma.providerProfile.upsert({
    where: { practiceId_userId: { practiceId: practice.id, userId: drJones.id } },
    update: {},
    create: {
      userId: drJones.id,
      practiceId: practice.id,
      specialties: ['DERMATOLOGY', 'PRIMARY_CARE'],
      credentials: 'MD, Board Certified Dermatology',
      bio: 'Dr. Jones specializes in teledermatology and skin health consultations.',
      languages: ['en'],
      consultationTypes: ['VIDEO', 'PHONE'],
    },
  });

  // Create services
  const generalConsult = await prisma.service.create({
    data: {
      practiceId: practice.id,
      name: 'General Consultation',
      description: 'Standard 30-minute consultation for general health concerns.',
      durationMinutes: 30,
      price: 75.0,
      confirmationMode: 'AUTO_CONFIRM',
      bufferAfter: 5,
    },
  });

  const mentalHealth = await prisma.service.create({
    data: {
      practiceId: practice.id,
      name: 'Mental Health Session',
      description: '60-minute mental health consultation and therapy session.',
      durationMinutes: 60,
      price: 150.0,
      confirmationMode: 'MANUAL_APPROVAL',
      bufferBefore: 5,
      bufferAfter: 10,
    },
  });

  const skinCheck = await prisma.service.create({
    data: {
      practiceId: practice.id,
      name: 'Skin Check',
      description: '15-minute quick skin assessment via video.',
      durationMinutes: 15,
      price: 50.0,
      confirmationMode: 'AUTO_CONFIRM',
    },
  });

  // Link services to providers
  await prisma.serviceProvider.createMany({
    data: [
      { serviceId: generalConsult.id, providerProfileId: smithProfile.id },
      { serviceId: mentalHealth.id, providerProfileId: smithProfile.id },
      { serviceId: generalConsult.id, providerProfileId: jonesProfile.id },
      { serviceId: skinCheck.id, providerProfileId: jonesProfile.id },
    ],
    skipDuplicates: true,
  });

  // Create availability rules (Mon-Fri 9am-5pm)
  for (let day = 1; day <= 5; day++) {
    await prisma.availabilityRule.create({
      data: {
        providerProfileId: smithProfile.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
      },
    });
    await prisma.availabilityRule.create({
      data: {
        providerProfileId: jonesProfile.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '16:00',
        slotDuration: 15,
      },
    });
  }

  console.log('Seed data created successfully');
  console.log(`  Users: admin, dr.smith, dr.jones, patient (password: DemoPass1)`);
  console.log(`  Practice: ${practice.name} (${practice.slug})`);
  console.log(`  Services: ${generalConsult.name}, ${mentalHealth.name}, ${skinCheck.name}`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
