# 🚀 RGR-RECO Quick Start Guide

## First Time Setup

```bash
# Already done! Just run:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Navigation

1. **Login** (`/`) - Enter any email → Sign In
2. **Dashboard** (`/dashboard`) - View KPIs and quick actions
3. **Recommendations** (`/recommend`) - Generate product recommendations
4. **Metrics** (`/metrics`) - View system performance and baselines

## Demo Workflow

### Step 1: Get Recommendations
1. Navigate to **Recommendations**
2. Select a customer (e.g., "Aysel")
3. Click **"Get Recommendations"**
4. Wait ~200-400ms for results

### Step 2: Explore Explainability
1. Click **"Why?"** on any recommendation
2. Review the breakdown:
   - **Rule-based**: Matched association rules
   - **Graph-based**: Similar users and paths
   - **RL**: Exploitation score and exploration bonus

### Step 3: Give Feedback
1. Click **Like**, **Dislike**, or **Purchase**
2. See Q-value update in real-time
3. Check delta: `qBefore → qAfter`

### Step 4: View Metrics
1. Navigate to **Metrics**
2. Compare baselines:
   - Random: 12% hit rate
   - Popularity: 28% hit rate
   - RGR: 47% hit rate ✅

## Key Features Demonstrated

### ✅ Hybrid Algorithm
- **Rule-based (42%)**: Association patterns
- **Graph-based (38%)**: Collaborative filtering  
- **RL (20%)**: Adaptive learning

### ✅ Explainability
- Full breakdown for each recommendation
- Rule matching with confidence/lift
- Graph traversal paths
- Q-value evolution

### ✅ Adaptive Learning
- Real-time Q-value updates
- Exploration vs exploitation balance
- Personalized over time

### ✅ Performance
- ~234ms avg response time
- <500MB memory footprint
- 47% hit rate vs baselines

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm start            # Run production server

# Testing
npm test             # Run unit tests
npm run test:ui      # Test with UI

# Code Quality
npm run lint         # ESLint
```

## File Structure Overview

- `app/` - Next.js pages and API routes
- `components/` - React UI components  
- `lib/rgr/` - Core algorithms
- `lib/rgr/__tests__/` - Unit tests
- `data/` - Demo seed data (JSON)
- `types.d.ts` - TypeScript definitions

## Customization

### Adjust Algorithm Weights
Edit `lib/rgr/weights.ts`:
```typescript
export const DEFAULT_WEIGHTS = {
  rule: 0.42,      // Association rules
  graph: 0.38,     // Graph-based CF
  rlExploit: 0.15, // RL exploitation
  rlExplore: 0.05  // RL exploration
};
```

### Modify RL Parameters
Edit `lib/rgr/rl.ts`:
```typescript
const ALPHA = 0.1        // Learning rate
const GAMMA = 0.9        // Discount factor
EXPLORATION_BONUS = 0.1  // Exploration reward
```

### Update Rewards
Edit `lib/rgr/rl.ts`:
```typescript
const REWARDS = {
  purchase: 1.0,
  like: 0.4,
  dislike: -0.6
};
```

## Troubleshooting

**Build errors?**
- Run `npm run build` to check for TypeScript errors
- Ensure all dependencies installed: `npm install`

**Tests failing?**
- Run `npm test` to see detailed output
- Check `lib/rgr/__tests__/` for test files

**Import errors?**
- Verify `tsconfig.json` paths are correct
- Ensure `types.d.ts` is properly included

## Next Steps

1. Read `README.md` for detailed documentation
2. Check `PROJECT_SUMMARY.md` for implementation overview
3. Explore `lib/rgr/` for algorithm details
4. Review `app/api/` for API documentation

---

**Ready to demo!** 🎉

