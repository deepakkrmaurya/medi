import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, 
  Package, 
  AlertTriangle, 
  Calendar, 
  TrendingUp,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { medicineAPI } from '../services/api';
import StatCard from '../components/StatCard';
import RecentMedicines from '../components/RecentMedicines';
import SalesChart from '../components/SalesChart';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, medicinesResponse] = await Promise.all([
        medicineAPI.getStats(),
        medicineAPI.getAll({ page: 1, limit: 5 })
      ]);
      
      setStats(statsResponse.data.stats);
      setRecentActivity(medicinesResponse.data.medicines);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Medicines',
      value: stats?.totalMedicines || 0,
      icon: Pill,
      color: 'blue',
      description: 'All medicines in inventory'
    },
    {
      title: 'Total Stock',
      value: stats?.totalStock || 0,
      icon: Package,
      color: 'green',
      description: 'Total quantity available'
    },
    {
      title: 'Expiring Soon',
      value: stats?.expiringMedicines || 0,
      icon: Calendar,
      color: 'yellow',
      description: 'Within next 30 days'
    },
    {
      title: 'Out of Stock',
      value: stats?.outOfStockMedicines || 0,
      icon: AlertTriangle,
      color: 'red',
      description: 'Need restocking'
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockMedicines || 0,
      icon: ShoppingCart,
      color: 'orange',
      description: 'Below threshold'
    },
    {
      title: 'Expired',
      value: stats?.expiredMedicines || 0,
      icon: AlertTriangle,
      color: 'red',
      description: 'Immediate action needed'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
    

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sales & Revenue
            </h3>
            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Sales</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
            </div>
          </div>
          <SalesChart />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
        >
          <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Recent Medicines
          </h3>
          <RecentMedicines medicines={recentActivity} />
        </motion.div>
      </div>

     
    </div>
  );
};

export default Dashboard;