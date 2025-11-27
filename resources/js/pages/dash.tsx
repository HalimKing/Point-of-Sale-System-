import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowUp, ArrowDown, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

interface SalesData {
  date: string;
  sales: number;
  transactions: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

interface Transaction {
  id: string;
  time: string;
  items: number;
  amount: number;
  payment: string;
}

interface DashboardData {
  metrics: Array<{
    title: string;
    value: string;
    change: number;
  }>;
  salesTrend: SalesData[];
  categoryData: CategoryData[];
  topProducts: TopProduct[];
  recentTransactions: Transaction[];
  last30DaysSales: SalesData[];
  financialYearSales: Array<{
    month: string;
    sales: number;
    target: number;
  }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon }) => {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <div className="text-blue-600">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
          {Math.abs(change)}%
        </div>
      </div>
    </div>
  );
};

// Utility function to download content
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const POSDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Fetch dashboard data from backend
  const fetchDashboardData = async (range: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/dashboard/data?timeRange=${range}`);
      
      if (!response || response.status !== 200) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = response.data as DashboardData;
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange);
  }, [timeRange]);

  // Refresh data
  const handleRefresh = () => {
    fetchDashboardData(timeRange);
  };

  // Download chart data as CSV
  const downloadChartDataAsCSV = (data: any[] | undefined, filename: string, chartName: string) => {
    try {
      setDownloading(`${chartName}-csv`);
      
      if (!data || data.length === 0) {
        alert('No data available to download');
        return;
      }
  
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      downloadBlob(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error downloading chart data:', error);
      alert(`Error downloading ${chartName} data as CSV. Please try again.`);
    } finally {
      setDownloading(null);
    }
  };

  // Download table as CSV
  const downloadTableAsCSV = (data: any[], filename: string, columns: string[], chartName: string) => {
    try {
      setDownloading(`${chartName}-csv`);
      
      if (!data || data.length === 0) {
        alert('No data available to download');
        return;
      }

      // Convert data to CSV format
      const headers = columns.join(',');
      const rows = data.map(item => 
        columns.map(col => {
          const value = item[col];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      );
      
      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      downloadBlob(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error downloading table:', error);
      alert(`Error downloading ${chartName} as CSV. Please try again.`);
    } finally {
      setDownloading(null);
    }
  };

  // Download all charts as CSV
  const downloadAllChartsAsCSV = () => {
    const charts = [
      { name: 'sales-trend', displayName: 'Sales Trend', data: dashboardData?.salesTrend },
      { name: 'category-distribution', displayName: 'Category Distribution', data: dashboardData?.categoryData },
      { name: 'last-30-days-sales', displayName: 'Last 30 Days Sales', data: dashboardData?.last30DaysSales },
      { name: 'financial-year-sales', displayName: 'Financial Year Sales', data: dashboardData?.financialYearSales },
    ];

    charts.forEach((chart, index) => {
      if (chart.data && chart.data.length > 0) {
        setTimeout(() => {
          downloadChartDataAsCSV(chart.data, chart.name, chart.displayName);
        }, index * 500);
      }
    });
  };

  // Sample data as fallback - remove this in production
  const sampleData: DashboardData = {
    metrics: [
      { title: "Today's Sales", value: "GHS 0.00", change: 0 },
      { title: "Yesterday's Sales", value: "GHS 0.00", change: 0 },
      { title: "Total Revenue", value: "GHS 0.00", change: 0 },
      { title: "Total Products", value: "0", change: 0 },
      { title: "Transactions", value: "0", change: 0 },
      { title: "Avg Transaction", value: "GHS 0.00", change: 0 },
      { title: "Customers", value: "0", change: 0 },
      { title: "Users", value: "0", change: 0 },
    ],
    salesTrend: [],
    categoryData: [],
    topProducts: [],
    recentTransactions: [],
    last30DaysSales: [],
    financialYearSales: []
  };

  const data = dashboardData || sampleData;

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">POS Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time insights into your store performance</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2">
              <button
                onClick={downloadAllChartsAsCSV}
                disabled={loading || downloading !== null}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download All CSV
              </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Today's Sales"
            value={data.metrics[0]?.value || "GHS 0.00"}
            change={data.metrics[0]?.change || 0}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <MetricCard
            title="Yesterday's Sales"
            value={data.metrics[1]?.value || "GHS 0.00"}
            change={data.metrics[1]?.change || 0}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <MetricCard
            title="Total Revenue"
            value={data.metrics[2]?.value || "GHS 0.00"}
            change={data.metrics[2]?.change || 0}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <MetricCard
            title="Total Products"
            value={data.metrics[3]?.value || "0"}
            change={data.metrics[3]?.change || 0}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
          <MetricCard
            title="Transactions"
            value={data.metrics[4]?.value || "0"}
            change={data.metrics[4]?.change || 0}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
          <MetricCard
            title="Avg Transaction"
            value={data.metrics[5]?.value || "GHS 0.00"}
            change={data.metrics[5]?.change || 0}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <MetricCard
            title="Customers"
            value={data.metrics[6]?.value || "0"}
            change={data.metrics[6]?.change || 0}
            icon={<Users className="w-6 h-6" />}
          />
          <MetricCard
            title="Users"
            value={data.metrics[7]?.value || "0"}
            change={data.metrics[7]?.change || 0}
            icon={<Users className="w-6 h-6" />}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Sales Trend</h2>
              <div className="flex gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
                <button
                  onClick={() => downloadChartDataAsCSV(data.salesTrend, 'sales-trend', 'Sales Trend')}
                  disabled={downloading !== null || data.salesTrend.length === 0}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {data.salesTrend.length > 0 ? (
                <LineChart data={data.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, 'Sales']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Sales (GHS)"
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No sales data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Sales by Category</h2>
              <div className="flex gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
                <button
                  onClick={() => downloadChartDataAsCSV(data.categoryData, 'category-distribution', 'Category Distribution')}
                  disabled={downloading !== null || data.categoryData.length === 0}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {data.categoryData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No category data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 - New Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Sales Last 30 Days */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Sales Last 30 Days</h2>
              <div className="flex gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
                <button
                  onClick={() => downloadChartDataAsCSV(data.last30DaysSales, 'last-30-days-sales', 'Last 30 Days Sales')}
                  disabled={downloading !== null || data.last30DaysSales.length === 0}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {data.last30DaysSales.length > 0 ? (
                <BarChart data={data.last30DaysSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, 'Sales']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="sales" 
                    fill="#10B981" 
                    name="Sales (GHS)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No 30-day sales data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>

          {/* Current Financial Year Sales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Current Financial Year Sales</h2>
              <div className="flex gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
                <button
                  onClick={() => downloadChartDataAsCSV(data.financialYearSales, 'financial-year-sales', 'Financial Year Sales')}
                  disabled={downloading !== null || data.financialYearSales.length === 0}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {data.financialYearSales.length > 0 ? (
                <LineChart data={data.financialYearSales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, 'Sales']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Actual Sales"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#F59E0B', r: 4 }}
                    name="Target Sales"
                  />
                </LineChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No financial year data available</p>
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="flex max-lg:flex-col gap-6 mb-8 w-full">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6 w-full lg:w-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Top Selling Products</h2>
              <div className="flex gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
                <button
                  onClick={() => downloadTableAsCSV(data.topProducts, 'top-products', ['name', 'quantity', 'revenue'], 'Top Products')}
                  disabled={downloading !== null || data.topProducts.length === 0}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {data.topProducts.length > 0 ? (
                data.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">GHS {product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No product data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6 w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <div className="flex gap-2">
                {loading && <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />}
                <button
                  onClick={() => downloadTableAsCSV(data.recentTransactions, 'recent-transactions', ['id', 'time', 'items', 'amount', 'payment'], 'Recent Transactions')}
                  disabled={downloading !== null || data.recentTransactions.length === 0}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.length > 0 ? (
                    data.recentTransactions.map((transaction, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-blue-600">{transaction.id}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{transaction.time}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{transaction.items}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">GHS {transaction.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{transaction.payment}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No recent transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSDashboard;