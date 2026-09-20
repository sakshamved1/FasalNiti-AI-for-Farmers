import React, { useState, useEffect } from 'react';
import { ScrollText, ShieldCheck, RefreshCw, Clock, Laptop } from 'lucide-react';
import api from '../../services/api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-black tracking-wider bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
              Compliance & Security
            </span>
            <span className="text-xs text-slate-400">Total Recorded Actions: {logs.length}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">Immutable audit logs recording all administrative user verifications, scheme updates, and ticket decisions.</p>
        </div>

        <button
          onClick={fetchLogs}
          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <ScrollText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No administrative actions logged yet.</p>
            <p className="text-[11px]">As administrators verify users or publish schemes, all activities will be logged here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Action Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <strong className="text-slate-900">{log.adminName}</strong>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-800 font-black px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-semibold">
                      {log.entity} <span className="text-[10px] text-slate-400 font-mono">({log.entityId})</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
