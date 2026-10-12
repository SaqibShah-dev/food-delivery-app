import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getDashboardStats,
  getPopularFood,
  getRevenueByCategory,
} from '../../api/admin';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

type Stats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  recentOrders: any[];
};

type PopularFood = {
  foodId: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
};

type RevenueCategory = {
  category: string;
  totalRevenue: number;
  totalQuantity: number;
  orderCount: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [popularFood, setPopularFood] = useState<PopularFood[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, popularRes, revenueRes] = await Promise.all([
          getDashboardStats(),
          getPopularFood(5),
          getRevenueByCategory(),
        ]);

        setStats(statsRes.data);
        setPopularFood(popularRes.data);
        setRevenueByCategory(revenueRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold">{stats?.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold">${stats?.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Pending Orders</h3>
          <p className="text-3xl font-bold">{stats?.pendingOrders}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular food bar chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top 5 Popular Food Items</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularFood}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalQuantity" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by category pie chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueByCategory}
                dataKey="totalRevenue"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Payment</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stats?.recentOrders.map((order) => (
              <tr key={order._id}>
                <td className="px-4 py-2">{order.user?.name || 'Unknown'}</td>
                <td className="px-4 py-2">${order.totalAmount.toFixed(2)}</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2">{order.paymentStatus}</td>
                <td className="px-4 py-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}