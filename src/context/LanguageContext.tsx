/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface TranslationDict {
  brand: string;
  slogan: string;
  tagline: string;
  ctaGetStarted: string;
  ctaLearnMore: string;
  scanButton: string;
  navDashboard: string;
  navAnalyzer: string;
  navLearning: string;
  navChat: string;
  navAdmin: string;
  navLanding: string;
  navLogout: string;
  navLogin: string;
  riskScore: string;
  confidenceScore: string;
  threatLevel: string;
  aiExplanation: string;
  technicalDetails: string;
  recommendations: string;
  nextActions: string;
  safe: string;
  suspicious: string;
  dangerous: string;
  recentScans: string;
  allSystemStatus: string;
  learningModules: string;
  startQuiz: string;
  score: string;
  correct: string;
  incorrect: string;
  saveReport: string;
  downloadReport: string;
  notifications: string;
  chatPlaceholder: string;
  adminControls: string;
  auditLogs: string;
  riskTrend: string;
  scanPlaceholder: string;
  screenshotUpload: string;
  fileUpload: string;
  phonePlaceholder: string;
}

const translations: Record<Language, TranslationDict> = {
  en: {
    brand: "Kashef",
    slogan: "Artificial Intelligence for Digital Self-Defense",
    tagline: "Instantly analyze URLs, messages, files, and screenshots. Protect your identity, bank details, and business from cyber criminals.",
    ctaGetStarted: "Scan Now",
    ctaLearnMore: "Explore Learning Center",
    scanButton: "Execute Defense Analysis",
    navDashboard: "Dashboard",
    navAnalyzer: "Threat Scanner",
    navLearning: "Cyber Academy",
    navChat: "AI Assistant",
    navAdmin: "Intel Console",
    navLanding: "Home",
    navLogout: "Sign Out",
    navLogin: "Secure Portal Sign In",
    riskScore: "Security Risk Score",
    confidenceScore: "Analysis Confidence",
    threatLevel: "Threat Assessment Level",
    aiExplanation: "AI Intelligence Report",
    technicalDetails: "Technical Evidence & Headers",
    recommendations: "Immediate Defense Actions",
    nextActions: "Next Steps",
    safe: "Safe & Verified",
    suspicious: "Suspicious",
    dangerous: "Dangerous / Malicious",
    recentScans: "Defensive Scan History",
    allSystemStatus: "Security Node Status",
    learningModules: "Cybersecurity Academy",
    startQuiz: "Launch Assessment Quiz",
    score: "Score",
    correct: "Correct Defense Answer!",
    incorrect: "Vulnerable Practice Selected",
    saveReport: "Bookmark Report",
    downloadReport: "Download PDF Certificate",
    notifications: "Threat Alerts Feed",
    chatPlaceholder: "Ask Kashef AI about phishing, passwords, security warnings, or suspect messages...",
    adminControls: "Platform Administration Settings",
    auditLogs: "Audit Logging System",
    riskTrend: "Risk Assessment History Trend",
    scanPlaceholder: "Paste suspicious link, WhatsApp text, email body, IBAN, bank message, or digital threat here...",
    screenshotUpload: "Drag and drop screenshot image here, or click to browse files",
    fileUpload: "Upload suspicious document (PDF, DOCX, ZIP, EXE) for sandbox analysis",
    phonePlaceholder: "Enter phone number (e.g. +966 50 123 4567) to scan databases..."
  },
  ar: {
    brand: "كاشف",
    slogan: "الذكاء الاصطناعي للدفاع الرقمي عن النفس",
    tagline: "افحص فوراً الروابط والرسائل والملفات ولقطات الشاشة. احمِ هويتك وحساباتك المصرفية من المحتالين بلمح البصر.",
    ctaGetStarted: "ابدأ الفحص الآن",
    ctaLearnMore: "تصفح أكاديمية كاشف",
    scanButton: "تشغيل تحليل الدفاع والوقاية",
    navDashboard: "لوحة التحكم",
    navAnalyzer: "فاحص التهديدات",
    navLearning: "الأكاديمية الرقمية",
    navChat: "المساعد الذكي",
    navAdmin: "منصة التحكم",
    navLanding: "الرئيسية",
    navLogout: "تسجيل الخروج",
    navLogin: "بوابة الدخول الآمن",
    riskScore: "مؤشر خطورة التهديد",
    confidenceScore: "مستوى ثقة التحليل",
    threatLevel: "تقييم التهديد المكتشف",
    aiExplanation: "تقرير تحليل الذكاء الاصطناعي",
    technicalDetails: "الأدلة والخصائص التقنية",
    recommendations: "توصيات الحماية الفورية",
    nextActions: "الخطوات الوقائية التالية",
    safe: "آمن وموثوق",
    suspicious: "مريب / مشبوه",
    dangerous: "خطير / احتيالي",
    recentScans: "سجل الفحوصات الأمنية",
    allSystemStatus: "حالة النظام الأمني",
    learningModules: "أكاديمية الحماية الأمنية",
    startQuiz: "بدأ اختبار الدرس والتقييم",
    score: "النتيجة",
    correct: "إجابة وقائية صحيحة!",
    incorrect: "ممارسة تشكل ثغرة أمنية",
    saveReport: "حفظ التقرير أمنياً",
    downloadReport: "تحميل وثيقة التقرير كـ PDF",
    notifications: "تنبيهات التهديدات العاجلة",
    chatPlaceholder: "اسأل كاشف عن التصيد، أمان كلمات المرور، الرسائل المريبة، وكيفية حماية نفسك...",
    adminControls: "إعدادات منصة الإدارة والتحكم",
    auditLogs: "سجل العمليات والرقابة الأمنية",
    riskTrend: "مؤشر خطورة الفحوصات السابقة",
    scanPlaceholder: "الصق هنا الرابط المريب، نص رسالة الواتساب، البريد الإلكتروني، الآيبان، أو أي تهديد رقمي...",
    screenshotUpload: "اسحب وأسقط لقطة الشاشة هنا، أو انقر لاختيار ملف من جهازك",
    fileUpload: "ارفع مستنداً مشبوهاً (PDF, DOCX, ZIP, EXE) لإجراء فحص سلوكي معزول له",
    phonePlaceholder: "أدخل رقم الهاتف (مثال: +966 50 123 4567) للبحث في البلاغات..."
  }
};

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: TranslationDict;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t: translations[language], isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
