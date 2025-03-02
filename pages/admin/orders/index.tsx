import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  Eye,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address?: string;
  shipping_info?: any;
  payment_info?: any;
  payment_id?: string | null;
  created_at: string;
  loyalty_points_earned?: number;
  user?: {
    full_name: string;
    email: string;
  };
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug: string;
  };
}

export default function OrdersAdmin() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'total_amount'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, user:users(full_name, email)')
          .order(sortField, { ascending: sortDirection === 'asc' });
        
        if (error) {
          throw error;
        }
        
        // Fetch order items for all orders to calculate correct totals
        const ordersWithCorrectTotals = await Promise.all((data || []).map(async (order) => {
          // If order total is already set and not zero, use it
          if (order.total_amount && order.total_amount > 0) {
            return order;
          }
          
          // Otherwise, fetch order items and calculate total
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('price, quantity')
            .eq('order_id', order.id);
            
          if (itemsData && itemsData.length > 0) {
            // Calculate total from order items
            const calculatedTotal = itemsData.reduce((sum, item) => {
              return sum + (parseFloat((item.price || 0).toString()) * item.quantity);
            }, 0);
            
            // If calculated total is different from stored total, update the order
            if (calculatedTotal > 0 && calculatedTotal !== order.total_amount) {
              // Update order in database
              await supabase
                .from('orders')
                .update({ total_amount: calculatedTotal })
                .eq('id', order.id);
                
              // Return updated order
              return { ...order, total_amount: calculatedTotal };
            }
          }
          
          return order;
        }));
        
        setOrders(ordersWithCorrectTotals);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [sortField, sortDirection]);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.full_name && order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle sort
  const handleSort = (field: 'created_at' | 'total_amount') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // View order details
  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setUpdateError('');
    setUpdateSuccess('');
    
    try {
      // Fetch order items
      const { data, error } = await supabase
        .from('order_items')
        .select('*, product:products(name, slug)')
        .eq('order_id', order.id);
      
      if (error) {
        throw error;
      }
      
      const items = data || [];
      setOrderItems(items);
      
      // Calculate the correct total from order items
      const calculatedTotal = items.reduce((sum, item) => {
        return sum + (parseFloat((item.price || 0).toString()) * item.quantity);
      }, 0);
      
      // If the calculated total doesn't match the stored total, update the order
      if (calculatedTotal > 0 && calculatedTotal !== order.total_amount) {
        // Update the order in the database
        const { error: updateError } = await supabase
          .from('orders')
          .update({ total_amount: calculatedTotal })
          .eq('id', order.id);
        
        if (updateError) {
          console.error('Error updating order total:', updateError);
        } else {
          // Update the local order object
          setSelectedOrder({
            ...order,
            total_amount: calculatedTotal
          });
          
          // Update the order in the orders list
          setOrders(orders.map(o => 
            o.id === order.id ? { ...o, total_amount: calculatedTotal } : o
          ));
        }
      }
      
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      setUpdateError('');
      setUpdateSuccess('');
      
      const { error } = await supabase
        .from('orders')
        .update({ status: updateStatus })
        .eq('id', selectedOrder.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setOrders(orders.map(o => 
        o.id === selectedOrder.id ? { ...o, status: updateStatus as any } : o
      ));
      
      setSelectedOrder(prev => prev ? { ...prev, status: updateStatus as any } : null);
      setUpdateSuccess('Order status updated successfully!');
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update order status');
    }
  };

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout title="Orders Management">
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('total_amount')}
                  >
                    <div className="flex items-center">
                      Total
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.full_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                        {formatCurrency(parseFloat((order.total_amount || 0).toString()))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Order Details: #{selectedOrder.id.substring(0, 8)}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowOrderDetails(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Order Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-2">Order Information</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Order ID:</div>
                    <div className="text-sm font-medium">{selectedOrder.id}</div>
                    
                    <div className="text-sm text-gray-500">Date:</div>
                    <div className="text-sm">{formatDate(selectedOrder.created_at)}</div>
                    
                    <div className="text-sm text-gray-500">Status:</div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500">Total:</div>
                    <div className="text-sm font-medium">
                      {formatCurrency(
                        orderItems.reduce((sum, item) => {
                          return sum + (parseFloat((item.price || 0).toString()) * item.quantity);
                        }, 0)
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-500">Payment ID:</div>
                    <div className="text-sm">{selectedOrder.payment_id || '-'}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm text-gray-500">Name:</div>
                    <div className="text-sm font-medium">{selectedOrder.user?.full_name || 'Unknown'}</div>
                    
                    <div className="text-sm text-gray-500">Email:</div>
                    <div className="text-sm">{selectedOrder.user?.email || '-'}</div>
                    
                    <div className="text-sm text-gray-500">Shipping Address:</div>
                    <div className="text-sm whitespace-pre-line">
                      {selectedOrder.shipping_address || 
                       (selectedOrder.shipping_info && typeof selectedOrder.shipping_info === 'object' 
                         ? Object.entries(selectedOrder.shipping_info)
                             .map(([key, value]) => `${key}: ${value}`)
                             .join('\n')
                         : selectedOrder.shipping_info)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orderItems.length > 0 ? (
                    orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {item.product ? (
                            <Link 
                              href={`/products/${item.product.slug}`}
                              target="_blank"
                              className="text-primary hover:underline"
                            >
                              {item.product.name}
                            </Link>
                          ) : (
                            `Product ID: ${item.product_id}`
                          )}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {formatCurrency(parseFloat((item.price || 0).toString()))}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(parseFloat((item.price || 0).toString()) * item.quantity)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-center text-sm text-gray-500">
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300">
                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-right">
                      Total:
                    </td>
                    <td className="px-4 py-2 text-sm font-bold">
                      {formatCurrency(
                        orderItems.reduce((sum, item) => {
                          return sum + (parseFloat((item.price || 0).toString()) * item.quantity);
                        }, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {/* Update Status */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Update Status</h4>
              
              {/* Error and Success Messages */}
              {updateError && (
                <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{updateError}</p>
                </div>
              )}
              
              {updateSuccess && (
                <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-start">
                  <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p>{updateSuccess}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <Button 
                  onClick={handleUpdateStatus}
                  disabled={updateStatus === selectedOrder.status}
                >
                  Update Status
                </Button>
              </div>
            </div>
            
            {/* Close Button */}
            <div className="flex justify-end">
              <Button 
                variant="outline"
                onClick={() => setShowOrderDetails(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
