import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, Calendar, Download, Filter, RefreshCw } from 'lucide-react';
import { medicineAPI } from '../services/api';
import { formatDate, calculateExpiryStatus, exportToCSV ,formatCurrency } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ExpiryTracking = () => {
  const [activeTab, setActiveTab] = useState('expiring');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    daysThreshold: 30
  });

  useEffect(() => {
    fetchExpiryMedicines();
  }, [activeTab, filters.daysThreshold]);

  const fetchExpiryMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getExpiry(activeTab);
      let filteredMedicines = response.data.medicines;

      // Apply additional filters
      if (filters.category !== 'all') {
        filteredMedicines = filteredMedicines.filter(med => med.category === filters.category);
      }

      setMedicines(filteredMedicines);
    } catch (error) {
      toast.error('Failed to fetch expiry data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'expiring', 
      label: 'Expiring Soon', 
      icon: Clock, 
      color: 'yellow',
      description: 'Medicines expiring within the specified days'
    },
    { 
      id: 'expired', 
      label: 'Expired', 
      icon: AlertTriangle, 
      color: 'red',
      description: 'Medicines that have already expired'
    }
  ];

  const categories = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 
    'Ointment', 'Drops', 'Inhaler', 'Other'
  ];

  const getStatusColor = (medicine) => {
    const status = calculateExpiryStatus(medicine.expiryDate);
    if (status === 'expired') {
      return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
    } else if (status === 'expiring') {
      return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
    }
    return 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600';
  };

  const getStatusIcon = (medicine) => {
    const status = calculateExpiryStatus(medicine.expiryDate);
    if (status === 'expired') return AlertTriangle;
    if (status === 'expiring') return Clock;
    return Calendar;
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const exportExpiryReport = () => {
    const exportData = medicines.map(medicine => ({
      'Medicine Name': medicine.name,
      'Batch No': medicine.batchNo,
      'Category': medicine.category,
      'Quantity': medicine.quantity,
      'Price': medicine.price,
      'Expiry Date': formatDate(medicine.expiryDate),
      'Days Until Expiry': getDaysUntilExpiry(medicine.expiryDate),
      'Status': activeTab === 'expired' ? 'Expired' : 'Expiring Soon'
    }));

    exportToCSV(exportData, `expiry-report-${activeTab}-${new Date().toISOString().split('T')[0]}`);
    toast.success('Report exported successfully');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Expiry Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor medicine expiry dates and take proactive actions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportExpiryReport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download size={20} />
            <span>Export Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchExpiryMedicines}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw size={20} />
            <span>Refresh</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Summary & Filters */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg bg-${currentTab.color}-100 dark:bg-${currentTab.color}-900/30`}>
                {React.createElement(currentTab.icon, { 
                  size: 24, 
                  className: `text-${currentTab.color}-600 dark:text-${currentTab.color}-400` 
                })}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentTab.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentTab.description}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {activeTab === 'expiring' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Days Threshold
                  </label>
                  <select
                    value={filters.daysThreshold}
                    onChange={(e) => handleFilterChange('daysThreshold', parseInt(e.target.value))}
                    className="input-field"
                  >
                    <option value={7}>7 days</option>
                    <option value={15}>15 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {medicines.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Medicines</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {medicines.reduce((sum, med) => sum + med.quantity, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Quantity</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(medicines.reduce((sum, med) => sum + (med.price * med.quantity), 0))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(medicines.map(med => med.category)).size}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
          </div>

          {/* Medicines List */}
          <div className="space-y-4">
            {medicines.map((medicine, index) => {
              const StatusIcon = getStatusIcon(medicine);
              const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate);
              const isExpired = daysUntilExpiry < 0;
              
              return (
                <motion.div
                  key={medicine._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-2 rounded-lg ${getStatusColor(medicine)}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-lg bg-${isExpired ? 'red' : 'yellow'}-100 dark:bg-${isExpired ? 'red' : 'yellow'}-900/30 flex items-center justify-center`}>
                          <StatusIcon 
                            size={24} 
                            className={`text-${isExpired ? 'red' : 'yellow'}-600 dark:text-${isExpired ? 'red' : 'yellow'}-400`} 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {medicine.name}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Batch:</span> {medicine.batchNo}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {medicine.category}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span> {medicine.quantity} units
                          </div>
                          <div>
                            <span className="font-medium">Price:</span> {formatCurrency(medicine.price)}
                          </div>
                          <div>
                            <span className="font-medium">Supplier:</span> {medicine.supplier || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Expiry Date
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatDate(medicine.expiryDate)}
                          </p>
                        </div>
                        
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            isExpired 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {isExpired 
                              ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                              : `Expires in ${daysUntilExpiry} days`
                            }
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Added: {formatDate(medicine.addedDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {medicines.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-gray-400 dark:text-gray-500 mb-2">
                  <Calendar size={48} className="mx-auto" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No {activeTab === 'expiring' ? 'expiring' : 'expired'} medicines found
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {activeTab === 'expiring' 
                    ? 'Medicines expiring within the specified days will appear here'
                    : 'Expired medicines will appear here'
                  }
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Action Recommendations */}
      {medicines.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
            Recommended Actions
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            {activeTab === 'expired' && (
              <>
                <li>• Immediately remove expired medicines from saleable stock</li>
                <li>• Contact suppliers for possible returns or replacements</li>
                <li>• Update inventory to reflect expired quantities</li>
                <li>• Review purchasing patterns to avoid overstocking</li>
              </>
            )}
            {activeTab === 'expiring' && (
              <>
                <li>• Prioritize sales of medicines expiring soon</li>
                <li>• Consider promotional offers for soon-to-expire items</li>
                <li>• Adjust future purchase quantities based on expiry patterns</li>
                <li>• Set up alerts for critical expiry dates</li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExpiryTracking;