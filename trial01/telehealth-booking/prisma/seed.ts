import { PrismaClient, UserRole, MembershipRole, SpecialtyCategory, ConsultationType, ConfirmationMode, IntakeFieldType } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Demo Practice ──────────────────────────────────────────────────────
  const practice = await prisma.practice.create({
    data: {
      id: randomUUID(),
      name: 'MedConnect Demo Clinic',
      slug: 'demo-clinic',
      description: 'A demonstration telehealth practice with synthetic data',
      category: SpecialtyCategory.PRIMARY_CARE,
      timezone: 'America/New_York',
      currency: 'USD',
      country: 'US',
      contactEmail: 'admin@demo-clinic.medconnect.dev',
      contactPhone: '+1-555-0100',
    },
  });

  // ─── Demo Users ─────────────────────────────────────────────────────────
  // Password: "DemoPass1" (bcrypt hash, 12 rounds)
  const passwordHash = '$2b$12$LJ3m4ys5Kq0v9X8YjZpOde8kQrV7n0OqWJUfGDMuNEPrXQVfMi.IG';

  const adminUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'admin@demo.medconnect.dev',
      passwordHash,
      name: 'Dr. Admin User',
      role: UserRole.PLATFORM_ADMIN,
      emailVerifiedAt: new Date(),
    },
  });

  const providerUser1 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'dr.smith@demo.medconnect.dev',
      passwordHash,
      name: 'Dr. Sarah Smith',
      role: UserRole.USER,
      emailVerifiedAt: new Date(),
    },
  });

  const providerUser2 = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'dr.jones@demo.medconnect.dev',
      passwordHash,
      name: 'Dr. Michael Jones',
      role: UserRole.USER,
      emailVerifiedAt: new Date(),
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      id: randomUUID(),
      email: 'patient@demo.medconnect.dev',
      passwordHash,
      name: 'Jane Patient',
      role: UserRole.USER,
      emailVerifiedAt: new Date(),
    },
  });

  // ─── Memberships ────────────────────────────────────────────────────────
  await prisma.tenantMembership.createMany({
    data: [
      { id: randomUUID(), userId: adminUser.id, practiceId: practice.id, role: MembershipRole.OWNER },
      { id: randomUUID(), userId: providerUser1.id, practiceId: practice.id, role: MembershipRole.PROVIDER },
      { id: randomUUID(), userId: providerUser2.id, practiceId: practice.id, role: MembershipRole.PROVIDER },
    ],
  });

  // ─── Provider Profiles ──────────────────────────────────────────────────
  const provider1 = await prisma.providerProfile.create({
    data: {
      id: randomUUID(),
      userId: providerUser1.id,
      practiceId: practice.id,
      specialties: ['General Practice', 'Preventive Medicine'],
      credentials: 'MD, FACP',
      bio: 'Board-certified internist with 15 years of experience in primary care and preventive medicine.',
      yearsOfExperience: 15,
      education: 'Johns Hopkins School of Medicine',
      languages: ['English', 'Spanish'],
      acceptingNewPatients: true,
      consultationTypes: [ConsultationType.VIDEO, ConsultationType.IN_PERSON],
    },
  });

  const provider2 = await prisma.providerProfile.create({
    data: {
      id: randomUUID(),
      userId: providerUser2.id,
      practiceId: practice.id,
      specialties: ['Psychiatry', 'Cognitive Behavioral Therapy'],
      credentials: 'MD, PhD',
      bio: 'Psychiatrist specializing in anxiety, depression, and PTSD treatment via telehealth.',
      yearsOfExperience: 10,
      education: 'Stanford School of Medicine',
      languages: ['English'],
      acceptingNewPatients: true,
      consultationTypes: [ConsultationType.VIDEO],
    },
  });

  // ─── Intake Form Template ──────────────────────────────────────────────
  const intakeTemplate = await prisma.intakeFormTemplate.create({
    data: {
      id: randomUUID(),
      practiceId: practice.id,
      name: 'General Health Intake',
      description: 'Standard intake form for new patients',
      fields: [
        { id: randomUUID(), type: IntakeFieldType.TEXT, label: 'Chief Complaint', required: true, placeholder: 'What brings you in today?' },
        { id: randomUUID(), type: IntakeFieldType.TEXTAREA, label: 'Medical History', required: false, placeholder: 'List any relevant medical history' },
        { id: randomUUID(), type: IntakeFieldType.SELECT, label: 'Insurance Provider', required: true, options: ['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealth', 'Medicare', 'Medicaid', 'Self-Pay', 'Other'] },
        { id: randomUUID(), type: IntakeFieldType.MULTI_SELECT, label: 'Current Medications', required: false, options: ['None', 'Blood Pressure', 'Cholesterol', 'Diabetes', 'Thyroid', 'Other'] },
        { id: randomUUID(), type: IntakeFieldType.CHECKBOX, label: 'I consent to telehealth services', required: true },
        { id: randomUUID(), type: IntakeFieldType.PHONE, label: 'Emergency Contact Phone', required: true, placeholder: '+1-555-000-0000' },
      ],
    },
  });

  // ─── Services ───────────────────────────────────────────────────────────
  const service1 = await prisma.service.create({
    data: {
      id: randomUUID(),
      practiceId: practice.id,
      name: 'Initial Consultation',
      description: 'Comprehensive initial visit for new patients',
      durationMinutes: 30,
      price: 150.0,
      consultationType: ConsultationType.VIDEO,
      confirmationMode: ConfirmationMode.AUTO_CONFIRM,
      intakeFormTemplateId: intakeTemplate.id,
      maxParticipants: 2,
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 5,
      category: 'Primary Care',
      providers: {
        create: [
          { id: randomUUID(), providerProfileId: provider1.id },
          { id: randomUUID(), providerProfileId: provider2.id },
        ],
      },
    },
  });

  const service2 = await prisma.service.create({
    data: {
      id: randomUUID(),
      practiceId: practice.id,
      name: 'Follow-up Visit',
      description: 'Follow-up appointment for existing patients',
      durationMinutes: 15,
      price: 75.0,
      consultationType: ConsultationType.VIDEO,
      confirmationMode: ConfirmationMode.AUTO_CONFIRM,
      maxParticipants: 2,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 5,
      category: 'Primary Care',
      providers: {
        create: [
          { id: randomUUID(), providerProfileId: provider1.id },
        ],
      },
    },
  });

  const service3 = await prisma.service.create({
    data: {
      id: randomUUID(),
      practiceId: practice.id,
      name: 'Therapy Session',
      description: '50-minute therapy session via video',
      durationMinutes: 50,
      price: 200.0,
      consultationType: ConsultationType.VIDEO,
      confirmationMode: ConfirmationMode.MANUAL_APPROVAL,
      maxParticipants: 2,
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 10,
      category: 'Mental Health',
      providers: {
        create: [
          { id: randomUUID(), providerProfileId: provider2.id },
        ],
      },
    },
  });

  // ─── Availability Rules ─────────────────────────────────────────────────
  // Provider 1: Mon-Fri 9am-5pm
  for (let day = 1; day <= 5; day++) {
    await prisma.availabilityRule.create({
      data: {
        id: randomUUID(),
        providerProfileId: provider1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
    });
  }

  // Provider 2: Mon, Wed, Fri 10am-6pm
  for (const day of [1, 3, 5]) {
    await prisma.availabilityRule.create({
      data: {
        id: randomUUID(),
        providerProfileId: provider2.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '18:00',
        slotDurationMinutes: 60,
      },
    });
  }

  console.log('Seed complete.');
  console.log(`  Practice: ${practice.name} (${practice.slug})`);
  console.log(`  Users: admin, dr.smith, dr.jones, patient (password: DemoPass1)`);
  console.log(`  Services: ${service1.name}, ${service2.name}, ${service3.name}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
