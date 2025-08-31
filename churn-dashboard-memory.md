# Churn Dashboard - Critical Memory Points

## 🚨 CRITICAL BUGS IN CLAUDE CODE
1. **Write() PATH ISSUES** - Works but writes to wrong location if not in project directory
   - Solution: Always `cd churn-dashboard` first, or use bash commands
2. **App.tsx often not updated** - Still shows React logo
   - Solution: Manually check and update App.tsx
3. **Working directory confusion** - CC must be in project folder
   - Solution: Always start with `cd C:\Users\work\churn-dashboard`

## 📁 Project Location & Structure
```
C:\Users\work\churn-dashboard\
  src/
    components/
      Tables/        <- Subfolder exists!
      ChurnDashboard.tsx
      DashboardCharts.tsx
      DataTable.tsx
      FileUpload.tsx
      FiltersSection.tsx
      MetricsCards.tsx
```

## 🔧 Quick Fixes When Things Break

### If you see React logo instead of dashboard:
```bash
cd churn-dashboard
type src\App.tsx  # Check if it imports ChurnDashboard
# If not, manually update App.tsx to:
# import ChurnDashboard from './components/ChurnDashboard';
# function App() { return <ChurnDashboard />; }
```

### If TypeScript/Recharts errors:
```bash
echo "SKIP_PREFLIGHT_CHECK=true" > .env
# Or comment out DashboardCharts component temporarily
```

### If styles are missing:
- Ensure src/index.css exists with Tailwind directives
- Check that index.tsx imports './index.css'

## 📊 CSV Structure (EXACT column names)
- Email
- Stripe User ID (for duplicate detection)
- Plans
- Activity
- MRR Cancelled (negative values)
- Cancellation date
- Sign Up Date  
- Seats
- Months Subscribed
- Country
- CRM (No_CRM, Pipedrive, HubSpot, etc.)

Test data file: "Churn Sheet1.csv" (416 rows)

## 🔄 Starting New Claude Code Session

### BEST PRACTICE - Use .claude-context file:
```bash
cd C:\Users\work\churn-dashboard
cat .claude-context  # This file points to specs and memory docs
```

### Recommended .claude-context content:
```
PROJECT: Churn Dashboard
LOCATION: C:\Users\work\churn-dashboard

MUST READ BEFORE ANY WORK:
1. Read churn-dashboard-specs.md - Contains ALL technical requirements
2. Read churn-dashboard-memory.md - Contains critical bugs and solutions

CRITICAL DEPENDENCIES (use exact versions):
- tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.16
- If PostCSS errors: echo "SKIP_PREFLIGHT_CHECK=true" > .env

BEFORE ANY WORK:
cd C:\Users\work\churn-dashboard
pwd                     # Verify location
cat src/App.tsx        # Check if imports ChurnDashboard
npm start              # Check current state
```

### Essential First Message:
```
cd C:\Users\work\churn-dashboard && cat .claude-context
Then read churn-dashboard-specs.md for full requirements
```

### Before Making Changes:
```bash
pwd                    # MUST show churn-dashboard folder
ls src/components/     # Verify what exists
cat src/App.tsx       # Check if imports ChurnDashboard
npm start             # See current state
```

## ✅ What's Working (as of Aug 19, 2025)
- File upload with drag-and-drop
- Duplicate detection using Stripe User ID
- All filters working:
  - Date range, Plan, Country
  - CRM (reads from column K: No_CRM, Pipedrive, HubSpot)
  - MRR range, Seats range, Tenure range
- Metrics calculation (Total MRR Lost shows correctly)
- Charts display real data (not random)
- localStorage persistence ('churnDashboardData')
- Data export to CSV
- Cumulative data uploads (adds to existing data)
- Tables show correct top churning plans/countries

## 🎯 Next Features to Build
- Enhanced drill-down capabilities
- Cohort analysis
- Predictive churn indicators
- Email notifications for high-value churn
- API integration for automated uploads

## 🐛 Common Issues & Solutions

### 1. **Tailwind CSS not working**
```bash
# Use specific versions:
npm uninstall tailwindcss postcss autoprefixer
npm install -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.16
npm start
```

### 2. **PostCSS plugin errors**
```bash
echo "SKIP_PREFLIGHT_CHECK=true" > .env
npm start
```

### 3. **localStorage corruption (blank page/errors)**
```javascript
// In browser console:
localStorage.clear()
location.reload()
```

### 4. **TypeScript + Recharts errors**
- Comment out `<DashboardCharts />` temporarily
- Or add `// @ts-ignore` above chart components

### 5. **Files not updating (Write() issue)**
- Always verify with `cat filename` after Write()
- Use bash commands if Write() fails

### 6. **React logo still showing**
- Manually update App.tsx:
```javascript
import ChurnDashboard from './components/ChurnDashboard';
function App() { return <ChurnDashboard />; }
export default App;
```