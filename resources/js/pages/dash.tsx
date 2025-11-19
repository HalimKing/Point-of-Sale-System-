import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowUp, ArrowDown } from 'lucide-react';

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
}

interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
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

const POSDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  
  // Sample data - in a real application, this would come from an API
  const salesData: SalesData[] = [
    { date: 'Mon', sales: 4200, transactions: 145 },
    { date: 'Tue', sales: 3800, transactions: 132 },
    { date: 'Wed', sales: 5100, transactions: 178 },
    { date: 'Thu', sales: 4700, transactions: 161 },
    { date: 'Fri', sales: 6300, transactions: 215 },
    { date: 'Sat', sales: 7800, transactions: 268 },
    { date: 'Sun', sales: 6900, transactions: 234 },
  ];

  const categoryData: CategoryData[] = [
    { name: 'Electronics', value: 35, color: '#3B82F6' },
    { name: 'Clothing', value: 25, color: '#10B981' },
    { name: 'Food & Beverage', value: 20, color: '#F59E0B' },
    { name: 'Home & Garden', value: 12, color: '#8B5CF6' },
    { name: 'Others', value: 8, color: '#6B7280' },
  ];

  const topProducts: TopProduct[] = [
    { name: 'Wireless Headphones', quantity: 145, revenue: 14500 },
    { name: 'Smart Watch', quantity: 98, revenue: 19600 },
    { name: 'Laptop Stand', quantity: 187, revenue: 9350 },
    { name: 'USB-C Cable', quantity: 312, revenue: 6240 },
    { name: 'Phone Case', quantity: 256, revenue: 7680 },
  ];

  const hourlyData = [
    { hour: '9 AM', customers: 12 },
    { hour: '10 AM', customers: 28 },
    { hour: '11 AM', customers: 45 },
    { hour: '12 PM', customers: 68 },
    { hour: '1 PM', customers: 72 },
    { hour: '2 PM', customers: 58 },
    { hour: '3 PM', customers: 51 },
    { hour: '4 PM', customers: 62 },
    { hour: '5 PM', customers: 85 },
    { hour: '6 PM', customers: 78 },
    { hour: '7 PM', customers: 54 },
    { hour: '8 PM', customers: 32 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">POS Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights into your store performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value="$38,900"
            change={12.5}
            icon={<DollarSign className="w-6 h-6" />}
          />
          <MetricCard
            title="Transactions"
            value="1,333"
            change={8.2}
            icon={<ShoppingCart className="w-6 h-6" />}
          />
          <MetricCard
            title="Avg Transaction"
            value="$29.17"
            change={3.8}
            icon={<TrendingUp className="w-6 h-6" />}
          />
          <MetricCard
            title="Customers"
            value="978"
            change={-2.4}
            icon={<Users className="w-6 h-6" />}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
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
                  name="Sales ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData as any}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hourly Traffic */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Traffic by Hour</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="customers" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h2>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
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
                {[
                  { id: '#TXN-1234', time: 'Oct 30, 2:45 PM', items: 3, amount: 127.50, payment: 'Credit Card' },
                  { id: '#TXN-1233', time: 'Oct 30, 2:38 PM', items: 1, amount: 49.99, payment: 'Cash' },
                  { id: '#TXN-1232', time: 'Oct 30, 2:22 PM', items: 5, amount: 203.25, payment: 'Credit Card' },
                  { id: '#TXN-1231', time: 'Oct 30, 2:15 PM', items: 2, amount: 85.00, payment: 'Debit Card' },
                  { id: '#TXN-1230', time: 'Oct 30, 2:08 PM', items: 4, amount: 156.75, payment: 'Credit Card' },
                ].map((transaction, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-blue-600">{transaction.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{transaction.time}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{transaction.items}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">${transaction.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{transaction.payment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSDashboard;