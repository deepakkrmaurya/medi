import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, User, Phone, Mail, X } from 'lucide-react';
import { medicineAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers.js';
import toast from 'react-hot-toast';

const BillingForm = ({ onBillGenerate, onClose }) => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    mobile: '',
    email: ''
  });
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await medicineAPI.getAll({ limit: 100, stockStatus: 'inStock' });
      setMedicines(response.data.medicines);
    } catch (error) {
      toast.error('Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item._id === medicine._id);
    
    if (existingItem) {
      if (existingItem.cartQuantity >= medicine.quantity) {
        toast.error(`Only ${medicine.quantity} units available in stock`);
        return;
      }
      setCart(cart.map(item =>
        item._id === medicine._id
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      ));
    } else {
      if (medicine.quantity < 1) {
        toast.error('This medicine is out of stock');
        return;
      }
      setCart([...cart, {
        ...medicine,
        cartQuantity: 1
      }]);
    }
    toast.success(`${medicine.name} added to cart`);
  };

  const updateCartQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(medicineId);
      return;
    }

    const medicine = medicines.find(m => m._id === medicineId);
    if (newQuantity > medicine.quantity) {
      toast.error(`Only ${medicine.quantity} units available in stock`);
      return;
    }

    setCart(cart.map(item =>
      item._id === medicineId
        ? { ...item, cartQuantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item._id !== medicineId));
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTax(0);
    toast.success('Cart cleared');
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = (subtotal * tax) / 100;
    return subtotal - discountAmount + taxAmount;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast.error('Please add items to the cart');
      return;
    }

    if (!customerInfo.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    const billData = {
      customerName: customerInfo.name,
      customerMobile: customerInfo.mobile,
      customerEmail: customerInfo.email,
      items: cart.map(item => ({
        medicine: item._id,
        medicineName: item.name,
        batchNo: item.batchNo,
        quantity: item.cartQuantity,
        price: item.price,
        mrp: item.mrp,
        discount: item.discount || 0
      })),
      subtotal: calculateSubtotal(),
      discount: discount,
      tax: tax,
      total: calculateTotal(),
      paymentMethod: 'Cash'
    };

    onBillGenerate(billData);
  };

  const quickAddMedicine = (medicine) => {
    addToCart(medicine);
    setSelectedMedicine(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Bill
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex h-[calc(95vh-80px)]">
          {/* Left Panel - Medicine Selection */}
          <div className="flex-1 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search medicines by name or batch number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full input-field"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredMedicines.map((medicine) => (
                  <motion.div
                    key={medicine._id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 cursor-pointer"
                    onClick={() => setSelectedMedicine(medicine)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {medicine.name}
                      </h4>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {medicine.category}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p>Batch: {medicine.batchNo}</p>
                      <p>Stock: {medicine.quantity}</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(medicine.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(medicine);
                      }}
                      className="w-full mt-2 bg-primary-600 text-white py-1 px-3 rounded text-sm hover:bg-primary-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </motion.div>
                ))}
              </div>

              {filteredMedicines.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Search size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No medicines found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Cart & Customer Info */}
          <div className="w-96 flex flex-col">
            {/* Customer Information */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <User size={18} className="mr-2" />
                Customer Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone size={14} className="inline mr-1" />
                    Mobile
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.mobile}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, mobile: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Enter mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail size={14} className="inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="input-field text-sm"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Cart Items ({cart.length})
                </h3>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-red-600 dark:text-red-400 text-sm hover:text-red-800 dark:hover:text-red-300"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Batch: {item.batchNo}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-white dark:bg-gray-600 rounded-lg px-2 py-1">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item._id, item.cartQuantity - 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 text-xs"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-medium text-sm">
                          {item.cartQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item._id, item.cartQuantity + 1)}
                          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500 text-xs"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatCurrency(item.price * item.cartQuantity)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Plus size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm">Your cart is empty</p>
                    <p className="text-xs">Add medicines from the left panel</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Summary & Actions */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-16 input-field text-right text-sm py-1"
                        min="0"
                        max="100"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-16 input-field text-right text-sm py-1"
                        min="0"
                        max="100"
                      />
                      <span className="text-xs">%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold border-t pt-2 dark:border-gray-600">
                    <span>Total Amount:</span>
                    <span className="text-green-600 dark:text-green-400">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-sm"
                  >
                    Generate Bill
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </motion.div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {selectedMedicine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Add {selectedMedicine.name}
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Batch:</span>
                  <span className="font-medium">{selectedMedicine.batchNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="font-medium">{formatCurrency(selectedMedicine.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                  <span className="font-medium">{selectedMedicine.quantity}</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedMedicine(null)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => quickAddMedicine(selectedMedicine)}
                  className="flex-1 btn-primary text-sm py-2"
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BillingForm;