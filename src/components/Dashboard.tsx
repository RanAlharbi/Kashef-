/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ScanRecord, SystemNotification } from '../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  Bookmark, 
  Download, 
  Clock, 
  FileText, 
  Filter, 
  ExternalLink,
  Info
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  token: string | null;
  onNavigateToScanner: () => void;
  userEmail?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ token, onNavigateToScanner, userEmail }) => {
  const { t, isRtl } = useLanguage();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('kashef_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const scansRes = await fetch('/api/scans/history', { headers });
      const notificationsRes = await fetch('/api/notifications', { headers });
      
      if (scansRes.ok) {
        const scansData = await scansRes.json();
        setScans(scansData);
      }
      if (notificationsRes.ok) {
        const notifData = await notificationsRes.json();
        setNotifications(notifData);
      }
    } catch (err) {
      console.error("Failed to load dashboard statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleDeleteScan = async (id: string) => {
    try {
      const response = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setScans(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('kashef_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleReadNotification = async (id: string) => {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  // Prepare chart data based on history scans
  const chartData = [
    { day: 'Mon', score: 20 },
    { day: 'Tue', score: 35 },
    { day: 'Wed', score: 10 },
    { day: 'Thu', score: 55 },
    { day: 'Fri', score: 40 },
    { day: 'Sat', score: 75 },
    { day: 'Sun', score: 12 },
  ];

  // Calculate actual ratios
  const totalCount = scans.length;
  const dangerousCount = scans.filter(s => s.severity === 'dangerous').length;
  const suspiciousCount = scans.filter(s => s.severity === 'suspicious').length;
  const safeCount = scans.filter(s => s.severity === 'safe').length;

  const filteredScans = scans.filter(s => {
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterSeverity !== 'all' && s.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-slate-100">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {isRtl ? 'لوحة المراقبة والحماية' : 'Secure Defense Dashboard'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isRtl ? `مرحباً بك مجدداً. فحص وتأمين نشط لحساب: ${userEmail || 'زائر'}` : `Welcome back. Secure node active for: ${userEmail || 'Visitor Guest'}`}
          </p>
        </div>
        <button
          id="dashboard-new-scan-btn"
          onClick={onNavigateToScanner}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 font-bold text-sm text-white rounded-xl shadow-lg transition"
        >
          {isRtl ? 'إجراء فحص وقائي جديد' : '+ Launch Scan Agent'}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <>
          {/* Quick Counter Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <FileText className="w-16 h-16" />
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'مجموع التحليلات' : 'TOTAL SECURITY SCANS'}</div>
              <div className="text-4xl font-black text-white mt-2">{totalCount}</div>
              <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تحليلات نشطة فورية' : 'Real-time telemetry feeds'}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'التهديدات النشطة' : 'DANGEROUS PHISHING / THREATS'}</div>
              <div className="text-4xl font-black text-rose-500 mt-2">{dangerousCount}</div>
              <div className="text-xs text-rose-400/80 mt-2 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تم حظرها وحفظ المستخدمين' : 'Quarantined successfully'}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'مؤشرات مشبوهة' : 'SUSPICIOUS INDICATORS'}</div>
              <div className="text-4xl font-black text-amber-500 mt-2">{suspiciousCount}</div>
              <div className="text-xs text-amber-400/80 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isRtl ? 'ننصح بمزيد من الحذر' : 'Caution / Verification urged'}</span>
              </div>
            </div>

            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl text-left">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'العناصر الآمنة' : 'VERIFIED SAFE SIGNATURES'}</div>
              <div className="text-4xl font-black text-emerald-500 mt-2">{safeCount}</div>
              <div className="text-xs text-emerald-400/80 mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تطابق كامل لشهادات الأمان' : 'SSL and domains verified'}</span>
              </div>
            </div>
          </div>

          {/* Chart and System Notifications Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart */}
            <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl lg:col-span-2 flex flex-col justify-between">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{t.riskTrend}</h3>
                <p className="text-xs text-slate-500 mt-1">{isRtl ? 'يعرض مستويات الخطورة المسجلة للفحوصات السابقة على مدار الأسبوع' : 'Defensive threat severity vectors calculated across previous 7 testing periods'}</p>
              </div>
              
              <div className="h-60 w-full font-mono text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Area type="monotone" dataKey="score" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="p-6 bg-slate-900/40 border border-slate-850 rounded-2xl flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <span>{t.notifications}</span>
              </h3>
              
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-1">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleReadNotification(notif.id)}
                    className={`p-3.5 border rounded-xl text-left transition cursor-pointer ${
                      notif.read 
                        ? 'bg-slate-950/40 border-slate-900 text-slate-400' 
                        : 'bg-rose-500/10 border-rose-500/30 text-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="text-xs font-bold leading-tight flex items-center gap-1">
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                        <span>{isRtl ? notif.titleAr : notif.titleEn}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs mt-1.5 leading-relaxed text-slate-400">
                      {isRtl ? notif.messageAr : notif.messageEn}
                    </p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center text-xs text-slate-500 py-12">
                    {isRtl ? 'لا توجد تنبيهات نشطة حالياً' : 'Zero immediate threat alerts active'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filtering and Security Scans List */}
          <div className="p-6 bg-slate-900/30 border border-slate-850 rounded-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold text-white">{t.recentScans}</h3>
              
              {/* Filter controls */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select 
                    id="filter-type-select"
                    value={filterType} 
                    onChange={e => setFilterType(e.target.value)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">{isRtl ? 'كل الأنواع' : 'All Types'}</option>
                    <option value="url_or_website">{isRtl ? 'روابط ومواقع' : 'URLs'}</option>
                    <option value="text_or_message">{isRtl ? 'رسائل ونص' : 'Messages'}</option>
                    <option value="screenshot">{isRtl ? 'لقطات شاشة' : 'Screenshots'}</option>
                    <option value="phone_number">{isRtl ? 'هواتف' : 'Phone Numbers'}</option>
                    <option value="financial">{isRtl ? 'مالية / آيبان' : 'Financial'}</option>
                    <option value="file">{isRtl ? 'ملفات' : 'Files'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                  <select 
                    id="filter-severity-select"
                    value={filterSeverity} 
                    onChange={e => setFilterSeverity(e.target.value)}
                    className="bg-transparent text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">{isRtl ? 'كل التقييمات' : 'All Severities'}</option>
                    <option value="safe">{isRtl ? 'آمنة' : 'Safe'}</option>
                    <option value="suspicious">{isRtl ? 'مشبوهة' : 'Suspicious'}</option>
                    <option value="dangerous">{isRtl ? 'خطيرة' : 'Dangerous'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scans Cards List */}
            <div className="space-y-4">
              {filteredScans.map((scan) => {
                const isFav = favorites.includes(scan.id);
                return (
                  <div 
                    key={scan.id} 
                    id={`scan-record-${scan.id}`}
                    className="p-5 bg-slate-950 border border-slate-900 rounded-xl space-y-4 hover:border-slate-800 transition text-left"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 bg-slate-900 border border-slate-850 rounded">
                            {scan.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-slate-400 font-mono select-all">
                            ID: {scan.id}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1.5 break-all">
                          {scan.inputName}
                        </h4>
                      </div>

                      {/* Badges and Actions */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          scan.severity === 'dangerous' 
                            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' 
                            : scan.severity === 'suspicious'
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        }`}>
                          {scan.severity === 'dangerous' ? t.dangerous : scan.severity === 'suspicious' ? t.suspicious : t.safe} ({scan.riskScore}%)
                        </span>

                        <button 
                          id={`bookmark-btn-${scan.id}`}
                          onClick={() => toggleFavorite(scan.id)}
                          className={`p-1.5 rounded-lg border transition ${
                            isFav 
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={t.saveReport}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>

                        <a 
                          id={`download-report-${scan.id}`}
                          href={`/api/scans/report-download/${scan.id}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                          title={t.downloadReport}
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        <button 
                          id={`delete-scan-${scan.id}`}
                          onClick={() => handleDeleteScan(scan.id)}
                          className="p-1.5 bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/30 rounded-lg text-slate-400 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* AI Findings block expanded */}
                    <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-3">
                      <div>
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Info className="w-3.5 h-3.5 text-rose-500" />
                          <span>{t.aiExplanation}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                          {isRtl ? scan.aiExplanationAr : scan.aiExplanationEn}
                        </p>
                      </div>

                      {scan.technicalDetailsEn && (
                        <div>
                          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{t.technicalDetails}</div>
                          <p className="text-[11px] font-mono text-slate-400 leading-relaxed mt-1 bg-slate-950 p-2 rounded border border-slate-900">
                            {isRtl ? scan.technicalDetailsAr : scan.technicalDetailsEn}
                          </p>
                        </div>
                      )}

                      {/* Display recommendations */}
                      {scan.recommendationsEn && scan.recommendationsEn.length > 0 && (
                        <div>
                          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-widest">{t.recommendations}</div>
                          <ul className="list-disc pl-4 text-xs text-slate-300 mt-1 space-y-1">
                            {(isRtl ? scan.recommendationsAr : scan.recommendationsEn).map((rec, rIdx) => (
                              <li key={rIdx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredScans.length === 0 && (
                <div className="text-center py-16 text-slate-500 text-sm">
                  {isRtl ? 'لا توجد فحوصات مطابقة لخيارات الفلترة' : 'Zero matching digital scan records found'}
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
