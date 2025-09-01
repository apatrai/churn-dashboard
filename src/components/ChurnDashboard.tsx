import React, { useState, useEffect } from 'react';
import { Download, Trash2, Eye, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import MetricsCards from './MetricsCards';
import DashboardCharts from './DashboardCharts';
import FiltersSection from './FiltersSection';
import TopPlansTable from './Tables/TopPlansTable';
import TopCountriesTable from './Tables/TopCountriesTable';
import { ChurnRecord, UploadPreview, Filters, UploadHistory } from '../types';
import { exportToCSV, filterByCRM } from '../utils/dataProcessing';
import { supabase } from '../utils/supabase';

const ChurnDashboard: React.FC = () => {
  const [allData, setAllData] = useState<ChurnRecord[]>([]);
  const [filteredData, setFilteredData] = useState<ChurnRecord[]>([]);
  const [filters, setFilters] = useState<Filters>({
    dateRange: { start: '', end: '' },
    plan: 'all',
    country: 'all',
    crmType: 'all',
    mrrRange: { min: 0, max: 999999 },
    seatsRange: { min: 0, max: 999999 },
    tenureRange: { min: 0, max: 999999 }
  });
  const [timeView, setTimeView] = useState<'month' | 'quarter'>('month');
  const [uploadPreview, setUploadPreview] = useState<UploadPreview>({
    newRecords: 0,
    duplicates: 0,
    errors: 0,
    show: false
  });
  const [dataHistory, setDataHistory] = useState<UploadHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load data from localStorage and Supabase on mount
  useEffect(() => {
    console.log('Component mounted, fetching data...');
    console.log('Current allData length at mount:', allData.length);
    
    const loadData = async () => {
      console.log('loadData function started');
      try {
        console.log('Supabase client:', supabase);
        console.log('Supabase type:', typeof supabase);
        
        console.log('Fetching from Supabase...');
        
        // Try to fetch data from Supabase first
        const { data: supabaseData, error } = await supabase
          .from('churn_data')
          .select('*');
        
        console.log('Supabase response:', supabaseData, error);
        console.log('Supabase data:', supabaseData);
        
        if (error) {
          console.log('Supabase error:', error);
        }
        
        if (!error && supabaseData && supabaseData.length > 0) {
          console.log('Processing', supabaseData.length, 'records from Supabase');
          // Convert Supabase data to ChurnRecord format
          const formattedData: ChurnRecord[] = supabaseData.map(record => ({
            email: record.email || '',
            stripeUserId: record.stripe_user_id,
            plans: record.plans || '',
            activity: record.activity || '',
            mrrCancelled: record.mrr_cancelled || 0,
            cancellationDate: record.cancellation_date || '',
            signUpDate: record.sign_up_date || '',
            seats: record.seats || 0,
            monthsSubscribed: record.months_subscribed || 0,
            country: record.country || '',
            crm: record.crm || ''
          }));
          console.log('About to setAllData with:', formattedData.length, 'records from: Supabase (first call)');
          setAllData(formattedData);
          // Also update localStorage as backup
          localStorage.setItem('churnDashboardData', JSON.stringify(formattedData));
          console.log('Data loaded from Supabase and saved to localStorage');
          // Update React state
          console.log('About to setAllData with:', formattedData.length, 'records from: Supabase (second call)');
          setAllData(formattedData);
          setFilteredData(formattedData);
          console.log('Current allData state will be updated with:', formattedData);
        } else {
          console.log('No data from Supabase or error occurred, falling back to localStorage');
          // Fallback to localStorage if Supabase is empty or has error
          const storedData = localStorage.getItem('churnDashboardData');
          console.log('localStorage data exists?', !!storedData, 'length:', storedData ? storedData.length : 0);
          if (storedData) {
            try {
              const parsedData = JSON.parse(storedData);
              console.log('Parsed localStorage data:', parsedData);
              console.log('About to setAllData with:', parsedData.length, 'records from: localStorage (no Supabase data)');
              setAllData(parsedData);
              setFilteredData(parsedData);
              console.log('Loaded', parsedData.length, 'records from localStorage');
            } catch (error) {
              console.error('Error loading stored data:', error);
            }
          } else {
            console.log('No data in localStorage either');
          }
        }
      } catch (error) {
        console.error('Error in loadData function:', error);
        // Fallback to localStorage
        const storedData = localStorage.getItem('churnDashboardData');
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            console.log('About to setAllData with:', parsedData.length, 'records from: localStorage (after error)');
            setAllData(parsedData);
            setFilteredData(parsedData);
            console.log('Loaded', parsedData.length, 'records from localStorage after error');
          } catch (error) {
            console.error('Error loading stored data:', error);
          }
        }
      }
      
      // Load history from localStorage
      const storedHistory = localStorage.getItem('churnDashboardHistory');
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory);
          setDataHistory(parsedHistory);
        } catch (error) {
          console.error('Error loading history:', error);
        }
      }
    };
    
    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (allData.length > 0) {
      localStorage.setItem('churnDashboardData', JSON.stringify(allData));
    }
    if (dataHistory.length > 0) {
      localStorage.setItem('churnDashboardHistory', JSON.stringify(dataHistory));
    }
  }, [allData, dataHistory]);

  // Apply filters when allData or filters change
  useEffect(() => {
    let filtered = [...allData];

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(item => 
        new Date(item.cancellationDate) >= startDate
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(item => 
        new Date(item.cancellationDate) <= endDate
      );
    }

    // Plan filter
    if (filters.plan !== 'all') {
      filtered = filtered.filter(item => 
        item.plans.toLowerCase().includes(filters.plan.toLowerCase())
      );
    }

    // Country filter
    if (filters.country !== 'all') {
      filtered = filtered.filter(item => 
        item.country === filters.country
      );
    }

    // CRM filter
    if (filters.crmType !== 'all') {
      filtered = filterByCRM(filtered, filters.crmType);
    }

    // MRR range filter
    filtered = filtered.filter(item => 
      item.mrrCancelled >= filters.mrrRange.min && 
      item.mrrCancelled <= filters.mrrRange.max
    );

    // Seats range filter
    filtered = filtered.filter(item => 
      item.seats >= filters.seatsRange.min && 
      item.seats <= filters.seatsRange.max
    );

    // Tenure range filter (Months Subscribed)
    filtered = filtered.filter(item => 
      item.monthsSubscribed >= filters.tenureRange.min && 
      item.monthsSubscribed <= filters.tenureRange.max
    );

    setFilteredData(filtered);
  }, [allData, filters]);

  const handleFileUpload = async (newData: ChurnRecord[], preview: UploadPreview) => {
    // Update data with new records (duplicates already filtered)
    console.log('About to setAllData with:', [...allData, ...newData].length, 'records from: File Upload (adding', newData.length, 'new records)');
    setAllData(prevData => [...prevData, ...newData]);
    
    // Insert/upsert data to Supabase
    try {
      // Convert ChurnRecord to Supabase format
      const supabaseRecords = newData.map(record => ({
        email: record.email,
        stripe_user_id: record.stripeUserId,
        plans: record.plans,
        activity: record.activity,
        mrr_cancelled: record.mrrCancelled,
        cancellation_date: record.cancellationDate,
        sign_up_date: record.signUpDate,
        seats: record.seats,
        months_subscribed: record.monthsSubscribed,
        country: record.country,
        crm: record.crm
      }));
      
      // Upsert to Supabase (will update if stripe_user_id exists, insert if new)
      const { error } = await supabase
        .from('churn_data')
        .upsert(supabaseRecords, {
          onConflict: 'stripe_user_id'
        });
      
      if (error) {
        console.error('Error uploading to Supabase:', error);
        // Continue with localStorage backup even if Supabase fails
      }
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
    }
    
    // Update localStorage as backup
    localStorage.setItem('churnDashboardData', JSON.stringify([...allData, ...newData]));
    
    // Add to history
    const historyEntry: UploadHistory = {
      timestamp: new Date().toISOString(),
      recordsAdded: newData.length,
      duplicatesSkipped: preview.duplicates,
      totalRecords: allData.length + newData.length
    };
    setDataHistory(prev => [...prev, historyEntry]);
    
    // Show preview
    setUploadPreview({ ...preview, show: true });
    
    // Hide preview after 5 seconds
    setTimeout(() => {
      setUploadPreview(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      console.log('About to setAllData with: 0 records from: Clear Data button');
      setAllData([]);
      setDataHistory([]);
      localStorage.removeItem('churnDashboardData');
      localStorage.removeItem('churnDashboardHistory');
    }
  };

  const handleExportData = () => {
    if (filteredData.length > 0) {
      exportToCSV(filteredData);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      plan: 'all',
      country: 'all',
      crmType: 'all',
      mrrRange: { min: 0, max: 999999 },
      seatsRange: { min: 0, max: 999999 },
      tenureRange: { min: 0, max: 999999 }
    });
  };

  const lastUpload = dataHistory.length > 0 
    ? new Date(dataHistory[dataHistory.length - 1].timestamp).toLocaleDateString()
    : 'Never';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Churn Analysis Dashboard</h1>
              <p className="text-gray-600">Monitor and analyze customer churn patterns - Live version</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Records: {allData.length}</p>
              <p className="text-sm text-gray-500">Last Upload: {lastUpload}</p>
            </div>
          </div>
        </div>

        {/* Upload Preview Alert */}
        {uploadPreview.show && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
            <span className="text-blue-800">
              Upload complete: {uploadPreview.newRecords} new records added, 
              {uploadPreview.duplicates} duplicates skipped
              {uploadPreview.errors > 0 && `, ${uploadPreview.errors} errors`}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <FileUpload onUpload={handleFileUpload} existingData={allData} />
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View History ({dataHistory.length})
          </button>
          <button
            onClick={handleExportData}
            disabled={filteredData.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Filtered Data ({filteredData.length})
          </button>
          <button
            onClick={handleClearData}
            disabled={allData.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        </div>

        {/* Upload History */}
        {showHistory && dataHistory.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold mb-3">Upload History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {dataHistory.map((entry, index) => (
                <div key={index} className="text-sm text-gray-600 flex justify-between">
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  <span>
                    +{entry.recordsAdded} records, {entry.duplicatesSkipped} duplicates skipped
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <FiltersSection 
          filters={filters} 
          setFilters={setFilters}
          onClearFilters={handleClearFilters}
          data={allData}
        />

        {/* Time View Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Trend View:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeView('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeView === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeView('quarter')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeView === 'quarter' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <MetricsCards data={filteredData} />

        {/* Charts */}
        <DashboardCharts data={filteredData} timeView={timeView} />

        {/* Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopPlansTable data={filteredData} />
          <TopCountriesTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default ChurnDashboard;