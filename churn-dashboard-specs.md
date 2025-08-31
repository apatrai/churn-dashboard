# Churn Analysis Dashboard Specifications - UPDATED

## Overview
React-based churn analysis dashboard with cumulative CSV upload capability, duplicate detection, and comprehensive filtering/visualization features. The dashboard maintains all historical data across multiple uploads.

## CRITICAL IMPLEMENTATION NOTES
- **Write() has PATH ISSUES** - Works but may write to wrong location if working directory is incorrect
- **Always start with** `cd C:\Users\work\churn-dashboard` to ensure correct working directory
- **Tailwind CSS version conflicts** - Always use Tailwind 3.3.0, PostCSS 8.4.31, Autoprefixer 10.4.16
- **TypeScript + Recharts has compatibility issues** - May need to comment out charts or use type assertions
- **App.tsx must be manually verified** - Often doesn't get updated by Claude Code
- **SKIP_PREFLIGHT_CHECK** - Add to .env file if version conflicts persist

## Tech Stack
- React 18 with hooks (useState, useEffect, useMemo)
- TypeScript
- Recharts for visualizations (may have type errors)
- Tailwind CSS 3.x for styling
- Papaparse for CSV parsing
- Lucide-react for icons

## DEPENDENCY VERSIONS (CRITICAL)
Always install specific versions to avoid conflicts:
```json
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "recharts": "^2.5.0",
  "papaparse": "^5.4.0",
  "lucide-react": "^0.263.1",
  "date-fns": "^2.30.0"
},
"devDependencies": {
  "tailwindcss": "^3.3.0",
  "postcss": "^8.4.31",
  "autoprefixer": "^10.4.16",
  "@types/papaparse": "^5.3.7"
}
```

## CSV Data Structure (MUST MATCH EXACTLY)
Required columns:
- Email
- Stripe User ID (unique identifier for duplicates)
- Plans
- Activity
- MRR Cancelled (negative values)
- Cancellation date
- Sign Up Date
- Seats
- Months Subscribed
- Country
- CRM (contains: No_CRM, Pipedrive, HubSpot, etc.)

## Core Features Implemented

### 1. Data Upload
- CSV file upload with drag-and-drop
- Validates required columns
- **Cumulative data handling**:
  - Appends to existing dataset
  - Checks duplicates using Stripe User ID
  - Shows "X new records, Y duplicates skipped"
- localStorage persistence (key: 'churnDashboardData')

### 2. Key Metrics Cards
- Total Churned Customers
- Total MRR Lost (sum of |MRR Cancelled|)
- Average MRR per Customer
- Monthly vs Annual breakdown

### 3. Filters Section (ALL WORKING)
- Date range (start/end date pickers)
- Plan dropdown (single select)
- Country dropdown (single select)
- CRM dropdown (reads from CRM column)
- MRR range (min/max)
- Seats range (min/max)
- Tenure range (min/max months subscribed)
- Clear all filters button

### 4. Visualizations

#### 4.1 Churn by Plan (Bar Chart)
- Shows customer count and MRR lost per plan
- Sorted by MRR impact

#### 4.2 Geographic Distribution (Bar Chart)
- Top 15 countries by churn count

#### 4.3 Tenure Distribution (Pie Chart)
- Segments: 0-3, 4-6, 7-12, 13-24, 25+ months

#### 4.4 Churn Trend (Line Chart)
- Toggle: Monthly vs Quarterly view
- Shows customer count and MRR lost over time

### 5. Data Tables

#### 5.1 Top Churning Plans Table
- Shows top 5 plans by MRR impact
- Columns: Plan Name | Customers | MRR Lost | Avg MRR

#### 5.2 Top Churning Countries Table
- Shows top 10 countries
- Includes percentage of total churn

## File Structure
```
src/
  App.tsx (imports ChurnDashboard)
  index.tsx (must import './index.css')
  index.css (contains Tailwind directives)
  components/
    Tables/  (subfolder for table components)
    ChurnDashboard.tsx (main component)
    FileUpload.tsx
    MetricsCards.tsx
    FiltersSection.tsx
    DashboardCharts.tsx
    DataTable.tsx
```

## Known Issues & Workarounds
1. **Recharts TypeScript errors**: Comment out charts or use type assertions
2. **Write() doesn't work**: Use bash commands for file creation
3. **Context window limits**: Keep instructions concise
4. **Path issues**: Always verify working directory

## Tech Stack
- React with hooks (useState, useEffect, useMemo)
- Recharts for visualizations
- Tailwind CSS for styling
- Papaparse for CSV parsing
- Lucide-react for icons

## Core Features

### 1. Data Upload
- CSV file upload interface with drag-and-drop support
- Validate CSV has required columns:
  - Email, Stripe User ID, Plans, Activity, MRR Cancelled
  - Cancellation date, Sign Up Date, Seats, Months Subscribed, Country
- **Cumulative data handling**:
  - Append new data to existing dataset (not replace)
  - Check for duplicates using Stripe User ID as unique key
  - Show duplicate detection results before confirming upload
  - Display: "X new records found, Y duplicates skipped"
- Show upload progress and data preview
- Option to view/export current complete dataset
- Data persistence using localStorage to maintain data between sessions
  - Note: For production with large datasets, consider IndexedDB or backend storage

### 2. Key Metrics Cards
Display 4 metric cards at top:
- Total Churned Customers (count)
- Total MRR Lost (sum of |MRR Cancelled|)
- Average Customer Lifetime (avg Months Subscribed)
- Average MRR per Customer

### 3. Filters Section
Interactive filters that update all visualizations:
- Date range (start/end date pickers)
- Plan dropdown (single select)
- Country dropdown (single select)
- MRR range (min/max number inputs)
- Clear all filters button

### 4. Visualizations

#### 4.1 Churn by Plan (Bar Chart)
- X-axis: Plan names (cleaned, remove suffixes)
- Y-axis: Dual axis - Customer count & MRR lost
- Sort by MRR impact descending

#### 4.2 Geographic Distribution (Bar Chart)
- Show top 15 countries by churn count
- X-axis: Country codes
- Y-axis: Customer count

#### 4.3 Tenure Distribution (Pie Chart)
- Segments: 0-3, 4-6, 7-12, 13-24, 25+ months
- Show percentage labels
- Use distinct colors

#### 4.4 Churn Trend (Line Chart)
- Toggle: Monthly vs Quarterly view
- Dual axis: Customer count & MRR lost
- X-axis: Time periods
- Auto-scale based on data range

### 5. Data Tables

#### 5.1 Top Churning Plans Table
Columns: Plan Name | Customers | MRR Lost | Avg MRR
- Show top 5 plans
- Sort by total MRR impact

#### 5.2 Top Churning Countries Table
Columns: Country | Customers | MRR Lost | % of Total
- Show top 10 countries
- Include percentage of total churn

## Data Processing Requirements
- Handle negative MRR values (use absolute values)
- Clean plan names (remove billing suffixes)
- Parse dates correctly
- Handle missing/null values gracefully
- Calculate all metrics dynamically based on filters
- **Duplicate checking logic**:
  - Use Stripe User ID as primary unique identifier
  - If duplicate found, keep existing record (don't overwrite)
  - Log duplicate records for user visibility
  - Option to force update duplicates if needed

## UI/UX Requirements
- Responsive design (mobile-friendly)
- Loading states during data processing
- Error handling for invalid CSV formats
- Hover tooltips on all chart elements
- Smooth transitions when filters change
- Gray background, white cards with shadows
- Clear visual hierarchy
- **Data management UI**:
  - Show total records count in header
  - "Last upload: [date]" indicator
  - Upload history modal/dropdown
  - Clear all data button with confirmation
  - Export current dataset option

## File Structure
```
src/
  ChurnDashboard.jsx (main component)
  components/
    FileUpload.jsx
    MetricsCards.jsx
    FiltersSection.jsx
    Charts/
      ChurnByPlan.jsx
      GeographicChart.jsx
      TenureChart.jsx
      TrendChart.jsx
    Tables/
      TopPlansTable.jsx
      TopCountriesTable.jsx
```

## Cumulative Upload Workflow
1. User uploads CSV file
2. System validates columns and data format
3. System checks each row against existing data using Stripe User ID
4. Display preview:
   - "Found X total records in file"
   - "Y new unique records will be added"
   - "Z duplicate records will be skipped"
   - Show sample of new vs duplicate records
5. User confirms upload
6. New records are appended to dataset
7. Update localStorage with new complete dataset
8. Refresh all visualizations with updated data
9. Log upload in history with timestamp

## State Management
- allData: Complete cumulative dataset (persisted in localStorage)
- filteredData: Data after filters applied
- filters: Current filter selections
- timeView: 'month' or 'quarter'
- loading/error states
- uploadStats: { newRecords: 0, duplicates: 0, errors: 0 }
- dataHistory: Track upload history with timestamps

## Edge Cases to Handle
- Empty CSV files
- Missing required columns
- Invalid date formats
- Very large datasets (10,000+ cumulative rows)
- No data after filters applied
- **Cumulative upload scenarios**:
  - All records are duplicates
  - Stripe User ID is missing/null
  - Same customer with updated information
  - localStorage size limits (5-10MB)
  - Corrupted localStorage data

## Performance Considerations
- Use useMemo for expensive calculations
- Debounce filter inputs
- Lazy load chart components
- Optimize re-renders with React.memo where needed

## Claude Code Example Prompt
```
Build a React churn analysis dashboard following the specifications in churn-dashboard-specs.md. 
Key requirements:
- CSV uploads should ADD to existing data, not replace it
- Use Stripe User ID to detect and skip duplicate records
- Store cumulative data in localStorage for persistence
- Show upload preview with new vs duplicate record counts
- Include data management features (view total records, clear data, export)
```

## SETUP FROM SCRATCH (Prevents Issues)
```bash
npx create-react-app churn-dashboard --template typescript
cd churn-dashboard
npm install -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.16
npx tailwindcss init -p
npm install recharts@2.5.0 papaparse@5.4.0 lucide-react@0.263.1 date-fns@2.30.0
npm install -D @types/papaparse@5.3.7
echo "SKIP_PREFLIGHT_CHECK=true" > .env

# Update src/index.css with:
# @tailwind base;
# @tailwind components;
# @tailwind utilities;
```