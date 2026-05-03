import { useState, useMemo } from 'react';
import { Search, Package, MapPin, Filter, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mock inventory data by warehouse
const inventoryByWarehouse: Record<string, typeof mockInventoryData> = {
  'Main Warehouse': [
    { id: 'PRD-001', name: 'Laptop Dell XPS 13', category: 'Electronics', location: 'A-1-01', quantity: 45, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-002', name: 'Office Chair Executive', category: 'Furniture', location: 'B-2-05', quantity: 12, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-003', name: 'Wireless Mouse Logitech', category: 'Electronics', location: 'A-1-03', quantity: 8, unit: 'pcs', status: 'Low Stock' },
    { id: 'PRD-004', name: 'A4 Paper Pack', category: 'Office Supplies', location: 'C-1-02', quantity: 156, unit: 'packs', status: 'In Stock' },
    { id: 'PRD-005', name: 'Desk Lamp LED', category: 'Furniture', location: 'B-1-04', quantity: 23, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-006', name: 'USB-C Cable 2m', category: 'Electronics', location: 'A-2-01', quantity: 5, unit: 'pcs', status: 'Low Stock' },
    { id: 'PRD-007', name: 'Ergonomic Keyboard', category: 'Electronics', location: 'A-1-02', quantity: 34, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-008', name: 'Whiteboard Marker Set', category: 'Office Supplies', location: 'C-2-03', quantity: 67, unit: 'sets', status: 'In Stock' },
    { id: 'PRD-009', name: 'Filing Cabinet 4-Drawer', category: 'Furniture', location: 'B-3-01', quantity: 3, unit: 'pcs', status: 'Low Stock' },
    { id: 'PRD-010', name: 'Monitor 27" 4K', category: 'Electronics', location: 'A-1-05', quantity: 18, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-011', name: 'Stapler Heavy Duty', category: 'Office Supplies', location: 'C-1-01', quantity: 42, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-012', name: 'Conference Table', category: 'Furniture', location: 'B-2-06', quantity: 2, unit: 'pcs', status: 'Low Stock' },
    { id: 'PRD-013', name: 'Notebook A5 Spiral', category: 'Office Supplies', location: 'C-1-04', quantity: 234, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-014', name: 'Webcam HD 1080p', category: 'Electronics', location: 'A-2-02', quantity: 15, unit: 'pcs', status: 'In Stock' },
    { id: 'PRD-015', name: 'Desk Organizer', category: 'Office Supplies', location: 'C-2-01', quantity: 29, unit: 'pcs', status: 'In Stock' },
  ],
  'West Coast Facility': [],
  'Distribution Center': [],
};

const mockInventoryData = inventoryByWarehouse['Main Warehouse'];

const availableWarehouses = ['Main Warehouse', 'West Coast Facility', 'Distribution Center'];

export default function Inventory() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentWarehouse, setCurrentWarehouse] = useState('Main Warehouse');
  const itemsPerPage = 10;

  const warehouseInventory = inventoryByWarehouse[currentWarehouse] || [];

  const filteredInventory = useMemo(() => {
    return warehouseInventory.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, warehouseInventory]);

  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const categories = ['all', ...Array.from(new Set(warehouseInventory.map(item => item.category)))];
  const canAddProducts = user?.role === 'Admin' || user?.role === 'Manager';
  const isInventoryEmpty = warehouseInventory.length === 0;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">View Stock</h1>
          <p className="text-lg text-gray-600 mt-1">Current inventory for {currentWarehouse}</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={currentWarehouse}
            onChange={(e) => { setCurrentWarehouse(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-base"
          >
            {availableWarehouses.map(wh => (
              <option key={wh} value={wh}>{wh}</option>
            ))}
          </select>
        </div>
      </div>

      {isInventoryEmpty ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-medium text-gray-900 mb-2">No inventory available</h3>
          <p className="text-lg text-gray-500 mb-6">No products have been added to {currentWarehouse} yet.</p>
          {canAddProducts && (
            <button className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Product ID, name, or location..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-base"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-base"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>
            </div>
            {searchQuery && (
              <div className="mt-3 text-base text-gray-600">
                Found {filteredInventory.length} result{filteredInventory.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {paginatedInventory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-lg text-gray-500">No items match your search</p>
                <p className="text-base text-gray-400 mt-1">Try checking the spelling or clearing the search filters</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">{item.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{item.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {item.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{item.quantity} {item.unit}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-base text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length} items
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg text-base font-medium ${
                              currentPage === page ? 'bg-gray-900 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
