import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffExport = ({ 
  onExport, 
  onImport, 
  loading = false 
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'xlsx',
    includeInactive: false,
    dateRange: 'all',
    startDate: '',
    endDate: '',
    fields: {
      personal: true,
      work: true,
      permissions: true,
      performance: false
    }
  });
  const [importFile, setImportFile] = useState(null);
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    skipErrors: true,
    sendWelcomeEmail: true
  });

  const handleExport = () => {
    if (exportOptions.dateRange === 'custom' && (!exportOptions.startDate || !exportOptions.endDate)) {
      toast.error('Please select start and end dates for custom range');
      return;
    }

    onExport(exportOptions);
    setShowExportModal(false);
  };

  const handleImport = () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    onImport(importFile, importOptions);
    setShowImportModal(false);
    setImportFile(null);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid Excel or CSV file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }

      setImportFile(file);
    }
  };

  const ExportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export Staff Data
            </h2>
            <button
              onClick={() => setShowExportModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="format"
                    value="xlsx"
                    checked={exportOptions.format === 'xlsx'}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Excel (.xlsx)</div>
                    <div className="text-sm text-gray-500">Recommended format</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportOptions.format === 'csv'}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">CSV (.csv)</div>
                    <div className="text-sm text-gray-500">Simple format</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={exportOptions.dateRange}
                onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Staff</option>
                <option value="active">Active Staff Only</option>
                <option value="recent">Recent Hires (30 days)</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {/* Custom Date Range */}
            {exportOptions.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportOptions.startDate}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exportOptions.endDate}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Include Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Include Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeInactive}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeInactive: e.target.checked }))}
                    className="mr-3"
                  />
                  <span className="text-sm text-gray-700">Include inactive staff</span>
                </label>
              </div>
            </div>

            {/* Fields to Export */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fields to Export
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(exportOptions.fields).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setExportOptions(prev => ({
                        ...prev,
                        fields: { ...prev.fields, [key]: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowExportModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ImportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Import Staff Data
            </h2>
            <button
              onClick={() => setShowImportModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="cursor-pointer"
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to select file or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Supports Excel (.xlsx, .xls) and CSV files
                  </p>
                </label>
              </div>
              {importFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Selected: {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Import Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Options
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.updateExisting}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm text-gray-700">Update existing staff</span>
                    <p className="text-xs text-gray-500">Update staff with matching email addresses</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.skipErrors}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, skipErrors: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm text-gray-700">Skip rows with errors</span>
                    <p className="text-xs text-gray-500">Continue importing valid rows</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.sendWelcomeEmail}
                    onChange={(e) => setImportOptions(prev => ({ ...prev, sendWelcomeEmail: e.target.checked }))}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-sm text-gray-700">Send welcome emails</span>
                    <p className="text-xs text-gray-500">Send welcome email to new staff members</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Import Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Import Instructions</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Required columns: First Name, Last Name, Email, Phone</li>
                    <li>• Optional columns: Department, Position, Hire Date, Salary</li>
                    <li>• Email addresses must be unique</li>
                    <li>• Phone numbers should include country code</li>
                    <li>• Date format: YYYY-MM-DD</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => setShowImportModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !importFile}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setShowExportModal(true)}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import
        </button>
      </div>

      {showExportModal && <ExportModal />}
      {showImportModal && <ImportModal />}
    </>
  );
};

export default StaffExport;
