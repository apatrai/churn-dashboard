import React, { useState, useEffect, useMemo } from 'react';
import { Download, Trash2, Eye, AlertCircle } from 'lucide-react';
import FileUpload from './FileUpload';
import MetricsCards from './MetricsCards';
import DashboardCharts from './DashboardCharts';
import FiltersSection from './FiltersSection';
import TopPlansTable from './Tables/TopPlansTable';
import TopCountriesTable from './Tables/TopCountriesTable';
import { ChurnRecord, UploadPreview, Filters, UploadHistory } from '../types';
import { exportToCSV, filterByCRM } from '../utils/dataProcessing';

const ChurnDashboard: React.FC = () => {
  const [allData, setAllData] = useState<ChurnRecord[]>([]);
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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('churnDashboardData');
    const storedHistory = localStorage.getItem('churnDashboardHistory');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setAllData(parsedData);
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    }
    
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setDataHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
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

  // Apply filters
  const filteredData = useMemo(() => {
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

    return filtered;
  }, [allData, filters]);

  const handleFileUpload = (newData: ChurnRecord[], preview: UploadPreview) => {
    // Update data with new records (duplicates already filtered)
    setAllData(prevData => [...prevData, ...newData]);
    
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
              <p className="text-gray-600">Monitor and analyze customer churn patterns</p>
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