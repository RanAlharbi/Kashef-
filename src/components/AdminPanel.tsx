/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PlatformConfig } from '../types';
import { 
  Terminal, 
  Settings, 
  Users, 
  Database, 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  Activity, 
  AlertOctagon,
  RefreshCw,
  Clock
} from 'lucide-react';

interface AdminPanelProps {
  token: string | null;
}

interface AdminData {
  config: PlatformConfig;
  stats: {
    totalScansCount: number;
    dangerousCount: number;
    suspiciousCount: number;
    safeCount: number;
    usersRegisteredCount: number;
  };
  users: { email: string; name: string; role: string; createdAt: string }[];
  auditLogs: { id: string; action: string; details: string; ip: string; timestamp: string }[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ token }) => {
  const { t, isRtl } = useLanguage();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // Editable configuration states
  const [modelName, setModelName] = useState('gemini-3.5-flash');
  const [maxVisitorScans, setMaxVisitorScans] = useState(5);
  const [grounding, setGrounding] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  const fetchAdminDetails = async () => {
    setLoading(true);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('/api/admin/settings', { headers });
      if (res.ok) {
        const details: AdminData = await res.json();
        setData(details);
        
        // Seed edit form
        setModelName(details.config.aiModelName);
        setMaxVisitorScans(details.config.maxScansPerVisitor);
        setGrounding(details.config.enableGrounding);
        setMaintenance(details.config.maintenanceMode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDetails();
  }, [token]);

  const saveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');

    try {
      const response = await fetch('/api/admin/settings/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          aiModelName: modelName,
          maxScansPerVisitor: Number(maxVisitorScans),
          enableGrounding: grounding,
          maintenanceMode: maintenance
        })
      });

      if (response.ok) {
        setSuccessMsg(isRtl ? 'تم تحديث تكوينات كاشف بنجاح!' : 'Kashef AI Engine configurations updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchAdminDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-slate-100">
      
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-6 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-8 h-8 text-rose-500" />
            <span>{isRtl ? 'منصة الرقابة والتحكم الأمني' : 'Cyber Security Admin Console'}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isRtl ? 'عرض سجلات التدقيق وتخصيص نماذج الذكاء الاصطناعي وصلاحيات الزوار' : 'Monitor system metrics, review audit logs, and configure active AI intelligence pipelines.'}
          </p>
        </div>
        
        <button 
          id="refresh-admin-btn"
          onClick={fetchAdminDetails}
          className="p-2 text-slate-500 hover:text-white hover:bg-slate-900 rounded-lg transition"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Side: System Metrics & Config Edit */}
            <div className="lg:col-span-5 space-y-6 text-left">
              
              {/* Stats Summary Panel */}
              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-4">
                <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4.5 h-4.5" />
                  <span>{isRtl ? 'مؤشرات النظام الحية' : 'LIVE SYSTEM HEALTH'}</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{isRtl ? 'المستخدمين المسجلين' : 'SUBSCRIBED NODES'}</div>
                    <div className="text-2xl font-black text-white mt-1">{data.stats.usersRegisteredCount}</div>
                  </div>
                  <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{isRtl ? 'إجمالي الفحوصات' : 'TOTAL CORRELATIONS'}</div>
                    <div className="text-2xl font-black text-white mt-1">{data.stats.totalScansCount}</div>
                  </div>
                </div>
              </div>

              {/* Editable Configuration Form */}
              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl">
                <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-6">
                  <Settings className="w-4.5 h-4.5" />
                  <span>{t.adminControls}</span>
                </h3>

                {successMsg && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl text-center font-semibold">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={saveConfiguration} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider mb-1.5">{isRtl ? 'نموذج الذكاء الاصطناعي النشط' : 'ACTIVE INFERENCE MODEL'}</label>
                    <select
                      id="admin-model-select"
                      value={modelName}
                      onChange={e => setModelName(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:border-rose-500 focus:outline-none"
                    >
                      <option value="gemini-3.5-flash">gemini-3.5-flash (Low Latency / Standard)</option>
                      <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex / Deep Reasoning)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase tracking-wider mb-1.5">{isRtl ? 'الحد الأقصى لفحوصات الزائر' : 'VISITOR PASS MAXIMUM SCANS'}</label>
                    <input
                      id="admin-max-scans-input"
                      type="number"
                      value={maxVisitorScans}
                      onChange={e => setMaxVisitorScans(Number(e.target.value))}
                      className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl focus:border-rose-500 focus:outline-none font-mono"
                    />
                  </div>

                  {/* Toggle buttons */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                      <div>
                        <div className="text-white text-xs">{isRtl ? 'بحث ومقاطعة الويب الحية (Grounding)' : 'Google Grounding Searches'}</div>
                        <p className="text-[10px] text-slate-500 font-normal">{isRtl ? 'تضمين نتائج الويب الحقيقية في ردود الذكاء الاصطناعي' : 'Inject fresh search contexts into scans'}</p>
                      </div>
                      <button
                        id="toggle-grounding-btn"
                        type="button"
                        onClick={() => setGrounding(!grounding)}
                        className="text-slate-400 hover:text-white transition"
                      >
                        {grounding ? <ToggleRight className="w-8 h-8 text-rose-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                      <div>
                        <div className="text-white text-xs">{isRtl ? 'وضع الصيانة للمنصة' : 'Vulnerability Maintenance Mode'}</div>
                        <p className="text-[10px] text-slate-500 font-normal">{isRtl ? 'حظر العمليات لفحوصات الصيانة الطارئة' : 'Disable public access during upgrades'}</p>
                      </div>
                      <button
                        id="toggle-maintenance-btn"
                        type="button"
                        onClick={() => setMaintenance(!maintenance)}
                        className="text-slate-400 hover:text-white transition"
                      >
                        {maintenance ? <ToggleRight className="w-8 h-8 text-rose-500" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="save-config-btn"
                    type="submit"
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-rose-400 font-bold rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isRtl ? 'حفظ وحقن التكوينات' : 'Save Engine Rules'}</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Right Side: Registered accounts list & Audit Logs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Subscribed nodes */}
              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl">
                <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <Users className="w-4.5 h-4.5" />
                  <span>{isRtl ? 'سجل الهويات والمستخدمين' : 'IDENTIFIED USER NODES'}</span>
                </h3>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {data.users.map((u, idx) => (
                    <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-slate-500 font-mono mt-0.5">{u.email}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono ${
                        u.role === 'admin' 
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                          : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                      }`}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit logs */}
              <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl">
                <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <Database className="w-4.5 h-4.5" />
                  <span>{t.auditLogs}</span>
                </h3>

                <div className="space-y-3 font-mono text-[11px] max-h-60 overflow-y-auto pr-1">
                  {data.auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1.5">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-rose-400 font-bold">{log.action.toUpperCase()}</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </span>
                      </div>
                      <div className="text-slate-300 leading-normal">{log.details}</div>
                      <div className="text-slate-600 text-[10px]">Source IP: {log.ip}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
};
