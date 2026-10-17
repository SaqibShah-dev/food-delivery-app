import { useEffect, useState } from 'react';
import axios from 'axios';
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

import type {
  IDashboardStats,
  IPopularFood,
  IRevenueCategory,
} from '../../types';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'Failed to load dashboard'
    );
  }

  return error instanceof Error
    ? error.message
    : 'Failed to load dashboard';
}

export default function Dashboard() {
  const [stats, setStats] = useState<IDashboardStats | null>(null);
  const [popularFood, setPopularFood] = useState<IPopularFood[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<
    IRevenueCategory[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [statsRes, popularRes, revenueRes] = await Promise.all([
          getDashboardStats(),
          getPopularFood(5),
          getRevenueByCategory(),
        ]);

        if (!active) {
          return;
        }

        setStats(statsRes.data);
        setPopularFood(popularRes.data);
        setRevenueByCategory(revenueRes.data);
      } catch (err: unknown) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div
        role="status"
        className="flex min-h-96 items-center justify-center p-6"
      >
        <p className="text-sm text-gray-500">
          Loading dashboard…
        </p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error || 'Dashboard statistics are unavailable'}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Administration
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Monitor orders, revenue, and popular food items.
          </p>
        </div>

        {/* Statistics */}
        <section
          aria-label="Dashboard statistics"
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-medium text-gray-500">
              Total Orders
            </h2>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-medium text-gray-500">
              Total Revenue
            </h2>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {currencyFormatter.format(stats.totalRevenue)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-sm font-medium text-gray-500">
              Pending Orders
            </h2>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.pendingOrders}
            </p>
          </div>
        </section>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="min-w-0 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top 5 Popular Food Items
            </h2>

            {popularFood.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                No popular food data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularFood}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="totalQuantity"
                    name="Units ordered"
                    fill="#0088FE"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="min-w-0 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Revenue by Category
            </h2>

            {revenueByCategory.length === 0 ? (
              <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                No category revenue data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    dataKey="totalRevenue"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {revenueByCategory.map((item, index) => (
                      <Cell
                        key={item.category}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>

        {/* Recent orders */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
          </div>

          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No orders have been placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      'Customer',
                      'Total',
                      'Status',
                      'Payment',
                      'Date',
                    ].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">
                        {order.user?.name || order.address.fullName}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {currencyFormatter.format(order.totalAmount)}
                      </td>

                      <td className="px-5 py-4 text-sm capitalize text-gray-700">
                        {order.status.replaceAll('-', ' ')}
                      </td>

                      <td className="px-5 py-4 text-sm capitalize text-gray-700">
                        {order.paymentStatus}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}