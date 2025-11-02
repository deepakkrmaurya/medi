import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SalesChart = () => {
  // Mock data - in real app, this would come from API
  const data = [
    { month: 'Jan', sales: 4000, revenue: 2400 },
    { month: 'Feb', sales: 3000, revenue: 1398 },
    { month: 'Mar', sales: 2000, revenue: 9800 },
    { month: 'Apr', sales: 2780, revenue: 3908 },
    { month: 'May', sales: 1890, revenue: 4800 },
    { month: 'Jun', sales: 2390, revenue: 3800 },
    { month: 'Jul', sales: 3490, revenue: 4300 },
    { month: 'Aug', sales: 4000, revenue: 2400 },
    { month: 'Sep', sales: 3000, revenue: 1398 },
    { month: 'Oct', sales: 2000, revenue: 9800 },
    { month: 'Nov', sales: 2780, revenue: 3908 },
    { month: 'Dec', sales: 1890, revenue: 4800 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="month" 
          className="text-sm"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis 
          className="text-sm"
          tick={{ fill: 'currentColor' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(229, 231, 235)',
            borderRadius: '0.5rem',
            color: 'rgb(17, 24, 39)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="sales" 
          stroke="#0ea5e9" 
          strokeWidth={2}
          name="Sales"
          dot={{ fill: '#0ea5e9', strokeWidth: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10b981" 
          strokeWidth={2}
          name="Revenue"
          dot={{ fill: '#10b981', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;