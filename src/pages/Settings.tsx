import React, { useRef } from 'react';
import { useStore } from '../store';
import { Download, Upload, User, Save } from 'lucide-react';

export default function Settings() {
  const { exportData, importData, githubUsername, setGithubUsername } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mytrackai-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        importData(result);
        alert('Data imported successfully!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your data and integrations.</p>
      </header>

      <section className="bg-surface p-6 rounded-2xl border border-gray-800 space-y-6">
        <h2 className="text-xl font-semibold text-white">Integrations</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              <User size={16} /> GitHub Username
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="e.g. torvalds"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="flex-1 bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
              <button className="bg-surface hover:bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
                <Save size={18} /> Save
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Used to sync your coding streak automatically.</p>
          </div>
        </div>
      </section>

      <section className="bg-surface p-6 rounded-2xl border border-gray-800 space-y-6">
        <h2 className="text-xl font-semibold text-white">Data Management</h2>
        
        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="flex-1 bg-background hover:bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-xl font-medium flex flex-col items-center gap-2 transition-colors"
          >
            <Download size={24} className="text-primary" />
            Export Data
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-background hover:bg-gray-800 border border-gray-700 text-white px-6 py-4 rounded-xl font-medium flex flex-col items-center gap-2 transition-colors"
          >
            <Upload size={24} className="text-secondary" />
            Import Data
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500 text-center">
          Export your data as a JSON file to back it up or move to another device.
        </p>
      </section>
    </div>
  );
}
