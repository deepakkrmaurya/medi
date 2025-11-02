import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, AlertTriangle, Clock ,Pill} from 'lucide-react';
import { formatDate, formatCurrency, calculateExpiryStatus } from '../utils/helpers';

const MedicineTable = ({ medicines, loading, onEdit, onDelete }) => {
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' };
    if (quantity <= 5) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' };
  };

  const getExpiryStatus = (expiryDate) => {
    const status = calculateExpiryStatus(expiryDate);
    if (status === 'expired') return { icon: AlertTriangle, color: 'text-red-600 bg-red-50 dark:bg-red-900/20' };
    if (status === 'expiring') return { icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' };
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 sm:px-6">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Mobile View */}
      <div className="sm:hidden">
        <div className="space-y-3 p-3">
          {medicines.map((medicine, index) => {
            const stockStatus = getStockStatus(medicine.quantity);
            const expiryStatus = getExpiryStatus(medicine.expiryDate);
            const ExpiryIcon = expiryStatus?.icon;
            
            return (
              <motion.div
                key={medicine._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {medicine.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Batch: {medicine.batchNo} • {medicine.category}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(medicine)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    >
                      <Edit2 size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(medicine._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                    <span className="ml-1 font-medium">{medicine.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="ml-1 font-medium">{formatCurrency(medicine.price)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Expiry:</span>
                    <span className="ml-1 font-medium">{formatDate(medicine.expiryDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                    {expiryStatus && (
                      <div className={`p-1 rounded-full ${expiryStatus.color}`}>
                        <ExpiryIcon size={12} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Medicine
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Batch & Category
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Expiry
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {medicines.map((medicine, index) => {
              const stockStatus = getStockStatus(medicine.quantity);
              const expiryStatus = getExpiryStatus(medicine.expiryDate);
              const ExpiryIcon = expiryStatus?.icon;
              
              return (
                <motion.tr
                  key={medicine._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {medicine.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {medicine.supplier || 'No supplier'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {medicine.batchNo}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {medicine.category}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {medicine.quantity}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(medicine.price)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      MRP: {formatCurrency(medicine.mrp)}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatDate(medicine.expiryDate)}
                      </span>
                      {expiryStatus && (
                        <div className={`p-1 rounded-full ${expiryStatus.color}`}>
                          <ExpiryIcon size={14} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(medicine)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(medicine._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        
        {medicines.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <Pill size={48} className="mx-auto" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No medicines found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add your first medicine to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineTable;