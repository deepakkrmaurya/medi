import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, BarChart3, PieChart, TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { medicineAPI, billAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  });
  const [reportType, setReportType] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Simulate API call - in real app, this would be actual API calls
      setTimeout(() => {
        setReportData(generateMockData());
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to fetch report data');
      setLoading(false);
    }
  };

  // Mock data generation - replace with actual API calls
  const generateMockData = () => {
    const salesData = [
      { month: 'Jan', sales: 45, revenue: 45000, profit: 12000, returns: 2 },
      { month: 'Feb', sales: 52, revenue: 52000, profit: 15000, returns: 1 },
      { month: 'Mar', sales: 48, revenue: 48000, profit: 13000, returns: 3 },
      { month: 'Apr', sales: 60, revenue: 60000, profit: 18000, returns: 2 },
      { month: 'May', sales: 55, revenue: 55000, profit: 16000, returns: 1 },
      { month: 'Jun', sales: 65, revenue: 65000, profit: 20000, returns: 4 },
    ];

    const categoryData = [
      { name: 'Tablets', value: 35, revenue: 35000 },
      { name: 'Capsules', value: 25, revenue: 25000 },
      { name: 'Syrups', value: 15, revenue: 15000 },
      { name: 'Injections', value: 12, revenue: 12000 },
      { name: 'Ointments', value: 8, revenue: 8000 },
      { name: 'Others', value: 5, revenue: 5000 },
    ];

    const stockData = [
      { name: 'In Stock', value: 65, count: 89 },
      { name: 'Low Stock', value: 15, count: 12 },
      { name: 'Out of Stock', value: 5, count: 7 },
      { name: 'Expired', value: 15, count: 15 },
    ];

    const expiryData = [
      { month: 'Jan', expiring: 5, expired: 2 },
      { month: 'Feb', expiring: 3, expired: 1 },
      { month: 'Mar', expiring: 8, expired: 0 },
      { month: 'Apr', expiring: 12, expired: 3 },
      { month: 'May', expiring: 7, expired: 1 },
      { month: 'Jun', expiring: 4, expired: 2 },
    ];

    return {
      salesData,
      categoryData,
      stockData,
      expiryData,
      summary: {
        totalRevenue: 325000,
        totalSales: 325,
        averageOrder: 1000,
        profitMargin: '31%',
        topCategory: 'Tablets',
        lowStockItems: 12
      }
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const exportReport = () => {
    toast.success('Report exported successfully!');
    // In real app, this would generate and download PDF/Excel
  };

  const applyFilters = () => {
    fetchReportData();
    toast.success('Filters applied');
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    switch (reportType) {
      case 'sales':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Sales & Revenue Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData?.salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#0ea5e9" 
                      fill="#0ea5e9" 
                      fillOpacity={0.3}
                      name="Revenue (₹)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="profit" 
                      stackId="2"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      name="Profit (₹)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Sales Volume & Returns
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData?.salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#0ea5e9" name="Units Sold" />
                    <Bar dataKey="returns" fill="#ef4444" name="Returns" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Sales by Category
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RePieChart>
                    <Pie
                      data={reportData?.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData?.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Revenue by Category
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData?.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'stock':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Stock Distribution
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RePieChart>
                    <Pie
                      data={reportData?.stockData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData?.stockData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Expiry Analysis
                </h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={reportData?.expiryData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="expiring" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Expiring Soon"
                      dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expired" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Expired"
                      dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gain insights into your business performance and make data-driven decisions.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportReport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
        >
          <Download size={20} />
          <span>Export Report</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field"
            >
              <option value="sales">Sales Report</option>
              <option value="category">Category Analysis</option>
              <option value="stock">Stock Analysis</option>
              <option value="expiry">Expiry Analysis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="input-field"
            />
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={applyFilters}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-primary-700"
            >
              <Filter size={20} />
              <span>Apply Filters</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(reportData.summary.totalRevenue)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {reportData.summary.totalSales}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Sales</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="text-purple-600 dark:text-purple-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {reportData.summary.profitMargin}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Profit Margin</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center"
          >
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="text-orange-600 dark:text-orange-400" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {reportData.summary.lowStockItems}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Low Stock Items</p>
          </motion.div>
        </div>
      )}

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {renderChart()}
      </div>

      {/* Data Summary */}
      {reportData && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Data Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Date Range:</span>
              <p className="font-medium">{formatDate(dateRange.start)} - {formatDate(dateRange.end)}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Report Generated:</span>
              <p className="font-medium">{new Date().toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Data Points:</span>
              <p className="font-medium">{reportData.salesData.length} months</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Top Category:</span>
              <p className="font-medium">{reportData.summary.topCategory}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;