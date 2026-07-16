/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ScanRecord, ScanType, SeverityLevel, ScreenshotHighlight } from '../types';
import { 
  Globe, 
  MessageSquare, 
  Image as ImageIcon, 
  Phone, 
  FileCheck, 
  CreditCard, 
  ShieldAlert, 
  ShieldCheck, 
  Upload, 
  Cpu, 
  QrCode, 
  FileText, 
  HelpCircle,
  Eye,
  Download,
  Terminal,
  RefreshCw,
  Clock
} from 'lucide-react';

interface SecurityAnalyzerProps {
  token: string | null;
  onScanCompleted: () => void;
}

export const SecurityAnalyzer: React.FC<SecurityAnalyzerProps> = ({ token, onScanCompleted }) => {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<ScanType>('url_or_website');
  const [inputText, setInputText] = useState('');
  
  // Custom states per module
  const [emailHeaders, setEmailHeaders] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; type: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ScanRecord | null>(null);
  const [selectedHighlight, setSelectedHighlight] = useState<ScreenshotHighlight | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tabs layout
  const scannerTabs: { id: ScanType; labelEn: string; labelAr: string; icon: any }[] = [
    { id: 'url_or_website', labelEn: 'URL & SSL', labelAr: 'موقع ورابط', icon: Globe },
    { id: 'text_or_message', labelEn: 'Messages & SMS', labelAr: 'الرسائل والنصوص', icon: MessageSquare },
    { id: 'screenshot', labelEn: 'Screenshot Vision', labelAr: 'لقطة شاشة وبصر', icon: ImageIcon },
    { id: 'phone_number', labelEn: 'Phone Intel', labelAr: 'أرقام الهواتف', icon: Phone },
    { id: 'financial', labelEn: 'IBAN & Crypto', labelAr: 'الحسابات المالية', icon: CreditCard },
    { id: 'file', labelEn: 'Malware Sandbox', labelAr: 'الملفات المشبوهة', icon: FileCheck },
  ];

  // Drag and drop mechanics for files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropImage = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };

  const handleDropSandboxFile = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processSandboxFile(files[0]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processImageFile(files[0]);
    }
  };

  const handleSandboxFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processSandboxFile(files[0]);
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
      setInputText(file.name);
    };
    reader.readAsDataURL(file);
  };

  const processSandboxFile = (file: File) => {
    setFileMeta({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream'
    });
    setInputText(file.name);
  };

  const executeAnalysis = async () => {
    if (!inputText && !screenshotBase64 && !fileMeta) return;

    setLoading(true);
    setCurrentResult(null);
    setSelectedHighlight(null);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
      type: activeTab,
      input: inputText || (fileMeta ? fileMeta.name : 'Screenshot Upload'),
      screenshot: screenshotBase64,
      emailHeaders: activeTab === 'text_or_message' ? emailHeaders : undefined,
      fileMeta: activeTab === 'file' ? fileMeta : undefined
    };

    try {
      const response = await fetch('/api/scans/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result: ScanRecord = await response.json();
      setCurrentResult(result);
      onScanCompleted(); // Refresh dashboard list if they navigate later
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setInputText('');
    setScreenshotBase64(null);
    setFileMeta(null);
    setEmailHeaders('');
    setCurrentResult(null);
    setSelectedHighlight(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-slate-100">
      
      {/* Header Info */}
      <div className="border-b border-slate-800 pb-6 text-left">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-8 h-8 text-rose-500 animate-spin-slow" />
          <span>{isRtl ? 'غرفة عمليات فحص التهديدات' : 'Cyber threat Intelligence Center'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isRtl ? 'قم بفحص وتحديد الأنماط الاحتيالية للروابط والرسائل والملفات بمساندة الذكاء الاصطناعي الأمني' : 'Execute multi-modal deep analytics on domains, fake messages, screenshots, mobile numbers, and suspicious financial IBAN networks.'}
        </p>
      </div>

      {/* Bento style scanner selection tabs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {scannerTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              id={`scanner-tab-${tab.id}`}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                resetScanner();
              }}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center transition duration-300 gap-2 ${
                isActive 
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold shadow-lg shadow-rose-500/5' 
                  : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce' : ''}`} />
              <span className="text-[11px] font-sans tracking-wide">
                {isRtl ? tab.labelAr : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* INPUT PANEL */}
        <div className="lg:col-span-5 p-6 bg-slate-900/40 border border-slate-850 rounded-2xl space-y-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-400 tracking-wider uppercase font-mono">
              [ {isRtl ? 'قناة المدخلات الأمنية' : 'INBOUND ANALYTICS CANAL'} ]
            </span>
            <button 
              id="reset-scanner-btn"
              onClick={resetScanner} 
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isRtl ? 'تصفير' : 'Reset'}</span>
            </button>
          </div>

          {/* DYNAMIC FORM VIEWS */}

          {activeTab === 'url_or_website' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'الرابط أو الموقع المطلوب فاحصه' : 'TARGET WEBSITE URL'}</label>
              <input
                id="url-scan-input"
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="https://paypa1-secure-login.xyz/update"
                className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl text-white text-sm transition"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                * {isRtl ? 'يفحص النطاق وأمن SSL وإعادات التوجيه التلقائية' : 'Scans Whois registrations, SSL validities, nested redirects, typosquatting variants.'}
              </p>
            </div>
          )}

          {activeTab === 'text_or_message' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'نص الرسالة أو محتوى البريد' : 'MESSAGE BODY OR EMAIL CONTENT'}</label>
              <textarea
                id="text-scan-input"
                rows={5}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={isRtl ? 'الصق هنا رسالة الواتساب أو البريد المريب لتحديد محاولات الهندسة الاجتماعية...' : 'Paste suspicious SMS, WhatsApp message, bank alert copy, or email text content here...'}
                className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl text-white text-sm transition"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{isRtl ? 'ترويسة البريد الإلكتروني (اختياري)' : 'EMAIL HEADERS / RAW HEADER (OPTIONAL)'}</label>
                <textarea
                  id="email-headers-input"
                  rows={3}
                  value={emailHeaders}
                  onChange={e => setEmailHeaders(e.target.value)}
                  placeholder="SPF, DKIM, Return-Path, Received blocks..."
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl text-white text-[11px] font-mono transition"
                />
              </div>
            </div>
          )}

          {activeTab === 'screenshot' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'لقطة شاشة لصفحة الدفع أو المحادثة' : 'SCAM SCREENSHOT UPLOAD'}</label>
              
              <div 
                id="dropzone-image"
                onDragOver={handleDragOver}
                onDrop={handleDropImage}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-rose-500 bg-slate-950/60 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3"
              >
                <input 
                  id="screenshot-file-input"
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {screenshotBase64 ? (
                  <div className="relative w-full max-h-48 overflow-hidden rounded-xl border border-slate-800">
                    <img src={screenshotBase64} alt="Pre-scan target" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-xs font-semibold text-white">
                      {isRtl ? 'انقر لتغيير الصورة' : 'Click to Replace Image'}
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-500" />
                    <p className="text-xs text-slate-400 leading-normal">
                      {t.screenshotUpload}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">
                      (PNG, JPG, JPEG supported)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'phone_number' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'رقم الهاتف المشبوه' : 'SUSPECT TELEPHONE NUMBER'}</label>
              <input
                id="phone-scan-input"
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="+966 50 119 2200"
                className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl text-white text-sm transition"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                * {isRtl ? 'يفحص سجل بلاغات السبام وانتحال الشخصية والمصدر الشبكي للرقم' : 'Verifies international caller records, carrier networks, virtual VoIP indicators.'}
              </p>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'رقم الحساب البنكي / آيبان أو محفظة العملات الرقمية' : 'IBAN OR CRYPTO WALLET ADDRESS'}</label>
              <input
                id="financial-scan-input"
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="SA93 8000 0000 1234 5678 9012"
                className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl text-white text-sm transition"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                * {isRtl ? 'يقاطع الحسابات المالية مع قوائم الحظر وسير التحويلات السريعة المريبة' : 'Cross-checks with bank blacklists and micro-transaction fraud logs.'}
              </p>
            </div>
          )}

          {activeTab === 'file' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{isRtl ? 'ارفع مستنداً للفحص المعزول' : 'MALWARE FILE EXPLOIT SANDBOX'}</label>
              
              <div 
                id="dropzone-sandbox"
                onDragOver={handleDragOver}
                onDrop={handleDropSandboxFile}
                className="border-2 border-dashed border-slate-800 hover:border-rose-500 bg-slate-950/60 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 relative"
              >
                <input 
                  id="sandbox-file-input"
                  type="file" 
                  onChange={handleSandboxFileSelect} 
                  accept=".pdf,.docx,.zip,.apk,.exe" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                
                {fileMeta ? (
                  <div className="text-left bg-slate-900 border border-slate-800 rounded-xl p-4 w-full space-y-1 text-xs">
                    <div className="font-bold text-white truncate">Name: {fileMeta.name}</div>
                    <div className="text-slate-400">Size: {(fileMeta.size / 1024).toFixed(2)} KB</div>
                    <div className="text-slate-400">Type: {fileMeta.type}</div>
                  </div>
                ) : (
                  <>
                    <FileText className="w-8 h-8 text-slate-500" />
                    <p className="text-xs text-slate-400 leading-normal">
                      {t.fileUpload}
                    </p>
                    <span className="text-[10px] text-slate-600 font-mono">
                      (PDF, DOCX, ZIP, APK, EXE)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <button
            id="run-analysis-btn"
            onClick={executeAnalysis}
            disabled={loading || (!inputText && !screenshotBase64 && !fileMeta)}
            className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 font-bold rounded-xl text-sm transition text-white shadow-lg disabled:opacity-50"
          >
            {loading ? (isRtl ? 'جاري الفحص واستدعاء الذكاء الاصطناعي...' : 'Active Sandbox Analysis Core Run...') : t.scanButton}
          </button>
        </div>

        {/* ANALYSIS RESULTS PANEL */}
        <div className="lg:col-span-7 space-y-6">
          
          {loading && (
            <div className="p-8 bg-slate-900/20 border border-slate-900 rounded-2xl text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-white">{isRtl ? 'جاري الفحص بالذكاء الاصطناعي الأمني لكاشف...' : 'Invoking Kashef Cloud Threat Intelligence...'}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isRtl ? 'نقوم بتحليل الروابط، وعمر النطاق، ومقاطعة البيانات لتأكيد سلامتها.' : 'Scanning certificate chains, verifying typosquatting models, and inspecting payloads in simulated sandboxes.'}
              </p>
              
              <div className="space-y-2 max-w-md mx-auto pt-4">
                <div className="h-2 bg-slate-850 rounded overflow-hidden">
                  <div className="h-full bg-rose-500 rounded animate-shimmer" style={{ width: '70%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>SSL_RESOLVE</span>
                  <span>HEURISTICS_SCAN</span>
                  <span>AI_CONTEXTUALIZE</span>
                </div>
              </div>
            </div>
          )}

          {!loading && !currentResult && (
            <div className="p-12 bg-slate-900/10 border border-slate-900 border-dashed rounded-2xl text-center text-slate-500">
              <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-400">{isRtl ? 'بانتظار المدخلات الأمنية' : 'Awaiting Defensive Indicators'}</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                {isRtl ? 'أدخل رابطاً أو رسالة أو ارفع صورة في لوحة المدخلات لتشغيل الفحص' : 'Select scanner mode, enter suspect material on the left panel, and launch analysis to display results.'}
              </p>
            </div>
          )}

          {!loading && currentResult && (
            <div id="scan-report-container" className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-6 text-left relative animate-fade-in">
              
              {/* Header result */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                    {currentResult.type.replace('_', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 select-all break-all">{currentResult.inputName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentResult.severity === 'dangerous' 
                      ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse' 
                      : currentResult.severity === 'suspicious'
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  }`}>
                    {currentResult.severity === 'dangerous' ? t.dangerous : currentResult.severity === 'suspicious' ? t.suspicious : t.safe}
                  </span>
                  <a 
                    id="download-report-btn"
                    href={`/api/scans/report-download/${currentResult.id}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg hover:text-white transition text-slate-400"
                    title={t.downloadReport}
                  >
                    <Download className="w-4.5 h-4.5" />
                  </a>
                </div>
              </div>

              {/* Gauges indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{t.riskScore}</div>
                  <div className="text-3xl font-black text-white mt-1 flex items-baseline gap-1">
                    <span style={{ color: currentResult.severity === 'dangerous' ? '#f43f5e' : currentResult.severity === 'suspicious' ? '#f59e0b' : '#10b981' }}>
                      {currentResult.riskScore}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{t.confidenceScore}</div>
                  <div className="text-3xl font-black text-white mt-1 flex items-baseline gap-1">
                    <span>{currentResult.confidence}%</span>
                  </div>
                </div>
              </div>

              {/* Screenshot interactive Visual highlights */}
              {screenshotBase64 && currentResult.highlights && currentResult.highlights.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Eye className="w-4 h-4 text-rose-500" />
                    <span>{isRtl ? 'التحليل البصري التفاعلي ومواضع الخطر' : 'INTERACTIVE SCREENSHOT COMPONENT MAP'}</span>
                  </label>
                  
                  <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 max-h-96">
                    <img src={screenshotBase64} alt="Scanned results visual map" className="w-full h-full object-contain" />
                    
                    {/* Render coordinate boxes */}
                    {currentResult.highlights.map((highlight) => (
                      <button
                        id={`highlight-box-${highlight.id}`}
                        key={highlight.id}
                        onClick={() => setSelectedHighlight(highlight)}
                        style={{
                          left: `${highlight.x}%`,
                          top: `${highlight.y}%`,
                          width: `${highlight.width}%`,
                          height: `${highlight.height}%`,
                        }}
                        className={`absolute border-2 border-dashed cursor-pointer transition hover:bg-black/25 flex items-center justify-center ${
                          highlight.severity === 'dangerous' 
                            ? 'border-rose-500 bg-rose-500/10' 
                            : 'border-amber-500 bg-amber-500/10'
                        }`}
                        title={isRtl ? highlight.labelAr : highlight.labelEn}
                      >
                        <span className="text-[9px] bg-slate-950 text-white font-mono rounded px-1 scale-75 border border-slate-800">
                          {isRtl ? highlight.labelAr.substring(0, 15) + '..' : highlight.labelEn.substring(0, 15) + '..'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono text-center">
                    {isRtl ? '* اضغط على المربعات المحددة بالخطوط المتقطعة لمعرفة تفاصيل مؤشر الاختراق' : '* Click on dashed highlighted components inside screen layout to reveal detailed threat indicators.'}
                  </p>

                  {selectedHighlight && (
                    <div id="highlight-details-card" className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-1.5 animate-fade-in">
                      <div className="font-bold text-rose-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span>{isRtl ? 'مؤشر أمني منتقى:' : 'Flagged UI Component Detail:'}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans font-medium">
                        {isRtl ? selectedHighlight.labelAr : selectedHighlight.labelEn}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Detailed Module results */}
              {currentResult.urlDetails && (
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-900 pb-1.5 mb-2">
                    {isRtl ? 'الخصائص الفنية للرابط' : 'URL FORENSIC METRICS'}
                  </div>
                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div>SSL Certificate: <span className={currentResult.urlDetails.sslValid ? 'text-emerald-400' : 'text-rose-400'}>{currentResult.urlDetails.sslValid ? 'VALID' : 'INVALID / EXPIRED'}</span></div>
                    <div>Domain Age: <span className="text-white">{currentResult.urlDetails.domainAgeMonths} months</span></div>
                    <div>Typosquatting: <span className={currentResult.urlDetails.typosquattingDetected ? 'text-rose-400 font-bold' : 'text-slate-400'}>{currentResult.urlDetails.typosquattingDetected ? 'YES (HIGH MATCH)' : 'NO'}</span></div>
                    <div>Is Short Link: <span className="text-white">{currentResult.urlDetails.isShortened ? 'YES' : 'NO'}</span></div>
                  </div>
                </div>
              )}

              {currentResult.fileDetails && (
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2 text-xs">
                  <div className="font-bold text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-900 pb-1.5 mb-2">
                    {isRtl ? 'تقرير محاكاةSandbox المستند' : 'FILE CRYPTOGRAPHIC HEURISTICS'}
                  </div>
                  <div className="font-mono text-[10px] space-y-1.5 break-all">
                    <div>SHA256: <span className="text-slate-300">{currentResult.fileDetails.sha256Hash}</span></div>
                    <div>Malware Signature Match: <span className="text-rose-400 font-bold">{currentResult.fileDetails.signatureCheck.toUpperCase()}</span></div>
                    <div>AI Behavior Notes: <span className="text-slate-400 font-sans">{currentResult.fileDetails.aiBehaviorAnalysis}</span></div>
                    <div>Detected Virus signatures: <span className="text-rose-400">{currentResult.fileDetails.detectedViruses.join(", ")}</span></div>
                  </div>
                </div>
              )}

              {/* AI Explanation Text */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{t.aiExplanation}</label>
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-slate-300 text-sm leading-relaxed font-sans">
                  {isRtl ? currentResult.aiExplanationAr : currentResult.aiExplanationEn}
                </div>
              </div>

              {/* Technical indicators */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">{t.technicalDetails}</label>
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl text-slate-400 font-mono text-xs leading-relaxed">
                  {isRtl ? currentResult.technicalDetailsAr : currentResult.technicalDetailsEn}
                </div>
              </div>

              {/* Recommendations and Next Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-rose-400 uppercase tracking-widest">{t.recommendations}</label>
                  <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1.5">
                    {(isRtl ? currentResult.recommendationsAr : currentResult.recommendationsEn).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-amber-400 uppercase tracking-widest">{t.nextActions}</label>
                  <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1.5">
                    {(isRtl ? currentResult.nextActionsAr : currentResult.nextActionsEn).map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
