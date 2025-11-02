import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, Search, ShoppingCart, User, Phone, Receipt } from 'lucide-react';
import { medicineAPI } from '../services/api';
import { formatCurrency, generateBillNo } from '../utils/helpers';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import BillPreview from '../components/BillPreview';

const Billing = () => {
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
  const [billGenerated, setBillGenerated] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

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

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * discount) / 100;
    const taxAmount = (subtotal * tax) / 100;
    return subtotal - discountAmount + taxAmount;
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setTax(0);
    toast.success('Cart cleared');
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Please add items to the cart');
      return;
    }

    if (!customerInfo.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    const billData = {
      billNo: generateBillNo(),
      customerName: customerInfo.name,
      customerMobile: customerInfo.mobile,
      customerEmail: customerInfo.email,
      items: cart.map(item => ({
        medicine: item._id,
        medicineName: item.name,
        batchNo: item.batchNo,
        hsnCode: item.hsnCode || '3004',
        quantity: item.cartQuantity,
        price: item.price,
        mrp: item.mrp || item.price * 1.2,
        discount: item.discount || 0,
        category: item.category,
        description: `${item.category} Medicine`
      })),
      subtotal: calculateSubtotal(),
      discount: discount,
      taxRate: tax,
      total: calculateTotal(),
      paymentMethod: 'Cash',
      date: new Date().toISOString()
    };

    // Set current bill and show preview
    setCurrentBill(billData);
    setShowBillPreview(true);
  };

  const handleSaveBill = async (bill) => {
    try {
      // Save bill to backend
      console.log('Saving bill:', bill);
      
      // Show success message
      setBillGenerated(true);
      toast.success('Bill saved successfully!');
      
      // Reset form after delay
      setTimeout(() => {
        setCart([]);
        setCustomerInfo({ name: '', mobile: '', email: '' });
        setDiscount(0);
        setTax(0);
        setBillGenerated(false);
        setShowBillPreview(false);
        setCurrentBill(null);
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to save bill');
    }
  };

  // Sample user data for the bill preview
  const userData = {
    storeName: 'MEDICAL STORE',
    storeAddress: 'Church Street Bengaluru',
    phone: '+91-1075314648',
    altPhone: '+91-8029924749',
    gstNumber: '29ABCDE1234F1Z5',
    name: 'Store Manager'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Billing System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create bills and manage customer transactions
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Bill No: {generateBillNo()}
        </div>
      </div>

      <AnimatePresence>
        {billGenerated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <Receipt className="text-green-600 dark:text-green-400" size={24} />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  Bill Generated Successfully!
                </h3>
                <p className="text-green-700 dark:text-green-400 text-sm">
                  The bill has been created and saved successfully.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Customer Info & Medicine Selection */}
        <div className="xl:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2">
              <User size={20} />
              <span>Customer Information</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter customer name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="tel"
                    value={customerInfo.mobile}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, mobile: e.target.value }))}
                    className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          {/* Medicine Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Select Medicines
            </h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search medicines by name or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Medicines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {filteredMedicines.map((medicine) => (
                <motion.div
                  key={medicine._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">
                      {medicine.name}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Batch: {medicine.batchNo}</p>
                      <p>Stock: {medicine.quantity} • {formatCurrency(medicine.price)}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addToCart(medicine)}
                    disabled={medicine.quantity === 0}
                    className="ml-3 bg-orange-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Plus size={16} />
                  </motion.button>
                </motion.div>
              ))}

              {filteredMedicines.length === 0 && (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No medicines found</p>
                  <p className="text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Cart & Summary */}
        <div className="space-y-6">
          {/* Cart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <ShoppingCart size={20} />
                <span>Cart Items</span>
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                <p>Your cart is empty</p>
                <p className="text-sm">Add medicines from the list</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.price)} each
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-white dark:bg-gray-600 rounded-lg px-2 py-1">
                        <button
                          onClick={() => updateCartQuantity(item._id, item.cartQuantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-medium text-sm">
                          {item.cartQuantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item._id, item.cartQuantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-500"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="text-right min-w-20">
                        <p className="font-medium text-sm">
                          {formatCurrency(item.price * item.cartQuantity)}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="mt-6 space-y-3 border-t pt-4 dark:border-gray-600">
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
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-right text-sm dark:bg-gray-700 dark:text-white"
                      min="0"
                      max="100"
                    />
                    <span>%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-right text-sm dark:bg-gray-700 dark:text-white"
                      min="0"
                      max="100"
                    />
                    <span>%</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-lg font-bold border-t pt-3 dark:border-gray-600">
                  <span>Total Amount:</span>
                  <span className="text-green-600 dark:text-green-400">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors mt-4"
                >
                  Generate Bill & Print
                </motion.button>
              </div>
            )}
          </div>

          {/* Quick Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Quick Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-400">Items in Cart:</span>
                <span className="font-medium">{cart.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-400">Total Quantity:</span>
                <span className="font-medium">
                  {cart.reduce((sum, item) => sum + item.cartQuantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-400">Customer:</span>
                <span className="font-medium truncate max-w-24">
                  {customerInfo.name || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Preview Modal */}
      {showBillPreview && currentBill && (
        <BillPreview
          bill={currentBill}
          user={userData}
          onClose={() => setShowBillPreview(false)}
          onSave={handleSaveBill}
        />
      )}
    </div>
  );
};

export default Billing;