# 🔐 Test Credentials

Semua akun menggunakan password yang sama: **`password123`**

## 👥 Akun Testing

### 👑 Ketua (Administrator)

```
Email: ketua@test.com
Password: password123
Role: KETUA
Status: Verified
```

**Akses:**

- Full access ke semua fitur
- Dapat membuat dan menghapus activity
- Dapat invite dan remove member
- Dapat mengubah settings organisasi

---

### 📝 Sekretaris

```
Email: sekretaris@test.com
Password: password123
Role: SEKRETARIS
Status: Verified
```

**Akses:**

- Dapat membuat activity
- Dapat membuat announcement
- Dapat melihat semua member

---

### 💰 Bendahara

```
Email: bendahara@test.com
Password: password123
Role: BENDAHARA
Status: Verified
```

**Akses:**

- Dapat mengelola keuangan
- Dapat membuat laporan keuangan
- Dapat melihat semua member

---

### 👤 Anggota 1 (Dengan Detail Lengkap)

```
Email: anggota1@test.com
Password: password123
Role: ANGGOTA
Status: Verified
```

**Detail:**

- Alamat: Jl. Anggota No. 1, Bandung
- Phone: 081234567892
- Birth Date: 20 Mei 1995

---

### 👤 Anggota 2

```
Email: anggota2@test.com
Password: password123
Role: ANGGOTA
Status: Verified
```

---

### 👤 Anggota 3

```
Email: anggota3@test.com
Password: password123
Role: ANGGOTA
Status: Verified
```

---

### 🎓 Senior

```
Email: senior@test.com
Password: password123
Role: SENIOR
Status: Verified
```

---

### 👨‍🏫 Pembina

```
Email: pembina@test.com
Password: password123
Role: PEMBINA
Status: Verified
```

---

### ⚠️ Unverified User (Untuk Testing Email Verification)

```
Email: unverified@test.com
Password: password123
Role: -
Status: Not Verified
```

**Verification Token:** `test-verification-token-123`

---

## 📧 Invitation Testing

### Pending Invitation

```
Email: invited@test.com
Token: test-invitation-token-123
Role: ANGGOTA
Expires: 7 hari dari seeding
```

---

## 🏢 Organization Info

```
Name: Organisasi Testing
Tagline: Organisasi untuk testing aplikasi
Address: Jl. Testing No. 123, Jakarta
Phone: 081234567890
Instagram: @orgtest
Facebook: /orgtest
Twitter: @orgtest
```

---

## 📅 Activities

### 1. Rapat Bulanan Januari

- **Type:** MEETING
- **Date:** 15 Mei 2026, 09:00-12:00
- **Location:** Kantor Organisasi
- **Status:** Private
- **Attendance:** Ada (dengan berbagai status)

### 2. Pelatihan Leadership

- **Type:** TRAINING
- **Date:** 20 Mei 2026, 08:00-17:00
- **Location:** Hotel Grand Indonesia
- **Status:** Public
- **Attendance:** Ada (termasuk external user)

### 3. Bakti Sosial

- **Type:** VOLUNTEER
- **Date:** 25 Mei 2026, 07:00-15:00
- **Location:** Panti Asuhan Harapan
- **Status:** Public
- **Attendance:** Ada

---

## 🧪 Quick Copy-Paste

### Login Ketua

```
ketua@test.com
password123
```

### Login Anggota

```
anggota1@test.com
password123
```

### Login Unverified

```
unverified@test.com
password123
```

---

## 💡 Tips Testing

1. **Test Role-Based Access:**
   - Login sebagai Ketua → Full access
   - Login sebagai Anggota → Limited access
   - Bandingkan fitur yang tersedia

2. **Test Attendance:**
   - Login sebagai Anggota2 (status: PENDING)
   - Coba scan QR atau manual check-in
   - Lihat perubahan status

3. **Test Email Verification:**
   - Login sebagai unverified@test.com
   - Sistem akan redirect ke halaman verifikasi
   - Gunakan token untuk testing

4. **Test Invitation:**
   - Login sebagai Ketua
   - Invite member baru
   - Check invitation list
   - Test accept/reject invitation

5. **Test CRUD Operations:**
   - Login sebagai Ketua/Sekretaris
   - Create new activity
   - Update activity
   - Delete activity

---

**Last Updated:** May 2026
