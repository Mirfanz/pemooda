import prisma from "@/lib/prisma";
import { PrismaClient } from "../lib/generated/prisma/client";
import bcrypt from "bcryptjs";

// const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Hash password untuk semua user testing
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Buat User Ketua (Creator Organization)
  console.log("Creating Ketua user...");
  const ketua = await prisma.user.upsert({
    where: { email: "ketua@test.com" },
    update: {},
    create: {
      email: "ketua@test.com",
      hashedPassword,
      name: "Ketua Testing",
      isVerified: true,
      role: "KETUA",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
    },
  });

  // 2. Buat Organization
  console.log("Creating organization...");
  const organization = await prisma.organization.upsert({
    where: { id: "org-test-001" },
    update: {},
    create: {
      id: "org-test-001",
      name: "Organisasi Testing",
      tagline: "Organisasi untuk testing aplikasi",
      imageUrl: "https://picsum.photos/seed/org1/400/400",
      createdBy: ketua.id,
    },
  });

  // Update ketua dengan organizationId
  await prisma.user.update({
    where: { id: ketua.id },
    data: { organizationId: organization.id },
  });

  // 3. Buat Organization Detail
  console.log("Creating organization details...");
  await prisma.organizationDetail.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      organizationId: organization.id,
      address: "Jl. Testing No. 123, Jakarta",
      phone: "081234567890",
      instagramUrl: "https://instagram.com/orgtest",
      facebookUrl: "https://facebook.com/orgtest",
      twitterUrl: "https://twitter.com/orgtest",
    },
  });

  // 4. Buat Organization Summary
  console.log("Creating organization summary...");
  await prisma.organizationSummary.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      organizationId: organization.id,
      totalMembers: 0,
      totalActivities: 0,
    },
  });

  // 5. Buat User Sekretaris
  console.log("Creating Sekretaris user...");
  const sekretaris = await prisma.user.upsert({
    where: { email: "sekretaris@test.com" },
    update: {},
    create: {
      email: "sekretaris@test.com",
      hashedPassword,
      name: "Sekretaris Testing",
      isVerified: true,
      role: "SEKRETARIS",
      organizationId: organization.id,
      avatarUrl: "https://i.pravatar.cc/150?img=2",
    },
  });

  // 6. Buat User Bendahara
  console.log("Creating Bendahara user...");
  const bendahara = await prisma.user.upsert({
    where: { email: "bendahara@test.com" },
    update: {},
    create: {
      email: "bendahara@test.com",
      hashedPassword,
      name: "Bendahara Testing",
      isVerified: true,
      role: "BENDAHARA",
      organizationId: organization.id,
      avatarUrl: "https://i.pravatar.cc/150?img=3",
    },
  });

  // 7. Buat User Anggota
  console.log("Creating Anggota users...");
  const anggota1 = await prisma.user.upsert({
    where: { email: "anggota1@test.com" },
    update: {},
    create: {
      email: "anggota1@test.com",
      hashedPassword,
      name: "Anggota Satu",
      isVerified: true,
      role: "ANGGOTA",
      organizationId: organization.id,
      avatarUrl: "https://i.pravatar.cc/150?img=4",
    },
  });

  const anggota2 = await prisma.user.upsert({
    where: { email: "anggota2@test.com" },
    update: {},
    create: {
      email: "anggota2@test.com",
      hashedPassword,
      name: "Anggota Dua",
      isVerified: true,
      role: "ANGGOTA",
      organizationId: organization.id,
      avatarUrl: "https://i.pravatar.cc/150?img=5",
    },
  });

  const anggota3 = await prisma.user.upsert({
    where: { email: "anggota3@test.com" },
    update: {},
    create: {
      email: "anggota3@test.com",
      hashedPassword,
      name: "Anggota Tiga",
      isVerified: true,
      role: "ANGGOTA",
      organizationId: organization.id,
      avatarUrl: "https://i.pravatar.cc/150?img=6",
    },
  });

  // 8. Buat User Senior
  console.log("Creating Senior user...");
  const senior = await prisma.user.upsert({
    where: { email: "senior@test.com" },
    update: {},
    create: {
      email: "senior@test.com",
      hashedPassword,
      name: "Senior Testing",
      isVerified: true,
      role: "SENIOR",
      organizationId: organization.id,
      avatarUrl: "https://i.pravatar.cc/150?img=7",
    },
  });

  // 9. Buat User Pembina
  console.log("Creating Pembina user...");
  const pembina = await prisma.user.upsert({
    where: { email: "pembina@test.com" },
    update: {},
    create: {
      email: "pembina@test.com",
      hashedPassword,
      name: "Pembina Testing",
      isVerified: true,
      role: "PEMBINA",
      organizationId: organization.id,
      avatarUrl: "https://i.pravatar.cc/150?img=8",
    },
  });

  // 10. Buat User Belum Verified
  console.log("Creating unverified user...");
  const unverified = await prisma.user.upsert({
    where: { email: "unverified@test.com" },
    update: {},
    create: {
      email: "unverified@test.com",
      hashedPassword,
      name: "User Belum Verified",
      isVerified: false,
      avatarUrl: "https://i.pravatar.cc/150?img=9",
    },
  });

  // 11. Buat User Detail untuk beberapa user
  console.log("Creating user details...");
  await prisma.userDetail.upsert({
    where: { userId: ketua.id },
    update: {},
    create: {
      userId: ketua.id,
      address: "Jl. Ketua No. 1, Jakarta",
      phone: "081234567891",
      birthDate: new Date("1990-01-15"),
    },
  });

  await prisma.userDetail.upsert({
    where: { userId: anggota1.id },
    update: {},
    create: {
      userId: anggota1.id,
      address: "Jl. Anggota No. 1, Bandung",
      phone: "081234567892",
      birthDate: new Date("1995-05-20"),
    },
  });

  // 12. Update Organization Summary
  const totalMembers = await prisma.user.count({
    where: { organizationId: organization.id },
  });

  await prisma.organizationSummary.update({
    where: { organizationId: organization.id },
    data: { totalMembers },
  });

  // 13. Buat Activities
  console.log("Creating activities...");
  const activity1 = await prisma.activity.create({
    data: {
      title: "Rapat Bulanan Januari",
      description: "Rapat rutin bulanan untuk evaluasi dan perencanaan",
      notes: ["Harap hadir tepat waktu", "Bawa laptop masing-masing"],
      type: "MEETING",
      isPublic: false,
      startDate: new Date("2026-05-15T09:00:00"),
      endDate: new Date("2026-05-15T12:00:00"),
      location: "Kantor Organisasi",
      mapsUrl: "https://maps.google.com/?q=-6.200000,106.816666",
      organizationId: organization.id,
      createdBy: ketua.id,
    },
  });

  const activity2 = await prisma.activity.create({
    data: {
      title: "Pelatihan Leadership",
      description: "Pelatihan kepemimpinan untuk pengurus organisasi",
      notes: ["Dress code: Formal", "Sertifikat akan diberikan"],
      type: "TRAINING",
      isPublic: true,
      startDate: new Date("2026-05-20T08:00:00"),
      endDate: new Date("2026-05-20T17:00:00"),
      location: "Hotel Grand Indonesia",
      mapsUrl: "https://maps.google.com/?q=-6.195000,106.823000",
      organizationId: organization.id,
      createdBy: sekretaris.id,
    },
  });

  const activity3 = await prisma.activity.create({
    data: {
      title: "Bakti Sosial",
      description: "Kegiatan bakti sosial di panti asuhan",
      notes: ["Bawa donasi", "Kumpul jam 07:00"],
      type: "VOLUNTEER",
      isPublic: true,
      startDate: new Date("2026-05-25T07:00:00"),
      endDate: new Date("2026-05-25T15:00:00"),
      location: "Panti Asuhan Harapan",
      organizationId: organization.id,
      createdBy: ketua.id,
    },
  });

  // 14. Update total activities
  const totalActivities = await prisma.activity.count({
    where: { organizationId: organization.id },
  });

  await prisma.organizationSummary.update({
    where: { organizationId: organization.id },
    data: { totalActivities },
  });

  // 15. Buat Attendances
  console.log("Creating attendances...");
  const attendance1 = await prisma.attendance.create({
    data: {
      activityId: activity1.id,
      name: "Absensi Rapat Bulanan",
      description: "Absensi untuk rapat bulanan Januari",
      startDate: new Date("2026-05-15T08:45:00"),
      endDate: new Date("2026-05-15T09:15:00"),
      allowExternalUsers: false,
    },
  });

  const attendance2 = await prisma.attendance.create({
    data: {
      activityId: activity2.id,
      name: "Absensi Pelatihan Leadership",
      description: "Absensi untuk pelatihan leadership",
      startDate: new Date("2026-05-20T07:45:00"),
      endDate: new Date("2026-05-20T08:15:00"),
      allowExternalUsers: true,
    },
  });

  const attendance3 = await prisma.attendance.create({
    data: {
      activityId: activity3.id,
      name: "Absensi Bakti Sosial",
      description: "Absensi untuk kegiatan bakti sosial",
      startDate: new Date("2026-05-25T06:45:00"),
      endDate: new Date("2026-05-25T07:15:00"),
      allowExternalUsers: true,
    },
  });

  // 16. Buat Attendees
  console.log("Creating attendees...");

  // Attendees untuk attendance1 (Rapat Bulanan)
  await prisma.attendee.create({
    data: {
      userId: ketua.id,
      attendanceId: attendance1.id,
      status: "PRESENT",
      attendedAt: new Date("2026-05-15T08:50:00"),
    },
  });

  await prisma.attendee.create({
    data: {
      userId: sekretaris.id,
      attendanceId: attendance1.id,
      status: "PRESENT",
      attendedAt: new Date("2026-05-15T08:55:00"),
    },
  });

  await prisma.attendee.create({
    data: {
      userId: bendahara.id,
      attendanceId: attendance1.id,
      status: "PRESENT",
      attendedAt: new Date("2026-05-15T09:00:00"),
    },
  });

  await prisma.attendee.create({
    data: {
      userId: anggota1.id,
      attendanceId: attendance1.id,
      status: "EXCUSE",
      excuseDescription: "Sakit demam",
    },
  });

  await prisma.attendee.create({
    data: {
      userId: anggota2.id,
      attendanceId: attendance1.id,
      status: "PENDING",
    },
  });

  // Attendees untuk attendance2 (Pelatihan)
  await prisma.attendee.create({
    data: {
      userId: ketua.id,
      attendanceId: attendance2.id,
      status: "PENDING",
    },
  });

  await prisma.attendee.create({
    data: {
      userId: sekretaris.id,
      attendanceId: attendance2.id,
      status: "PENDING",
    },
  });

  await prisma.attendee.create({
    data: {
      userId: senior.id,
      attendanceId: attendance2.id,
      status: "PENDING",
    },
  });

  // External user untuk attendance2
  await prisma.attendee.create({
    data: {
      attendanceId: attendance2.id,
      name: "User External",
      email: "external@example.com",
      status: "PENDING",
    },
  });

  // 17. Update attendance statistics
  await updateAttendanceStats(attendance1.id);
  await updateAttendanceStats(attendance2.id);

  // 18. Buat Announcements
  console.log("Creating announcements...");
  await prisma.announcement.create({
    data: {
      title: "Selamat Datang!",
      content:
        "Selamat datang di sistem manajemen organisasi kami. Silakan lengkapi profil Anda.",
      organizationId: organization.id,
      createdBy: ketua.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Pengumuman Rapat",
      content:
        "Rapat bulanan akan dilaksanakan pada tanggal 15 Mei 2026. Harap semua pengurus hadir.",
      organizationId: organization.id,
      createdBy: sekretaris.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: "Iuran Bulanan",
      content:
        "Mohon untuk segera membayar iuran bulanan paling lambat tanggal 10 setiap bulannya.",
      organizationId: organization.id,
      createdBy: bendahara.id,
    },
  });

  // 19. Buat Verification Token untuk unverified user
  console.log("Creating verification token...");
  await prisma.verificationToken.create({
    data: {
      token: "test-verification-token-123",
      type: "EMAIL_VERIFICATION",
      userId: unverified.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam dari sekarang
    },
  });

  // 20. Buat Invitation
  console.log("Creating invitations...");
  await prisma.invitation.create({
    data: {
      email: "invited@test.com",
      organizationId: organization.id,
      role: "ANGGOTA",
      token: "test-invitation-token-123",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari dari sekarang
      createdBy: ketua.id,
    },
  });

  console.log("✅ Seeding completed successfully!");
  console.log("\n📋 Test Accounts Created:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    "Email: ketua@test.com       | Password: password123 | Role: KETUA",
  );
  console.log(
    "Email: sekretaris@test.com  | Password: password123 | Role: SEKRETARIS",
  );
  console.log(
    "Email: bendahara@test.com   | Password: password123 | Role: BENDAHARA",
  );
  console.log(
    "Email: anggota1@test.com    | Password: password123 | Role: ANGGOTA",
  );
  console.log(
    "Email: anggota2@test.com    | Password: password123 | Role: ANGGOTA",
  );
  console.log(
    "Email: anggota3@test.com    | Password: password123 | Role: ANGGOTA",
  );
  console.log(
    "Email: senior@test.com      | Password: password123 | Role: SENIOR",
  );
  console.log(
    "Email: pembina@test.com     | Password: password123 | Role: PEMBINA",
  );
  console.log(
    "Email: unverified@test.com  | Password: password123 | Role: - (Not Verified)",
  );
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📊 Data Created:");
  console.log(`- Organization: ${organization.name}`);
  console.log(`- Total Members: ${totalMembers}`);
  console.log(`- Total Activities: ${totalActivities}`);
  console.log(`- Total Announcements: 3`);
  console.log(`- Total Attendances: 3`);
}

// Helper function untuk update attendance statistics
async function updateAttendanceStats(attendanceId: string) {
  const stats = await prisma.attendee.groupBy({
    by: ["status"],
    where: { attendanceId },
    _count: true,
  });

  const totalPresent = stats.find((s) => s.status === "PRESENT")?._count || 0;
  const totalAbsent = stats.find((s) => s.status === "ABSENT")?._count || 0;
  const totalExcuse = stats.find((s) => s.status === "EXCUSE")?._count || 0;
  const totalPending = stats.find((s) => s.status === "PENDING")?._count || 0;

  await prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      totalPresent,
      totalAbsent,
      totalExcuse,
      totalPending,
    },
  });
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
