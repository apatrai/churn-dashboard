export interface ChurnRecord {
  email: string;
  stripeUserId: string;
  plans: string;
  activity: string;
  mrrCancelled: number;
  cancellationDate: string;
  signUpDate: string;
  seats: number;
  monthsSubscribed: number;
  country: string;
  crm: string;
}

export interface UploadPreview {
  newRecords: number;
  duplicates: number;
  errors: number;
  show: boolean;
  sampleNewRecords?: ChurnRecord[];
  sampleDuplicates?: ChurnRecord[];
}

export interface Filters {
  dateRange: {
    start: string;
    end: string;
  };
  plan: string;
  country: string;
  crmType: string;
  mrrRange: {
    min: number;
    max: number;
  };
  seatsRange: {
    min: number;
    max: number;
  };
  tenureRange: {
    min: number;
    max: number;
  };
}

// CRM filter will use actual values from the CSV CRM column

export interface MetricsData {
  totalChurnedCustomers: number;
  totalMRRLost: number;
  avgCustomerLifetime: number;
  avgMRRPerCustomer: number;
}

export interface ChartDataPoint {
  // For bar charts
  name?: string;
  value?: number;
  customers?: number;
  mrrLost?: number;
  
  // For pie chart
  label?: string;
  percentage?: number;
  
  // For line chart
  period?: string;
  month?: string;
  quarter?: string;
  
  // For tables
  plan?: string;
  country?: string;
  avgMRR?: number;
  percentOfTotal?: number;
}

export interface UploadHistory {
  timestamp: string;
  recordsAdded: number;
  duplicatesSkipped: number;
  totalRecords: number;
}

export interface DataState {
  allData: ChurnRecord[];
  filteredData: ChurnRecord[];
  filters: Filters;
  timeView: 'month' | 'quarter';
  uploadStats: UploadPreview;
  dataHistory: UploadHistory[];
  loading: boolean;
  error: string | null;
}