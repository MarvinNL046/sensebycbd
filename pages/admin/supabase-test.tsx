import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  checkConnection, 
  fetchData, 
  insertData, 
  updateData, 
  deleteData,
  listTables,
  getTableSchema,
  getTableData
} from '../../lib/supabase-utils';
import { supabase } from '../../lib/supabase';

interface ConnectionStatus {
  connected: boolean;
  error: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  created_at?: string;
}

interface TableInfo {
  schemaname: string;
  tablename: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

const SupabaseTestPage: NextPage = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    description: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Database explorer state
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loadingTables, setLoadingTables] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableSchema, setTableSchema] = useState<ColumnInfo[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingTableDetails, setLoadingTableDetails] = useState<boolean>(false);

  // Check connection on page load
  useEffect(() => {
    const checkConnectionStatus = async () => {
      const status = await checkConnection();
      setConnectionStatus(status);
    };

    checkConnectionStatus();
  }, []);

  // Fetch products on page load
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchData<Product>(
          'products',
          'id, name, price, description, created_at',
          {},
          { limit: 10, orderBy: { column: 'created_at', ascending: false } }
        );

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle form input changes for new product
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  // Handle form input changes for editing product
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProduct) return;
    
    const { name, value } = e.target;
    setEditingProduct({
      ...editingProduct,
      [name]: name === 'price' ? parseFloat(value) : value,
    });
  };

  // Create a new product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await insertData<Product>(
        'products',
        {
          ...newProduct,
          slug: newProduct.name?.toLowerCase().replace(/\s+/g, '-') || '',
        }
      );

      if (error) {
        throw error;
      }

      // Add the new product to the list
      if (data && data.length > 0) {
        setProducts([data[0], ...products]);
        
        // Reset the form
        setNewProduct({
          name: '',
          price: 0,
          description: '',
        });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Start editing a product
  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  // Save edited product
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    
    try {
      const { data, error } = await updateData(
        'products',
        {
          name: editingProduct.name,
          price: editingProduct.price,
          description: editingProduct.description,
          slug: editingProduct.name.toLowerCase().replace(/\s+/g, '-'),
        },
        { id: editingProduct.id }
      );

      if (error) {
        throw error;
      }

      // Update the product in the list
      if (data && data.length > 0) {
        setProducts(
          products.map((p: Product) => (p.id === editingProduct.id ? data[0] : p))
        );
        
        // Exit edit mode
        setEditingProduct(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Delete a product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      const { error } = await deleteData(
        'products',
        { id }
      );

      if (error) {
        throw error;
      }

      // Remove the product from the list
      setProducts(products.filter((p: Product) => p.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Direct Supabase query example
  const handleDirectQuery = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .limit(3);
      
      if (error) {
        throw error;
      }
      
      alert(`Direct query result: ${JSON.stringify(data, null, 2)}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch all tables
  const handleFetchTables = async () => {
    setLoadingTables(true);
    setError(null);
    
    try {
      const { data, error } = await listTables();
      
      if (error) {
        throw error;
      }
      
      setTables(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTables(false);
    }
  };

  // Fetch table details (schema and data)
  const handleSelectTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoadingTableDetails(true);
    setError(null);
    
    try {
      // Fetch table schema
      const { data: schemaData, error: schemaError } = await getTableSchema(tableName);
      
      if (schemaError) {
        throw schemaError;
      }
      
      setTableSchema(schemaData || []);
      
      // Fetch table data
      const { data: tableData, error: dataError } = await getTableData(tableName);
      
      if (dataError) {
        throw dataError;
      }
      
      setTableData(tableData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTableDetails(false);
    }
  };

  return (
    <AdminLayout title="Supabase Test">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
        
        {/* Connection Status */}
        <div className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          {connectionStatus ? (
            <div>
              <p className={`font-bold ${connectionStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus.connected ? 'Connected ✅' : 'Not Connected ❌'}
              </p>
              {connectionStatus.error && (
                <p className="text-red-600 mt-2">{connectionStatus.error}</p>
              )}
            </div>
          ) : (
            <p>Checking connection...</p>
          )}
          
          <button 
            onClick={handleDirectQuery}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Test Direct Query
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 rounded">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {/* Create New Product Form */}
        <div className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
          <form onSubmit={handleCreateProduct}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1">Description</label>
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create Product
            </button>
          </form>
        </div>
        
        {/* Products List */}
        <div className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b text-left">Name</th>
                    <th className="py-2 px-4 border-b text-left">Price</th>
                    <th className="py-2 px-4 border-b text-left">Description</th>
                    <th className="py-2 px-4 border-b text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: Product) => (
                    <tr key={product.id}>
                      <td className="py-2 px-4 border-b">
                        {editingProduct?.id === product.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editingProduct.name}
                            onChange={handleEditInputChange}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {editingProduct?.id === product.id ? (
                          <input
                            type="number"
                            name="price"
                            value={editingProduct.price}
                            onChange={handleEditInputChange}
                            className="w-full p-1 border rounded"
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          `€${product.price.toFixed(2)}`
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {editingProduct?.id === product.id ? (
                          <textarea
                            name="description"
                            value={editingProduct.description || ''}
                            onChange={handleEditInputChange}
                            className="w-full p-1 border rounded"
                            rows={2}
                          />
                        ) : (
                          product.description || '-'
                        )}
                      </td>
                      <td className="py-2 px-4 border-b">
                        {editingProduct?.id === product.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartEdit(product)}
                              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Database Explorer */}
        <div className="p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Database Explorer</h2>
          <p className="mb-4">
            This section uses the service role key to access database information. 
            You can view all tables, their schemas, and data.
          </p>
          
          <button 
            onClick={handleFetchTables}
            className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loadingTables}
          >
            {loadingTables ? 'Loading Tables...' : 'List All Tables'}
          </button>
          
          {tables.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Table List */}
              <div className="col-span-1 border rounded p-4">
                <h3 className="font-semibold mb-2">Tables</h3>
                <ul className="space-y-1">
                  {tables.map((table) => (
                    <li key={table.tablename}>
                      <button
                        onClick={() => handleSelectTable(table.tablename)}
                        className={`w-full text-left px-2 py-1 rounded ${
                          selectedTable === table.tablename
                            ? 'bg-blue-100 text-blue-800'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {table.tablename}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Table Details */}
              <div className="col-span-1 md:col-span-3 border rounded p-4">
                {selectedTable ? (
                  loadingTableDetails ? (
                    <p>Loading table details...</p>
                  ) : (
                    <div>
                      <h3 className="font-semibold text-lg mb-4">Table: {selectedTable}</h3>
                      
                      {/* Table Schema */}
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2">Schema</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-white border">
                            <thead>
                              <tr>
                                <th className="py-2 px-4 border-b text-left">Column</th>
                                <th className="py-2 px-4 border-b text-left">Type</th>
                                <th className="py-2 px-4 border-b text-left">Nullable</th>
                                <th className="py-2 px-4 border-b text-left">Default</th>
                              </tr>
                            </thead>
                            <tbody>
                              {tableSchema.map((column) => (
                                <tr key={column.column_name}>
                                  <td className="py-2 px-4 border-b">{column.column_name}</td>
                                  <td className="py-2 px-4 border-b">{column.data_type}</td>
                                  <td className="py-2 px-4 border-b">{column.is_nullable}</td>
                                  <td className="py-2 px-4 border-b">{column.column_default || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {/* Table Data */}
                      <div>
                        <h4 className="font-semibold mb-2">Data (First 100 rows)</h4>
                        {tableData.length === 0 ? (
                          <p>No data found in this table.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border">
                              <thead>
                                <tr>
                                  {Object.keys(tableData[0]).map((key) => (
                                    <th key={key} className="py-2 px-4 border-b text-left">
                                      {key}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {tableData.map((row, index) => (
                                  <tr key={index}>
                                    {Object.values(row).map((value: any, i) => (
                                      <td key={i} className="py-2 px-4 border-b">
                                        {typeof value === 'object' 
                                          ? JSON.stringify(value) 
                                          : String(value !== null ? value : '-')}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <p>Select a table to view its schema and data.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SupabaseTestPage;
