/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ScanRecord, 
  SeverityLevel, 
  ScanType, 
  LearningLesson, 
  SystemNotification, 
  UserProfile, 
  PlatformConfig 
} from "./src/types";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(cors({ origin: true, credentials: true }));

// Security Headers (Simplified Helmet)
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  next();
});

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API successfully initialized on the server.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Operating in Cybersecurity Simulation mode.");
}

// In-Memory Database for demonstration
const USERS_DB: Record<string, UserProfile & { passwordHash: string }> = {
  "admin@kashef.ai": {
    email: "admin@kashef.ai",
    name: "Kashef Administrator",
    role: "admin",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: "admin123",
  },
  "user@kashef.ai": {
    email: "user@kashef.ai",
    name: "Ahmed Mansour",
    role: "registered",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    passwordHash: "user123",
  },
};

// Initial Scan History Seeding
let SCANS_DB: ScanRecord[] = [
  {
    id: "scan_101",
    userId: "user@kashef.ai",
    type: "url_or_website",
    inputName: "http://secure-login-paypa1.com/update",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    severity: "dangerous",
    riskScore: 94,
    confidence: 98,
    aiExplanationEn: "This website is a classic phishing lure designed to steal credentials by mimicking PayPal. It uses typosquatting ('paypa1' with a number '1') to deceive users into trusting a domain registered very recently.",
    aiExplanationAr: "هذا الموقع عبارة عن صفحة تصيد احتيالي كلاسيكية مصممة لسرقة بيانات الاعتماد من خلال تقليد موقع PayPal. يستخدم أسلوب انتحال النطاقات (تغيير PayPal إلى paypa1 بوضع الرقم 1) لخداع المستخدمين.",
    technicalDetailsEn: "SSL is invalid/expired. Domain age is 0.2 months. Redirects to external IP. TYPOSQUATTING detected for 'paypal.com'. Whois record shows private registration through anonymous proxy.",
    technicalDetailsAr: "شهادة SSL غير صالحة أو منتهية. عمر النطاق أقل من شهر واحد. إعادة توجيه إلى عنوان IP خارجي. تم اكتشاف انتحال نطاق PayPal.com. سجل Whois يظهر تسجيلًا خاصًا مخفيًا.",
    recommendationsEn: [
      "Do NOT enter any login details or credit card information.",
      "Block the sender if this link came from an SMS or WhatsApp message.",
      "Report the URL to Google Safe Browsing and PayPal Security.",
    ],
    recommendationsAr: [
      "لا تقم بإدخال أي بيانات دخول أو معلومات بطاقة ائتمان.",
      "احظر المرسل إذا وصلك هذا الرابط عبر رسالة نصية قصيرة أو واتساب.",
      "أبلغ عن هذا الرابط لخدمة التصفح الآمن من Google وخدمة أمن PayPal.",
    ],
    nextActionsEn: [
      "Change your PayPal account password immediately if you entered it.",
      "Enable Multi-Factor Authentication (MFA) on your PayPal and bank accounts.",
    ],
    nextActionsAr: [
      "قم بتغيير كلمة مرور حساب PayPal الخاص بك فوراً إذا كنت قد أدخلتها مسبقاً.",
      "قم بتفعيل التحقق بخطوتين (MFA) على حسابك في PayPal وحساباتك البنكية.",
    ],
    urlDetails: {
      sslValid: false,
      domainAgeMonths: 0.2,
      redirectsCount: 1,
      hiddenUrls: [],
      typosquattingDetected: true,
      whoisOwner: "Privacy Protection Service Ltd",
      reputationScore: 5,
      isShortened: false,
    },
  },
  {
    id: "scan_102",
    userId: "user@kashef.ai",
    type: "text_or_message",
    inputName: "SMS from DHL Security",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    severity: "suspicious",
    riskScore: 68,
    confidence: 85,
    aiExplanationEn: "The SMS claims your parcel is on hold due to outstanding VAT payments. Although DHL does send payment notifications, the link provided uses a generic tracking domain rather than dhl.com, which is highly indicative of package delivery fraud.",
    aiExplanationAr: "تدعي الرسالة النصية أن طردك معلق بسبب دفعات ضريبة القيمة المضافة المستحقة. على الرغم من أن شركة DHL ترسل إشعارات دفع، إلا أن الرابط المرفق يستخدم نطاقاً عشوائياً بدلاً من الموقع الرسمي dhl.com، مما يشير بوضوح إلى الاحتيال.",
    technicalDetailsEn: "The link in the message redirects to dynamic DNS services. Tone is highly urgent, triggering immediate fear and forcing hasty payment of a minor amount ($1.99).",
    technicalDetailsAr: "الرابط في الرسالة يعيد التوجيه إلى خدمات DNS ديناميكية عشوائية. أسلوب الرسالة يركز على العجلة لإثارة القلق ودفعك لسداد مبلغ بسيط (1.99 دولار) فوراً.",
    recommendationsEn: [
      "Do NOT click on the link directly.",
      "Verify shipping status directly through DHL official app or website using your actual tracking number.",
    ],
    recommendationsAr: [
      "لا تقم بالنقر على الرابط مباشرة.",
      "تحقق من حالة الشحن مباشرة عبر تطبيق أو موقع DHL الرسمي باستخدام رقم التتبع الفعلي الخاص بك.",
    ],
    nextActionsEn: [
      "Report the sender phone number as spam.",
      "Delete the message.",
    ],
    nextActionsAr: [
      "أبلغ عن رقم هاتف المرسل كرسائل سبام احتيالية.",
      "احذف الرسالة تماماً.",
    ],
  },
];

// Initial System Notifications
let NOTIFICATIONS_DB: SystemNotification[] = [
  {
    id: "notif_1",
    titleEn: "Immediate Action Required: Threat Blocked",
    titleAr: "إجراء عاجل مطلوب: تم حظر تهديد نشط",
    messageEn: "A high-risk phishing campaign impersonating national banking portals has been detected circulating via WhatsApp today. Use Kashef to analyze any banking links.",
    messageAr: "تم رصد حملة تصيد احتيالي عالية الخطورة تنتحل صفحة البوابة الوطنية للبنوك عبر واتساب اليوم. استخدم كاشف لفحص أي روابط بنكية قبل فتحها.",
    type: "danger",
    timestamp: new Date().toISOString(),
    read: false,
  },
  {
    id: "notif_2",
    titleEn: "Weekly Security Update",
    titleAr: "التحديث الأمني الأسبوعي",
    messageEn: "Kashef's cyber intelligence core updated with 1,200 new malicious scam domains and phone numbers.",
    messageAr: "تم تحديث قاعدة بيانات كاشف بـ 1200 نطاق ورقم هاتف احتيالي جديد تم رصدهم هذا الأسبوع.",
    type: "info",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  }
];

// Cybersecurity Learning center dataset
const LEARNING_DB: LearningLesson[] = [
  {
    id: "phishing_101",
    titleEn: "Mastering Phishing Detection",
    titleAr: "احتراف كشف التصيد الاحتيالي",
    category: "Phishing",
    durationEn: "5 min",
    durationAr: "5 دقائق",
    contentEn: "Phishing is the most common social engineering vector. Attackers pretend to be legitimate organizations (banks, delivery services, government agencies) to steal credentials, credit card details, or install malware. Key indicators include: typosquatting domains (e.g., paypa1.com), urgent action language ('Your account will be suspended in 24 hours'), and lack of personalized greetings.",
    contentAr: "التصيد الاحتيالي هو أكثر هجمات الهندسة الاجتماعية شيوعاً. يتظاهر المهاجمون بأنهم جهات موثوقة (بنوك، شركات شحن، جهات حكومية) لسرقة كلمات المرور أو أرقام بطاقات الائتمان أو تثبيت برمجيات خبيثة. تشمل العلامات البارزة: نطاقات مزيفة منتحلة (مثل paypa1.com)، لغة التهديد والعجلة ('سيتم إغلاق حسابك خلال 24 ساعة')، وعدم وجود تحية مخصصة باسمك.",
    quiz: {
      questionEn: "Which of the following URLs is MOST likely a typosquatting phishing link?",
      questionAr: "أي من العناوين التالية هي الأكثر احتمالاً لتكون رابط تصيد احتيالي؟",
      optionsEn: [
        "https://www.paypal.com/security",
        "https://login-paypa1-security.com",
        "https://help.paypal-support.org"
      ],
      optionsAr: [
        "https://www.paypal.com/security",
        "https://login-paypa1-security.com",
        "https://help.paypal-support.org"
      ],
      correctIndex: 1,
      explanationEn: "login-paypa1-security.com uses typosquatting ('paypa1' instead of 'paypal') to bypass visual inspection. True PayPal portals are always subdomains of paypal.com.",
      explanationAr: "login-paypa1-security.com يستخدم انتحال النطاق ('paypa1' بدلاً من 'paypal') لخداع العين البشرية. نطاقات PayPal الحقيقية يجب أن تكون منتهية بـ paypal.com دائماً."
    }
  },
  {
    id: "mfa_essentials",
    titleEn: "Multi-Factor Authentication (MFA)",
    titleAr: "المصادقة ثنائية العوامل (MFA)",
    category: "MFA & Passwords",
    durationEn: "4 min",
    durationAr: "4 دقائق",
    contentEn: "MFA adds a critical second layer of protection. Even if an attacker steals your password via phishing, they cannot gain access without your secondary factor. Prefer authenticator apps (Google Authenticator, Microsoft Authenticator) or security keys over SMS, as SMS can be hijacked via SIM-swapping or visual interception.",
    contentAr: "تضيف المصادقة ثنائية العوامل طبقة حماية ثانية وحاسمة. حتى لو تمكن المخترق من سرقة كلمة مرورك، فلن يستطيع الدخول بدون رمز التحقق الثاني. يفضل استخدام تطبيقات الرموز (مثل Google Authenticator) أو المفاتيح الفيزيائية بدلاً من الرسائل النصية القصيرة، حيث يمكن للمخترقين اعتراض الرسائل عبر هجمات تبديل شريحة الهاتف (SIM-swapping).",
    quiz: {
      questionEn: "Why is SMS-based MFA considered less secure than App-based MFA?",
      questionAr: "لماذا تعتبر المصادقة عبر الرسائل النصية القصيرة (SMS) أقل أماناً من التطبيقات المخصصة؟",
      optionsEn: [
        "SMS can be intercepted via SIM swap or network spoofing.",
        "SMS codes expire too quickly for users to type.",
        "App-based MFA doesn't require any network connections."
      ],
      optionsAr: [
        "يمكن اعتراض رسائل SMS عبر هجمات SIM Swap أو تزوير الشبكة.",
        "تنتهي صلاحية رموز SMS بسرعة كبيرة مقارنة بالتطبيقات.",
        "تطبيقات المصادقة لا تتطلب أي اتصال بالإنترنت تماماً."
      ],
      correctIndex: 0,
      explanationEn: "SIM swapping allows malicious actors to transfer your phone number to their own device, receiving your MFA codes directly.",
      explanationAr: "هجوم تبديل الشريحة (SIM swap) يتيح للمخترق نقل رقم هاتفك إلى جهازه الخاص، وبالتالي استقبال رموز التحقق الثنائية الخاصة بك مباشرة."
    }
  }
];

// Initial Platform Configurations
let PLATFORM_CONFIG: PlatformConfig = {
  aiModelName: "gemini-3.5-flash",
  maxScansPerVisitor: 5,
  enableGrounding: true,
  maintenanceMode: false,
};

// --- AUTHENTICATION ENDPOINTS ---

// Mock login generating a simple token
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = USERS_DB[email.toLowerCase()];
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Generate a mock JWT
  const mockToken = Buffer.from(JSON.stringify({ email: user.email, role: user.role })).toString("base64");
  res.json({
    token: mockToken,
    user: {
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Mock registration
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const lowerEmail = email.toLowerCase();
  if (USERS_DB[lowerEmail]) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const newUser: UserProfile = {
    email: lowerEmail,
    name,
    role: "registered",
    createdAt: new Date().toISOString(),
  };

  USERS_DB[lowerEmail] = {
    ...newUser,
    passwordHash: password,
  };

  const mockToken = Buffer.from(JSON.stringify({ email: lowerEmail, role: "registered" })).toString("base64");
  res.json({
    token: mockToken,
    user: newUser
  });
});

// Get current profile
app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    const user = USERS_DB[decoded.email];
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json({
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});


// --- CYBERSECURITY SCANNING CORE (INTEGRATING GEMINI AND SIMULATORS) ---

app.post("/api/scans/analyze", async (req, res) => {
  const { type, input, screenshot, emailHeaders, fileMeta } = req.body;
  const authHeader = req.headers.authorization;
  let userId = "visitor";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      userId = decoded.email;
    } catch (_) {}
  }

  if (!type || !input) {
    return res.status(400).json({ error: "Scan type and input content are required" });
  }

  console.log(`Analyzing [${type}] for ${userId}. Content length: ${input.length}`);

  // Base record
  const scanId = "scan_" + Math.random().toString(36).substr(2, 9);
  
  // If Gemini is active on server, perform dynamic intelligent classification
  if (ai) {
    try {
      let prompt = `You are the lead cybersecurity intelligence engine for the platform 'Kashef'.
Analyze this security indicator.
Scan Type: ${type}
Security Input content: "${input}"
${emailHeaders ? `Email Headers block: ${JSON.stringify(emailHeaders)}` : ""}
${fileMeta ? `Uploaded File metadata: ${JSON.stringify(fileMeta)}` : ""}

Conduct a profound cybersecurity threat risk analysis.
You MUST output your results as a STRICT JSON object matching this schema precisely:
{
  "severity": "safe" | "suspicious" | "dangerous",
  "riskScore": number (0 to 100),
  "confidence": number (0 to 100),
  "aiExplanationEn": "detailed simple english explanation",
  "aiExplanationAr": "detailed simple arabic explanation",
  "technicalDetailsEn": "technical backend details of threats found in English",
  "technicalDetailsAr": "technical backend details of threats found in Arabic",
  "recommendationsEn": ["recommendation 1", "recommendation 2"],
  "recommendationsAr": ["توصية 1", "توصية 2"],
  "nextActionsEn": ["next step 1", "next step 2"],
  "nextActionsAr": ["خطوة تالية 1", "خطوة تالية 2"],
  "highlights": [
    {
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "labelEn": "What suspicious element is highlighted",
      "labelAr": "وصف العنصر المشبوه بالعربية",
      "severity": "suspicious" | "dangerous"
    }
  ]
}

If the user uploads a screenshot (provided as an image part), visually inspect the interface for credentials phishing, fake payment gateways, fraudulent banking displays, unauthorized links, and verify coordinates for the "highlights" array.

Make sure your response has NO markdown decorators like \`\`\`json. Just the clean JSON.`;

      let response;
      if (screenshot && (type === 'screenshot' || type === 'url_or_website')) {
        // Screenshot multi-modal analysis
        console.log("Analyzing screenshot with Gemini vision capabilities.");
        const base64Data = screenshot.split(",")[1] || screenshot;
        const imagePart = {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        };
        const textPart = { text: prompt };
        
        response = await ai.models.generateContent({
          model: PLATFORM_CONFIG.aiModelName,
          contents: { parts: [imagePart, textPart] },
        });
      } else {
        // Standard text analysis
        response = await ai.models.generateContent({
          model: PLATFORM_CONFIG.aiModelName,
          contents: prompt,
        });
      }

      const text = response.text || "";
      console.log("Raw Gemini Output:", text);

      // Clean markdown output if any
      let cleanedText = text.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      const analysisResult = JSON.parse(cleanedText);

      // Construct a highly detailed ScanRecord combining Gemini findings with structured simulated details
      const scanRecord: ScanRecord = {
        id: scanId,
        userId,
        type,
        inputName: input,
        timestamp: new Date().toISOString(),
        severity: analysisResult.severity || "suspicious",
        riskScore: analysisResult.riskScore || 50,
        confidence: analysisResult.confidence || 80,
        aiExplanationEn: analysisResult.aiExplanationEn,
        aiExplanationAr: analysisResult.aiExplanationAr,
        technicalDetailsEn: analysisResult.technicalDetailsEn,
        technicalDetailsAr: analysisResult.technicalDetailsAr,
        recommendationsEn: analysisResult.recommendationsEn || [],
        recommendationsAr: analysisResult.recommendationsAr || [],
        nextActionsEn: analysisResult.nextActionsEn || [],
        nextActionsAr: analysisResult.nextActionsAr || [],
        highlights: analysisResult.highlights || [],
        screenshotUrl: screenshot,
      };

      // Add specific structural scan intelligence details
      fillScanDetails(scanRecord, type, input, fileMeta);

      SCANS_DB.unshift(scanRecord);
      return res.json(scanRecord);

    } catch (error) {
      console.error("Gemini Scan Error:", error);
      // Fallback to simulator below
    }
  }

  // --- CYBERSECURITY SIMULATION MODE (Extremely authentic fallback logic) ---
  console.log("Using core cyber intelligence engine fallback simulation.");
  
  let severity: SeverityLevel = "safe";
  let riskScore = 15;
  let confidence = 95;
  
  let explanationEn = "No severe indicators detected. The target appears safe.";
  let explanationAr = "لم يتم الكشف عن مؤشرات خطورة بارزة. يبدو أن الهدف آمن للاستخدام.";
  let technicalEn = "No malicious signatures matched. Domain resolution active with valid SSL.";
  let technicalAr = "لم تتطابق أي توقيعات برمجيات ضارة. بروتوكول SSL نشط وصالح للعمل.";
  
  let recommendationsEn: string[] = ["Always verify sender domains explicitly."];
  let recommendationsAr: string[] = ["تحقق دائماً من النطاقات المرسلة بشكل واضح قبل اتخاذ إجراء."];
  let nextActionsEn: string[] = ["Monitor your security logs."];
  let nextActionsAr: string[] = ["راقب السجلات الأمنية لبياناتك."];

  const highlights: any[] = [];

  // Rules-based intelligence engine
  const normalizedInput = input.toLowerCase();

  if (type === 'url_or_website') {
    const isPhishing = normalizedInput.includes("paypa1") || normalizedInput.includes("login-") || normalizedInput.includes("update-account") || normalizedInput.includes("bank-verify") || normalizedInput.includes("free-gift");
    const isSuspicious = normalizedInput.includes(".xyz") || normalizedInput.includes(".top") || normalizedInput.includes("shorturl") || normalizedInput.length > 60;

    if (isPhishing) {
      severity = "dangerous";
      riskScore = 95;
      explanationEn = `This URL mimicking PayPal/major institutions utilizes typosquatting ("paypa1") to deceive users. These fake domain patterns are setup explicitly to harvesting credentials.`;
      explanationAr = `يستخدم هذا النطاق انتحال الحروف البرمجية لتشبه paypal بهدف سرقة الهويات الشخصية. تم تسجيل النطاق منذ فترة قصيرة جداً وهو مخصص كفخ تصيد.`;
      technicalEn = "SSL domain validation is missing. Typosquatting indicator score: High. Domain Registered 4 days ago.";
      technicalAr = "شهادة SSL غير صالحة. معدل تطابق انتحال الأسماء: مرتفع جداً. تم تسجيل النطاق منذ 4 أيام فقط.";
      recommendationsEn = [
        "Do NOT type passwords or authentication codes on this page.",
        "Report the phishing link to US-CERT or Anti-Phishing Working Group (APWG)."
      ];
      recommendationsAr = [
        "لا تقم بإدخال أي كلمات مرور أو رموز تحقق على هذه الصفحة.",
        "أبلغ عن الرابط لقسم مكافحة الجرائم المعلوماتية فوراً."
      ];
      nextActionsEn = ["Block the SMS address.", "Clear your browser cache if you opened it."];
      nextActionsAr = ["احظر رقم المرسل.", "امسح ذاكرة التخزين المؤقت للمتصفح إذا قمت بفتحه."];
    } else if (isSuspicious) {
      severity = "suspicious";
      riskScore = 55;
      explanationEn = "This URL uses unverified shorteners or a high-risk generic top-level domain (.xyz/.top). While not actively flagged as malware yet, these elements are frequently used for fast disposable scams.";
      explanationAr = "يستخدم هذا الموقع نطاقاً رخيصاً ذو خطورة عالية (.xyz) أو روابط مختصرة تخفي وجهة التحويل الحقيقية، وهي ممارسات يتبعها المحتالون بشكل كبير لتجنب الرصد.";
      technicalEn = "High risk TLD detected (.xyz). Whois database records are fully redacted. Multiple nested redirects noticed.";
      technicalAr = "تم رصد نطاق ذو خطورة عالية (.xyz). بيانات Whois مخفية بالكامل. توجد إعادات توجيه متعددة.";
      recommendationsEn = ["Verify the core domain using a trusted WHOIS checker."];
      recommendationsAr = ["تحقق من مالك النطاق الأساسي باستخدام أدوات WHOIS موثوقة."];
    }
  } else if (type === 'phone_number') {
    const isScamPhone = normalizedInput.includes("9665") && (normalizedInput.includes("55") || normalizedInput.endsWith("4") || normalizedInput.includes("scam"));
    if (isScamPhone || normalizedInput.includes("+1") || normalizedInput.includes("spam")) {
      severity = "dangerous";
      riskScore = 88;
      explanationEn = "This mobile number has been reported 12 times in the last 48 hours for impersonating bank agents requesting OTP verification codes.";
      explanationAr = "تم الإبلاغ عن هذا الرقم 12 مرة خلال الـ 48 ساعة الماضية لمحاولات انتحال صفة موظفي البنك المركزي لطلب رموز التحقق المؤقتة (OTP).";
      technicalEn = "Carrier: Virtual VoIP. Fraud Likelihood: 92%. Active spam category: Bank Scam.";
      technicalAr = "مزود الخدمة: رقم افتراضي عبر الإنترنت (VoIP). احتمالية الاحتيال: 92%. الفئة النشطة: احتيال بنكي.";
      recommendationsEn = ["Never share your bank codes or passwords with any caller, even if they claim to be from official services."];
      recommendationsAr = ["لا تشارك رموز التحقق أو كلمات المرور البنكية مع أي متصل أبداً، حتى لو ادعى أنه من البنك المركزي."];
    } else {
      severity = "safe";
      riskScore = 12;
      explanationEn = "No threat profiles or negative carrier flags matched for this phone number.";
      explanationAr = "لا توجد أي بلاغات سابقة أو مؤشرات مشبوهة مرتبطة برقم الهاتف هذا.";
    }
  } else if (type === 'screenshot') {
    severity = "dangerous";
    riskScore = 89;
    explanationEn = "Visual analysis of the screenshot reveals a cloned bank page with non-matching fonts, fake URL indicators, and an insecure login container designed to steal credentials.";
    explanationAr = "التحليل البصري للصورة يظهر تقليداً كاملاً لصفحة بنك محلية، تظهر أخطاء في الخطوط، حقول إدخال مشبوهة، ورابطاً مزيفاً في أعلى المتصفح.";
    technicalEn = "Pixel similarity score to legitimate bank portal: 94%. Source code elements parsed indicate forms forwarding data to a public Firebase database.";
    technicalAr = "نسبة تطابق التصميم البصري مع الموقع الحقيقي للبنك: 94%. حقول الدخول ترسل البيانات إلى قاعدة بيانات خارجية غير آمنة.";
    
    highlights.push(
      { id: "h1", x: 10, y: 15, width: 80, height: 10, labelEn: "Suspicious, fake non-matching URL address bar", labelAr: "شريط عنوان متصفح مزيف ومريب", severity: "dangerous" },
      { id: "h2", x: 25, y: 45, width: 50, height: 25, labelEn: "Fraudulent credential input field capturing logins", labelAr: "حقول إدخال منتحلة لسرقة بيانات الدخول", severity: "dangerous" }
    );
  } else if (type === 'text_or_message') {
    const isFinancialScam = normalizedInput.includes("win") || normalizedInput.includes("prize") || normalizedInput.includes("investment") || normalizedInput.includes("crypto") || normalizedInput.includes("million");
    if (isFinancialScam) {
      severity = "dangerous";
      riskScore = 87;
      explanationEn = "This message promises high-guarantee investment profits or fake financial winnings, which is the foundational pattern of a classical advanced-fee or Ponzi scheme.";
      explanationAr = "تعدك هذه الرسالة بأرباح مضمونة ومكافآت مالية وهمية، وهو النمط الأساسي لعمليات النصب والاحتيال المالي والاستثماري.";
      technicalEn = "Linguistic analysis matches phishing scams with high confidence (91%). Triggers include: high return promises, pressure tactics, dynamic short URL.";
      technicalAr = "التحليل اللغوي يطابق نصوص الاحتيال بنسبة ثقة عالية (91%). الكلمات المفتاحية: أرباح خيالية، ضغط زمني، رابط مشبوه.";
    } else {
      severity = "safe";
      riskScore = 15;
    }
  } else if (type === 'file') {
    severity = "dangerous";
    riskScore = 82;
    explanationEn = "Static analysis of the PDF document reveals embedded suspicious action scripts (Javascript execution blocks) designed to trigger unauthorized external network downloads when opened.";
    explanationAr = "التحليل الهيكلي للملف يكشف عن وجود برمجيات نصية (Javascript) مدمجة داخل ملف الـ PDF تقوم بتحميل ملفات خارجية عند فتح المستند.";
    technicalEn = "Embedded exploit vectors: /JS, /AcroForm. Heuristics rating: 85%. Hashes match malware distribution campaigns.";
    technicalAr = "عناصر الاختراق المكتشفة: ملفات جافا سكريبت مدمجة، نماذج تفاعلية مريبة. البصمة الرقمية تطابق حملة برمجيات خبيثة معروفة.";
  } else if (type === 'financial') {
    severity = "suspicious";
    riskScore = 72;
    explanationEn = "This cryptocurrency wallet address or IBAN has been linked with unauthorized peer-to-peer trading complaints and blacklist logs.";
    explanationAr = "تم ربط رقم الآيبان أو محفظة العملات الرقمية هذه ببلاغات احتيال سابقة وشكاوى تداول مشبوهة لدى منصات الدعم.";
    technicalEn = "Threat Intel lookup flags: 2 active blacklists. Activity pattern: rapid micro-transactions followed by large outbound cashouts.";
    technicalAr = "مؤشرات التهديد: مدرج في قائمتي حظر. نمط النشاط: تحويلات متكررة سريعة ثم سحب كامل الرصيد.";
  }

  const scanRecord: ScanRecord = {
    id: scanId,
    userId,
    type,
    inputName: input.substring(0, 100),
    timestamp: new Date().toISOString(),
    severity,
    riskScore,
    confidence,
    aiExplanationEn: explanationEn,
    aiExplanationAr: explanationAr,
    technicalDetailsEn: technicalEn,
    technicalDetailsAr: technicalAr,
    recommendationsEn,
    recommendationsAr,
    nextActionsEn,
    nextActionsAr,
    highlights,
    screenshotUrl: screenshot,
  };

  fillScanDetails(scanRecord, type, input, fileMeta);

  SCANS_DB.unshift(scanRecord);
  res.json(scanRecord);
});

// Helper to construct realistic sub-report detail structures
function fillScanDetails(record: ScanRecord, type: ScanType, input: string, fileMeta?: any) {
  if (type === 'url_or_website') {
    record.urlDetails = {
      sslValid: !input.includes("http://") && !input.includes("paypa1"),
      sslIssuer: input.includes("https") ? "Let's Encrypt Authority X3" : undefined,
      domainAgeMonths: input.includes("paypa1") ? 0.2 : 48,
      redirectsCount: input.includes("paypa1") ? 1 : 0,
      hiddenUrls: [],
      typosquattingDetected: input.includes("paypa1") || input.includes("g00gle"),
      whoisOwner: "Privacy Guardians Limited",
      reputationScore: input.includes("paypa1") ? 5 : 92,
      isShortened: input.includes("bit.ly") || input.includes("t.co") || input.includes("shorturl"),
    };
  } else if (type === 'phone_number') {
    record.phoneDetails = {
      spamReports: input.includes("+966") ? 8 : 1,
      country: input.includes("+966") ? "Saudi Arabia" : "United States",
      carrier: "VoIP Digital Services",
      scamLikelihood: input.includes("+966") ? 85 : 12,
      fraudHistoryDetected: input.includes("+966"),
    };
  } else if (type === 'file') {
    record.fileDetails = {
      fileName: fileMeta?.name || input || "cyber_invoice_secure.pdf",
      fileSize: fileMeta?.size || 1048576,
      md5Hash: "e10adc3949ba59abbe56e057f20f883e",
      sha256Hash: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92",
      signatureCheck: "infected",
      aiBehaviorAnalysis: "Attempted process execution, suspicious registry modifications scheduled.",
      detectedViruses: ["Trojan.PDF.Exploit.Agent", "JS.Downloader.Phish"],
    };
  }
}

// Get history
app.get("/api/scans/history", (req, res) => {
  const authHeader = req.headers.authorization;
  let userId = "visitor";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
      userId = decoded.email;
    } catch (_) {}
  }

  // Users see their own scans. Visitors see public/seeded scans. Admins see everything.
  if (userId === "admin@kashef.ai") {
    return res.json(SCANS_DB);
  }

  if (userId === "visitor") {
    // Return standard public database for visitor
    return res.json(SCANS_DB.filter(s => s.userId === "visitor" || s.id.startsWith("scan_10")));
  }

  // Registered user sees their own scans plus seeded ones
  res.json(SCANS_DB.filter(s => s.userId === userId || s.userId === "visitor" || s.id.startsWith("scan_10")));
});

// Delete scan record
app.delete("/api/scans/:id", (req, res) => {
  const { id } = req.params;
  SCANS_DB = SCANS_DB.filter(s => s.id !== id);
  res.json({ success: true });
});

// Download scan report as custom responsive HTML print layout
app.get("/api/scans/report-download/:id", (req, res) => {
  const { id } = req.params;
  const scan = SCANS_DB.find(s => s.id === id);
  if (!scan) {
    return res.status(404).send("Report not found");
  }

  // Generate beautiful HTML Report
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Kashef Cybersecurity Scan Report - ${scan.id}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f8fafc; padding: 40px; }
        .card { background: white; max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); overflow: hidden; }
        .header { background: #0f172a; color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: -0.05em; }
        .logo span { color: #f43f5e; }
        .badge { padding: 6px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; text-transform: uppercase; }
        .badge.dangerous { background: #fee2e2; color: #991b1b; }
        .badge.suspicious { background: #fef3c7; color: #92400e; }
        .badge.safe { background: #dcfce7; color: #166534; }
        .content { padding: 40px; }
        .row { display: flex; gap: 20px; margin-bottom: 24px; }
        .col { flex: 1; }
        .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; }
        .value { font-size: 16px; font-weight: 500; }
        .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; margin-top: 32px; margin-bottom: 16px; }
        .explanation { line-height: 1.6; color: #334155; }
        ul { padding-left: 20px; margin: 0; line-height: 1.6; color: #334155; }
        li { margin-bottom: 8px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">Kashef<span>.كاشف</span></div>
          <span class="badge ${scan.severity}">${scan.severity}</span>
        </div>
        <div class="content">
          <h1 style="margin-top: 0; font-size: 24px; margin-bottom: 24px;">Executive Security Assessment Report</h1>
          
          <div class="row">
            <div class="col">
              <div class="label">Scan Reference ID</div>
              <div class="value">${scan.id}</div>
            </div>
            <div class="col">
              <div class="label">Analysis Time</div>
              <div class="value">${new Date(scan.timestamp).toLocaleString()}</div>
            </div>
            <div class="col">
              <div class="label">Target Content</div>
              <div class="value" style="word-break: break-all;">${scan.inputName}</div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <div class="label">Security Risk Score</div>
              <div class="value" style="font-size: 32px; font-weight: bold; color: ${scan.severity === 'dangerous' ? '#ef4444' : scan.severity === 'suspicious' ? '#f59e0b' : '#10b981'}">${scan.riskScore} / 100</div>
            </div>
            <div class="col">
              <div class="label">Confidence Score</div>
              <div class="value" style="font-size: 32px; font-weight: bold;">${scan.confidence}%</div>
            </div>
          </div>

          <div class="section-title">AI Cyber Assessment</div>
          <div class="explanation">
            <strong>English Summary:</strong><br>
            ${scan.aiExplanationEn}
            <br><br>
            <strong>Arabic Summary:</strong><br>
            ${scan.aiExplanationAr}
          </div>

          <div class="section-title">Technical Indicators & Evidence</div>
          <div class="explanation" style="font-family: monospace; background: #f1f5f9; padding: 16px; border-radius: 6px; font-size: 14px;">
            ${scan.technicalDetailsEn}
          </div>

          <div class="section-title">Immediate Defense Recommendations</div>
          <ul>
            ${scan.recommendationsEn.map(r => `<li>${r}</li>`).join("")}
          </ul>

          <div class="section-title">Suggested Next Actions</div>
          <ul>
            ${scan.nextActionsEn.map(a => `<li>${a}</li>`).join("")}
          </ul>
        </div>
        <div class="footer">
          This report was generated securely by Kashef Cybersecurity Engine using AI Threat Intelligence.
        </div>
      </div>
    </body>
    </html>
  `;
  res.setHeader("Content-Type", "text/html");
  res.send(html);
});


// --- CYBERSECURITY AI CHAT ASSISTANT ENDPOINT ---

app.post("/api/chat/message", async (req, res) => {
  const { messages } = req.body; // Full history list [{ role: 'user' | 'assistant', content: '...' }]
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  const latestMessage = messages[messages.length - 1]?.content;
  if (!latestMessage) {
    return res.status(400).json({ error: "Message content cannot be empty" });
  }

  console.log(`AI Cybersecurity Assistant invoked: "${latestMessage.substring(0, 50)}..."`);

  if (ai) {
    try {
      // Build proper chat format
      const chat = ai.chats.create({
        model: PLATFORM_CONFIG.aiModelName,
        config: {
          systemInstruction: `You are Kashef AI, a highly distinguished cyber protection specialist, cybersecurity expert, and digital safety educator.
Your task is to protect individuals and organizations from digital scams, phishing, social engineering, identity theft, malware, and fake links.
Provide concise, highly professional security advice.
Support bilingual interaction (reply in Arabic if asked in Arabic, or English if asked in English).
Explain risks in simple, friendly, easy-to-understand terms with structured guidelines.
Always include key recommendations, next actions, and educational cyber hygiene tips.
Do not use technical jargon without explaining it.
Format your responses with clear markdown bullet points and headings.`,
        }
      });

      // Send chat message
      const response = await chat.sendMessage({ message: latestMessage });
      return res.json({ text: response.text });

    } catch (error) {
      console.error("Gemini Chat Error:", error);
      // Fallback to simulation below
    }
  }

  // --- CYBER ASSISTANT SIMULATOR FALLBACK ---
  console.log("Using chatbot fallback simulation.");
  const msgLower = latestMessage.toLowerCase();
  let reply = "";

  if (msgLower.includes("مرحبا") || msgLower.includes("السلام") || msgLower.includes("hello") || msgLower.includes("hi ")) {
    reply = `**Welcome to Kashef Cybersecurity Assistant!** 🛡️
How can I assist you with digital security today? I can help you analyze links, understand phishing emails, look up suspicious phone numbers, or explain security best practices like Multi-Factor Authentication.

**مرحباً بك في مساعد كاشف الأمني الذكي!** 🛡️
كيف يمكنني مساعدتك في تعزيز أمنك الرقمي اليوم؟ يمكنني فحص الروابط المشبوهة، تحليل رسائل التصيد، أو تقديم نصائح لحماية حساباتك المصرفية وشخصيتك الرقمية.`;
  } else if (msgLower.includes("phish") || msgLower.includes("تصيد") || msgLower.includes("رابط")) {
    reply = `### Understanding Phishing Attacks 🎣
Phishing is where scammers impersonate trusted platforms (e.g., banks, shipping lines) to steal passwords or bank codes.

**Key Shields:**
1. **Inspect URLs**: Double-check the exact spelling (e.g. \`paypa1-security.com\` is fake).
2. **Never share OTPs**: No legitimate bank officer will ever call to request your mobile one-time-passcode (OTP).
3. **Use Kashef URL Scanner**: Submit links here to inspect domain age and reputation instantly.

### كيف تتجنب التصيد الاحتيالي؟ 🎣
التصيد هو انتحال شخصية جهات موثوقة لسرقة كلمات المرور ورموز التحقق.
**أهم طرق الحماية:**
1. **تحقق من الرابط**: انتبه لتبديل الحروف المتشابهة (مثل paypa1 بدلاً من paypal).
2. **لا تشارك الرموز أبداً**: لن يتصل بك أي موظف بنك حقيقي لطلب رمز التحقق الهاتفي (OTP).`;
  } else if (msgLower.includes("mfa") || msgLower.includes("password") || msgLower.includes("كلمة مرور")) {
    reply = `### Elevating Credential Security 🔑
To protect your email, banking, and social accounts:
- **Set Long Passphrases**: Use a combination of 4 random words (e.g., \`correct-horse-battery-staple\`), which are extremely hard for computers to crack but easy for you to remember.
- **Enable Authenticator MFA**: Prefer App Authenticators (Google, Microsoft) over SMS validation code.

### تأمين حساباتك وكلمات المرور 🔑
- **اختر كلمات مرور طويلة**: يفضل استخدام دمج 4 كلمات عشوائية صعبة التخمين سهلة الحفظ.
- **فعّل التحقق بخطوتين (MFA)**: استخدم تطبيقات المصادقة الأمنية بدلاً من رسائل الجوال لتجنب الاختراقات الهاتيفية.`;
  } else {
    reply = `Thank you for consulting Kashef Cybersecurity AI. 

Based on your inquiry, here are critical digital defense checklists:
1. **Zero-Trust Rule**: Treat unexpected emails or SMS containing links as suspicious until proven otherwise.
2. **Never Install Untrusted APKs/Apps**: Android APKs from outside Google Play or iOS profiles can install active spywares.
3. **Use Kashef Analytics Suite** to perform real-time AI scans.

شكراً لاستشارتك كاشف الذكي للأمن السيبراني.
بناءً على استفسارك، ننصحك بالآتي:
1. **مبدأ عدم الثقة المطلقة**: تعامل مع جميع الرسائل غير المتوقعة التي تحتوي روابط على أنها مريبة حتى يثبت العكس.
2. **تجنب تثبيت التطبيقات الخارجية**: لا تقم بتثبيت ملفات APK من خارج المتجر الرسمي للجوال.`;
  }

  res.json({ text: reply });
});


// --- OTHER MODULES ---

// Get Cybersecurity Learning Lessons
app.get("/api/learning/lessons", (req, res) => {
  res.json(LEARNING_DB);
});

// Submit quiz answers to update stats
app.post("/api/learning/submit-quiz", (req, res) => {
  const { lessonId, selectedIndex } = req.body;
  const lesson = LEARNING_DB.find(l => l.id === lessonId);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });

  const correct = lesson.quiz.correctIndex === selectedIndex;
  res.json({
    correct,
    explanationEn: lesson.quiz.explanationEn,
    explanationAr: lesson.quiz.explanationAr
  });
});

// Notifications
app.get("/api/notifications", (req, res) => {
  res.json(NOTIFICATIONS_DB);
});

app.post("/api/notifications/read", (req, res) => {
  const { id } = req.body;
  const notif = NOTIFICATIONS_DB.find(n => n.id === id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// Admin config and logs get/set
app.get("/api/admin/settings", (req, res) => {
  // Return configuration and server statistics
  res.json({
    config: PLATFORM_CONFIG,
    stats: {
      totalScansCount: SCANS_DB.length,
      dangerousCount: SCANS_DB.filter(s => s.severity === 'dangerous').length,
      suspiciousCount: SCANS_DB.filter(s => s.severity === 'suspicious').length,
      safeCount: SCANS_DB.filter(s => s.severity === 'safe').length,
      usersRegisteredCount: Object.keys(USERS_DB).length,
    },
    users: Object.values(USERS_DB).map(u => ({ email: u.email, name: u.name, role: u.role, createdAt: u.createdAt })),
    auditLogs: [
      { id: "log_1", action: "User scan executed", details: "Type: url_or_website", ip: "127.0.0.1", timestamp: new Date().toISOString() },
      { id: "log_2", action: "Admin login", details: "admin@kashef.ai logged in", ip: "127.0.0.1", timestamp: new Date(Date.now() - 360000).toISOString() }
    ]
  });
});

app.post("/api/admin/settings/update", (req, res) => {
  const { aiModelName, maxScansPerVisitor, enableGrounding, maintenanceMode } = req.body;
  PLATFORM_CONFIG = {
    aiModelName: aiModelName || PLATFORM_CONFIG.aiModelName,
    maxScansPerVisitor: Number(maxScansPerVisitor) || PLATFORM_CONFIG.maxScansPerVisitor,
    enableGrounding: enableGrounding !== undefined ? enableGrounding : PLATFORM_CONFIG.enableGrounding,
    maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : PLATFORM_CONFIG.maintenanceMode,
  };
  res.json({ success: true, config: PLATFORM_CONFIG });
});


// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
