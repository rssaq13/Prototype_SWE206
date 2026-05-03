export interface Product {
  id: string;
  name: string;
  quantity: number;
  warehouseId: string;
  location: string; // Shelf/Bin
  category: string;
  minStock: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'Issue' | 'Receive' | 'Transfer' | 'Adjust';
  quantity: number;
  warehouseId: string;
  destinationWarehouseId?: string; // For transfers
  date: Date;
  performedBy: string;
  notes: string;
  reason?: string; // For adjustments (damaged, lost, audit)
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: Date;
  category: 'stock' | 'user' | 'system' | 'location';
}

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: 'Admin' | 'Manager' | 'Inventory Staff';
  createdAt: Date;
  lastLogin: Date;
}

export const warehouses: Warehouse[] = [
  { id: 'WH001', name: 'Main Warehouse', location: 'New York, NY' },
  { id: 'WH002', name: 'West Coast Facility', location: 'Los Angeles, CA' },
  { id: 'WH003', name: 'Distribution Center', location: 'Chicago, IL' },
];

export const products: Product[] = [
  {
    id: 'P001',
    name: 'Laptop - Dell XPS 15',
    quantity: 45,
    warehouseId: 'WH001',
    location: 'A-12-3',
    category: 'Electronics',
    minStock: 20,
  },
  {
    id: 'P002',
    name: 'Office Chair - Ergonomic',
    quantity: 8,
    warehouseId: 'WH001',
    location: 'B-05-1',
    category: 'Furniture',
    minStock: 15,
  },
  {
    id: 'P003',
    name: 'Wireless Mouse',
    quantity: 150,
    warehouseId: 'WH002',
    location: 'C-08-2',
    category: 'Electronics',
    minStock: 50,
  },
  {
    id: 'P004',
    name: 'Monitor - 27" 4K',
    quantity: 30,
    warehouseId: 'WH001',
    location: 'A-15-4',
    category: 'Electronics',
    minStock: 25,
  },
  {
    id: 'P005',
    name: 'Standing Desk',
    quantity: 12,
    warehouseId: 'WH002',
    location: 'B-03-2',
    category: 'Furniture',
    minStock: 10,
  },
  {
    id: 'P006',
    name: 'USB-C Cable',
    quantity: 5,
    warehouseId: 'WH003',
    location: 'D-01-5',
    category: 'Accessories',
    minStock: 30,
  },
  {
    id: 'P007',
    name: 'Keyboard - Mechanical',
    quantity: 75,
    warehouseId: 'WH001',
    location: 'C-10-1',
    category: 'Electronics',
    minStock: 40,
  },
  {
    id: 'P008',
    name: 'Desk Lamp - LED',
    quantity: 40,
    warehouseId: 'WH002',
    location: 'E-02-3',
    category: 'Accessories',
    minStock: 20,
  },
  {
    id: 'P009',
    name: 'Notebook - A4 Ruled',
    quantity: 3,
    warehouseId: 'WH003',
    location: 'F-05-2',
    category: 'Stationery',
    minStock: 50,
  },
  {
    id: 'P010',
    name: 'Webcam - 1080p',
    quantity: 55,
    warehouseId: 'WH001',
    location: 'A-20-1',
    category: 'Electronics',
    minStock: 30,
  },
];

export const stockMovements: StockMovement[] = [
  {
    id: 'SM001',
    productId: 'P001',
    productName: 'Laptop - Dell XPS 15',
    type: 'Receive',
    quantity: 20,
    warehouseId: 'WH001',
    date: new Date('2026-04-10'),
    performedBy: 'Sarah Manager',
    notes: 'New shipment from supplier',
  },
  {
    id: 'SM002',
    productId: 'P002',
    productName: 'Office Chair - Ergonomic',
    type: 'Issue',
    quantity: 10,
    warehouseId: 'WH001',
    date: new Date('2026-04-09'),
    performedBy: 'Mike Staff',
    notes: 'Issued to Marketing department',
  },
  {
    id: 'SM003',
    productId: 'P003',
    productName: 'Wireless Mouse',
    type: 'Receive',
    quantity: 100,
    warehouseId: 'WH002',
    date: new Date('2026-04-08'),
    performedBy: 'Sarah Manager',
    notes: 'Bulk order received',
  },
  {
    id: 'SM004',
    productId: 'P004',
    productName: 'Monitor - 27" 4K',
    type: 'Transfer',
    quantity: 15,
    warehouseId: 'WH001',
    destinationWarehouseId: 'WH002',
    date: new Date('2026-04-07'),
    performedBy: 'Sarah Manager',
    notes: 'Transferred to West Coast facility',
  },
  {
    id: 'SM005',
    productId: 'P006',
    productName: 'USB-C Cable',
    type: 'Adjust',
    quantity: -25,
    warehouseId: 'WH003',
    date: new Date('2026-04-06'),
    performedBy: 'John Admin',
    notes: 'Stock audit adjustment',
    reason: 'audit',
  },
];

export const users: User[] = [
  {
    id: 'U001',
    name: 'John Admin',
    email: 'admin@sims.com',
    username: 'admin',
    role: 'Admin',
    createdAt: new Date('2025-01-15'),
    lastLogin: new Date('2026-04-11'),
  },
  {
    id: 'U002',
    name: 'Sarah Manager',
    email: 'manager@sims.com',
    username: 'manager',
    role: 'Manager',
    createdAt: new Date('2025-02-20'),
    lastLogin: new Date('2026-04-10'),
  },
  {
    id: 'U003',
    name: 'Mike Staff',
    email: 'staff@sims.com',
    username: 'staff',
    role: 'Inventory Staff',
    createdAt: new Date('2025-03-10'),
    lastLogin: new Date('2026-04-09'),
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: 'AL001',
    user: 'John Admin',
    action: 'User Created',
    details: 'Created new user account: Mike Staff (Inventory Staff)',
    timestamp: new Date('2026-04-11T09:15:00'),
    category: 'user',
  },
  {
    id: 'AL002',
    user: 'Sarah Manager',
    action: 'Stock Received',
    details: 'Received 20 units of Laptop - Dell XPS 15 at Main Warehouse',
    timestamp: new Date('2026-04-10T14:30:00'),
    category: 'stock',
  },
  {
    id: 'AL003',
    user: 'Mike Staff',
    action: 'Stock Issued',
    details: 'Issued 10 units of Office Chair - Ergonomic from Main Warehouse',
    timestamp: new Date('2026-04-09T11:20:00'),
    category: 'stock',
  },
  {
    id: 'AL004',
    user: 'Sarah Manager',
    action: 'Stock Transferred',
    details: 'Transferred 15 units of Monitor - 27" 4K from Main Warehouse to West Coast Facility',
    timestamp: new Date('2026-04-07T16:45:00'),
    category: 'stock',
  },
  {
    id: 'AL005',
    user: 'John Admin',
    action: 'Stock Adjusted',
    details: 'Adjusted USB-C Cable quantity by -25 units (Reason: audit)',
    timestamp: new Date('2026-04-06T10:00:00'),
    category: 'stock',
  },
  {
    id: 'AL006',
    user: 'Mike Staff',
    action: 'Location Updated',
    details: 'Updated location for Keyboard - Mechanical to C-10-1',
    timestamp: new Date('2026-04-05T13:30:00'),
    category: 'location',
  },
  {
    id: 'AL007',
    user: 'John Admin',
    action: 'User Role Changed',
    details: 'Changed role for Sarah Manager from Inventory Staff to Manager',
    timestamp: new Date('2026-04-04T09:00:00'),
    category: 'user',
  },
  {
    id: 'AL008',
    user: 'System',
    action: 'Low Stock Alert',
    details: 'Low stock alert triggered for Office Chair - Ergonomic (8 units, min: 15)',
    timestamp: new Date('2026-04-03T08:00:00'),
    category: 'system',
  },
  {
    id: 'AL009',
    user: 'Sarah Manager',
    action: 'Report Generated',
    details: 'Generated inventory report for March 2026',
    timestamp: new Date('2026-04-01T15:00:00'),
    category: 'system',
  },
  {
    id: 'AL010',
    user: 'John Admin',
    action: 'User Deleted',
    details: 'Deleted user account: Test User (Inventory Staff)',
    timestamp: new Date('2026-03-28T11:30:00'),
    category: 'user',
  },
];
