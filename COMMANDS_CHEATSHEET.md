# 🎯 Commands Cheatsheet

Quick reference untuk command yang sering digunakan.

## 📦 NPM Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database

```bash
# Run seeder
npm run db:seed

# Reset database & seed (⚠️ akan hapus semua data)
npm run db:reset
```

---

## 🗄️ Prisma Commands

### Migration

```bash
# Create and apply migration
npx prisma migrate dev

# Apply pending migrations
npx prisma migrate deploy

# Reset database (⚠️ akan hapus semua data)
npx prisma migrate reset

# Reset dengan force (skip confirmation)
npx prisma migrate reset --force

# Create migration without applying
npx prisma migrate dev --create-only

# Mark migration as applied
npx prisma migrate resolve --applied <migration_name>

# Mark migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>
```

### Client

```bash
# Generate Prisma Client
npx prisma generate

# Validate schema
npx prisma validate

# Format schema
npx prisma format
```

### Studio

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio

# Open on specific port
npx prisma studio --port 5556
```

### Database

```bash
# Push schema to database (without migration)
npx prisma db push

# Pull schema from database
npx prisma db pull

# Seed database
npx prisma db seed
```

---

## 🐘 PostgreSQL Commands

### Service Management

```bash
# Linux/Mac
sudo systemctl start postgresql
sudo systemctl stop postgresql
sudo systemctl restart postgresql
sudo systemctl status postgresql

# Windows (PowerShell as Admin)
Start-Service postgresql-x64-14
Stop-Service postgresql-x64-14
Restart-Service postgresql-x64-14
Get-Service postgresql*
```

### Database Operations

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
createdb pemooda_db
# atau
psql -U postgres -c "CREATE DATABASE pemooda_db;"

# Drop database (⚠️ akan hapus semua data)
dropdb pemooda_db
# atau
psql -U postgres -c "DROP DATABASE pemooda_db;"

# List databases
psql -U postgres -c "\l"

# Connect to specific database
psql -U postgres -d pemooda_db
```

### Inside psql

```sql
-- List databases
\l

-- Connect to database
\c pemooda_db

-- List tables
\dt

-- Describe table
\d users

-- Show table data
SELECT * FROM users;

-- Count records
SELECT COUNT(*) FROM users;

-- Exit
\q
```

---

## 🔐 Quick Login

### Copy-Paste Credentials

**Ketua (Full Access):**

```
ketua@test.com
password123
```

**Sekretaris:**

```
sekretaris@test.com
password123
```

**Bendahara:**

```
bendahara@test.com
password123
```

**Anggota:**

```
anggota1@test.com
password123
```

**Unverified User:**

```
unverified@test.com
password123
```

---

## 🧪 Testing Commands

### Run Tests (jika ada)

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.spec.ts

# Run with coverage
npm test -- --coverage
```

---

## 🔍 Debugging

### Check Logs

```bash
# View Prisma query logs
# Edit lib/prisma.ts dan tambahkan:
# log: ['query', 'info', 'warn', 'error']

# View Next.js logs
# Sudah otomatis di console saat npm run dev
```

### Inspect Database

```bash
# Open Prisma Studio
npx prisma studio

# Or use psql
psql -U postgres -d pemooda_db
```

---

## 🧹 Clean Commands

### Clean Build

```bash
# Remove build artifacts
rm -rf .next

# Remove node_modules
rm -rf node_modules

# Remove Prisma generated files
rm -rf lib/generated

# Clean all
rm -rf .next node_modules lib/generated
```

### Clean Install

```bash
# Remove everything
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Install fresh
npm install
```

### Clean Database

```bash
# Drop and recreate database
dropdb pemooda_db
createdb pemooda_db

# Run migration
npx prisma migrate dev

# Seed database
npm run db:seed
```

---

## 🚀 Deployment Commands

### Build

```bash
# Build for production
npm run build

# Test production build locally
npm run build && npm start
```

### Environment

```bash
# Check environment variables
printenv | grep DATABASE_URL
printenv | grep JWT_SECRET

# Or on Windows
Get-ChildItem Env: | Where-Object {$_.Name -like "*DATABASE*"}
```

---

## 📊 Database Statistics

### Quick Stats

```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Count by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- Count activities
SELECT COUNT(*) FROM activities;

-- Count attendances
SELECT COUNT(*) FROM attendances;

-- Count organizations
SELECT COUNT(*) FROM organizations;

-- Recent users
SELECT email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5;

-- Recent activities
SELECT title, start_date FROM activities ORDER BY created_at DESC LIMIT 5;
```

---

## 🔄 Common Workflows

### Fresh Start

```bash
# 1. Clean everything
rm -rf node_modules package-lock.json .next lib/generated

# 2. Install dependencies
npm install

# 3. Generate Prisma Client
npx prisma generate

# 4. Reset database
npm run db:reset

# 5. Start dev server
npm run dev
```

### Update Schema

```bash
# 1. Edit prisma/schema.prisma

# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Generate client
npx prisma generate

# 4. Restart dev server
# Ctrl+C then npm run dev
```

### Add Seed Data

```bash
# 1. Edit prisma/seed.ts

# 2. Reset and seed
npm run db:reset

# Or just seed (if no conflicts)
npm run db:seed
```

---

## 💡 Pro Tips

### Aliases (Optional)

Tambahkan ke `.bashrc` atau `.zshrc`:

```bash
# Prisma aliases
alias pstudio="npx prisma studio"
alias pgen="npx prisma generate"
alias pmigrate="npx prisma migrate dev"
alias preset="npx prisma migrate reset --force"

# Database aliases
alias dbseed="npm run db:seed"
alias dbreset="npm run db:reset"

# Development aliases
alias dev="npm run dev"
alias build="npm run build"
```

### Git Aliases

```bash
# Add to .gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
```

---

## 📱 Quick Reference URLs

```
Development:     http://localhost:3000
Prisma Studio:   http://localhost:5555
API Docs:        http://localhost:3000/api
```

---

## 🆘 Emergency Commands

### Database Locked

```bash
# Kill all connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'pemooda_db';"

# Then retry your command
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or on Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Reset Everything (Nuclear Option)

```bash
# ⚠️ WARNING: This will delete EVERYTHING!

# 1. Stop all processes
# Ctrl+C on all terminals

# 2. Clean files
rm -rf node_modules package-lock.json .next lib/generated

# 3. Drop database
dropdb pemooda_db

# 4. Create database
createdb pemooda_db

# 5. Fresh install
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed

# 6. Start
npm run dev
```

---

**Bookmark this page for quick reference! 📌**

**Last Updated:** May 2026
