import { useState } from 'react';
import { ChevronDown, Download, Filter } from 'lucide-react';
import { stockMovementLogs, type StockMovementLog } from './StockOperations';

export default function ActivityLogs() {
  const [filterUser, setFilterUser] = useState('All Users');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const categoryMap: { [key: string]: string } = {
    RECEIVE: 'Stock',
    ISSUE: 'Stock',
    TRANSFER: 'Stock',
    ADJUST: 'Stock',
    LOCATION_UPDATE: 'Location',
  };

  const uniqueUsers = ['All Users', ...Array.from(new Set(stockMovementLogs.map((log) => log.actorName)))];
  const uniqueCategories = ['All Categories', 'Stock', 'Location', 'User', 'System'];

  const filteredLogs = stockMovementLogs.filter((log) => {
    const userMatch = filterUser === 'All Users' || log.actorName === filterUser;
    const category = categoryMap[log.actionType] || 'System';
    const categoryMatch = filterCategory === 'All Categories' || category === filterCategory;
    let dateMatch = true;
    if (filterStartDate) dateMatch = dateMatch && new Date(log.timestamp) >= new Date(filterStartDate);
    if (filterEndDate) dateMatch = dateMatch && new Date(log.timestamp) <= new Date(filterEndDate);
    return userMatch && categoryMatch && dateMatch;
  });

  const formatTimestamp = (timestamp: string) =>
    new Date(timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });

  const getActionLabel = (actionType: string) => {
    const labels: { [key: string]: string } = {
      RECEIVE: 'Stock Received',
      ISSUE: 'Stock Issued',
      TRANSFER: 'Stock Transferred',
      ADJUST: 'Stock Adjusted',
      LOCATION_UPDATE: 'Location Updated',
    };
    return labels[actionType] || actionType;
  };

  const getCategoryBadge = (actionType: string) => {
    const category = categoryMap[actionType] || 'System';
    const colors: { [key: string]: string } = {
      Stock: 'bg-blue-100 text-blue-700',
      Location: 'bg-green-100 text-green-700',
      User: 'bg-purple-100 text-purple-700',
      System: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[category]}`}>
        {category}
      </span>
    );
  };

  const getDetails = (log: StockMovementLog) => {
    switch (log.actionType) {
      case 'RECEIVE':
        return `Received ${log.quantityChanged} units of ${log.productName} at ${log.warehouse}`;
      case 'ISSUE':
        return `Issued ${Math.abs(log.quantityChanged || 0)} units of ${log.productName} from ${log.warehouse}`;
      case 'TRANSFER':
        return `Transferred ${log.quantityChanged} units of ${log.productName} from ${log.sourceWarehouse} to ${log.destinationWarehouse}`;
      case 'ADJUST':
        return `Adjusted ${log.productName}: ${log.oldQuantity} → ${log.newQuantity} units (Reason: ${log.reason})`;
      case 'LOCATION_UPDATE':
        return `Updated location for ${log.productName} from ${log.oldLocation} to ${log.newLocation}`;
      default:
        return log.notes || 'No details available';
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Category', 'Details'].join(','),
      ...filteredLogs.map((log) =>
        [
          formatTimestamp(log.timestamp),
          log.actorName,
          getActionLabel(log.actionType),
          categoryMap[log.actionType] || 'System',
          getDetails(log).replace(/,/g, ';'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Activity Logs</h1>
          <p className="text-gray-600">Monitor all system activities and user actions</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-5 h-5 text-gray-700" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">Filter activity logs by user, category, or date range</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">User</label>
            <div className="relative">
              <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                {uniqueUsers.map((user) => <option key={user} value={user}>{user}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <div className="relative">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                {uniqueCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
            <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
            <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {(filterUser !== 'All Users' || filterCategory !== 'All Categories' || filterStartDate || filterEndDate) && (
          <div className="mt-4">
            <button onClick={() => { setFilterUser('All Users'); setFilterCategory('All Categories'); setFilterStartDate(''); setFilterEndDate(''); }}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Activity History</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredLogs.length} of {stockMovementLogs.length} activities
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No activity logs found. Perform stock operations to see them here.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.actorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getActionLabel(log.actionType)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getCategoryBadge(log.actionType)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">{getDetails(log)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
