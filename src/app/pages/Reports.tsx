import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, Package, AlertTriangle, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';

// Mock report data
const stockMovementData = [
  { date: 'Apr 1', received: 45, issued: 32 },
  { date: 'Apr 2', received: 52, issued: 38 },
  { date: 'Apr 3', received: 38, issued: 45 },
  { date: 'Apr 4', received: 65, issued: 42 },
  { date: 'Apr 5', received: 78, issued: 55 },
  { date: 'Apr 6', received: 92, issued: 68 },
  { date: 'Apr 7', received: 85, issued: 72 },
  { date: 'Apr 8', received: 98, issued: 58 },
  { date: 'Apr 9', received: 72, issued: 65 },
  { date: 'Apr 10', received: 68, issued: 52 },
];

const lowStockItems = [
  { id: 'PRD-003', name: 'Wireless Mouse Logitech', quantity: 8, threshold: 15 },
  { id: 'PRD-006', name: 'USB-C Cable 2m', quantity: 5, threshold: 20 },
  { id: 'PRD-009', name: 'Filing Cabinet 4-Drawer', quantity: 3, threshold: 10 },
  { id: 'PRD-012', name: 'Conference Table', quantity: 2, threshold: 5 },
];

const categoryDistribution = [
  { category: 'Electronics', count: 142 },
  { category: 'Furniture', count: 78 },
  { category: 'Office Supplies', count: 203 },
];

type ReportType = 'stock-movement' | 'current-inventory' | 'low-stock';

export default function Reports() {
  const { user } = useAuth();
  const [noDataError, setNoDataError] = useState(false);

  // Check if user has access to reports
  const hasAccess = user?.role === 'Admin' || user?.role === 'Manager';

  if (!hasAccess) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-semibold text-red-900 mb-3">Access Denied</h2>
            <p className="text-lg text-red-700 mb-6">
              You do not have permission to generate reports. This feature is only available to Admins and Managers.
            </p>
            <div className="bg-white rounded-lg p-4 border border-red-200">
              <p className="text-base text-gray-700">
                <strong>Current User:</strong> {user?.name} ({user?.role})
              </p>
              <p className="text-sm text-gray-500 mt-2">
                If you believe this is an error, please contact your system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [selectedReport, setSelectedReport] = useState<ReportType>('stock-movement');
  const [dateFrom, setDateFrom] = useState('2026-04-01');
  const [dateTo, setDateTo] = useState('2026-04-23');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setNoDataError(false);

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const currentDate = new Date();
    const minValidDate = new Date('2020-01-01');
    const maxValidDate = new Date(currentDate.getFullYear() + 1, 11, 31);

    setTimeout(() => {
      setIsGenerating(false);
      if (fromDate < minValidDate || toDate < minValidDate || fromDate > maxValidDate || toDate > maxValidDate || fromDate > toDate) {
        setNoDataError(true);
        setReportGenerated(false);
      } else {
        setNoDataError(false);
        setReportGenerated(true);
      }
    }, 1500);
  };

  const handleDownloadPDF = () => alert('PDF download functionality would be implemented here');
  const handleDownloadCSV = () => alert('CSV download functionality would be implemented here');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">Generate Reports</h1>
        <p className="text-lg text-gray-600 mt-1">Analyze inventory data and trends</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-gray-600 mb-1">Total Items</p>
              <p className="text-4xl font-bold text-gray-900">423</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-gray-600 mb-1">Low Stock Items</p>
              <p className="text-4xl font-bold text-yellow-600">4</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base text-gray-600 mb-1">Categories</p>
              <p className="text-4xl font-bold text-gray-900">3</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Report Configuration Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Configuration</h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => { setSelectedReport(e.target.value as ReportType); setReportGenerated(false); setNoDataError(false); }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-base"
            >
              <option value="stock-movement">Stock Movement</option>
              <option value="current-inventory">Current Inventory</option>
              <option value="low-stock">Low Stock Alert</option>
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-base"
            />
          </div>
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-base"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base"
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
          {reportGenerated && (
            <>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-base"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-base"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Report Display Area */}
      <div>
        {noDataError ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Records Found</h3>
            <p className="text-base text-gray-600 mb-1">No records found for the selected criteria.</p>
            <p className="text-base text-gray-500">
              Please try selecting a different date range between 2020 and {new Date().getFullYear() + 1}.
            </p>
          </div>
        ) : !reportGenerated ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Report Generated</h3>
            <p className="text-base text-gray-500">Select report parameters and click "Generate Report" to view data</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedReport === 'stock-movement' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Stock Movement Report</h2>
                    <p className="text-sm text-gray-500 mt-1">{dateFrom} to {dateTo}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stockMovementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="received" stroke="#10b981" strokeWidth={2} name="Received" />
                      <Line type="monotone" dataKey="issued" stroke="#3b82f6" strokeWidth={2} name="Issued" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Total Received</div>
                    <div className="text-2xl font-bold text-green-700 mt-1">753</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium">Total Issued</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">527</div>
                  </div>
                </div>
              </div>
            )}

            {selectedReport === 'current-inventory' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Current Inventory Report</h2>
                    <p className="text-sm text-gray-500 mt-1">Breakdown by category</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" name="Item Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  {categoryDistribution.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{cat.category}</span>
                      <span className="text-gray-600">{cat.count} items</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport === 'low-stock' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert Report</h2>
                    <p className="text-sm text-gray-500 mt-1">Items below minimum threshold</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.id}</div>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="font-semibold text-yellow-700">{item.quantity} units</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-gray-600">Minimum Threshold:</span>
                        <span className="text-gray-700">{item.threshold} units</span>
                      </div>
                      <div className="mt-3 w-full bg-yellow-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{ width: `${(item.quantity / item.threshold) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                    <AlertTriangle className="w-5 h-5" />
                    Action Required
                  </div>
                  <p className="text-sm text-red-600">
                    {lowStockItems.length} items require immediate restocking to maintain inventory levels.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
