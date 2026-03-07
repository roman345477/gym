# 🏋️ GymDiary — Telegram Mini App

A full-stack Telegram Mini App for tracking gym workouts, exercises, and progress.

---

## 🏗 Project Structure

```
gym-app/
├── backend/                  # Node.js + Express + Prisma
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── server.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── workouts.ts
│   │       ├── exercises.ts
│   │       ├── sets.ts
│   │       └── progress.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # React + TypeScript + Vite + Tailwind
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   ├── pages/
    │   └── types/
    ├── Dockerfile
    └── package.json
```

---

## 🚀 Deploy on Railway (Step by Step)

### Prerequisites
- [Railway account](https://railway.app)
- [Telegram Bot](https://t.me/BotFather) (create via @BotFather)

---

### Step 1: Create Telegram Bot

1. Open Telegram → @BotFather
2. `/newbot` → set name and username
3. Save your **bot token**
4. `/newapp` → link your frontend URL (set later)
5. Enable Mini App in bot settings

---

### Step 2: Deploy Database on Railway

1. Go to [railway.app](https://railway.app) → New Project
2. Add Service → **PostgreSQL**
3. Copy the `DATABASE_URL` from Variables tab

---

### Step 3: Deploy Backend on Railway

1. In the same Railway project → Add Service → **GitHub Repo**
2. Select your repo, set **Root Directory** to `/backend`
3. Railway auto-detects Dockerfile

**Set these Environment Variables:**
```
DATABASE_URL=postgresql://...  (from Step 2)
PORT=3001
```

4. After first deploy, run migration:
   - Go to Railway console or add this as start command:
   ```
   npx prisma migrate deploy && node dist/server.js
   ```
5. Copy your backend **Public URL** (e.g. `https://gym-backend.railway.app`)

---

### Step 4: Deploy Frontend on Railway

1. Add Service → **GitHub Repo**
2. Set **Root Directory** to `/frontend`

**Set these Environment Variables:**
```
VITE_API_URL=https://your-backend.railway.app
```

3. Deploy — Railway uses Dockerfile automatically
4. Copy your frontend **Public URL**

---

### Step 5: Configure Telegram Mini App

1. Go to @BotFather → Your Bot → Menu Button → Configure Mini App URL
2. Set URL to your frontend Railway URL
3. Alternatively: `/setmenubutton` → your URL

**Or link via inline button:**
```
https://t.me/your_bot?startapp
```

---

### Step 6: Local Development

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL in .env

npm install
npx prisma migrate dev --name init
npm run dev
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:3001

npm install
npm run dev
```

**Test without Telegram:**
- The app falls back to a dev user (id: 123456789) when Telegram WebApp SDK is not available
- Open `http://localhost:5173` in browser directly

---

## 🗄 Database Schema

```prisma
model User {
  id         Int       @id @default(autoincrement())
  telegramId String    @unique
  name       String
  createdAt  DateTime  @default(now())
  workouts   Workout[]
}

model Workout {
  id        Int        @id @default(autoincrement())
  userId    Int
  date      DateTime
  createdAt DateTime   @default(now())
  user      User       @relation(...)
  exercises Exercise[]
}

model Exercise {
  id        Int     @id @default(autoincrement())
  workoutId Int
  name      String
  workout   Workout @relation(...)
  sets      Set[]
}

model Set {
  id         Int      @id @default(autoincrement())
  exerciseId Int
  weight     Float
  reps       Int
  exercise   Exercise @relation(...)
}
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/telegram | Login / create user |
| GET | /workouts?telegramId= | Get all workouts |
| POST | /workouts | Create workout |
| GET | /workouts/:id | Get workout by ID |
| PUT | /workouts/:id | Update workout |
| DELETE | /workouts/:id | Delete workout |
| POST | /exercises | Add exercise |
| POST | /sets | Add set |
| GET | /progress?telegramId= | List exercise names |
| GET | /progress/:name?telegramId= | Get progress data |

---

## 📱 Features

- ✅ **Dashboard** — stats, recent workouts, quick start
- ✅ **Workout Editor** — create/edit workouts with exercises and sets
- ✅ **Exercise Autocomplete** — popular exercises suggestions
- ✅ **Quick Set Duplication** — last set weight/reps pre-filled
- ✅ **History** — grouped by month, edit/delete
- ✅ **Progress Charts** — max weight over time (Recharts)
- ✅ **Telegram Auth** — auto-login via initDataUnsafe
- ✅ **Haptic Feedback** — via Telegram WebApp API
- ✅ **Dark Theme** — optimized for mobile

---

## 🔒 Security Notes

For production, validate Telegram `initData` using HMAC-SHA256:

```typescript
import crypto from 'crypto';

function validateTelegramData(initData: string, botToken: string): boolean {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const expectedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return expectedHash === hash;
}
```

Add this check to `/auth/telegram` before creating users.
