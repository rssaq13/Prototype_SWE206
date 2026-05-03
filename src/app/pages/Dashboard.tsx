import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Package, AlertTriangle, TrendingUp, Clock, Warehouse } from 'lucide-react';
import { products, stockMovements, warehouses } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();

  // Calculate statistics
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockItems = products.filter((p) => p.quantity < p.minStock);
  const recentMovements = stockMovements.slice(0, 5);
  const warehouseCount = warehouses.length;

  // Prepare chart data for stock movement trends
  const chartData = [
    { date: 'Apr 4', received: 0, issued: 0 },
    { date: 'Apr 5', received: 0, issued: 0 },
    { date: 'Apr 6', received: 0, issued: 0 },
    { date: 'Apr 7', received: 15, issued: 0 },
    { date: 'Apr 8', received: 100, issued: 0 },
    { date: 'Apr 9', received: 0, issued: 10 },
    { date: 'Apr 10', received: 20, issued: 0 },
    { date: 'Apr 11', received: 0, issued: 0 },
  ];

  // Warehouse inventory distribution
  const warehouseData = warehouses.map(wh => {
    const warehouseProducts = products.filter(p => p.warehouseId === wh.id);
    const totalQty = warehouseProducts.reduce((sum, p) => sum + p.quantity, 0);
    return {
      name: wh.name,
      items: totalQty,
    };
  });

  const stats = [
    {
      title: 'Total Items',
      value: totalItems.toLocaleString(),
      description: `Across ${products.length} products`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockItems.length,
      description: 'Items below minimum',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Warehouses',
      value: warehouseCount,
      description: 'Active locations',
      icon: Warehouse,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Recent Movements',
      value: stockMovements.length,
      description: 'Last 7 days',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-semibold mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Stock Movement Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Movement Trends</CardTitle>
            <CardDescription>Daily stock movements over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} name="Received" />
                <Line type="monotone" dataKey="issued" stroke="#f59e0b" strokeWidth={2} name="Issued" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Warehouse Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Distribution</CardTitle>
            <CardDescription>Inventory count by warehouse location</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={warehouseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="items" fill="#3b82f6" name="Total Items" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-gray-500">No low stock alerts</p>
              ) : (
                lowStockItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-gray-600">
                        {product.id} • {product.location}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="text-sm font-semibold text-red-600">
                        {product.quantity} units
                      </p>
                      <p className="text-xs text-gray-500">
                        Min: {product.minStock}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest stock movements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div
                    className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      movement.type === 'Receive' ? 'bg-green-50' : 'bg-orange-50'
                    }`}
                  >
                    <Package
                      className={`h-4 w-4 ${
                        movement.type === 'Receive' ? 'text-green-600' : 'text-orange-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-medium truncate">{movement.productName}</p>
                      <Badge
                        variant={movement.type === 'Receive' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {movement.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {movement.quantity} units • {movement.performedBy}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {movement.date.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}