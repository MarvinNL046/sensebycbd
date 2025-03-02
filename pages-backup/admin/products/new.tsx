import AdminLayout from '../../../components/admin/AdminLayout';
import ProductForm from '../../../components/admin/products/ProductForm';

export default function NewProduct() {
  return (
    <AdminLayout title="Add New Product">
      <ProductForm />
    </AdminLayout>
  );
}
