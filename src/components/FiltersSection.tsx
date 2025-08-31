import React from 'react';
import { Filter, X, Database, Users, Clock } from 'lucide-react';
import { Filters, ChurnRecord } from '../types';
import { cleanPlanName } from '../utils/dataProcessing';

interface FiltersSectionProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onClearFilters: () => void;
  data: ChurnRecord[];
}

const FiltersSection: React.FC<FiltersSectionProps> = ({ 
  filters, 
  setFilters, 
  onClearFilters,
  data 
}) => {
  // Get unique values for dropdowns
  const uniquePlans = Array.from(new Set(data.map(d => cleanPlanName(d.plans)))).sort();
  const uniqueCountries = Array.from(new Set(data.map(d => d.country).filter(Boolean))).sort();
  const uniqueCRMs = Array.from(new Set(data.map(d => d.crm || 'No_CRM'))).sort();

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleMRRChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? (field === 'min' ? 0 : 999999) : parseFloat(value);
    setFilters(prev => ({
      ...prev,
      mrrRange: {
        ...prev.mrrRange,
        [field]: numValue
      }
    }));
  };

  const handleSeatsChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? (field === 'min' ? 0 : 999999) : parseInt(value, 10);
    setFilters(prev => ({
      ...prev,
      seatsRange: {
        ...prev.seatsRange,
        [field]: numValue
      }
    }));
  };

  const handleTenureChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? (field === 'min' ? 0 : 999999) : parseInt(value, 10);
    setFilters(prev => ({
      ...prev,
      tenureRange: {
        ...prev.tenureRange,
        [field]: numValue
      }
    }));
  };

  const hasActiveFilters = 
    filters.dateRange.start !== '' ||
    filters.dateRange.end !== '' ||
    filters.plan !== 'all' ||
    filters.country !== 'all' ||
    filters.crmType !== 'all' ||
    filters.mrrRange.min > 0 ||
    filters.mrrRange.max < 999999 ||
    filters.seatsRange.min > 0 ||
    filters.seatsRange.max < 999999 ||
    filters.tenureRange.min > 0 ||
    filters.tenureRange.max < 999999;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* First Row - Date, Plan, Country, CRM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Date Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Plan Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan
          </label>
          <select
            value={filters.plan}
            onChange={(e) => setFilters(prev => ({ ...prev, plan: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Plans</option>
            {uniquePlans.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
        </div>

        {/* Country Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          <select
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        {/* CRM Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Database className="inline w-3 h-3 mr-1" />
            CRM
          </label>
          <select
            value={filters.crmType}
            onChange={(e) => setFilters(prev => ({ ...prev, crmType: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All CRMs</option>
            {uniqueCRMs.map(crm => (
              <option key={crm} value={crm}>
                {crm === 'No_CRM' ? 'No CRM' : crm}
              </option>
            ))}
          </select>
        </div>
        </div>

        {/* Second Row - Range Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* MRR Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min MRR ($)
          </label>
          <input
            type="number"
            value={filters.mrrRange.min === 0 ? '' : filters.mrrRange.min}
            onChange={(e) => handleMRRChange('min', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max MRR ($)
          </label>
          <input
            type="number"
            value={filters.mrrRange.max === 999999 ? '' : filters.mrrRange.max}
            onChange={(e) => handleMRRChange('max', e.target.value)}
            placeholder="No limit"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Seats Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="inline w-3 h-3 mr-1" />
            Min Seats
          </label>
          <input
            type="number"
            value={filters.seatsRange.min === 0 ? '' : filters.seatsRange.min}
            onChange={(e) => handleSeatsChange('min', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="inline w-3 h-3 mr-1" />
            Max Seats
          </label>
          <input
            type="number"
            value={filters.seatsRange.max === 999999 ? '' : filters.seatsRange.max}
            onChange={(e) => handleSeatsChange('max', e.target.value)}
            placeholder="No limit"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tenure Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="inline w-3 h-3 mr-1" />
            Min Tenure (months)
          </label>
          <input
            type="number"
            value={filters.tenureRange.min === 0 ? '' : filters.tenureRange.min}
            onChange={(e) => handleTenureChange('min', e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="inline w-3 h-3 mr-1" />
            Max Tenure (months)
          </label>
          <input
            type="number"
            value={filters.tenureRange.max === 999999 ? '' : filters.tenureRange.max}
            onChange={(e) => handleTenureChange('max', e.target.value)}
            placeholder="No limit"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersSection;