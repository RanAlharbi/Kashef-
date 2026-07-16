/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'visitor' | 'registered' | 'admin';

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type ScanType =
  | 'text_or_message' // SMS, WhatsApp, Telegram, Email Body
  | 'url_or_website'  // URL scanning
  | 'screenshot'      // Screenshots / Images / QR
  | 'phone_number'    // Suspicious Phone numbers
  | 'financial'       // Bank IBAN or Crypto Wallets
  | 'file';           // Malware PDF/DOCX/ZIP simulation

export type SeverityLevel = 'safe' | 'suspicious' | 'dangerous';

export interface UrlScanReport {
  sslValid: boolean;
  sslIssuer?: string;
  domainAgeMonths: number;
  redirectsCount: number;
  hiddenUrls: string[];
  typosquattingDetected: boolean;
  whoisOwner?: string;
  reputationScore: number; // 0 to 100
  isShortened: boolean;
}

export interface EmailScanReport {
  senderAddress: string;
  headersAnalyzed: boolean;
  spfStatus: 'pass' | 'fail' | 'none';
  dkimStatus: 'pass' | 'fail' | 'none';
  dmarcStatus: 'pass' | 'fail' | 'none';
  hasSuspiciousAttachments: boolean;
  suspiciousLinksFound: string[];
}

export interface PhoneIntelligenceReport {
  spamReports: number;
  country: string;
  carrier: string;
  scamLikelihood: number; // percentage
  fraudHistoryDetected: boolean;
}

export interface QRScanReport {
  scannedText: string;
  isUrl: boolean;
  redirectsToScam: boolean;
  isFakePaymentQr: boolean;
}

export interface ScreenshotHighlight {
  id: string;
  x: number; // Percentage from left
  y: number; // Percentage from top
  width: number; // Percentage
  height: number; // Percentage
  labelEn: string;
  labelAr: string;
  severity: SeverityLevel;
}

export interface FileMalwareReport {
  fileName: string;
  fileSize: number;
  md5Hash: string;
  sha256Hash: string;
  signatureCheck: 'clean' | 'infected' | 'unknown';
  aiBehaviorAnalysis: string;
  detectedViruses: string[];
}

export interface ScanRecord {
  id: string;
  userId: string; // 'visitor' or email
  type: ScanType;
  inputName: string; // The URL, Phone, File Name, Text fragment
  timestamp: string;
  severity: SeverityLevel;
  riskScore: number; // 0 to 100
  confidence: number; // 0 to 100
  
  // AI Explanations & Summaries
  aiExplanationEn: string;
  aiExplanationAr: string;
  technicalDetailsEn: string;
  technicalDetailsAr: string;
  
  recommendationsEn: string[];
  recommendationsAr: string[];
  nextActionsEn: string[];
  nextActionsAr: string[];

  // Detailed reports based on scan type
  urlDetails?: UrlScanReport;
  emailDetails?: EmailScanReport;
  phoneDetails?: PhoneIntelligenceReport;
  qrDetails?: QRScanReport;
  fileDetails?: FileMalwareReport;
  highlights?: ScreenshotHighlight[];
  screenshotUrl?: string; // Base64 representation of uploaded image for viewing
}

export interface LearningLesson {
  id: string;
  titleEn: string;
  titleAr: string;
  category: string;
  durationEn: string;
  durationAr: string;
  contentEn: string;
  contentAr: string;
  quiz: {
    questionEn: string;
    questionAr: string;
    optionsEn: string[];
    optionsAr: string[];
    correctIndex: number;
    explanationEn: string;
    explanationAr: string;
  };
}

export interface SystemNotification {
  id: string;
  titleEn: string;
  titleAr: string;
  messageEn: string;
  messageAr: string;
  type: 'danger' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PlatformConfig {
  aiModelName: string;
  maxScansPerVisitor: number;
  enableGrounding: boolean;
  maintenanceMode: boolean;
}
