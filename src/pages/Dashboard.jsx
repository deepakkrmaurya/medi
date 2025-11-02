import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Pill, 
  Package, 
  AlertTriangle, 
  Calendar, 
  ShoppingCart
} from 'lucide-react';
import { medicineAPI } from '../services/api';
import StatCard from '../components/StatCard';
import SalesChart from '../components/SalesChart';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentMedicines, setRecentMedicines] = useState([]);

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
      setRecentMedicines(medicinesResponse.data.medicines);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
     
      {/* Stats Grid - Fixed for mobile */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="col-span-1"
            >
              <StatCard 
                {...stat}
                className="h-full min-h-[100px] sm:min-h-[120px]"
                compact={true}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Charts and Recent Medicines */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Sales & Revenue
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Last 30 days performance
              </p>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Sales</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]">
            <SalesChart responsive={true} />
          </div>
        </motion.div>

        {/* Recent Medicines */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
        >
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Recent Medicines
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Latest added medicines
            </p>
          </div>
          
          {/* Recent Medicines List */}
          <div className="space-y-3">
            {recentMedicines.length > 0 ? (
              recentMedicines.map((medicine, index) => (
                <motion.div
                  key={medicine._id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (index * 0.1) }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Pill size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {medicine.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {medicine.category} • Stock: {medicine.stockQuantity}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    medicine.stockQuantity === 0 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : medicine.stockQuantity < 10
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {medicine.stockQuantity === 0 ? 'Out of Stock' : 
                     medicine.stockQuantity < 10 ? 'Low Stock' : 'In Stock'}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">No recent medicines found</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;