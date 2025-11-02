import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileFooter from './MobileFooter';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Only visible on desktop (lg and above) */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar - Visible on all screens */}
        <Topbar />
        
        {/* Main Content with proper spacing for mobile footer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pt-4 pb-4 lg:pb-6 sm:px-6 sm:pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Mobile Footer Navigation - Only visible on mobile */}
          <MobileFooter />
        </div>
      </div>
    </div>
  );
};

export default Layout;