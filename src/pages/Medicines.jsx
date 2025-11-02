import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, RefreshCw } from 'lucide-react';
import { medicineAPI } from '../services/api';
import MedicineTable from '../components/MedicineTable';
import MedicineForm from '../components/MedicineForm';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    stockStatus: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchMedicines();
  }, [filters, pagination.page]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await medicineAPI.getAll(params);
      setMedicines(response.data.medicines);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (error) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (medicineData) => {
    try {
      await medicineAPI.create(medicineData);
      toast.success('Medicine added successfully');
      setShowForm(false);
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to add medicine');
    }
  };

  const handleUpdate = async (medicineData) => {
    try {
      await medicineAPI.update(editingMedicine._id, medicineData);
      toast.success('Medicine updated successfully');
      setShowForm(false);
      setEditingMedicine(null);
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to update medicine');
    }
  };

  const handleDelete = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    try {
      await medicineAPI.delete(medicineId);
      toast.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      toast.error('Failed to delete medicine');
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const exportMedicines = () => {
    // In real app, this would export to CSV/Excel
    toast.success('Export functionality would be implemented here');
  };

  const categories = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 
    'Ointment', 'Drops', 'Inhaler', 'Other'
  ];

  const stockStatusOptions = [
    { value: '', label: 'All Stock' },
    { value: 'inStock', label: 'In Stock' },
    { value: 'lowStock', label: 'Low Stock' },
    { value: 'outOfStock', label: 'Out of Stock' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Medicine Management
          </h1>
         
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportMedicines}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Download size={20} />
            <span>Export</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchMedicines}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw size={20} />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700"
          >
            <Plus size={20} />
            <span>Add Medicine</span>
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Medicines
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full input-field"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full input-field cursor-pointer"
            >
              <option className='cursor-pointer' value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Status
            </label>
            <select
              value={filters.stockStatus}
              onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
              className="w-full input-field cursor-pointer"
            >
              {stockStatusOptions.map(option => (
                <option  key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end ">
            <div className="text-sm mb-3 text-gray-600 dark:text-gray-400">
              Showing [<span className='text-[#F09F0D]'>{medicines.length}</span> ] of {pagination.total} medicines
            </div>
          </div>
        </div>
      </div>

      {/* Medicine Table */}
      <MedicineTable
        medicines={medicines}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}

      {/* Medicine Form Modal */}
      {showForm && (
        <MedicineForm
          medicine={editingMedicine}
          onSubmit={editingMedicine ? handleUpdate : handleCreate}
          onClose={() => {
            setShowForm(false);
            setEditingMedicine(null);
          }}
        />
      )}
    </div>
  );
};

export default Medicines;