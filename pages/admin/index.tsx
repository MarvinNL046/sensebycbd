import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import logger from '../../lib/utils/logger';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Card } from '../../components/ui/card';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  lowStockProducts: number;
}

interface RecentOrder {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  user: {
    full_name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      
      try {
        // Fetch total products
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        // Fetch low stock products (less than 5 in stock)
        const { count: lowStockProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lt('stock', 5);
        
        // Fetch total orders
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        // Fetch total users
        const { count: totalUsers } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        // Fetch all orders to calculate correct total revenue
        const { data: orders } = await supabase
          .from('orders')
          .select('id, total_amount');
        
        logger.log('Dashboard - Orders:', orders);
        
        // Calculate total revenue based on order items
        let totalRevenue = 0;
        
        if (orders && orders.length > 0) {
          // Process each order
          for (const order of orders) {
            let orderTotal = order.total_amount || 0;
            
            // Fetch order items for this order
            const { data: orderItems } = await supabase
              .from('order_items')
              .select('quantity, price')
              .eq('order_id', order.id);
            
            // If order has items, calculate total from items
            if (orderItems && orderItems.length > 0) {
              const calculatedTotal = orderItems.reduce((sum, item) => {
                return sum + (parseFloat((item.price || 0).toString()) * item.quantity);
              }, 0);
              
              // If calculated total is valid and different from stored total, update the order
              if (calculatedTotal > 0 && calculatedTotal !== order.total_amount) {
                logger.log(`Dashboard - Updating order ${order.id} total from ${order.total_amount} to ${calculatedTotal}`);
                
              try {
                // Update order in database - only update the total_amount field
                const { error: updateError } = await supabase
                  .from('orders')
                  .update({ total_amount: calculatedTotal })
                  .eq('id', order.id);
                
                if (updateError) {
                  logger.error('Error updating order total:', updateError);
                } else {
                  // Use calculated total
                  orderTotal = calculatedTotal;
                }
              } catch (error) {
                logger.error('Exception updating order total:', error);
              }
              }
            }
            
            // Add to total revenue
            totalRevenue += orderTotal;
            logger.log(`Dashboard - Order ${order.id} total: ${orderTotal}, Running total: ${totalRevenue}`);
          }
        }
        
        logger.log('Dashboard - Final total revenue:', totalRevenue);
        
        // Fetch recent orders
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select('id, created_at, status, total_amount, user_id')
          .order('created_at', { ascending: false })
          .limit(5);
        
        logger.log('Dashboard - Recent orders data:', recentOrdersData);
        
        // Fetch user data and calculate correct totals for each order
        const ordersWithUserData = await Promise.all(
          (recentOrdersData || []).map(async (order) => {
            // Fetch order items for this order
            const { data: orderItems } = await supabase
              .from('order_items')
              .select('quantity, price')
              .eq('order_id', order.id);
            
            // Calculate correct total from order items
            let orderTotal = order.total_amount || 0;
            
            if (orderItems && orderItems.length > 0) {
              const calculatedTotal = orderItems.reduce((sum, item) => {
                return sum + (parseFloat((item.price || 0).toString()) * item.quantity);
              }, 0);
              
              if (calculatedTotal > 0) {
                logger.log(`Dashboard - Recent order ${order.id} calculated total: ${calculatedTotal}`);
                
                // Update order in database if needed
                if (calculatedTotal !== order.total_amount) {
                  logger.log(`Dashboard - Updating recent order ${order.id} total from ${order.total_amount} to ${calculatedTotal}`);
                  
                  try {
                    // Update order in database - only update the total_amount field
                    const { error: updateError } = await supabase
                      .from('orders')
                      .update({ total_amount: calculatedTotal })
                      .eq('id', order.id);
                    
                    if (updateError) {
                      logger.error('Error updating recent order total:', updateError);
                    }
                  } catch (error) {
                    logger.error('Exception updating recent order total:', error);
                  }
                }
                
                orderTotal = calculatedTotal;
              }
            }
            
            // Fetch user data
            let userData = { full_name: 'Unknown', email: '' };
            
            if (order.user_id) {
              const { data: userResult } = await supabase
                .from('users')
                .select('full_name, email')
                .eq('id', order.user_id)
                .single();
              
              if (userResult) {
                userData = userResult;
              }
            }
            
            return {
              id: order.id,
              created_at: order.created_at,
              status: order.status,
              total_amount: orderTotal,
              user: userData
            };
          })
        );
        
        logger.log('Dashboard - Orders with user data:', ordersWithUserData);
        
        setStats({
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          totalUsers: totalUsers || 0,
          totalRevenue,
          lowStockProducts: lowStockProducts || 0,
        });
        
        setRecentOrders(ordersWithUserData);
      } catch (error) {
        logger.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Products" 
              value={stats.totalProducts.toString()} 
              icon={<Package className="w-8 h-8 text-blue-500" />}
              href="/admin/products"
            />
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders.toString()} 
              icon={<ShoppingCart className="w-8 h-8 text-green-500" />}
              href="/admin/orders"
            />
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers.toString()} 
              icon={<Users className="w-8 h-8 text-purple-500" />}
              href="/admin/users"
            />
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(stats.totalRevenue)} 
              icon={<TrendingUp className="w-8 h-8 text-yellow-500" />}
            />
          </div>
          
          {/* Alerts */}
          {stats.lowStockProducts > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-400 mr-2" />
                <p className="text-amber-700">
                  <span className="font-bold">{stats.lowStockProducts}</span> products are low in stock (less than 5 items).
                  <Link href="/admin/products" className="ml-2 text-amber-800 underline">
                    View products
                  </Link>
                </p>
              </div>
            </div>
          )}
          
          {/* Recent Orders */}
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.user?.full_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(parseFloat(order.total_amount.toString()))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link href={`/admin/orders/${order.id}`} className="text-primary hover:text-primary-dark">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* View All Orders Link */}
          <div className="mt-4 text-right">
            <Link href="/admin/orders" className="inline-flex items-center text-primary hover:text-primary-dark">
              View all orders
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  href?: string;
}

function StatCard({ title, value, icon, href }: StatCardProps) {
  const content = (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-full">
          {icon}
        </div>
      </div>
    </Card>
  );
  
  if (href) {
    return (
      <Link href={href} className="block h-full hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }
  
  return content;
}
