import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, ArrowUp, ArrowDown, Package, Clock } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function RestaurantAnalytics({ orders, restaurant }) {
  const [timeRange, setTimeRange] = useState('week'); // 'today', 'week', 'month', 'year'
  const [isRealData, setIsRealData] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    topItems: [],
    revenueByDay: [],
    ordersByStatus: {},
    revenueGrowth: 0,
    ordersGrowth: 0,
    hourlyData: [],
    categoryData: [],
    previousPeriodRevenue: 0
  });

  useEffect(() => {
    calculateAnalytics();
  }, [orders, timeRange]);

  const calculateAnalytics = () => {
    // Always use real data if available, otherwise use sample data
    const hasRealData = orders && orders.length > 0;
    setIsRealData(hasRealData);
    
    if (!hasRealData) {
      // Generate sample data for demonstration
      setAnalytics(generateSampleData());
      return;
    }

    const now = new Date();
    
    // Filter orders for current period
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (timeRange) {
        case 'today':
          return orderDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        case 'year':
          return orderDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    // Filter orders for previous period (for growth calculation)
    const previousOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (timeRange) {
        case 'today':
          const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          return orderDate.toDateString() === yesterday.toDateString();
        case 'week':
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= twoWeeksAgo && orderDate < oneWeekAgo;
        case 'month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          return orderDate >= lastMonth && orderDate <= lastMonthEnd;
        case 'year':
          return orderDate.getFullYear() === now.getFullYear() - 1;
        default:
          return false;
      }
    });

    // Calculate metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const previousPeriodRevenue = previousOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const previousPeriodOrders = previousOrders.length;
    
    // Calculate growth percentages
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0;
    
    const ordersGrowth = previousPeriodOrders > 0 
      ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100 
      : totalOrders > 0 ? 100 : 0;

    // Top items
    const itemCounts = {};
    filteredOrders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { count: 0, revenue: 0 };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Revenue by day (last 7 days)
    const revenueByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === date.toDateString()
      );
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      revenueByDay.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    // Hourly data (for current period)
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourOrders = filteredOrders.filter(order => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      });
      return {
        hour: `${hour}:00`,
        orders: hourOrders.length,
        revenue: hourOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      };
    }).filter(data => data.orders > 0 || data.revenue > 0);

    // Orders by status
    const ordersByStatus = filteredOrders.reduce((acc, order) => {
      const status = order.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Category data (order types)
    const categoryData = filteredOrders.reduce((acc, order) => {
      const type = order.orderType || 'dine-in';
      if (!acc[type]) {
        acc[type] = { name: type, value: 0, revenue: 0 };
      }
      acc[type].value += 1;
      acc[type].revenue += order.totalAmount || 0;
      return acc;
    }, {});

    setAnalytics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topItems,
      revenueByDay,
      ordersByStatus,
      revenueGrowth: parseFloat(revenueGrowth.toFixed(1)),
      ordersGrowth: parseFloat(ordersGrowth.toFixed(1)),
      hourlyData,
      categoryData: Object.values(categoryData),
      previousPeriodRevenue
    });
  };

  const generateSampleData = () => {
    return {
      totalRevenue: 45680,
      totalOrders: 156,
      avgOrderValue: 293,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
      previousPeriodRevenue: 40500,
      topItems: [
        { name: 'Margherita Pizza', count: 45, revenue: 11250 },
        { name: 'Chicken Biryani', count: 38, revenue: 9500 },
        { name: 'Paneer Tikka', count: 32, revenue: 6400 },
        { name: 'Veg Burger', count: 28, revenue: 4200 },
        { name: 'Masala Dosa', count: 25, revenue: 3750 }
      ],
      revenueByDay: [
        { day: 'Mon', date: 'Nov 25', revenue: 5200, orders: 18 },
        { day: 'Tue', date: 'Nov 26', revenue: 6800, orders: 23 },
        { day: 'Wed', date: 'Nov 27', revenue: 7200, orders: 25 },
        { day: 'Thu', date: 'Nov 28', revenue: 6500, orders: 22 },
        { day: 'Fri', date: 'Nov 29', revenue: 8900, orders: 31 },
        { day: 'Sat', date: 'Nov 30', revenue: 9800, orders: 34 },
        { day: 'Sun', date: 'Dec 1', revenue: 7280, orders: 25 }
      ],
      hourlyData: [
        { hour: '9:00', orders: 5, revenue: 1200 },
        { hour: '12:00', orders: 15, revenue: 4500 },
        { hour: '13:00', orders: 18, revenue: 5400 },
        { hour: '19:00', orders: 25, revenue: 7500 },
        { hour: '20:00', orders: 22, revenue: 6600 },
        { hour: '21:00', orders: 12, revenue: 3600 }
      ],
      categoryData: [
        { name: 'dine-in', value: 85, revenue: 25500 },
        { name: 'delivery', value: 58, revenue: 17400 },
        { name: 'takeaway', value: 13, revenue: 2780 }
      ],
      ordersByStatus: {
        pending: 12,
        preparing: 8,
        'out-for-delivery': 5,
        delivered: 131
      }
    };
  };

  const StatCard = ({ icon: Icon, title, value, growth, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );

  const maxRevenue = Math.max(...analytics.revenueByDay.map(d => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Analytics</h2>
            {!isRealData && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                📊 Demo Data
              </span>
            )}
            {isRealData && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                ✅ Live Data
              </span>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isRealData ? 'Real-time performance metrics' : 'Sample data for demonstration'}
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {['today', 'week', 'month', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`₹${analytics.totalRevenue.toLocaleString()}`}
          growth={analytics.revenueGrowth}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={ShoppingBag}
          title="Total Orders"
          value={analytics.totalOrders}
          growth={analytics.ordersGrowth}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Avg Order Value"
          value={`₹${Math.round(analytics.avgOrderValue)}`}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Users}
          title="Active Customers"
          value={Math.round(analytics.totalOrders * 0.7)}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Trend</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 7 days performance</p>
            </div>
            <Calendar size={20} className="text-primary" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.revenueByDay}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="day" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#f97316" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total (7 days)</span>
              <span className="text-xl font-bold text-primary">
                ₹{analytics.revenueByDay.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Top Items Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Selling Items</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">By revenue generated</p>
            </div>
            <Package size={20} className="text-primary" />
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                type="number" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#9ca3af" 
                style={{ fontSize: '11px' }}
                width={100}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value, name) => {
                  if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                  if (name === 'count') return [value, 'Orders'];
                  return [value, name];
                }}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Trends & Order Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Revenue Trend */}
        {analytics.hourlyData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hourly Performance</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Orders by hour of day</p>
              </div>
              <Clock size={20} className="text-primary" />
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis 
                  dataKey="hour" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '10px' }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => {
                    if (name === 'orders') return [value, 'Orders'];
                    if (name === 'revenue') return [`₹${value.toLocaleString()}`, 'Revenue'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order Type Distribution */}
        {analytics.categoryData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order Types</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Distribution by type</p>
              </div>
              <ShoppingBag size={20} className="text-primary" />
            </div>
            
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryData.map((entry, index) => {
                      const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value, name, props) => [
                      `${value} orders (₹${props.payload.revenue.toLocaleString()})`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-2">
              {analytics.categoryData.map((item, index) => {
                const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981'];
                return (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {item.value} orders
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Status Distribution</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.ordersByStatus).map(([status, count]) => {
            const colors = {
              pending: 'from-yellow-500 to-yellow-600',
              preparing: 'from-blue-500 to-blue-600',
              'out-for-delivery': 'from-purple-500 to-purple-600',
              delivered: 'from-green-500 to-green-600',
              completed: 'from-green-500 to-green-600'
            };
            
            const totalOrders = Object.values(analytics.ordersByStatus).reduce((a, b) => a + b, 0);
            const percentage = totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0;
            
            return (
              <div key={status} className="text-center">
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${colors[status] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg`}>
                  {count}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {status.replace('-', ' ')}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {percentage}%
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <h4 className="text-sm font-medium opacity-90 mb-2">Peak Hours</h4>
          <p className="text-3xl font-bold mb-1">
            {analytics.hourlyData.length > 0 
              ? analytics.hourlyData.reduce((max, curr) => curr.orders > max.orders ? curr : max, analytics.hourlyData[0]).hour
              : '7-9 PM'
            }
          </p>
          <p className="text-sm opacity-75">Most orders received</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h4 className="text-sm font-medium opacity-90 mb-2">Avg Order Value</h4>
          <p className="text-3xl font-bold mb-1">₹{Math.round(analytics.avgOrderValue)}</p>
          <p className="text-sm opacity-75">Per transaction</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <h4 className="text-sm font-medium opacity-90 mb-2">Customer Rating</h4>
          <p className="text-3xl font-bold mb-1">{restaurant?.rating || 4.5} ⭐</p>
          <p className="text-sm opacity-75">Based on reviews</p>
        </div>
      </div>
    </div>
  );
}
