/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldAlert, 
  Search, 
  BookOpen, 
  HelpCircle, 
  Award, 
  Lock, 
  MessageCircle, 
  FileCheck, 
  PhoneCall, 
  CheckCircle,
  Users,
  Terminal,
  Activity,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onStartScanner: () => void;
  onStartAcademy: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartScanner, onStartAcademy, onOpenAuth }) => {
  const { t, isRtl } = useLanguage();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const stats = [
    { labelEn: "Analyzed Indicators", labelAr: "مؤشرات تم فحصها", value: "354,801+" },
    { labelEn: "Phishing Attempts Blocked", labelAr: "محاولات تصيد محظورة", value: "98.4%" },
    { labelEn: "False Positive Ratio", labelAr: "نسبة الخطأ الإيجابي", value: "< 0.05%" },
    { labelEn: "Active Protected Users", labelAr: "مستخدمين محمين نشطين", value: "12,400+" },
  ];

  const featuresList = [
    {
      icon: Search,
      titleEn: "Smart URL & SSL Scanner",
      titleAr: "فاحص الروابط الذكي",
      descEn: "Inspects domain age, typosquatting variants, missing SSL security certificates, and hidden nested URL redirects instantly.",
      descAr: "يقوم فوراً بتحليل عمر النطاق، والتحقق من صحة شهادات الأمان الرقمية SSL، ورصد التحويلات الخفية المتعددة.",
    },
    {
      icon: ShieldAlert,
      titleEn: "Screenshot Vision Defense",
      titleAr: "حماية الصور البصرية",
      descEn: "Upload a screenshot of any suspect payment screen or chat, and our AI vision highlights exactly where scams or spoofing occur.",
      descAr: "ارفع لقطة شاشة لرسائل الواتساب أو صفحات الدفع وسيقوم الذكاء الاصطناعي البصري بوضع إشارات على الحقول الاحتيالية.",
    },
    {
      icon: PhoneCall,
      titleEn: "Phone Number Intelligence",
      titleAr: "استخبارات الهواتف المشبوهة",
      descEn: "Cross-checks carrier metadata, VoIP virtual numbers, and reported spam databases to evaluate potential SMS or cold-call frauds.",
      descAr: "يفحص أرقام الهواتف ويعرف مزود الخدمة ويقيس تكرار البلاغات عنها لكشف محاولات الابتزاز وادعاء صفة البنوك.",
    },
    {
      icon: FileCheck,
      titleEn: "Malware Document Sandbox",
      titleAr: "عزل وتحليل الملفات",
      descEn: "Simulates behavior checks on ZIP, PDF, and DOCX files. Generates cryptographic hashes and detects embedded malicious JS exploits.",
      descAr: "يجري فحصاً سلوكياً آمناً للملفات المرفوعة ويقوم بمطابقة البصمات الإلكترونية مع قواعد بيانات الفيروسات العالمية.",
    }
  ];

  const faqs = [
    {
      qEn: "How does Kashef identify phishing sites?",
      qAr: "كيف يستطيع كاشف كشف مواقع التصيد الاحتيالي؟",
      aEn: "Kashef combines real-time Gemini vision with metadata checks (domain registration age, certificate validations, typosquatting similarity models, and threat intel registers) to categorize URLs.",
      aAr: "يجمع كاشف بين قدرات الذكاء الاصطناعي البصري من Gemini وتحليل البيانات الوصفية للنطاق (مثل تاريخ التسجيل، تطابق الأحرف الزائفة، وقوائم الحظر المعتمدة)."
    },
    {
      qEn: "Is my private data secure when running scans?",
      qAr: "هل بياناتي ومعلوماتي الشخصية آمنة أثناء الفحص؟",
      aEn: "Absolutely. Kashef utilizes a zero-retention policy for images and texts uploaded by visitors. Scanning is executed server-side with enterprise encryption protocols.",
      aAr: "بالتأكيد. يلتزم كاشف بسياسة صارمة لعدم تخزين لقطات الشاشة أو النصوص المرفوعة للفحص بشكل دائم، وتتم الفحوصات في بيئة معزولة."
    },
    {
      qEn: "What are visual screenshot highlights?",
      qAr: "ما هي ميزة الإشارات البصرية على لقطات الشاشة؟",
      aEn: "When a user uploads a screenshot, Gemini vision analyzes the elements, detecting cloned interface boxes. It marks exact screen coordinates so users can visualize exactly what constitutes a threat.",
      aAr: "عند رفع صورة، يقوم محرك الرؤية بتحليل مكونات الصفحة مثل حقول الدخول المزورة، ويحدد إحداثياتها بدقة على الشاشة ليراها المستخدم بوضوح."
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMsg) {
      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setContactName('');
        setContactEmail('');
        setContactMsg('');
      }, 4000);
    }
  };

  return (
    <div className="w-full text-zinc-100 bg-zinc-950 font-sans">
      
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-20" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Soft colorful blur spheres */}
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-72 h-72 bg-violet-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-400 mb-6 tracking-wide animate-pulse">
          <Terminal className="w-4 h-4" />
          <span>{isRtl ? 'مدعوم بالكامل بالذكاء الاصطناعي السيبراني' : 'Advanced Generative Cyber-Defense Platform'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight max-w-4xl">
          {isRtl ? 'احمِ نفسك من الاحتيال مع ' : 'Defend Your Digital Self With '}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-400 to-indigo-600 drop-shadow-sm font-sans">
            {isRtl ? 'كاشف الذكي' : 'Kashef Core'}
          </span>
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mt-6 font-sans">
          {t.tagline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            id="hero-start-scan-btn"
            onClick={onStartScanner}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-base rounded-xl transition shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          >
            {t.ctaGetStarted}
          </button>
          <button
            id="hero-academy-btn"
            onClick={onStartAcademy}
            className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-base rounded-xl border border-zinc-800 hover:border-zinc-700 transition"
          >
            {t.ctaLearnMore}
          </button>
        </div>

        {/* Live dashboard mockup preview */}
        <div className="mt-16 w-full max-w-4xl border border-zinc-800 bg-zinc-900/60 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4 text-xs text-zinc-500">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="bg-zinc-950 px-4 py-1 rounded border border-zinc-800 text-[11px] font-mono select-none">
              https://kashef.ai/threat-dashboard
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              <span className="font-mono text-zinc-400">Node_Active</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{isRtl ? 'آخر فحص للموقع' : 'LATEST WEBSITE ANALYZED'}</div>
              <div className="text-sm font-semibold text-white mt-1 select-all truncate">secure-login-paypa1.com</div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs rounded mt-2.5 font-bold">
                {t.dangerous} (94%)
              </div>
            </div>
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{isRtl ? 'الرقم المريب المكتشف' : 'SUSPECT VOIP PHONE'}</div>
              <div className="text-sm font-semibold text-white mt-1 select-all">+966 50 119 2200</div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs rounded mt-2.5 font-bold">
                {t.suspicious} (68%)
              </div>
            </div>
            <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-xl">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">{isRtl ? 'المستوى التعليمي العام' : 'ACADEMY INSIGHTS'}</div>
              <div className="text-sm font-semibold text-white mt-1">{isRtl ? 'الحماية من الهندسة الاجتماعية' : 'Social Engineering Defense'}</div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded mt-2.5 font-bold">
                {isRtl ? '٢ درس مكتمل' : '2 Modules Done'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Grid */}
      <section className="border-y border-zinc-900 bg-zinc-950/50 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{s.value}</div>
              <div className="text-xs sm:text-sm text-zinc-500 mt-2 font-medium">{isRtl ? s.labelAr : s.labelEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Feature Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {isRtl ? 'حزمة استخبارات التهديدات المتكاملة' : 'Complete Threat Intelligence Architecture'}
          </h2>
          <p className="text-zinc-400 mt-4 max-w-2xl mx-auto text-base">
            {isRtl ? 'أدوات دفاعية متكاملة مصممة لمكافحة الأشكال المتعددة لعمليات النصب الرقمي والاختراق.' : 'Engineered specifically to identify modern vectors of social engineering, banking cloning, and phishing attempts.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuresList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div 
                key={idx} 
                className="p-6 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 hover:bg-zinc-900/70 rounded-2xl transition duration-300 flex gap-4 text-left group"
              >
                <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{isRtl ? f.titleAr : f.titleEn}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{isRtl ? f.descAr : f.descEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive AI Demonstration (Preview playground) */}
      <section className="bg-zinc-900/30 border-y border-zinc-900 py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-xs text-emerald-400 font-bold mb-4">
              <Award className="w-3.5 h-3.5" />
              <span>{isRtl ? 'الرؤية الحاسوبية النشطة' : 'Active Vision Parsing Enabled'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {isRtl ? 'كيف يكتشف كاشف مواقع الاحتيال؟' : 'AI-Powered Scam & Clone Identification'}
            </h2>
            <p className="text-zinc-400 mt-4 leading-relaxed text-base">
              {isRtl 
                ? 'لا نكتفي بفحص النص فقط. يقرأ نموذج كاشف لقطة الشاشة المرفوعة ويقوم بتمشيطها للبحث عن تزييف في الشعار، أو تغيير طفيف في عناوين المتصفح، أو حقول دفع مريبة، ومقاطعتها مع مئات من مؤشرات الخداع النشطة.' 
                : 'Most engines fail on visual cloning. Kashef processes images, inspecting layout metrics to detect false payment inputs, misaligned typography, or spoofed bank labels. Experience complete context inspection.'}
            </p>
            
            <div className="mt-8 space-y-4">
              {[
                { labelEn: "Zero Retention Metadata Protocol", labelAr: "بروتوكول أمني مشدد بعدم حفظ الصور المرفوعة" },
                { labelEn: "Precision Visual Grid Coordinate Mapping", labelAr: "رصد دقيق ومؤطر لمكامن الخدعة على الصورة" },
                { labelEn: "Dynamic Response in Arabic & English", labelAr: "دعم فوري كامل للغتين العربية والإنجليزية" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-sm text-zinc-300 font-medium">{isRtl ? item.labelAr : item.labelEn}</span>
                </div>
              ))}
            </div>

            <button
              id="playground-cta-btn"
              onClick={onStartScanner}
              className="mt-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 font-bold text-sm text-white rounded-xl shadow-lg transition"
            >
              {isRtl ? 'جرب فحص الصور والروابط الآن' : 'Test Vision Scanner Now'}
            </button>
          </div>

          <div className="relative border border-zinc-800 rounded-2xl p-6 bg-zinc-950 overflow-hidden shadow-2xl">
            {/* Visual highlight box simulation */}
            <div className="absolute top-[28%] left-[10%] right-[10%] h-[12%] border-2 border-dashed border-rose-500 bg-rose-500/10 rounded flex items-center justify-center pointer-events-none group animate-pulse">
              <span className="absolute -top-3.5 left-2 bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                {isRtl ? 'عنوان مزيف (انتحال)' : 'Typosquatting Domain Detected'}
              </span>
            </div>
            <div className="absolute top-[52%] left-[25%] right-[25%] h-[16%] border-2 border-dashed border-rose-500 bg-rose-500/10 rounded flex items-center justify-center pointer-events-none group animate-pulse">
              <span className="absolute -top-3.5 left-2 bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                {isRtl ? 'حقول التقاط بطاقات ائتمان احتيالية' : 'Cloned Credit Card Form Field'}
              </span>
            </div>

            <div className="opacity-40 select-none">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 text-xs font-mono">
                <span className="text-zinc-500">HTTPS_REQUEST_INBOUND</span>
                <span className="text-zinc-500">paypa1-login-update.com</span>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-zinc-900 rounded w-1/3" />
                <div className="h-10 bg-zinc-900 rounded w-full border border-zinc-800" />
                <div className="h-10 bg-zinc-900 rounded w-full border border-zinc-800" />
                <div className="h-12 bg-indigo-600/20 rounded w-1/2 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Models */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isRtl ? 'خطط مرنة للدفاع الرقمي' : 'Transparent Defense Packages'}
          </h2>
          <p className="text-zinc-400 mt-4 text-base max-w-xl mx-auto">
            {isRtl ? 'اختر الخيار الأنسب لمدى فحصك وحجم الحماية المطلوبة.' : 'Choose the subscription level that matches your frequency of operations and organizational size.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Guest level */}
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition">
            <div>
              <h3 className="text-xl font-bold text-white">{isRtl ? 'زائر / مجاني' : 'Visitor Pass'}</h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{isRtl ? 'تجربة محدودة' : 'Limited Analytics'}</p>
              <div className="text-3xl font-extrabold text-white mt-4">$0</div>
              <ul className="mt-6 space-y-3 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? '٥ فحص روابط يومي' : '5 URL Scans Daily'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'تقارير أمنية مختصرة' : 'Executive Scan Summary'}</span>
                </li>
                <li className="flex items-center gap-2 text-zinc-600">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>{isRtl ? 'لا يدعم فحص لقطات الشاشة' : 'No Screenshot uploads'}</span>
                </li>
              </ul>
            </div>
            <button
              id="pricing-free-btn"
              onClick={onStartScanner}
              className="mt-8 w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs rounded-xl transition"
            >
              {isRtl ? 'استخدم كزائر مجاناً' : 'Get Started for Free'}
            </button>
          </div>

          {/* Registered User level */}
          <div className="p-6 bg-zinc-900 border-2 border-indigo-500/50 rounded-2xl flex flex-col justify-between relative shadow-xl">
            <span className="absolute -top-3.5 right-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {isRtl ? 'موصى به' : 'MOST POPULAR'}
            </span>
            <div>
              <h3 className="text-xl font-bold text-white">{isRtl ? 'المستخدم الرقمي' : 'Registered Defender'}</h3>
              <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">{isRtl ? 'أمان متكامل للأفراد' : 'Full Personal Protection'}</p>
              <div className="text-3xl font-extrabold text-white mt-4">
                $5 <span className="text-sm font-normal text-zinc-500">/ {isRtl ? 'شهر' : 'mo'}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'فحوصات لا نهائية لجميع الملفات والروابط' : 'Unlimited Security Scans'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'فحص الصور ولقطات الشاشة بصرياً' : 'Complete Visual Screenshot Scanning'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'الوصول الكامل للمساعد الأمني كاشف' : 'Full Cybersecurity AI Chatbot Access'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'تحميل تقارير الفحص والشهادات' : 'Downloadable Forensic PDF Reports'}</span>
                </li>
              </ul>
            </div>
            <button
              id="pricing-registered-btn"
              onClick={onOpenAuth}
              className="mt-8 w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-lg"
            >
              {isRtl ? 'سجل واحصل على الحساب' : 'Subscribe & Defender Activation'}
            </button>
          </div>

          {/* Admin level description */}
          <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition">
            <div>
              <h3 className="text-xl font-bold text-white">{isRtl ? 'مستوى المؤسسة' : 'Enterprise Control'}</h3>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{isRtl ? 'إدارة وتحكم مخصص' : 'Custom Governance'}</p>
              <div className="text-3xl font-extrabold text-white mt-4">$49 <span className="text-sm font-normal text-zinc-500">/ {isRtl ? 'شهر' : 'mo'}</span></div>
              <ul className="mt-6 space-y-3 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'منصة مخصصة لإدارة السياسات والرقابة' : 'Custom Multi-user Control Panel'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'إمكانية فحص الملفات البرمجية الصعبة' : 'Custom API Access for Scanning'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>{isRtl ? 'سجلات التدقيق الأمني ومراقبة الاستهلاك' : 'Audit logs & consumption limits'}</span>
                </li>
              </ul>
            </div>
            <button
              id="pricing-enterprise-btn"
              onClick={onOpenAuth}
              className="mt-8 w-full py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-xs rounded-xl transition"
            >
              {isRtl ? 'تواصل معنا للتفعيل' : 'Sign In as Enterprise'}
            </button>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-24 px-6 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <HelpCircle className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {isRtl ? 'الأسئلة الأكثر شيوعاً' : 'Frequently Answered Inquiries'}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-zinc-900 bg-zinc-900/20 rounded-xl overflow-hidden">
                <button
                  id={`faq-btn-${idx}`}
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center hover:bg-zinc-900/40 transition font-bold text-white text-sm"
                >
                  <span>{isRtl ? faq.qAr : faq.qEn}</span>
                  <ChevronDown className={`w-4 h-4 transition duration-300 text-indigo-500 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-5 border-t border-zinc-900 text-zinc-400 text-sm leading-relaxed bg-zinc-900/10">
                    {isRtl ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">{isRtl ? 'تواصل مع خبراء الأمن' : 'Get in Touch with Cyber Defenders'}</h2>
          <p className="text-zinc-400 mt-2 text-sm">{isRtl ? 'هل تريد تخصيص المنصة لمؤسستك أو الإبلاغ عن ثغرة؟' : 'Need custom integrations, support, or vulnerability disclosures?'}</p>
        </div>

        {contactSuccess ? (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center rounded-2xl font-bold text-sm">
            {isRtl ? 'شكراً لتواصلك معنا! سنرد على استفسارك خلال ٢٨ ساعة.' : 'Message received! Our team will respond within 24 hours.'}
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">{isRtl ? 'الاسم' : 'Name'}</label>
                <input
                  id="contact-name-input"
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email'}</label>
                <input
                  id="contact-email-input"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none text-white text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1">{isRtl ? 'محتوى الرسالة' : 'Message Message'}</label>
              <textarea
                id="contact-msg-textarea"
                required
                rows={4}
                value={contactMsg}
                onChange={e => setContactMsg(e.target.value)}
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-indigo-500 focus:outline-none text-white text-sm"
              />
            </div>
            <button
              id="contact-submit-btn"
              type="submit"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 font-bold text-sm text-indigo-400 border border-zinc-700 hover:border-zinc-600 rounded-xl transition"
            >
              {isRtl ? 'إرسال الرسالة بشكل آمن' : 'Transmit Message Securely'}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-500" />
            <span className="font-extrabold text-xl text-white tracking-tight">Kashef<span className="text-indigo-500">.كاشف</span></span>
          </div>
          <div className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} Kashef Cybersecurity Platform. All Rights Resilient.
          </div>
          <div className="flex gap-4 text-xs text-zinc-400">
            <a href="#features" className="hover:text-white transition">{isRtl ? 'الشروط والخصوصية' : 'Privacy Protocol'}</a>
            <span>&bull;</span>
            <a href="#academy" className="hover:text-white transition">{isRtl ? 'إبراء الذمة' : 'Vulnerability Disclosures'}</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
