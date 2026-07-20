# Family Finance Tracker — Revised Implementation Plan

A **modern, sleek** family finance tracker with income & expense tracking, lending/borrowing, budgets, and rich analytics. Built with **Expo (React Native)** + **Firebase**. Dark mode, professional UI, offline-first.

---

## Stack & Free Tier

| Layer | Tech | Free Limits |
|---|---|---|
| Frontend | Expo (React Native) + Expo Router | Free & open-source |
| Auth | Firebase Auth (Email/Password) | Unlimited |
| Database | Cloud Firestore | 1 GB, 50K reads/day, 20K writes/day |
| Charts | `react-native-chart-kit` or `victory-native` | Free |
| Icons | `@expo/vector-icons` (MaterialCommunityIcons) | Free |
| Offline | Firestore built-in persistence | Automatic |
| Build | EAS Build | 30 free builds/month |

> [!NOTE]
> For 4 members with daily usage, expect ~500-1000 reads/day and ~30-80 writes/day — **~2% of the free tier**. You're safe.

---

## Feature Breakdown

### 1. Authentication (Option B — Individual Accounts)
- Each family member registers with their own **email + password**
- First person creates the family → gets a **6-digit Family Code**
- Other members enter this code during sign-up to join the family
- Each person's name is tied to their account
- Multiple devices per person supported (same login)

### 2. Current Balance
- **Balance = Total Income − Total Expenses** (calculated in real-time)
- Displayed prominently on the home screen as a large number
- Shows ↑ or ↓ trend compared to last month
- Family-wide balance (combined), not per-member

### 3. Income Tracking
- Add income with:
  - **Amount** (₹)
  - **Source category**: `Salary`, `Business/Freelance`, `Gift/Received`, `Interest/Returns`, `Refund`, `Cashback`, `Rental Income`, `Other`
  - **Note** (optional)
  - **Date**
  - **Received by** (which family member)
- Monthly income summary on dashboard

### 4. Expense Tracking
- Add expense with:
  - **Amount** (₹)
  - **Category** (Indian-style defaults, see below)
  - **Note** (optional)
  - **Date** (defaults to today)
  - **Paid by** (auto-filled with logged-in member)
- Quick-add from home screen

### 5. Lending & Borrowing Tracker
A dedicated section to track money flows with people outside the family:

#### Money Lent (Diya Hua)
- Who you lent to (person name)
- Amount
- Date
- Reason/Note
- Expected return date (optional)
- Status: `Pending` → `Partially Returned` → `Settled`
- Record partial returns with dates

#### Money Borrowed (Liya Hua)
- Who you borrowed from
- Amount, date, reason
- Track repayments the same way

#### Dashboard shows:
- **Total lent out** (pending) — "₹12,000 bahar hai"
- **Total borrowed** (pending) — "₹5,000 wapas karna hai"
- **Net lending position**

### 6. Monthly Budget
- Set a **total monthly budget** (e.g., ₹50,000)
- Optionally set **category-wise budgets** (e.g., Food: ₹10,000, Transport: ₹3,000)
- Dashboard shows:
  - **Budget progress bar** — how much used vs remaining
  - **Daily budget** = Remaining budget ÷ Days left in month (auto-calculated)
  - **Over-budget alert** — red warning when exceeded
- Budget comparison across months (trend)

### 7. Analytics & Graphs (Detailed but Simple)

| Chart | What It Shows |
|---|---|
| **Donut Chart** | Category-wise expense split for current month |
| **Income vs Expense Bar** | Side-by-side bars for each month (last 6 months) |
| **Spending Trend Line** | Total monthly expenses over time (last 6-12 months) |
| **Category Trend** | How spending in each category changes month-to-month |
| **Member Breakdown** | Who's spending how much (horizontal bars) |
| **Budget Utilization** | Progress bars per category showing used vs budget |
| **Daily Spending** | Bar chart showing spending per day this month |
| **Top Spending Categories** | Ranked list with amounts and percentages |
| **Savings Rate** | (Income − Expenses) / Income × 100% per month |

> [!TIP]
> All charts will be interactive — tap a slice/bar to see details. Colors will be consistent per category across all charts.

### 8. Dark Mode
- **Dark mode is the default** — modern fintech aesthetic
- Option to switch to light mode in settings
- Deep dark backgrounds (#0D0D0D, #1A1A1A) with vibrant accent colors
- Proper contrast ratios for readability

### 9. Custom Categories
- Default categories pre-loaded (Indian-style, see below)
- **Add custom categories** from settings
- **Remove/hide categories** you don't use
- Each category has an icon and color

---

## Default Categories (Indian Household)

### Expense Categories
| Category | Icon | Example |
|---|---|---|
| 🛒 Groceries/Sabzi | cart | Vegetables, fruits, ration |
| 🍽️ Food Outside | restaurant | Restaurant, street food, Zomato/Swiggy |
| 🏠 Rent | home | Monthly rent |
| ⚡ Electricity | flash | Bijli bill |
| 💧 Water | water | Water bill, tanker |
| 🔥 Gas/LPG | flame | Gas cylinder, piped gas |
| 📱 Mobile/Recharge | phone | Recharge, phone bill |
| 🌐 Internet/WiFi | wifi | Broadband, data pack |
| 🚗 Transport/Petrol | car | Petrol, auto, Ola/Uber, metro |
| 🏥 Medical/Doctor | medical | Doctor visit, medicines, tests |
| 📚 Education/Tuition | school | School fees, tuition, books |
| 👕 Shopping/Kapde | shopping-bag | Clothes, shoes, accessories |
| 🎬 Entertainment | movie | Movies, Netflix, outings |
| 🏦 EMI/Loan | bank | Home loan, car loan, personal loan EMI |
| 🛡️ Insurance | shield | LIC, health insurance, car insurance |
| 🙏 Donations/Daan | heart | Temple, charity, mandir |
| 🎉 Festival/Tyohaar | party | Diwali, Holi, celebrations |
| 🏡 Household/Saman | couch | Furniture, utensils, appliances |
| 💇 Personal Care | person | Salon, grooming, gym |
| 🧒 Kids | baby | Toys, diapers, baby food |
| 📦 Other | dots | Anything else |

### Income Categories
| Category | Icon |
|---|---|
| 💰 Salary | briefcase |
| 💼 Business/Freelance | laptop |
| 🎁 Gift/Received | gift |
| 🏦 Interest/Returns | trending-up |
| 💸 Refund | refresh |
| 📱 Cashback | phone-check |
| 🏠 Rental Income | building |
| 📦 Other | dots |

---

## App Screens (Total: 8 screens)

```
┌──────────────────────────────────────────────────────┐
│                    APP FLOW                           │
│                                                       │
│  Auth Screens                                         │
│   ├── Login                                           │
│   └── Register (+ Family Code setup/join)             │
│       │                                               │
│       ▼                                               │
│  Tab Navigator (4 tabs)                               │
│   │                                                   │
│   ├── 🏠 Home (Dashboard)                             │
│   │    ├── Current Balance (big)                      │
│   │    ├── Income / Expense this month                │
│   │    ├── Budget progress bar                        │
│   │    ├── Daily budget remaining                     │
│   │    ├── Recent transactions (last 5)               │
│   │    ├── Quick category spending overview           │
│   │    └── Lending summary (total out/in)             │
│   │                                                   │
│   ├── 📊 Analytics                                    │
│   │    ├── Donut: category breakdown                  │
│   │    ├── Bar: income vs expense (6 months)          │
│   │    ├── Line: spending trend                       │
│   │    ├── Member breakdown                           │
│   │    ├── Category trends over months                │
│   │    ├── Budget utilization per category            │
│   │    ├── Daily spending this month                  │
│   │    ├── Savings rate over months                   │
│   │    └── Top spending categories ranked             │
│   │                                                   │
│   ├── 🤝 Lendings                                     │
│   │    ├── Tab: Lent (Diya Hua)                       │
│   │    ├── Tab: Borrowed (Liya Hua)                   │
│   │    ├── Total lent / borrowed / net                │
│   │    ├── Each entry expandable (partial returns)    │
│   │    └── Mark as settled                            │
│   │                                                   │
│   └── ⚙️ Settings                                     │
│        ├── Profile (name, email)                      │
│        ├── Family info + Family Code                  │
│        ├── Manage members                             │
│        ├── Manage categories (add/remove)             │
│        ├── Monthly budget setting                     │
│        ├── Category-wise budgets                      │
│        ├── Dark/Light mode toggle                     │
│        └── Logout                                     │
│                                                       │
│  Modal Screens                                        │
│   ├── Add Transaction (Income/Expense toggle)         │
│   ├── Add Lending (Lent/Borrowed toggle)              │
│   └── Transaction Detail (edit/delete)                │
└──────────────────────────────────────────────────────┘
```

---

## UI Design Direction

### Color Palette (Dark Mode — Default)
```
Background:        #0A0A0F (near black with blue tint)
Surface/Card:      #14141F (elevated surfaces)
Surface Hover:     #1E1E2E (interactive states)
Border:            #2A2A3A (subtle borders)

Primary Accent:    #6C5CE7 (electric violet — primary actions)
Income Green:      #00D68F (money received)
Expense Red:       #FF6B6B (money spent)
Lending Orange:    #FDCB6E (money lent out)
Borrowed Blue:     #74B9FF (money borrowed)

Text Primary:      #FFFFFF
Text Secondary:    #8A8A9A
Text Muted:        #555566
```

### Design Principles
- **Glassmorphism cards** — frosted glass effect with subtle transparency
- **Smooth animations** — screen transitions, number counters, chart reveals
- **Large typography** for key numbers (balance, totals)
- **Consistent spacing** — 8px grid system
- **Bottom sheet modals** for add/edit forms
- **Haptic feedback** on key actions (add, delete)
- **Gradient accents** on primary buttons and headers
- **Rounded corners** (16px on cards, 12px on buttons)
- **Category colors** consistent everywhere (same color for "Food" in charts, lists, and badges)

### Light Mode Variant
```
Background:        #F5F5FA
Surface/Card:      #FFFFFF
Border:            #E8E8F0
Text Primary:      #1A1A2E
Text Secondary:    #6B6B80
(Accent colors remain the same)
```

---

## Firebase Data Model

```
Firestore Database
│
├── families/
│   └── {familyId}/
│       ├── name: "Sharma Family"
│       ├── code: "A3X7K9"                    ← 6-char family join code
│       ├── members: ["Papa", "Mummy", "Rahul", "Priya"]
│       ├── currency: "₹"
│       ├── categories: {
│       │     expense: ["Groceries", "Food Outside", "Rent", ...],
│       │     income: ["Salary", "Business", "Gift", ...]
│       │   }
│       ├── createdAt: timestamp
│       └── createdBy: "userId123"
│
├── transactions/
│   └── {transactionId}/
│       ├── familyId: "fam_abc123"
│       ├── type: "expense" | "income"
│       ├── amount: 450
│       ├── category: "Groceries"
│       ├── note: "Sabzi mandi se"
│       ├── memberName: "Mummy"
│       ├── memberId: "userId456"
│       ├── date: "2026-07-20"
│       ├── month: "2026-07"                  ← denormalized for queries
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── lendings/
│   └── {lendingId}/
│       ├── familyId: "fam_abc123"
│       ├── type: "lent" | "borrowed"
│       ├── personName: "Ramesh Uncle"         ← external person
│       ├── amount: 5000                       ← original amount
│       ├── reason: "Emergency medical"
│       ├── date: "2026-07-15"
│       ├── expectedReturnDate: "2026-08-15"   ← optional
│       ├── memberName: "Papa"                 ← family member involved
│       ├── memberId: "userId123"
│       ├── status: "pending" | "partial" | "settled"
│       ├── returns: [                         ← array of partial returns
│       │     { amount: 2000, date: "2026-07-25", note: "First installment" }
│       │   ]
│       ├── returnedTotal: 2000                ← sum of returns (denormalized)
│       ├── remainingAmount: 3000              ← amount - returnedTotal
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── budgets/
│   └── {budgetId}/                            ← one per family per month
│       ├── familyId: "fam_abc123"
│       ├── month: "2026-07"
│       ├── totalBudget: 50000
│       ├── categoryBudgets: {                 ← optional per-category limits
│       │     "Groceries": 10000,
│       │     "Food Outside": 5000,
│       │     "Transport": 3000
│       │   }
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
└── users/
    └── {userId}/
        ├── email: "rahul@email.com"
        ├── name: "Rahul"
        ├── familyId: "fam_abc123"
        ├── role: "admin" | "member"           ← creator is admin
        ├── createdAt: timestamp
        └── lastLoginAt: timestamp
```

> [!IMPORTANT]
> **Query patterns optimized for free tier:**
> - All monthly queries use the `month` field index → no full-collection scans
> - `returnedTotal` and `remainingAmount` are denormalized on lendings to avoid reading the entire `returns` array for summaries
> - Budget is one document per month per family → single read to get budget info
> - Balance is calculated client-side from monthly aggregates, not stored (avoids race conditions with offline sync)

---

## Budget & Daily Budget Logic

```
Monthly Budget Setting:
  User sets: totalBudget = ₹50,000 for July 2026
  Optional: categoryBudgets = { Groceries: ₹10,000, Transport: ₹3,000, ... }

Dashboard Calculations:
  totalSpent     = sum of all expenses this month
  budgetUsed%    = (totalSpent / totalBudget) × 100
  remaining      = totalBudget - totalSpent
  daysLeft       = daysInMonth - currentDayOfMonth + 1
  dailyBudget    = remaining / daysLeft

  Example for July 20:
    totalBudget  = ₹50,000
    totalSpent   = ₹28,000
    remaining    = ₹22,000
    daysLeft     = 12 (July 20-31)
    dailyBudget  = ₹1,833/day

Color coding:
  0-60%  used → Green  (on track)
  60-85% used → Yellow (watch out)
  85-100% used → Orange (almost done)
  >100%  used → Red    (over budget!)
```

---

## Project Structure

```
Expense-Tracker/
├── app/                              # Expo Router screens
│   ├── _layout.tsx                   # Root layout (theme provider, auth gate)
│   ├── index.tsx                     # Redirect based on auth
│   │
│   ├── (auth)/                       # Auth flow (unauthenticated)
│   │   ├── login.tsx                 # Login screen
│   │   └── register.tsx              # Register + create/join family
│   │
│   ├── (tabs)/                       # Main app (authenticated)
│   │   ├── _layout.tsx              # Bottom tab navigator
│   │   ├── home.tsx                  # Dashboard
│   │   ├── analytics.tsx            # Charts & graphs
│   │   ├── lendings.tsx             # Lending/Borrowing tracker
│   │   └── settings.tsx             # Settings & preferences
│   │
│   ├── add-transaction.tsx          # Modal: Add income/expense
│   ├── add-lending.tsx              # Modal: Add lent/borrowed
│   ├── transaction-detail.tsx       # Modal: View/edit/delete transaction
│   ├── lending-detail.tsx           # Modal: View lending, record returns
│   ├── manage-categories.tsx        # Modal: Add/remove categories
│   └── set-budget.tsx               # Modal: Set monthly/category budgets
│
├── components/                       # Reusable UI components
│   ├── ui/                          # Base UI components
│   │   ├── Card.tsx                 # Glassmorphism card
│   │   ├── Button.tsx               # Primary/secondary buttons
│   │   ├── Input.tsx                # Styled text input
│   │   ├── Badge.tsx                # Category badge with color
│   │   ├── ProgressBar.tsx          # Budget progress bar
│   │   ├── BottomSheet.tsx          # Bottom sheet modal
│   │   └── Toggle.tsx               # Dark/light mode toggle
│   │
│   ├── home/                        # Dashboard components
│   │   ├── BalanceCard.tsx          # Current balance display
│   │   ├── IncomeExpenseSummary.tsx # Income/Expense for month
│   │   ├── BudgetProgress.tsx       # Budget bar + daily budget
│   │   ├── RecentTransactions.tsx   # Last 5 transactions
│   │   ├── LendingSummary.tsx       # Quick lending overview
│   │   └── QuickCategoryView.tsx    # Top spending categories
│   │
│   ├── analytics/                   # Chart components
│   │   ├── DonutChart.tsx           # Category breakdown
│   │   ├── IncomeExpenseBar.tsx     # Monthly comparison bars
│   │   ├── SpendingTrend.tsx        # Line chart over months
│   │   ├── MemberBreakdown.tsx      # Per-member spending
│   │   ├── CategoryTrend.tsx        # Category over months
│   │   ├── BudgetUtilization.tsx    # Budget vs actual per category
│   │   ├── DailySpending.tsx        # Daily bar chart
│   │   ├── SavingsRate.tsx          # Savings % over months
│   │   └── TopCategories.tsx        # Ranked category list
│   │
│   ├── transactions/                # Transaction components
│   │   ├── TransactionCard.tsx      # Single transaction item
│   │   ├── FilterBar.tsx            # Filter chips
│   │   └── CategoryPicker.tsx       # Category grid selector
│   │
│   └── lendings/                    # Lending components
│       ├── LendingCard.tsx          # Single lending item
│       ├── ReturnEntry.tsx          # Partial return record
│       └── LendingStats.tsx         # Total lent/borrowed/net
│
├── lib/                              # Core business logic
│   ├── firebase.ts                  # Firebase config & init
│   ├── auth.ts                      # Auth functions (login, register, family code)
│   ├── transactions.ts             # CRUD for income/expenses
│   ├── lendings.ts                  # CRUD for lending/borrowing
│   ├── budgets.ts                   # Budget CRUD & calculations
│   ├── analytics.ts                # Data aggregation for charts
│   └── types.ts                     # TypeScript interfaces
│
├── hooks/                            # Custom React hooks
│   ├── useAuth.ts                   # Auth state management
│   ├── useTransactions.ts          # Real-time transaction data
│   ├── useLendings.ts              # Real-time lending data
│   ├── useBudget.ts                # Budget data & daily calc
│   ├── useFamily.ts                # Family info & members
│   ├── useAnalytics.ts            # Aggregated chart data
│   └── useTheme.ts                 # Dark/light mode state
│
├── context/                          # React context providers
│   ├── AuthContext.tsx              # Auth state provider
│   └── ThemeContext.tsx             # Theme provider (dark/light)
│
├── constants/                        # App constants
│   ├── categories.ts               # Default categories + icons + colors
│   ├── colors.ts                   # Dark & light theme colors
│   └── config.ts                   # App configuration
│
├── utils/                            # Utility functions
│   ├── formatCurrency.ts           # ₹ formatting (₹1,23,456 Indian style)
│   ├── dateUtils.ts                # Date helpers
│   └── calculations.ts            # Budget, balance calculations
│
├── assets/                          # Static assets
│   └── fonts/                      # Custom fonts (Inter/Outfit)
│
├── app.json                         # Expo config
├── package.json
├── tsconfig.json
└── firebaseConfig.ts               # Firebase project credentials
```

---

## Key Dependencies

```json
{
  "dependencies": {
    "expo": "~52.x",
    "expo-router": "latest",
    "react-native": "latest",
    "firebase": "^10.x",
    "@react-native-async-storage/async-storage": "latest",
    "react-native-chart-kit": "latest",
    "react-native-svg": "latest",
    "react-native-reanimated": "latest",
    "react-native-gesture-handler": "latest",
    "react-native-safe-area-context": "latest",
    "react-native-screens": "latest",
    "expo-status-bar": "latest",
    "expo-haptics": "latest",
    "expo-font": "latest",
    "@expo/vector-icons": "latest",
    "date-fns": "latest"
  }
}
```

> [!NOTE]
> **`react-native-chart-kit`** gives us bar charts, line charts, pie/donut charts, and progress rings — all we need for analytics. It's lightweight and works with Expo out of the box. If we need more control, we can swap to `victory-native`.

---

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Family members can read/write family doc
    match /families/{familyId} {
      allow read: if request.auth != null;  // needed for family code lookup
      allow write: if request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId == familyId;
    }
    
    // Transactions: only family members
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null 
        && resource.data.familyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId;
      allow create: if request.auth != null;
    }
    
    // Lendings: only family members
    match /lendings/{lendingId} {
      allow read, write: if request.auth != null 
        && resource.data.familyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId;
      allow create: if request.auth != null;
    }
    
    // Budgets: only family members
    match /budgets/{budgetId} {
      allow read, write: if request.auth != null 
        && resource.data.familyId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.familyId;
      allow create: if request.auth != null;
    }
  }
}
```

---

## Currency Formatting (Indian Style)

```typescript
// ₹1,23,456.00 (Indian numbering system)
function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });
}

// Examples:
// 1000      → ₹1,000
// 123456    → ₹1,23,456
// 10000000  → ₹1,00,00,000
```

---

## Implementation Phases

| Phase | What | Estimated Time |
|---|---|---|
| **Phase 1: Setup** | Expo project init, Firebase setup, theme system, base UI components | ~45 min |
| **Phase 2: Auth** | Login, Register, Family Code create/join, auth context | ~45 min |
| **Phase 3: Transactions** | Add income/expense, transaction list, filters, edit/delete | ~60 min |
| **Phase 4: Dashboard** | Balance card, income/expense summary, recent transactions, budget progress | ~45 min |
| **Phase 5: Budget** | Monthly budget setting, category budgets, daily budget calculation | ~30 min |
| **Phase 6: Lendings** | Lent/borrowed CRUD, partial returns, status tracking | ~45 min |
| **Phase 7: Analytics** | All 9 chart types, month selector, data aggregation | ~60 min |
| **Phase 8: Settings** | Category management, theme toggle, family info, profile | ~30 min |
| **Phase 9: Polish** | Animations, haptics, error handling, loading states, offline testing | ~45 min |
| **Phase 10: Build** | APK build via EAS, testing on devices | ~30 min |

**Total estimated: ~7-8 hours of development**

---

## User Review Required

> [!IMPORTANT]
> ### Family Admin Permissions
> Should the family creator (admin) have any special privileges? For example:
> - Only admin can **delete** transactions made by others?
> - Only admin can **change the monthly budget**?
> - Any member can **add/edit categories**?
> 
> Or should all 4 members have **equal access** to everything? (Simpler approach — I'd recommend this for a family app.)

> [!WARNING]
> ### Starting Balance
> The "Current Balance" will be calculated as `Total Income − Total Expenses` from when you start using the app. If you want to enter a **starting balance** (e.g., "we currently have ₹2,00,000"), I can add a one-time "initial balance" field in family settings. Otherwise, balance starts from ₹0 and builds up as you add income. **Which approach do you prefer?**

---

## Verification Plan

### Automated
- TypeScript type checking (`npx tsc --noEmit`)
- Expo doctor (`npx expo doctor`)
- Build validation (`eas build -p android --profile preview --no-wait`)

### Manual Testing
1. **Auth flow**: Register → Create family → Get code → Second device joins with code
2. **Transaction CRUD**: Add income, add expense, edit, delete → verify balance updates
3. **Offline mode**: Airplane mode → add expense → go online → verify sync on other device
4. **Multi-device**: Add expense on phone A → appears on phone B within seconds
5. **Budget**: Set ₹50,000 budget → add expenses → verify progress bar and daily budget math
6. **Lendings**: Lend ₹10,000 → record ₹3,000 return → verify remaining = ₹7,000 → settle
7. **Analytics**: Add varied transactions → verify all 9 charts render correctly
8. **Dark/Light mode**: Toggle → verify all screens look correct in both themes
