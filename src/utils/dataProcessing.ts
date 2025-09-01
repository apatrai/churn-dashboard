import { ChurnRecord, ChartDataPoint } from '../types';

export const parseCSVData = (csvRow: any): ChurnRecord => {
  return {
    email: csvRow['Email'] || csvRow['email'] || '',
    stripeUserId: csvRow['Stripe User ID'] || csvRow['stripeUserId'] || '',
    plans: csvRow['Plans'] || csvRow['plans'] || '',
    activity: csvRow['Activity'] || csvRow['activity'] || '',
    mrrCancelled: Math.abs(parseFloat(csvRow['MRR Cancelled'] || csvRow['mrrCancelled'] || '0')),
    cancellationDate: csvRow['Cancellation date'] || csvRow['cancellationDate'] || '',
    signUpDate: csvRow['Sign Up Date'] || csvRow['signUpDate'] || '',
    seats: parseInt(csvRow['Seats'] || csvRow['seats'] || '1', 10),
    monthsSubscribed: parseInt(csvRow['Months Subscribed'] || csvRow['monthsSubscribed'] || '0', 10),
    country: csvRow['Country'] || csvRow['country'] || '',
    crm: csvRow['CRM'] || csvRow['crm'] || 'No_CRM'
  };
};

export const cleanPlanName = (plan: string): string => {
  // Remove billing suffixes like "(Monthly)", "(Annual)", etc.
  return plan.replace(/\s*\([^)]*\)\s*$/, '').trim();
};

export const filterByCRM = (records: ChurnRecord[], crmValue: string): ChurnRecord[] => {
  if (crmValue === 'all') {
    return records;
  }
  
  // Filter by exact CRM value from the CSV
  return records.filter(record => record.crm === crmValue);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const calculateDateRange = (days: number): Date => {
  const now = new Date();
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

export const groupDataByMonth = (data: ChurnRecord[]): Map<string, ChurnRecord[]> => {
  const grouped = new Map<string, ChurnRecord[]>();
  
  data.forEach(item => {
    if (!item.cancellationDate) return;
    const date = new Date(item.cancellationDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(item);
  });
  
  return grouped;
};

export const groupDataByQuarter = (data: ChurnRecord[]): Map<string, ChurnRecord[]> => {
  const grouped = new Map<string, ChurnRecord[]>();
  
  data.forEach(item => {
    if (!item.cancellationDate) return;
    const date = new Date(item.cancellationDate);
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const quarterKey = `${date.getFullYear()}-Q${quarter}`;
    
    if (!grouped.has(quarterKey)) {
      grouped.set(quarterKey, []);
    }
    grouped.get(quarterKey)!.push(item);
  });
  
  return grouped;
};

export const getTenureSegment = (months: number): string => {
  if (months <= 3) return '0-3 months';
  if (months <= 6) return '4-6 months';
  if (months <= 12) return '7-12 months';
  if (months <= 24) return '13-24 months';
  return '25+ months';
};

export const getChurnByPlan = (data: ChurnRecord[]): ChartDataPoint[] => {
  const planData = new Map<string, { customers: number; mrrLost: number }>();
  
  data.forEach(record => {
    // Keep the full plan name including (default_monthly) for proper grouping
    const planName = record.plans || 'Unknown';
    if (!planData.has(planName)) {
      planData.set(planName, { customers: 0, mrrLost: 0 });
    }
    const current = planData.get(planName)!;
    current.customers++;
    // Use absolute value for MRR since values are stored as negative
    current.mrrLost += Math.abs(record.mrrCancelled);
  });
  
  return Array.from(planData.entries())
    .map(([plan, data]) => ({
      name: plan,
      plan,
      customers: data.customers,
      mrrLost: data.mrrLost,
      avgMRR: data.mrrLost / data.customers
    }))
    .sort((a, b) => b.mrrLost - a.mrrLost);
};

export const getGeographicDistribution = (data: ChurnRecord[]): ChartDataPoint[] => {
  const countryData = new Map<string, number>();
  
  data.forEach(record => {
    if (record.country) {
      countryData.set(record.country, (countryData.get(record.country) || 0) + 1);
    }
  });
  
  return Array.from(countryData.entries())
    .map(([country, count]) => ({
      name: country,
      country,
      value: count,
      customers: count
    }))
    .sort((a, b) => b.value! - a.value!)
    .slice(0, 15);
};

export const getTenureDistribution = (data: ChurnRecord[]): ChartDataPoint[] => {
  const segments = new Map<string, number>();
  const segmentOrder = ['0-3 months', '4-6 months', '7-12 months', '13-24 months', '25+ months'];
  
  data.forEach(record => {
    const segment = getTenureSegment(record.monthsSubscribed);
    segments.set(segment, (segments.get(segment) || 0) + 1);
  });
  
  const total = data.length;
  
  return segmentOrder.map(segment => ({
    name: segment,
    label: segment,
    value: segments.get(segment) || 0,
    percentage: total > 0 ? ((segments.get(segment) || 0) / total) * 100 : 0
  }));
};

export const getChurnTrend = (data: ChurnRecord[], timeView: 'month' | 'quarter'): ChartDataPoint[] => {
  const grouped = timeView === 'month' ? groupDataByMonth(data) : groupDataByQuarter(data);
  
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, records]) => ({
      period,
      [timeView]: period,
      customers: records.length,
      mrrLost: records.reduce((sum, r) => sum + r.mrrCancelled, 0)
    }));
};

export const getTopPlans = (data: ChurnRecord[], limit: number = 5): ChartDataPoint[] => {
  return getChurnByPlan(data).slice(0, limit);
};

export const getCRMStats = (data: ChurnRecord[]): ChartDataPoint[] => {
  const crmStats = new Map<string, { customers: number; mrrLost: number }>();
  
  data.forEach(record => {
    const crmValue = record.crm || 'No_CRM';
    
    if (!crmStats.has(crmValue)) {
      crmStats.set(crmValue, { customers: 0, mrrLost: 0 });
    }
    
    const current = crmStats.get(crmValue)!;
    current.customers++;
    current.mrrLost += record.mrrCancelled;
  });
  
  return Array.from(crmStats.entries())
    .map(([name, data]) => ({
      name,
      customers: data.customers,
      mrrLost: data.mrrLost,
      avgMRR: data.mrrLost / data.customers
    }))
    .sort((a, b) => b.mrrLost - a.mrrLost);
};

export const getTopCountries = (data: ChurnRecord[], limit: number = 10): ChartDataPoint[] => {
  const countryData = new Map<string, { customers: number; mrrLost: number }>();
  const total = data.length;
  
  data.forEach(record => {
    // Handle empty/null countries as 'Unknown'
    const countryName = record.country || 'Unknown';
    
    if (!countryData.has(countryName)) {
      countryData.set(countryName, { customers: 0, mrrLost: 0 });
    }
    const current = countryData.get(countryName)!;
    current.customers++;
    // Use absolute value for MRR since values are stored as negative
    current.mrrLost += Math.abs(record.mrrCancelled);
  });
  
  return Array.from(countryData.entries())
    .map(([country, data]) => ({
      country,
      name: country,
      customers: data.customers,
      mrrLost: data.mrrLost,
      percentOfTotal: total > 0 ? (data.customers / total) * 100 : 0
    }))
    .sort((a, b) => b.mrrLost - a.mrrLost)
    .slice(0, limit);
};

export const exportToCSV = (data: ChurnRecord[], filename?: string): void => {
  const headers = [
    'Email',
    'Stripe User ID',
    'Plans',
    'Activity',
    'MRR Cancelled',
    'Cancellation date',
    'Sign Up Date',
    'Seats',
    'Months Subscribed',
    'Country',
    'CRM'
  ];
  
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.email,
      row.stripeUserId,
      row.plans,
      row.activity,
      row.mrrCancelled,
      row.cancellationDate,
      row.signUpDate,
      row.seats,
      row.monthsSubscribed,
      row.country,
      row.crm
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `churn_data_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};