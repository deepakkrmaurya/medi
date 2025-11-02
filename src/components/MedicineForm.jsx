import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

const MedicineForm = ({ medicine, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    batchNo: '',
    category: 'Tablet',
    quantity: '',
    price: '',
    mrp: '',
    discount: '',
    expiryDate: '',
    supplier: '',
    description: '',
    lowStockAlert: 5
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (medicine) {
      setFormData({
        name: medicine.name || '',
        batchNo: medicine.batchNo || '',
        category: medicine.category || 'Tablet',
        quantity: medicine.quantity || '',
        price: medicine.price || '',
        mrp: medicine.mrp || '',
        discount: medicine.discount || '',
        expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
        supplier: medicine.supplier || '',
        description: medicine.description || '',
        lowStockAlert: medicine.lowStockAlert || 5
      });
      
      if (medicine.image) {
        setImagePreview(medicine.image);
      }
    }
  }, [medicine]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Medicine name is required';
    if (!formData.batchNo.trim()) newErrors.batchNo = 'Batch number is required';
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.price || formData.price < 0) newErrors.price = 'Valid price is required';
    if (!formData.mrp || formData.mrp < 0) newErrors.mrp = 'Valid MRP is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (formData.discount < 0 || formData.discount > 100) newErrors.discount = 'Discount must be between 0-100';
    
    // Image validation - required only for new medicine
    if (!medicine && !imageFile) {
      newErrors.image = 'Medicine image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = new FormData();
      
      // Append form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Append image file if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      onSubmit(submitData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select an image file'
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }));
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      
      // Clear image error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: ''
        }));
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const categories = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 
    'Ointment', 'Drops', 'Inhaler', 'Other'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
        >
          {/* Header - Sticky on mobile */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {medicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-3 sm:space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Medicine Image {!medicine && '*'}
              </label>
              
              <div className="flex items-center justify-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Medicine preview"
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-dashed border-orange-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-orange-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-4 pb-5 sm:pt-5 sm:pb-6">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                        Upload Image
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              
              {errors.image && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.image}</p>
              )}
            </div>

            {/* Form Grid - Responsive columns */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Medicine Name - Full width on mobile */}
              <div className="xs:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                    errors.name ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter medicine name"
                />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Batch Number */}
              <div className="xs:col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Batch Number *
                </label>
                <input
                  type="text"
                  name="batchNo"
                  value={formData.batchNo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                    errors.batchNo ? 'border-red-500' : ''
                  }`}
                  placeholder="Enter batch number"
                />
                {errors.batchNo && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.batchNo}</p>}
              </div>

              {/* Category */}
              <div className="xs:col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                    errors.quantity ? 'border-red-500' : ''
                  }`}
                  placeholder="Qty"
                  min="0"
                />
                {errors.quantity && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.quantity}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                    errors.price ? 'border-red-500' : ''
                  }`}
                  placeholder="Price"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.price}</p>}
              </div>

              {/* MRP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  MRP (₹) *
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                    errors.mrp ? 'border-red-500' : ''
                  }`}
                  placeholder="MRP"
                  min="0"
                  step="0.01"
                />
                {errors.mrp && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.mrp}</p>}
              </div>

              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                    errors.discount ? 'border-red-500' : ''
                  }`}
                  placeholder="Discount"
                  min="0"
                  max="100"
                />
                {errors.discount && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.discount}</p>}
              </div>

              {/* Expiry Date */}
              <div className="xs:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white ${
                    errors.expiryDate ? 'border-red-500' : ''
                  }`}
                />
                {errors.expiryDate && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.expiryDate}</p>}
              </div>

              {/* Low Stock Alert */}
              <div className="xs:col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  name="lowStockAlert"
                  value={formData.lowStockAlert}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                />
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Alert when stock reaches this level
                </p>
              </div>

              {/* Supplier */}
              <div className="xs:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Manufactured by 
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter manufacturer name"
                />
              </div>

              {/* Description */}
              <div className="xs:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Enter medicine description"
                />
              </div>
            </div>

            {/* Action Buttons - Responsive layout */}
            <div className="flex flex-col xs:flex-row justify-end space-y-2 xs:space-y-0 xs:space-x-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="w-full xs:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors order-2 xs:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full xs:w-auto px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors order-1 xs:order-2"
              >
                {medicine ? 'Update Medicine' : 'Add Medicine'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MedicineForm;