import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  FaArrowUp,
  FaArrowDown,
  FaMoneyBillWave,
  FaShoppingCart,
  FaStore,
  FaCube,
  FaSearch,
  FaUserAlt
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import './Layout.css';
import Dashboard from '../pages/Dashboard';

const salesData = [
  { month: 'Jan', sales: 45000 },
  { month: 'Feb', sales: 52000 },
  { month: 'Mar', sales: 48000 },
  { month: 'Apr', sales: 61000 },
  { month: 'May', sales: 55000 },
  { month: 'Jun', sales: 67000 },
  { month: 'Jul', sales: 73000 },
  { month: 'Aug', sales: 69000 },
  { month: 'Sep', sales: 78000 },
  { month: 'Oct', sales: 85000 },
  { month: 'Nov', sales: 82000 },
  { month: 'Dec', sales: 95000 }
];

const recentOrders = [
  { id: '#12345', customer: 'John Doe', amount: '₹1,250', status: 'Completed' },
  { id: '#12346', customer: 'Jane Smith', amount: '₹890', status: 'Pending' },
  { id: '#12347', customer: 'Mike Johnson', amount: '₹2,100', status: 'Completed' },
  { id: '#12348', customer: 'Sarah Wilson', amount: '₹650', status: 'Cancelled' }
];

const StatCard = ({ title, value, change, icon, color, changeType }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p className="stat-title">{title}</p>
      <div className={`stat-change ${changeType}`}>
        {changeType === 'up' ? <FaArrowUp /> : <FaArrowDown />}
        {change}
      </div>
    </div>
  </div>
);

// ✅ START component here
const DashboardDataPage = () => {
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:5000/api/products/total-count")
      .then(res => {
        setProductCount(res.data.totalProducts);
      })
      .catch(err => {
        console.error("Failed to load product count", err);
      });
  }, []);

  return (
    <div>
      <Dashboard />
      <div className="container">
        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search vendors, products, orders..."
                className="dashboard-search"
              />
            </div>
            <div className="admin-info">
              <FaUserAlt className="admin-icon" />
              <span>Admin User</span>
            </div>
          </div>

          <div className="stats-grid">
            <StatCard
              title="Total Revenue"
              value="₹244,948"
              change="+12.5% from last month"
              icon={<FaMoneyBillWave />}
              color="green"
              changeType="up"
            />
            <StatCard
              title="Total Orders"
              value="1,231"
              change="+8.2% from last month"
              icon={<FaShoppingCart />}
              color="purple"
              changeType="up"
            />
            <StatCard
              title="Active Vendors"
              value="153"
              change="+5 new this month"
              icon={<FaStore />}
              color="pink"
              changeType="up"
            />
          <StatCard
  title="Total Products"
  value={productCount ? productCount.toLocaleString() : "0"}
  change="+234 this month"
  icon={<FaCube />}
  color="blue"
  changeType="up"
/>

          </div>

          <div className="dashboard-grid">
            <div className="chart-container">
              <div className="chart-header">
                <h3>Sales Overview</h3>
                <select className="time-filter">
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="recent-orders">
              <div className="orders-header">
                <h3>Recent Orders</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="orders-table">
                <div className="table-header">
                  <span>Order ID</span>
                  <span>Customer</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>
                {recentOrders.map((order, index) => (
                  <div key={index} className="table-row">
                    <span className="order-id">{order.id}</span>
                    <span>{order.customer}</span>
                    <span className="amount">{order.amount}</span>
                    <span className={`status ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDataPage;
