import { Suspense } from 'react';
import OrdersClient from './orders-client';

// Loading component
function OrdersLoading() {
  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export const metadata = {
  title: 'Orders Management - Admin Dashboard',
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersClient />
    </Suspense>
  );
}
