import React from 'react';
import { TrendingDown, Users, DollarSign, Clock } from 'lucide-react';
import { ChurnRecord, MetricsData } from '../types';
import { formatCurrency } from '../utils/dataProcessing';

interface MetricsCardsProps {
  data: ChurnRecord[];
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ data }) => {
  const calculateMetrics = (): MetricsData => {
    const totalChurnedCustomers = data.length;
    const totalMRRLost = data.reduce((sum, item) => sum + item.mrrCancelled, 0);
    const avgCustomerLifetime = totalChurnedCustomers > 0 
      ? data.reduce((sum, item) => sum + item.monthsSubscribed, 0) / totalChurnedCustomers 
      : 0;
    const avgMRRPerCustomer = totalChurnedCustomers > 0 
      ? totalMRRLost / totalChurnedCustomers 
      : 0;

    return {
      totalChurnedCustomers,
      totalMRRLost,
      avgCustomerLifetime,
      avgMRRPerCustomer
    };
  };

  const metrics = calculateMetrics();

  const cards = [
    {
      title: 'Total Churned Customers',
      value: metrics.totalChurnedCustomers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      subtext: 'Total count'
    },
    {
      title: 'Total MRR Lost',
      value: formatCurrency(metrics.totalMRRLost),
      icon: DollarSign,
      color: 'bg-red-500',
      subtext: 'Sum of all cancelled MRR'
    },
    {
      title: 'Avg Customer Lifetime',
      value: metrics.avgCustomerLifetime.toFixed(1) + ' months',
      icon: Clock,
      color: 'bg-green-500',
      subtext: 'Average months subscribed'
    },
    {
      title: 'Avg MRR per Customer',
      value: formatCurrency(metrics.avgMRRPerCustomer),
      icon: TrendingDown,
      color: 'bg-purple-500',
      subtext: 'Average revenue per churn'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} rounded-lg p-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">{card.subtext}</p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsCards;