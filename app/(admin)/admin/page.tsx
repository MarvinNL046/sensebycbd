import Link from 'next/link';
import { Card } from '../../../components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Products</h2>
          <p className="text-gray-600 mb-4">Manage your product catalog</p>
          <Link 
            href="/admin/products" 
            className="text-primary hover:text-primary/80"
          >
            View Products →
          </Link>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Orders</h2>
          <p className="text-gray-600 mb-4">View and manage customer orders</p>
          <Link 
            href="/admin/orders" 
            className="text-primary hover:text-primary/80"
          >
            View Orders →
          </Link>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-gray-600 mb-4">Manage user accounts and permissions</p>
          <Link 
            href="/admin/users" 
            className="text-primary hover:text-primary/80"
          >
            View Users →
          </Link>
        </Card>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/products/new" 
            className="block p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <h3 className="font-medium">Add New Product</h3>
            <p className="text-sm text-gray-500">Create a new product in your catalog</p>
          </Link>
          
          <Link 
            href="/admin/categories" 
            className="block p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <h3 className="font-medium">Manage Categories</h3>
            <p className="text-sm text-gray-500">Organize your products into categories</p>
          </Link>
          
          <Link 
            href="/admin/translations" 
            className="block p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <h3 className="font-medium">Manage Translations</h3>
            <p className="text-sm text-gray-500">Update content translations</p>
          </Link>
          
          <Link 
            href="/" 
            className="block p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <h3 className="font-medium">View Website</h3>
            <p className="text-sm text-gray-500">See your store as customers see it</p>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span>Authentication</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span>Database Connection</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Connected</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span>Server-side Authentication</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Working</span>
          </div>
        </div>
      </div>
    </div>
  );
}
