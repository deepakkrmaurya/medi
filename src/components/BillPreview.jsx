import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, X, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const BillPreview = ({ bill, user, onClose }) => {
  const billRef = useRef();

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => billRef.current,
    documentTitle: `tax-invoice-${bill.billNo}`,
    pageStyle: `
      @media print {
        @page {
          size: A4;
          margin: 0.5in;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          font-size: 12px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        .print-section {
          width: 100% !important;
          background: white !important;
          margin: 0 !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        th, td {
          border: 1px solid #000 !important;
          padding: 6px !important;
          text-align: left !important;
        }
        .bg-gray-100 {
          background-color: #f3f4f6 !important;
        }
        .border {
          border: 1px solid #000 !important;
        }
        .border-t {
          border-top: 1px solid #000 !important;
        }
        .border-b {
          border-bottom: 1px solid #000 !important;
        }
      }
    `,
    onAfterPrint: () => toast.success('Tax invoice printed successfully'),
  });

  // Download as PDF
  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-download' });
      
      const element = billRef.current;
      
      // Add print styles for PDF generation
      const originalStyles = element.style.cssText;
      element.style.width = '210mm';
      element.style.margin = '0 auto';
      element.style.padding = '15mm';
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Restore original styles
      element.style.cssText = originalStyles;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`invoice-${bill.billNo}.pdf`);
      
      toast.success('PDF downloaded successfully', { id: 'pdf-download' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', { id: 'pdf-download' });
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = bill.items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      const discountAmount = itemTotal * ((item.discount || 0) / 100);
      return sum + (itemTotal - discountAmount);
    }, 0);

    const totalDiscount = bill.items.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      return sum + (itemTotal * ((item.discount || 0) / 100));
    }, 0);

    const taxAmount = subtotal * ((bill.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    return { 
      subtotal: Math.round(subtotal * 100) / 100, 
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100, 
      total: Math.round(total * 100) / 100 
    };
  };

  const { subtotal, totalDiscount, taxAmount, total } = calculateTotals();

  // Convert amount to words - FIXED VERSION
  const convertToWords = (amount) => {
    if (amount === 0) return 'Zero Rupees Only';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertLessThanThousand = (num) => {
      if (num === 0) return '';
      if (num < 10) return units[num];
      if (num < 20) return teens[num - 10];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
      return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' and ' + convertLessThanThousand(num % 100) : '');
    };

    let rupees = Math.floor(amount); // Changed from const to let
    const paise = Math.round((amount - rupees) * 100);
    
    let words = '';
    
    if (rupees >= 10000000) {
      words += convertLessThanThousand(Math.floor(rupees / 10000000)) + ' Crore ';
      rupees %= 10000000;
    }
    
    if (rupees >= 100000) {
      words += convertLessThanThousand(Math.floor(rupees / 100000)) + ' Lakh ';
      rupees %= 100000;
    }
    
    if (rupees >= 1000) {
      words += convertLessThanThousand(Math.floor(rupees / 1000)) + ' Thousand ';
      rupees %= 1000;
    }
    
    if (rupees > 0) {
      words += convertLessThanThousand(rupees);
    }
    
    words = words.trim() + ' Rupees';
    
    if (paise > 0) {
      words += ' and ' + convertLessThanThousand(paise) + ' Paise';
    }
    
    return words + ' Only';
  };

  // Ensure bill has all required fields
  const currentBill = {
    billNo: bill.billNo,
    customerName: bill.customerName || '',
    customerAddress: bill.customerAddress || '',
    customerGSTIN: bill.customerGSTIN || '',
    customerMobile: bill.customerMobile || '',
    paymentMethod: bill.paymentMethod || 'Cash',
    taxRate: bill.taxRate || 0,
    items: bill.items || []
  };

  const currentUser = {
    storeName: user?.storeName || 'MEDICAL STORE',
    storeAddress: user?.storeAddress || 'Church Street Bengaluru',
    phone: user?.phone || '+91-1075314648',
    altPhone: user?.altPhone || '+91-8029924749',
    gstNumber: user?.gstNumber || '',
    name: user?.name || 'Store Manager'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl overflow-hidden"
      >
        {/* Header */}
        <div className="no-print flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            TAX INVOICE PREVIEW
          </h2>
          <div className="flex items-center space-x-3">
            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <FileText size={18} />
              <span>Download PDF</span>
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Printer size={18} />
              <span>Print</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Bill Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6">
          <div ref={billRef} className="print-section bg-white mx-auto border border-gray-300 p-8" style={{ width: '210mm', margin: '0 auto' }}>
            
            {/* Header Section */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold uppercase mb-2 border-b-2 border-black pb-2">
                TAX INVOICE
              </h1>
              
              <div className="mb-3">
                <h2 className="text-lg font-semibold uppercase mb-1">MEDICAL INVOICE</h2>
                <p className="text-xs">Address: {currentUser.storeAddress}</p>
                <p className="text-xs">
                  Phone no: {currentUser.phone} {currentUser.altPhone && ` ${currentUser.altPhone}`}
                </p>
              </div>
            </div>

            {/* Party Details Section */}
            <div className="mb-4 grid grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-base mb-1 border-b border-gray-300 pb-1">Party's Name</h3>
                <div className="space-y-1">
                  <p><strong>Name:</strong> {currentBill.customerName || '____________________'}</p>
                  <p><strong>Address:</strong> {currentBill.customerAddress || '____________________'}</p>
                  <p><strong>GSTIN NO:</strong> {currentBill.customerGSTIN || '____________________'}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="space-y-1">
                  <p><strong>Invoice No:</strong> {currentBill.billNo}</p>
                  <p><strong>Date:</strong> {formatDate(new Date())}</p>
                  {currentUser.gstNumber && <p><strong>Store GSTIN:</strong> {currentUser.gstNumber}</p>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-4">
              <table className="w-full border-collapse border border-gray-800 text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-800 px-2 py-1 text-left font-semibold w-8">S.No</th>
                    <th className="border border-gray-800 px-2 py-1 text-left font-semibold">Items</th>
                    <th className="border border-gray-800 px-2 py-1 text-left font-semibold w-16">HSN</th>
                    <th className="border border-gray-800 px-2 py-1 text-left font-semibold w-16">RATE</th>
                    <th className="border border-gray-800 px-2 py-1 text-left font-semibold w-16">MRP</th>
                    <th className="border border-gray-800 px-2 py-1 text-left font-semibold w-16">TAX</th>
                    <th className="border border-gray-800 px-2 py-1 text-left font-semibold w-20">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBill.items.map((item, index) => {
                    const itemTotal = item.price * item.quantity;
                    const discountAmount = itemTotal * ((item.discount || 0) / 100);
                    const finalAmount = itemTotal - discountAmount;
                    const itemTax = finalAmount * (currentBill.taxRate / 100);
                    const totalAmount = finalAmount + itemTax;

                    return (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="border border-gray-800 px-2 py-1 align-top">{index + 1}.</td>
                          <td className="border border-gray-800 px-2 py-1 align-top">
                            <div className="font-medium">{item.medicineName}</div>
                            <div className="text-gray-600">{item.batchNo}</div>
                          </td>
                          <td className="border border-gray-800 px-2 py-1 align-top">{item.hsnCode || '3004'}</td>
                          <td className="border border-gray-800 px-2 py-1 align-top">{formatCurrency(item.price)}</td>
                          <td className="border border-gray-800 px-2 py-1 align-top">{formatCurrency(item.mrp || item.price * 1.2)}</td>
                          <td className="border border-gray-800 px-2 py-1 align-top">
                            {currentBill.taxRate || 0}% ({formatCurrency(itemTax)})
                          </td>
                          <td className="border border-gray-800 px-2 py-1 align-top font-semibold">
                            {formatCurrency(totalAmount)}
                          </td>
                        </tr>
                        {/* Additional description row */}
                        <tr>
                          <td className="border border-gray-800 px-2 py-0"></td>
                          <td colSpan="6" className="border border-gray-800 px-2 py-0 text-gray-600">
                            {item.description || `${item.category} Medicine`}
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Empty rows for additional items */}
                  {Array.from({ length: Math.max(0, 5 - currentBill.items.length) }).map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="border border-gray-800 px-2 py-1">{currentBill.items.length + index + 1}.</td>
                      <td className="border border-gray-800 px-2 py-1"></td>
                      <td className="border border-gray-800 px-2 py-1"></td>
                      <td className="border border-gray-800 px-2 py-1"></td>
                      <td className="border border-gray-800 px-2 py-1"></td>
                      <td className="border border-gray-800 px-2 py-1"></td>
                      <td className="border border-gray-800 px-2 py-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Horizontal Line */}
            <div className="border-t border-gray-800 my-2"></div>

            {/* Totals Section */}
            <div className="mb-4 text-sm">
              <div className="flex justify-between items-start">
                <div className="w-1/2">
                  <div className="mb-2">
                    <h3 className="font-semibold text-base mb-1">Sub Total</h3>
                    <div className="text-xl font-bold">{formatCurrency(total)}</div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-base mb-1">Amount in words</h3>
                    <div className="border border-gray-400 p-1 min-h-10 text-xs italic">
                      {convertToWords(total)}
                    </div>
                  </div>
                </div>
                
                <div className="w-1/2">
                  <table className="w-full border-collapse text-sm">
                    <tbody>
                      <tr>
                        <td className="py-0 pr-3 text-right font-semibold">Subtotal:</td>
                        <td className="py-0 text-right border-b border-gray-300">{formatCurrency(subtotal)}</td>
                      </tr>
                      {totalDiscount > 0 && (
                        <tr>
                          <td className="py-0 pr-3 text-right font-semibold">Discount:</td>
                          <td className="py-0 text-right border-b border-gray-300 text-red-600">-{formatCurrency(totalDiscount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-0 pr-3 text-right font-semibold">Tax ({(currentBill.taxRate || 0)}%):</td>
                        <td className="py-0 text-right border-b border-gray-300">{formatCurrency(taxAmount)}</td>
                      </tr>
                      <tr>
                        <td className="py-0 pr-3 text-right font-semibold text-base">Total:</td>
                        <td className="py-0 text-right border-b-2 border-gray-800 text-base font-bold">
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="grid grid-cols-2 gap-6 mt-4 pt-2 border-t border-gray-800 text-xs">
              <div>
                <h3 className="font-semibold text-base mb-1">Terms and Conditions</h3>
                <div className="space-y-0 border border-gray-400 p-1 min-h-16">
                  <p>• Goods once sold will not be taken back</p>
                  <p>• Subject to Bengaluru jurisdiction</p>
                  <p>• E. &. O.E.</p>
                  <p>• Please check medicines at the time of purchase</p>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-base mb-1">Seal & Signature</h3>
                <div className="border border-gray-400 p-2 min-h-16 flex items-center justify-center">
                  <div className="text-gray-600">
                    <p>For {currentUser.storeName}</p>
                    <p className="mt-2">____________________</p>
                    <p>Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-3 pt-2 border-t border-gray-300 text-gray-600">
              <p>This is a computer generated invoice</p>
              <p>Generated on: {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BillPreview;