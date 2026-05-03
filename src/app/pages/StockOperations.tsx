import { useState } from 'react';
import {
  ChevronDown,
  PackagePlus,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRightLeft,
  Edit3,
  Package,
} from 'lucide-react';

// Mock product database
const PRODUCTS = [
  { id: 'PROD-001', name: 'Laptop Dell XPS 15' },
  { id: 'PROD-002', name: 'Monitor LG 27inch' },
  { id: 'PROD-003', name: 'Keyboard Mechanical' },
  { id: 'PROD-004', name: 'Mouse Wireless' },
  { id: 'PROD-005', name: 'Headphones Sony' },
];

// Mock warehouse database with capacities
const WAREHOUSES = [
  { id: 'WH-001', name: 'Main Warehouse - New York, NY', capacity: 1000, currentStock: 750 },
  { id: 'WH-002', name: 'West Coast Facility - Los Angeles, CA', capacity: 500, currentStock: 450 },
  { id: 'WH-003', name: 'Distribution Center - Chicago, IL', capacity: 800, currentStock: 200 },
];

// Mock inventory - tracking product quantities per warehouse
const INITIAL_INVENTORY: { [key: string]: number } = {
  'PROD-001_WH-001': 50,
  'PROD-001_WH-002': 30,
  'PROD-002_WH-001': 100,
  'PROD-002_WH-003': 25,
  'PROD-003_WH-001': 75,
  'PROD-004_WH-002': 40,
  'PROD-005_WH-001': 15,
};

// Adjustment reasons
const ADJUSTMENT_REASONS = [
  'Damaged',
  'Lost',
  'Theft',
  'Audit Correction',
  'Expired',
  'Quality Control',
  'Other',
];

type ItemLocation = {
  productId: string;
  warehouse: string;
  aisle: string;
  shelf: string;
};

const INITIAL_LOCATIONS: ItemLocation[] = [
  { productId: 'PROD-001', warehouse: 'WH-001', aisle: 'A', shelf: '1' },
  { productId: 'PROD-002', warehouse: 'WH-001', aisle: 'A', shelf: '2' },
  { productId: 'PROD-003', warehouse: 'WH-001', aisle: 'B', shelf: '1' },
  { productId: 'PROD-004', warehouse: 'WH-002', aisle: 'A', shelf: '1' },
  { productId: 'PROD-005', warehouse: 'WH-001', aisle: 'C', shelf: '1' },
];

export type StockMovementLog = {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  productId: string;
  productName: string;
  actionType: 'RECEIVE' | 'ISSUE' | 'TRANSFER' | 'ADJUST' | 'LOCATION_UPDATE';
  quantityChanged?: number;
  warehouse?: string;
  sourceWarehouse?: string;
  destinationWarehouse?: string;
  oldQuantity?: number;
  newQuantity?: number;
  reason?: string;
  notes?: string;
  oldLocation?: string;
  newLocation?: string;
};

// Shared log store (module-level for cross-page access)
export const stockMovementLogs: StockMovementLog[] = [];

type MessageState = { type: 'success' | 'error' | 'warning'; text: string } | null;

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function GuidelineItem({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h4 className="font-medium text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

function MessageAlert({ message, onClose }: { message: MessageState; onClose: () => void }) {
  if (!message) return null;
  return (
    <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${
      message.type === 'success' ? 'bg-green-50 border border-green-200' :
      message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
      'bg-red-50 border border-red-200'
    }`}>
      {message.type === 'success' ? (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${message.type === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
      )}
      <p className={`text-sm flex-1 ${
        message.type === 'success' ? 'text-green-800' :
        message.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
      }`}>{message.text}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function StockOperations() {
  const [activeTab, setActiveTab] = useState('issue-receive');
  const [activeStockAction, setActiveStockAction] = useState('receive');

  const [productId, setProductId] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const [sourceWarehouse, setSourceWarehouse] = useState('');
  const [destinationWarehouse, setDestinationWarehouse] = useState('');

  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [newWarehouse, setNewWarehouse] = useState('');
  const [newAisle, setNewAisle] = useState('');
  const [newShelf, setNewShelf] = useState('');
  const [currentLocation, setCurrentLocation] = useState<ItemLocation | null>(null);

  const [inventory, setInventory] = useState<{ [key: string]: number }>(INITIAL_INVENTORY);
  const [itemLocations, setItemLocations] = useState<ItemLocation[]>(INITIAL_LOCATIONS);
  const [message, setMessage] = useState<MessageState>(null);

  const getAvailableStock = (pid: string, warehouseId: string): number =>
    inventory[`${pid}_${warehouseId}`] || 0;

  const recordStockMovement = (logEntry: Omit<StockMovementLog, 'id' | 'timestamp' | 'actorId' | 'actorName'>): boolean => {
    const completeEntry: StockMovementLog = {
      ...logEntry,
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      actorId: 'USER-001',
      actorName: 'John Admin',
    };
    const dbSuccess = Math.random() > 0.05;
    if (!dbSuccess) return false;
    stockMovementLogs.unshift(completeEntry);
    return true;
  };

  const handleClear = () => {
    setProductId(''); setWarehouse(''); setQuantity(''); setNotes('');
    setSourceWarehouse(''); setDestinationWarehouse('');
    setAdjustmentReason(''); setNewWarehouse(''); setNewAisle(''); setNewShelf('');
    setCurrentLocation(null); setMessage(null); setShowConfirmation(false);
  };

  const handleTabChange = (tab: string) => { setActiveTab(tab); handleClear(); };

  const handleSubmit = () => {
    setMessage(null);
    if (!productId || !warehouse || !quantity) { setMessage({ type: 'error', text: 'Please fill in all required fields' }); return; }
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) { setMessage({ type: 'error', text: 'Product ID not found. Please create a new product profile before processing the stock.' }); return; }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) { setMessage({ type: 'error', text: 'Please enter a valid quantity' }); return; }
    const selectedWarehouse = WAREHOUSES.find(w => w.id === warehouse);
    const inventoryKey = `${productId}_${warehouse}`;

    if (activeStockAction === 'receive') {
      if (selectedWarehouse) {
        const availableCapacity = selectedWarehouse.capacity - selectedWarehouse.currentStock;
        if (qty > availableCapacity) { setMessage({ type: 'warning', text: `Maximum capacity reached. Available capacity: ${availableCapacity}. Please select a different location.` }); return; }
      }
      if (Math.random() < 0.05) { setMessage({ type: 'error', text: 'Database connection failed. The transaction could not be saved.' }); return; }
      setInventory(prev => ({ ...prev, [inventoryKey]: (prev[inventoryKey] || 0) + qty }));
      recordStockMovement({ productId, productName: product.name, actionType: 'RECEIVE', quantityChanged: qty, warehouse: selectedWarehouse?.name, notes });
      setMessage({ type: 'success', text: `Stock recorded! ${qty} units of ${product.name} added to ${selectedWarehouse?.name}.` });
      setTimeout(() => handleClear(), 3000);
    } else {
      const availableStock = getAvailableStock(productId, warehouse);
      if (availableStock < qty) { setMessage({ type: 'warning', text: `Insufficient stock. Requested: ${qty}, Available in ${selectedWarehouse?.name}: ${availableStock}.` }); return; }
      if (Math.random() < 0.05) { setMessage({ type: 'error', text: 'Database connection failed. The transaction could not be saved.' }); return; }
      setInventory(prev => ({ ...prev, [inventoryKey]: prev[inventoryKey] - qty }));
      recordStockMovement({ productId, productName: product.name, actionType: 'ISSUE', quantityChanged: -qty, warehouse: selectedWarehouse?.name, notes });
      setMessage({ type: 'success', text: `Stock issued! ${qty} units of ${product.name} removed from ${selectedWarehouse?.name}.` });
      setTimeout(() => handleClear(), 3000);
    }
  };

  const handleTransfer = () => {
    setMessage(null);
    if (!productId || !sourceWarehouse || !destinationWarehouse || !quantity) { setMessage({ type: 'error', text: 'Please fill in all required fields' }); return; }
    if (sourceWarehouse === destinationWarehouse) { setMessage({ type: 'error', text: 'Source and destination warehouses cannot be the same' }); return; }
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) { setMessage({ type: 'error', text: 'Product ID not found.' }); return; }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) { setMessage({ type: 'error', text: 'Please enter a valid quantity' }); return; }
    const availableStock = getAvailableStock(productId, sourceWarehouse);
    const sourceWh = WAREHOUSES.find(w => w.id === sourceWarehouse);
    if (availableStock < qty) { setMessage({ type: 'warning', text: `Source stock insufficient. Available at ${sourceWh?.name}: ${availableStock} units.` }); return; }
    const destWh = WAREHOUSES.find(w => w.id === destinationWarehouse);
    if (destWh) {
      const availableCapacity = destWh.capacity - destWh.currentStock;
      if (qty > availableCapacity) {
        const alt = WAREHOUSES.find(w => w.id !== sourceWarehouse && w.id !== destinationWarehouse && (w.capacity - w.currentStock) >= qty);
        setMessage({ type: 'error', text: `${destWh.name} is at max capacity. ${alt ? `Suggested alternative: ${alt.name}` : 'No alternative locations available.'}` }); return;
      }
    }
    if (Math.random() < 0.05) { setMessage({ type: 'error', text: 'Database connection failed. Transfer rolled back.' }); return; }
    setInventory(prev => ({ ...prev, [`${productId}_${sourceWarehouse}`]: (prev[`${productId}_${sourceWarehouse}`] || 0) - qty, [`${productId}_${destinationWarehouse}`]: (prev[`${productId}_${destinationWarehouse}`] || 0) + qty }));
    recordStockMovement({ productId, productName: product.name, actionType: 'TRANSFER', quantityChanged: qty, sourceWarehouse: sourceWh?.name, destinationWarehouse: destWh?.name, notes });
    setMessage({ type: 'success', text: `Transfer successful! ${qty} units of ${product.name} moved from ${sourceWh?.name} to ${destWh?.name}.` });
    setTimeout(() => handleClear(), 3000);
  };

  const handleAdjust = () => {
    setMessage(null);
    if (!productId || !warehouse || !quantity || !adjustmentReason) { setMessage({ type: 'error', text: 'Please fill in all required fields' }); return; }
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) { setMessage({ type: 'error', text: 'Product ID not found.' }); return; }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) { setMessage({ type: 'error', text: 'Invalid quantity. Please enter a valid non-negative integer.' }); return; }
    if (!showConfirmation) {
      setShowConfirmation(true);
      const currentStock = getAvailableStock(productId, warehouse);
      setMessage({ type: 'warning', text: `WARNING: This will override stock records. Current: ${currentStock} → New: ${qty} units. Click "Confirm Adjustment" to proceed.` }); return;
    }
    if (Math.random() < 0.02) { setMessage({ type: 'error', text: 'System error. No data was lost — the system has recovered automatically.' }); setShowConfirmation(false); return; }
    const inventoryKey = `${productId}_${warehouse}`;
    const oldQuantity = inventory[inventoryKey] || 0;
    setInventory(prev => ({ ...prev, [inventoryKey]: qty }));
    const selectedWarehouse = WAREHOUSES.find(w => w.id === warehouse);
    recordStockMovement({ productId, productName: product.name, actionType: 'ADJUST', oldQuantity, newQuantity: qty, warehouse: selectedWarehouse?.name, reason: adjustmentReason, notes });
    setMessage({ type: 'success', text: `Stock adjusted! ${product.name} updated from ${oldQuantity} to ${qty} units. Reason: ${adjustmentReason}.` });
    setShowConfirmation(false);
    setTimeout(() => handleClear(), 3000);
  };

  const handleProductIdChangeForLocation = (id: string) => {
    setProductId(id);
    setCurrentLocation(id ? itemLocations.find(loc => loc.productId === id) || null : null);
  };

  const handleUpdateLocation = () => {
    setMessage(null);
    if (!productId || !newWarehouse || !newAisle || !newShelf) { setMessage({ type: 'error', text: 'Please fill in all required fields' }); return; }
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) { setMessage({ type: 'error', text: 'Product ID not found.' }); return; }
    const locationOccupied = itemLocations.some(loc => loc.warehouse === newWarehouse && loc.aisle === newAisle && loc.shelf === newShelf && loc.productId !== productId);
    if (locationOccupied) { setMessage({ type: 'error', text: `Location already occupied. Warehouse ${newWarehouse}, Aisle ${newAisle}, Shelf ${newShelf} is in use.` }); return; }
    const oldLoc = itemLocations.find(loc => loc.productId === productId);
    const oldLocationStr = oldLoc ? `${oldLoc.warehouse}-${oldLoc.aisle}-${oldLoc.shelf}` : 'Not set';
    const newLocationStr = `${newWarehouse}-${newAisle}-${newShelf}`;
    setItemLocations(prev => {
      const idx = prev.findIndex(loc => loc.productId === productId);
      const updated = [...prev];
      if (idx >= 0) { updated[idx] = { productId, warehouse: newWarehouse, aisle: newAisle, shelf: newShelf }; return updated; }
      return [...prev, { productId, warehouse: newWarehouse, aisle: newAisle, shelf: newShelf }];
    });
    recordStockMovement({ productId, productName: product.name, actionType: 'LOCATION_UPDATE', oldLocation: oldLocationStr, newLocation: newLocationStr, notes: `Location updated from ${oldLocationStr} to ${newLocationStr}` });
    const warehouseName = WAREHOUSES.find(w => w.id === newWarehouse)?.name;
    setMessage({ type: 'success', text: `Location updated! ${product.name} is now at ${warehouseName}, Aisle ${newAisle}, Shelf ${newShelf}.` });
    setTimeout(() => handleClear(), 3000);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Stock Actions</h1>
        <p className="text-gray-600">Manage inventory movements and updates</p>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-3 rounded-xl shadow-sm">
        <div className="bg-gray-100 rounded-full p-1 inline-flex gap-1">
          <TabButton label="Issue/Receive" active={activeTab === 'issue-receive'} onClick={() => handleTabChange('issue-receive')} />
          <TabButton label="Transfer" active={activeTab === 'transfer'} onClick={() => handleTabChange('transfer')} />
          <TabButton label="Adjust" active={activeTab === 'adjust'} onClick={() => handleTabChange('adjust')} />
          <TabButton label="Update Location" active={activeTab === 'update-location'} onClick={() => handleTabChange('update-location')} />
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-6">
        <div className="flex-1">

          {/* Issue / Receive Tab */}
          {activeTab === 'issue-receive' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <PackagePlus className="w-5 h-5 text-gray-700" />
                <div>
                  <h2 className="font-semibold text-gray-900">Issue or Receive Stock</h2>
                  <p className="text-sm text-gray-500">
                    {activeStockAction === 'receive' ? 'Add items to inventory from suppliers or transfers' : 'Remove items from inventory for departments or customers'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mb-6">
                <button onClick={() => { setActiveStockAction('receive'); setMessage(null); }}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeStockAction === 'receive' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Receive Stock
                </button>
                <button onClick={() => { setActiveStockAction('issue'); setMessage(null); }}
                  className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeStockAction === 'issue' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  Issue Stock
                </button>
              </div>
              <MessageAlert message={message} onClose={() => setMessage(null)} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select a product or scan barcode</option>
                      {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select warehouse</option>
                      {WAREHOUSES.map(wh => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} {activeStockAction === 'issue' && productId ? `(Stock: ${getAvailableStock(productId, wh.id)} units)` : `(Available: ${wh.capacity - wh.currentStock}/${wh.capacity})`}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity <span className="text-red-500">*</span></label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {activeStockAction === 'issue' && productId && warehouse && (
                    <p className="mt-1.5 text-sm text-gray-600">Available stock: <span className="font-medium text-gray-900">{getAvailableStock(productId, warehouse)} units</span></p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter reason for this stock movement..." rows={3} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSubmit} className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                  <PackagePlus className="w-4 h-4" />
                  {activeStockAction === 'receive' ? 'Submit Receive' : 'Submit Issue'}
                </button>
                <button onClick={handleClear} className="px-8 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">Clear</button>
              </div>
            </div>
          )}

          {/* Transfer Tab */}
          {activeTab === 'transfer' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <ArrowRightLeft className="w-5 h-5 text-gray-700" />
                <div>
                  <h2 className="font-semibold text-gray-900">Transfer Stock</h2>
                  <p className="text-sm text-gray-500">Move items between warehouses</p>
                </div>
              </div>
              <MessageAlert message={message} onClose={() => setMessage(null)} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select a product</option>
                      {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Source Warehouse <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={sourceWarehouse} onChange={(e) => setSourceWarehouse(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select source warehouse</option>
                      {WAREHOUSES.map(wh => <option key={wh.id} value={wh.id}>{wh.name} {productId ? `(Stock: ${getAvailableStock(productId, wh.id)} units)` : ''}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination Warehouse <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={destinationWarehouse} onChange={(e) => setDestinationWarehouse(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select destination warehouse</option>
                      {WAREHOUSES.filter(wh => wh.id !== sourceWarehouse).map(wh => <option key={wh.id} value={wh.id}>{wh.name} (Available: {wh.capacity - wh.currentStock}/{wh.capacity})</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity <span className="text-red-500">*</span></label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity to transfer" className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {productId && sourceWarehouse && (
                    <p className="mt-1.5 text-sm text-gray-600">Available at source: <span className="font-medium text-gray-900">{getAvailableStock(productId, sourceWarehouse)} units</span></p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter reason for this transfer..." rows={3} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleTransfer} className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                  <ArrowRightLeft className="w-4 h-4" /> Confirm Transfer
                </button>
                <button onClick={handleClear} className="px-8 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">Clear</button>
              </div>
            </div>
          )}

          {/* Adjust Tab */}
          {activeTab === 'adjust' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Edit3 className="w-5 h-5 text-gray-700" />
                <div>
                  <h2 className="font-semibold text-gray-900">Adjust Stock Manually</h2>
                  <p className="text-sm text-gray-500">Override inventory quantities for audits and corrections</p>
                </div>
              </div>
              <MessageAlert message={message} onClose={() => setMessage(null)} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select a product</option>
                      {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select warehouse</option>
                      {WAREHOUSES.map(wh => <option key={wh.id} value={wh.id}>{wh.name} {productId ? `(Current: ${getAvailableStock(productId, wh.id)} units)` : ''}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Exact Quantity <span className="text-red-500">*</span></label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter new exact quantity" min="0" className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {productId && warehouse && (
                    <p className="mt-1.5 text-sm text-gray-600">Current stock: <span className="font-medium text-gray-900">{getAvailableStock(productId, warehouse)} units</span></p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Adjustment <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select a reason</option>
                      {ADJUSTMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter additional details about this adjustment..." rows={3} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleAdjust} className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${showConfirmation ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                  <Edit3 className="w-4 h-4" />
                  {showConfirmation ? 'Confirm Adjustment' : 'Adjust Stock'}
                </button>
                <button onClick={handleClear} className="px-8 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">Clear</button>
              </div>
            </div>
          )}

          {/* Update Location Tab */}
          {activeTab === 'update-location' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-gray-700" />
                <div>
                  <h2 className="font-semibold text-gray-900">Update Item Location</h2>
                  <p className="text-sm text-gray-500">Update physical warehouse locations for items</p>
                </div>
              </div>
              <MessageAlert message={message} onClose={() => setMessage(null)} />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={productId} onChange={(e) => handleProductIdChangeForLocation(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                      <option value="">Select a product</option>
                      {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.id} - {p.name}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                {currentLocation && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 text-sm mb-2">Current Location</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div><p className="text-blue-600 font-medium">Warehouse</p><p className="text-blue-900">{WAREHOUSES.find(w => w.id === currentLocation.warehouse)?.name || currentLocation.warehouse}</p></div>
                      <div><p className="text-blue-600 font-medium">Aisle</p><p className="text-blue-900">{currentLocation.aisle}</p></div>
                      <div><p className="text-blue-600 font-medium">Shelf</p><p className="text-blue-900">{currentLocation.shelf}</p></div>
                    </div>
                  </div>
                )}
                {productId && !currentLocation && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">No location found for this product. You can set a new location below.</p>
                  </div>
                )}
                <div className="pt-2">
                  <h4 className="font-medium text-gray-900 text-sm mb-3">New Location Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Warehouse <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select value={newWarehouse} onChange={(e) => setNewWarehouse(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                          <option value="">Select new warehouse</option>
                          {WAREHOUSES.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Aisle <span className="text-red-500">*</span></label>
                        <input type="text" value={newAisle} onChange={(e) => setNewAisle(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())} placeholder="e.g., A, B, C" maxLength={2} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Shelf Number <span className="text-red-500">*</span></label>
                        <input type="text" value={newShelf} onChange={(e) => setNewShelf(e.target.value.replace(/[^0-9]/g, ''))} placeholder="e.g., 1, 2, 3" maxLength={3} className="w-full px-3 py-2.5 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleUpdateLocation} className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                  <Package className="w-4 h-4" /> Save Location
                </button>
                <button onClick={handleClear} className="px-8 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors">Clear</button>
              </div>
            </div>
          )}
        </div>

        {/* Guidelines Sidebar */}
        <div className="w-72">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Guidelines</h3>
            <div className="space-y-4">
              {activeTab === 'issue-receive' && (<>
                <GuidelineItem title="Receive Stock" description="Use when new inventory arrives from suppliers or transfers" />
                <GuidelineItem title="Issue Stock" description="Use when releasing inventory to departments or customers" />
                <GuidelineItem title="Validation" description="Issue operations check for sufficient stock" />
              </>)}
              {activeTab === 'transfer' && (<>
                <GuidelineItem title="Stock Movement" description="Transfer inventory between warehouses while maintaining accurate location data" />
                <GuidelineItem title="Source Verification" description="System verifies sufficient stock at source before allowing transfer" />
                <GuidelineItem title="Capacity Check" description="Destination warehouse capacity is validated. Alternative locations suggested if needed" />
              </>)}
              {activeTab === 'adjust' && (<>
                <GuidelineItem title="Manual Override" description="Fix inventory discrepancies from theft, damage, or audit errors with proper authorization" />
                <GuidelineItem title="Audit Trail" description="All adjustments require a standardized reason to prevent fraud and maintain clear records" />
                <GuidelineItem title="Confirmation Required" description="System warns before overriding records and requires explicit confirmation" />
              </>)}
              {activeTab === 'update-location' && (<>
                <GuidelineItem title="Physical Tracking" description="Keep system locations synchronized with actual warehouse organization for quick item retrieval" />
                <GuidelineItem title="Location Validation" description="System enforces one item per location to prevent conflicts and ensure accurate tracking" />
                <GuidelineItem title="Warehouse Optimization" description="Update locations during reorganization to maximize space utilization and efficiency" />
              </>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
