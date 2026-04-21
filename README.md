# ⛳ GolfGive — Golf Charity Draw Platform

A full-stack MERN web application: monthly golf draw, prize pools, and charity giving — all in one platform.

---

## 📁 FOLDER STRUCTURE

```
golf-charity-platform/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile
│   │   ├── subscriptionController.js
│   │   ├── scoreController.js     # Rolling 5-score logic
│   │   ├── drawController.js      # Draw engine + winner detection
│   │   ├── charityController.js
│   │   ├── winnerController.js    # Verification + payouts
│   │   └── adminController.js    # Dashboard stats + user mgmt
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + adminOnly + requireSubscription
│   │   └── errorHandler.js        # Central error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Subscription.js
│   │   ├── Score.js               # Has addScore / editScore / deleteScore methods
│   │   ├── Draw.js
│   │   ├── Winner.js
│   │   └── Charity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── subscriptions.js
│   │   ├── scores.js
│   │   ├── draws.js
│   │   ├── charities.js
│   │   ├── winners.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── email.js               # Nodemailer (mock in dev, real in prod)
│   │   └── generateToken.js       # JWT token factory
│   ├── .env.example
│   ├── seed.js                    # Database seed script
│   ├── server.js                  # Express entry point
│   ├── vercel.json
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.js   # ProtectedRoute, AdminRoute, PublicOnlyRoute
    │   │   └── ui/
    │   │       └── Navbar.js
    │   ├── context/
    │   │   └── AuthContext.js          # Global auth state with JWT
    │   ├── pages/
    │   │   ├── HomePage.js             # Landing page
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js         # 3-step wizard
    │   │   ├── DashboardPage.js        # User dashboard (scores, sub, winnings)
    │   │   ├── AdminPage.js            # Full admin panel
    │   │   └── CharitiesPage.js        # Public charity browser
    │   ├── styles/
    │   │   └── global.css              # Design system + all component styles
    │   ├── utils/
    │   │   └── api.js                  # Axios with JWT interceptor
    │   ├── App.js                      # Router + layout
    │   └── index.js
    ├── vercel.json
    └── package.json
```

---

## 🗄️ DATABASE SCHEMAS

### User

| Field             | Type     | Notes                          |
|-------------------|----------|--------------------------------|
| name              | String   | Required                       |
| email             | String   | Unique, lowercase              |
| password          | String   | Bcrypt hashed, select: false   |
| role              | String   | 'user' or 'admin'              |
| selectedCharity   | ObjectId | Ref: Charity                   |
| charityPercentage | Number   | 10–100, default 10             |
| totalWinnings     | Number   | Accumulated prize total        |
| isActive          | Boolean  | Soft delete flag               |

### Subscription

| Field                 | Type     | Notes                             |
|-----------------------|----------|-----------------------------------|
| user                  | ObjectId | Ref: User (unique per user)       |
| plan                  | String   | 'monthly' or 'yearly'             |
| amount                | Number   | £10 or £100                       |
| status                | String   | active/inactive/cancelled/lapsed  |
| startDate / endDate   | Date     | Auto-calculated on creation       |
| prizePoolContribution | Number   | Amount - charity portion          |
| charityContribution   | Number   | amount × charityPercentage %      |

### Score

| Field   | Type          | Notes                             |
|---------|---------------|-----------------------------------|
| user    | ObjectId      | Ref: User (unique per user)       |
| entries | [ScoreEntry]  | Max 5; sorted newest first        |

ScoreEntry: `{ value: 1–45, date: Date }`

**Key Score Logic (in model methods):**
- `addScore(value, date)` — validates range, checks duplicate date, adds entry, sorts, trims to 5
- `editScore(entryId, value, date)` — finds and updates, re-sorts
- `deleteScore(entryId)` — splices from array

### Draw

| Field           | Type     | Notes                              |
|-----------------|----------|------------------------------------|
| month / year    | Number   | Compound unique index              |
| winningNumbers  | [Number] | 5 numbers (1–45)                   |
| drawType        | String   | 'random' or 'algorithmic'          |
| status          | String   | pending / simulated / published    |
| jackpotPool     | Number   | 40% of pool + rollover             |
| fourMatchPool   | Number   | 35% of pool                        |
| threeMatchPool  | Number   | 25% of pool                        |
| rolloverAmount  | Number   | Unclaimed jackpot from prior month |

### Winner

| Field              | Type     | Notes                                         |
|--------------------|----------|-----------------------------------------------|
| draw               | ObjectId | Ref: Draw                                     |
| user               | ObjectId | Ref: User                                     |
| matchType          | String   | '5-match', '4-match', '3-match'               |
| prizeAmount        | Number   | Pool ÷ number of winners in tier              |
| verificationStatus | String   | pending → proof_submitted → approved/rejected |
| paymentStatus      | String   | pending → paid                                |

### Charity

| Field          | Type     | Notes                             |
|----------------|----------|-----------------------------------|
| name           | String   | Required                          |
| category       | String   | health/education/environment/etc  |
| isFeatured     | Boolean  | Shown on homepage                 |
| upcomingEvents | [Object] | title, date, description          |
| totalReceived  | Number   | Running donation total            |

---

## 🔌 API ENDPOINTS

### Auth — `/api/auth`
| Method | Endpoint       | Access  | Description          |
|--------|----------------|---------|----------------------|
| POST   | /register      | Public  | Create account       |
| POST   | /login         | Public  | Get JWT token        |
| GET    | /me            | Private | Get my profile       |
| PUT    | /me            | Private | Update profile       |

### Subscriptions — `/api/subscriptions`
| Method | Endpoint  | Access  | Description               |
|--------|-----------|---------|---------------------------|
| POST   | /         | Private | Subscribe to a plan       |
| GET    | /me       | Private | Get my subscription       |
| PUT    | /cancel   | Private | Cancel subscription       |
| GET    | /         | Admin   | All subscriptions         |
| PUT    | /:id      | Admin   | Update subscription status|

### Scores — `/api/scores`
| Method | Endpoint               | Access          | Description           |
|--------|------------------------|-----------------|-----------------------|
| GET    | /me                    | Private + Sub   | My scores             |
| POST   | /                      | Private + Sub   | Add score             |
| PUT    | /:entryId              | Private + Sub   | Edit score            |
| DELETE | /:entryId              | Private + Sub   | Delete score          |
| GET    | /                      | Admin           | All user scores       |
| PUT    | /admin/:userId/:entryId| Admin           | Edit user's score     |

### Draws — `/api/draws`
| Method | Endpoint       | Access  | Description                    |
|--------|----------------|---------|--------------------------------|
| GET    | /              | Public  | Published draws                |
| GET    | /latest        | Public  | Most recent published draw     |
| GET    | /my-history    | Private | My win history                 |
| GET    | /admin         | Admin   | All draws (all statuses)       |
| POST   | /              | Admin   | Create draw for current month  |
| POST   | /:id/run       | Admin   | Run or simulate draw           |

> **POST /:id/run body:** `{ "drawType": "random"|"algorithmic", "simulate": true|false }`

### Charities — `/api/charities`
| Method | Endpoint | Access | Description         |
|--------|----------|--------|---------------------|
| GET    | /        | Public | List all charities  |
| GET    | /:id     | Public | Single charity      |
| POST   | /        | Admin  | Create charity      |
| PUT    | /:id     | Admin  | Update charity      |
| DELETE | /:id     | Admin  | Deactivate charity  |

### Winners — `/api/winners`
| Method | Endpoint       | Access  | Description                     |
|--------|----------------|---------|---------------------------------|
| GET    | /me            | Private | My winnings                     |
| PUT    | /:id/proof     | Private | Submit proof image URL          |
| GET    | /              | Admin   | All winners (optional ?status=) |
| PUT    | /:id/verify    | Admin   | Approve or reject winner        |
| PUT    | /:id/pay       | Admin   | Mark winner as paid             |

### Admin — `/api/admin`
| Method | Endpoint       | Access | Description          |
|--------|----------------|--------|----------------------|
| GET    | /stats         | Admin  | Dashboard analytics  |
| GET    | /users         | Admin  | All users            |
| GET    | /users/:id     | Admin  | User detail          |
| PUT    | /users/:id     | Admin  | Update user          |
| DELETE | /users/:id     | Admin  | Deactivate user      |

---

## ⚙️ LOCAL SETUP

### 1. Clone & install

```bash
git clone <your-repo>

# Backend
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env

# Frontend
cd ../frontend
npm install
```

### 2. Configure `.env` (backend)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/golf-charity
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Seed database

```bash
cd backend
node seed.js
```

This creates:
- **Admin:** `admin@golfgive.com` / `admin123`
- **Player:** `player@golfgive.com` / `player123`
- 5 sample charities

### 4. Run both servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

---

## 🚀 DEPLOYMENT

### Backend → Render.com (recommended for Node)

1. Create new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root to `backend/`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add environment variables:
   ```
   MONGO_URI=...
   JWT_SECRET=...
   CLIENT_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   ```

### Frontend → Vercel

1. Create new project on [vercel.com](https://vercel.com)
2. Connect GitHub repo, set root to `frontend/`
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   ```
4. Deploy. The `vercel.json` handles SPA routing automatically.

---

## 🎮 DRAW SYSTEM EXPLAINED

### How the draw engine works:

1. **Admin creates a draw** (`POST /api/draws`) for the current month
   - Calculates prize pool from all active subscriptions' `prizePoolContribution`
   - Checks previous month for unclaimed jackpot (rollover)
   - Splits pool: 40% jackpot, 35% four-match, 25% three-match

2. **Admin simulates** (optional preview) — generates numbers, doesn't publish

3. **Admin publishes** (`POST /api/draws/:id/run` with `simulate: false`)
   - Generates 5 unique random numbers (1–45)
   - Loops through all active subscribers who have scores
   - Counts matches between user's scores and winning numbers
   - Creates `Winner` records for 3-match, 4-match, 5-match
   - Splits prize equally among winners in each tier
   - Sends email notifications to winners
   - 5-match jackpot rolls over next month if unclaimed

### Algorithmic draw:
- Weights numbers by how frequently they appear in user score history
- More common scores = more likely to be drawn (favours regular players)

---

## 🧪 TESTING CHECKLIST

- [ ] Register a new user → 3-step wizard → auto-subscription
- [ ] Login as admin → admin@golfgive.com / admin123
- [ ] Add 6 scores → confirm only 5 kept (oldest removed)
- [ ] Add score for duplicate date → confirm error shown
- [ ] Admin: create draw → simulate → publish
- [ ] User: check if they appear in winners after draw
- [ ] User: submit proof → Admin: approve → mark paid
- [ ] Cancel subscription → confirm score entry blocked
- [ ] Add charity via Admin panel → appears in registration
- [ ] Test on mobile — full responsive layout

---

## 🎨 DESIGN SYSTEM

- **Theme:** Dark luxury — deep charcoal backgrounds, emerald green accent, gold highlights
- **Fonts:** Playfair Display (headings) + DM Sans (body)
- **Colors:** `--accent: #22c55e` (emerald) · `--gold: #f59e0b` · `--bg-primary: #0a0c0f`
- **No golf clichés** — emotion-first design leading with charity impact
