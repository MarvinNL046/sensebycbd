import Link from 'next/link';
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  FolderTree,
  Globe,
  ExternalLink
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { createClient } from '../../../utils/supabase/server';

export const metadata = {
  title: 'Admin Dashboard - SenseByCBD',
};

export default async function AdminDashboard() {
  // Fetch data from Supabase
  const supabase = await createClient();
  
  // Fetch products count
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  // Fetch users count
  const { count: usersCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  // Fetch orders count and total revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('id, total_amount, created_at');
  
  // Calculate total revenue
  const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  
  // Calculate stats for the current month vs previous month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Filter orders for current and previous month
  const currentMonthOrders = orders?.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  }) || [];
  
  const previousMonthOrders = orders?.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate.getMonth() === previousMonth && orderDate.getFullYear() === previousMonthYear;
  }) || [];
  
  // Calculate stats
  const currentMonthOrdersCount = currentMonthOrders.length;
  const previousMonthOrdersCount = previousMonthOrders.length;
  const ordersChange = previousMonthOrdersCount === 0 
    ? 100 
    : ((currentMonthOrdersCount - previousMonthOrdersCount) / previousMonthOrdersCount) * 100;
  
  const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const revenueChange = previousMonthRevenue === 0 
    ? 100 
    : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Prepare stats object
  const stats = {
    orders: {
      total: orders?.length || 0,
      change: parseFloat(ordersChange.toFixed(1)),
      increasing: ordersChange >= 0
    },
    revenue: {
      total: formatCurrency(totalRevenue),
      change: parseFloat(revenueChange.toFixed(1)),
      increasing: revenueChange >= 0
    },
    users: {
      total: usersCount || 0,
      change: 0, // We don't have historical data for users
      increasing: true
    },
    products: {
      total: productsCount || 0,
      change: 0, // We don't have historical data for products
      increasing: false
    }
  };
  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bestellingen</p>
              <h3 className="text-2xl font-bold mt-1">{stats.orders.total}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.orders.increasing ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={stats.orders.increasing ? "text-green-500" : "text-red-500"}>
              {stats.orders.change}%
            </span>
            <span className="text-muted-foreground ml-1">sinds vorige maand</span>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Omzet</p>
              <h3 className="text-2xl font-bold mt-1">{stats.revenue.total}</h3>
            </div>
            <div className="bg-green-500/10 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.revenue.increasing ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={stats.revenue.increasing ? "text-green-500" : "text-red-500"}>
              {stats.revenue.change}%
            </span>
            <span className="text-muted-foreground ml-1">sinds vorige maand</span>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gebruikers</p>
              <h3 className="text-2xl font-bold mt-1">{stats.users.total}</h3>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.users.increasing ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={stats.users.increasing ? "text-green-500" : "text-red-500"}>
              {stats.users.change}%
            </span>
            <span className="text-muted-foreground ml-1">sinds vorige maand</span>
          </div>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Producten</p>
              <h3 className="text-2xl font-bold mt-1">{stats.products.total}</h3>
            </div>
            <div className="bg-amber-500/10 p-2 rounded-full">
              <Package className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {stats.products.increasing ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-amber-500 mr-1" />
            )}
            <span className={stats.products.increasing ? "text-green-500" : "text-amber-500"}>
              {stats.products.change}%
            </span>
            <span className="text-muted-foreground ml-1">sinds vorige maand</span>
          </div>
        </Card>
      </div>
      
      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/products">Bekijk alle</Link>
            </Button>
          </div>
          <h2 className="text-lg font-semibold mb-2">Producten</h2>
          <p className="text-muted-foreground mb-4">Beheer je productcatalogus</p>
          <Button asChild>
            <Link href="/admin/products">
              Beheer Producten
            </Link>
          </Button>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-500/10 p-2 rounded-full">
              <ShoppingCart className="h-5 w-5 text-green-500" />
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/orders">Bekijk alle</Link>
            </Button>
          </div>
          <h2 className="text-lg font-semibold mb-2">Bestellingen</h2>
          <p className="text-muted-foreground mb-4">Bekijk en beheer klantbestellingen</p>
          <Button asChild>
            <Link href="/admin/orders">
              Beheer Bestellingen
            </Link>
          </Button>
        </Card>
        
        <Card className="p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">Bekijk alle</Link>
            </Button>
          </div>
          <h2 className="text-lg font-semibold mb-2">Gebruikers</h2>
          <p className="text-muted-foreground mb-4">Beheer gebruikersaccounts en rechten</p>
          <Button asChild>
            <Link href="/admin/users">
              Beheer Gebruikers
            </Link>
          </Button>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Snelle Acties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start h-auto py-3" asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Nieuw Product Toevoegen</div>
                <div className="text-xs text-muted-foreground mt-1">Maak een nieuw product aan in je catalogus</div>
              </div>
            </Link>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto py-3" asChild>
            <Link href="/admin/categories">
              <FolderTree className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Categorieën Beheren</div>
                <div className="text-xs text-muted-foreground mt-1">Organiseer je producten in categorieën</div>
              </div>
            </Link>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto py-3" asChild>
            <Link href="/admin/translations">
              <Globe className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Vertalingen Beheren</div>
                <div className="text-xs text-muted-foreground mt-1">Update content vertalingen</div>
              </div>
            </Link>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto py-3" asChild>
            <Link href="/" target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Website Bekijken</div>
                <div className="text-xs text-muted-foreground mt-1">Bekijk je winkel zoals klanten die zien</div>
              </div>
            </Link>
          </Button>
        </div>
      </Card>
      
      {/* System Status */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Systeemstatus</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-green-500/10 dark:bg-green-900/20 rounded-md">
            <span className="font-medium">Authenticatie</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">Actief</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-500/10 dark:bg-green-900/20 rounded-md">
            <span className="font-medium">Database Verbinding</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">Verbonden</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-green-500/10 dark:bg-green-900/20 rounded-md">
            <span className="font-medium">Server-side Authenticatie</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">Werkend</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
