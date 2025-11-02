import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Pill,
  Calendar,
  Package,
  TrendingUp
} from 'lucide-react';
import { medicineAPI } from '../services/api';
import { formatDate, calculateExpiryStatus, formatCurrency } from '../utils/helpers';

const RecentMedicines = ({ medicines: propMedicines, limit = 5 }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // all, expiring, expired, lowStock

  useEffect(() => {
    if (propMedicines) {
      setMedicines(propMedicines);
      setLoading(false);
    } else {
      fetchRecentMedicines();
    }
  }, [propMedicines]);

  const fetchRecentMedicines = async () => {
    try {
      const response = await medicineAPI.getAll({ page: 1, limit: 10 });
      setMedicines(response.data.medicines);
    } catch (error) {
      console.error('Error fetching recent medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (medicine) => {
    const expiryStatus = calculateExpiryStatus(medicine.expiryDate);
    
    if (expiryStatus === 'expired') {
      return <AlertTriangle className="text-red-500" size={18} />;
    } else if (expiryStatus === 'expiring') {
      return <Clock className="text-yellow-500" size={18} />;
    } else {
      return <CheckCircle className="text-green-500" size={18} />;
    }
  };

  const getStatusText = (medicine) => {
    const expiryStatus = calculateExpiryStatus(medicine.expiryDate);
    
    if (expiryStatus === 'expired') {
      return 'Expired';
    } else if (expiryStatus === 'expiring') {
      return 'Expiring Soon';
    } else {
      return 'Good';
    }
  };

  const getStatusColor = (medicine) => {
    const expiryStatus = calculateExpiryStatus(medicine.expiryDate);
    
    if (expiryStatus === 'expired') {
      return 'text-red-700 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
    } else if (expiryStatus === 'expiring') {
      return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    } else {
      return 'text-green-700 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    }
  };

  const getStockStatus = (medicine) => {
    if (medicine.quantity === 0) return 'out-of-stock';
    if (medicine.quantity <= medicine.lowStockAlert) return 'low-stock';
    return 'in-stock';
  };

  const getStockColor = (medicine) => {
    const stockStatus = getStockStatus(medicine);
    
    if (stockStatus === 'out-of-stock') {
      return 'text-red-600';
    } else if (stockStatus === 'low-stock') {
      return 'text-yellow-600';
    } else {
      return 'text-green-600';
    }
  };

  const filteredMedicines = medicines
    .filter(medicine => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'expiring') return calculateExpiryStatus(medicine.expiryDate) === 'expiring';
      if (activeFilter === 'expired') return calculateExpiryStatus(medicine.expiryDate) === 'expired';
      if (activeFilter === 'lowStock') return getStockStatus(medicine) === 'low-stock' || getStockStatus(medicine) === 'out-of-stock';
      return true;
    })
    .slice(0, limit);

  const stats = {
    total: medicines.length,
    expiring: medicines.filter(m => calculateExpiryStatus(m.expiryDate) === 'expiring').length,
    expired: medicines.filter(m => calculateExpiryStatus(m.expiryDate) === 'expired').length,
    lowStock: medicines.filter(m => getStockStatus(m) === 'low-stock' || getStockStatus(m) === 'out-of-stock').length
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="rounded-lg bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Pill className="mr-2 text-orange-500" size={24} />
            Recent Medicines
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Overview of your medicine inventory
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.expiring}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Expiring</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.expired}</div>
            <div className="text-xs text-red-600 dark:text-red-400">Expired</div>
          </div>
          <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.lowStock}</div>
            <div className="text-xs text-orange-600 dark:text-orange-400">Low Stock</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { key: 'all', label: 'All', count: stats.total },
          { key: 'expiring', label: 'Expiring', count: stats.expiring },
          { key: 'expired', label: 'Expired', count: stats.expired },
          { key: 'lowStock', label: 'Low Stock', count: stats.lowStock }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              activeFilter === filter.key
                ? 'bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {filter.label}
            <span className="ml-1 text-xs opacity-70">({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Medicines List */}
      <AnimatePresence>
        <div className="space-y-3">
          {filteredMedicines.map((medicine, index) => (
            <motion.div
              key={medicine._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="group p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 flex items-center justify-center border border-orange-200 dark:border-orange-700">
                      {getStatusIcon(medicine)}
                    </div>
                  </div>

                  {/* Medicine Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                        {medicine.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(medicine)} flex-shrink-0`}>
                        {getStatusText(medicine)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <Package size={14} />
                        <span>Batch: {medicine.batchNo}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <TrendingUp size={14} />
                        <span className={getStockColor(medicine)}>
                          Stock: {medicine.quantity}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Exp: {formatDate(medicine.expiryDate)}</span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Price: {formatCurrency(medicine.price)}
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Category: {medicine.category}</span>
                      {medicine.supplier && (
                        <span>By: {medicine.supplier}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredMedicines.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
        >
          <Pill className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No medicines found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {activeFilter !== 'all' 
              ? `No medicines match the "${activeFilter}" filter`
              : 'Get started by adding your first medicine'
            }
          </p>
        </motion.div>
      )}

      {/* View All Link */}
      {medicines.length > limit && (
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm font-medium transition-colors">
            View All Medicines →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentMedicines;