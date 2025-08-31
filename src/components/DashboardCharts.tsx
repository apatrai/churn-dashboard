import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChurnRecord } from '../types';
import { 
  getChurnByPlan, 
  getGeographicDistribution, 
  getTenureDistribution, 
  getChurnTrend,
  formatCurrency 
} from '../utils/dataProcessing';

interface DashboardChartsProps {
  data: ChurnRecord[];
  timeView: 'month' | 'quarter';
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ data, timeView }) => {
  const churnByPlanData = getChurnByPlan(data);
  const geographicData = getGeographicDistribution(data);
  const tenureData = getTenureDistribution(data);
  const trendData = getChurnTrend(data, timeView);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('MRR') || entry.name.includes('mrrLost') 
                ? formatCurrency(entry.value) 
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Churn by Plan Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Churn by Plan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={churnByPlanData.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              angle={-45} 
              textAnchor="end" 
              height={80} 
            />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="customers" 
              fill="#3B82F6" 
              name="Customers" 
            />
            <Bar 
              yAxisId="right" 
              dataKey="mrrLost" 
              fill="#EF4444" 
              name="MRR Lost" 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Geographic Distribution Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Geographic Distribution (Top 15)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={geographicData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
            />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Bar dataKey="value" fill="#10B981" name="Customers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tenure Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Customer Tenure Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={tenureData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {tenureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Churn Trend Line Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Churn Trend ({timeView === 'month' ? 'Monthly' : 'Quarterly'})
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              stroke="#6b7280" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
            />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="customers" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Customers"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="mrrLost" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="MRR Lost"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;