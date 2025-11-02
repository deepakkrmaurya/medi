// components/SavedBills.jsx
import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Download, Calendar, User, Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const SavedBills = ({ isOpen, onClose }) => {
  const [savedBills, setSavedBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedBills();
    }
  }, [isOpen]);

  const loadSavedBills = () => {
    try {
      const bills = JSON.parse(localStorage.getItem('medicalBills') || '[]');
      setSavedBills(bills);
    } catch (error) {
      toast.error('Failed to load saved bills');
    }
  };

  const deleteBill = (billId) => {
    try {
      const updatedBills = savedBills.filter(bill => bill.id !== billId);
      localStorage.setItem('medicalBills', JSON.stringify(updatedBills));
      setSavedBills(updatedBills);
      toast.success('Bill deleted successfully');
    } catch (error) {
      toast.error('Failed to delete bill');
    }
  };

  const downloadBill = (bill) => {
    try {
      const blob = new Blob([JSON.stringify(bill, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${bill.billNo}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Bill downloaded successfully');
    } catch (error) {
      toast.error('Failed to download bill');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Receipt className="mr-2" size={24} />
            Saved Bills
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {savedBills.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Receipt size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No saved bills found</p>
              <p className="text-sm">Bills you save will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar size={14} />
                          <span>{formatDate(bill.savedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <User size={14} />
                          <span>{bill.customerName}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Bill No:</span>
                          <p className="font-medium">{bill.billNo}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Items:</span>
                          <p className="font-medium">{bill.items.length}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total:</span>
                          <p className="font-medium text-green-600">{formatCurrency(bill.total)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Payment:</span>
                          <p className="font-medium">{bill.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => downloadBill(bill)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Download Bill"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total {savedBills.length} bills saved
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedBills;