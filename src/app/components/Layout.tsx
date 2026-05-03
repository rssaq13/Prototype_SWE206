import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Package,
  LayoutDashboard,
  PackageSearch,
  ArrowLeftRight,
  BarChart3,
  Users,
  LogOut,
  User,
  Menu,
  Search,
  Bell,
  Warehouse,
  Settings,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { cn } from './ui/utils';
import { products, warehouses } from '../data/mockData';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouses[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate low stock items for notifications
  const lowStockItems = products.filter((p) => p.quantity < p.minStock);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Inventory Staff'] },
    { path: '/inventory', label: 'Inventory', icon: PackageSearch, roles: ['Admin', 'Manager', 'Inventory Staff'] },
    { path: '/stock-operations', label: 'Stock Actions', icon: ArrowLeftRight, roles: ['Admin', 'Manager', 'Inventory Staff'] },
    { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Manager'] },
    { path: '/activity-logs', label: 'Activity Logs', icon: FileText, roles: ['Admin'] },
    { path: '/users', label: 'User Management', icon: Users, roles: ['Admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Manager', 'Inventory Staff'] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    user && item.roles.includes(user.role)
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inventory?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {filteredNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex-col z-30">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">SIMS</h1>
              <p className="text-xs text-gray-500">Inventory System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">SIMS</h1>
          </div>
        </div>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              {/* Logo in mobile menu */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-lg">SIMS</h1>
                    <p className="text-xs text-gray-500">Inventory System</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <NavLinks onClick={() => setMobileMenuOpen(false)} />
              </nav>

              {/* User Info */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Top Bar */}
      <header className="hidden md:block fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 z-20">
        <div className="h-full flex items-center justify-between px-6 gap-4">
          {/* Global Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4"
              />
            </div>
          </form>

          <div className="flex items-center gap-3">
            {/* Warehouse Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Warehouse className="h-4 w-4" />
                  <span className="hidden lg:inline">{selectedWarehouse.name}</span>
                  <span className="lg:hidden">{selectedWarehouse.id}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Switch Warehouse</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {warehouses.map((wh) => (
                  <DropdownMenuItem
                    key={wh.id}
                    onClick={() => setSelectedWarehouse(wh)}
                    className={cn(
                      'cursor-pointer',
                      selectedWarehouse.id === wh.id && 'bg-blue-50'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <p className="font-medium">{wh.name}</p>
                        <p className="text-xs text-gray-500">{wh.location}</p>
                      </div>
                      {selectedWarehouse.id === wh.id && (
                        <div className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {lowStockItems.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {lowStockItems.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-3">
                  <h4 className="font-semibold">Low Stock Alerts</h4>
                  {lowStockItems.length === 0 ? (
                    <p className="text-sm text-gray-500">No alerts at this time</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {lowStockItems.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-100"
                        >
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-gray-600">
                              {product.quantity} units remaining (Min: {product.minStock})
                            </p>
                            <p className="text-xs text-gray-500">{product.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="hidden lg:inline text-sm">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs font-normal text-gray-500">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:ml-64 md:mt-16 pt-16 md:pt-0 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}