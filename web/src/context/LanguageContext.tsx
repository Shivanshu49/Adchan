"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";


export type SupportedLanguage = "hi" | "en" | "mr" | "gu";

type TranslationSet = Record<SupportedLanguage, string>;

const STORAGE_KEY = "adchan-language";

const translations: Record<string, TranslationSet> = {
  "skip.main": {
    hi: "मुख्य सामग्री पर जाएँ",
    en: "Skip to main content",
    mr: "मुख्य मजकुराकडे जा",
    gu: "મુખ્ય સામગ્રી પર જાઓ",
  },
  "nav.home": { hi: "होम", en: "Home", mr: "मुख्यपृष्ठ", gu: "હોમ" },
  "nav.services": { hi: "सेवाएं", en: "Services", mr: "सेवा", gu: "સેવાઓ" },
  "nav.schemes": { hi: "योजनाएं", en: "Schemes", mr: "योजना", gu: "યોજનાઓ" },
  "nav.help": { hi: "सहायता", en: "Help", mr: "मदत", gu: "સહાય" },
  "nav.language": { hi: "भाषा चुनें", en: "Choose language", mr: "भाषा निवडा", gu: "ભાષા પસંદ કરો" },
  "nav.profile": { hi: "प्रोफाइल", en: "Profile", mr: "प्रोफाइल", gu: "પ્રોફાઇલ" },
  "footer.real": { hi: "क्या असली है?", en: "What is real?", mr: "काय खरे आहे?", gu: "શું સાચું છે?" },
  "footer.how": { hi: "कैसे काम करता है", en: "How it works", mr: "हे कसे काम करते", gu: "તે કેવી રીતે કામ કરે છે" },
  "footer.research": { hi: "शोध और साक्षात्कार", en: "Research and interviews", mr: "संशोधन आणि मुलाखती", gu: "સંશોધન અને મુલાકાતો" },
  "footer.reset": { hi: "डेमो रीसेट करें", en: "Reset demo", mr: "डेमो रीसेट करा", gu: "ડેમો રીસેટ કરો" },
  "footer.disclaimer": {
    hi: "स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।",
    en: "Independent prototype — not affiliated with any government body.",
    mr: "स्वतंत्र नमुना — कोणत्याही सरकारी संस्थेशी संबंधित नाही.",
    gu: "સ્વતંત્ર પ્રોટોટાઇપ — કોઈ સરકારી સંસ્થા સાથે સંબંધિત નથી.",
  },
  "home.reset": {
    hi: "इस ब्राउज़र का डेमो साफ़ हो गया। अब किसी भी नमूना नंबर से फिर शुरू करें।",
    en: "The demo has been reset in this browser. Start again with any sample number.",
    mr: "या ब्राउझरमधील डेमो रीसेट झाला. कोणत्याही नमुना क्रमांकाने पुन्हा सुरू करा.",
    gu: "આ બ્રાઉઝરમાં ડેમો રીસેટ થયો. કોઈપણ નમૂના નંબરથી ફરી શરૂ કરો.",
  },
  "home.eyebrow": { hi: "डिजिटल किसान सेवा केंद्र", en: "Digital Farmer Service Centre", mr: "डिजिटल शेतकरी सेवा केंद्र", gu: "ડિજિટલ ખેડૂત સેવા કેન્દ્ર" },
  "home.greeting": { hi: "नमस्ते किसान!", en: "Hello, farmer!", mr: "नमस्कार शेतकरी!", gu: "નમસ્તે ખેડૂત!" },
  "home.intro": {
    hi: "PM-KISAN किस्त कहाँ रुकी और अब क्या करना है—साफ़ हिंदी में जानिए।",
    en: "Find out where your PM-KISAN instalment is stuck and what to do next.",
    mr: "PM-KISAN चा हप्ता कुठे अडकला आणि पुढे काय करायचे ते सोप्या भाषेत जाणून घ्या.",
    gu: "PM-KISAN નો હપ્તો ક્યાં અટક્યો અને હવે શું કરવું તે સરળ ભાષામાં જાણો.",
  },
  "home.registration.label": { hi: "रजिस्ट्रेशन नंबर डालिए", en: "Enter registration number", mr: "नोंदणी क्रमांक टाका", gu: "રજિસ્ટ્રેશન નંબર દાખલ કરો" },
  "home.registration.placeholder": { hi: "रजिस्ट्रेशन नंबर (उदा. UP-DEMO-0001)", en: "Registration number (e.g. UP-DEMO-0001)", mr: "नोंदणी क्रमांक (उदा. UP-DEMO-0001)", gu: "રજિસ્ટ્રેશન નંબર (દા.ત. UP-DEMO-0001)" },
  "home.registration.search": { hi: "खोजें", en: "Search", mr: "शोधा", gu: "શોધો" },
  "home.registration.security": {
    hi: "कोई लॉगिन नहीं, कोई कैप्चा नहीं। आपकी जानकारी सुरक्षित है।",
    en: "No login and no captcha. Your information stays secure.",
    mr: "लॉगिन किंवा कॅप्चा नाही. तुमची माहिती सुरक्षित आहे.",
    gu: "લૉગિન કે કેપ્ચા નથી. તમારી માહિતી સુરક્ષિત છે.",
  },
  "home.services.title": { hi: "मुख्य किसान सेवाएं", en: "Main farmer services", mr: "मुख्य शेतकरी सेवा", gu: "મુખ્ય ખેડૂત સેવાઓ" },
  "home.services.subtitle": { hi: "अपनी आवश्यकता अनुसार सेवा चुनें और तुरंत विवरण देखें", en: "Choose a service and see the details immediately", mr: "गरजेनुसार सेवा निवडा आणि माहिती लगेच पहा", gu: "જરૂર મુજબ સેવા પસંદ કરો અને વિગતો તરત જુઓ" },
  "home.services.all": { hi: "सभी 12 सेवाएं देखें", en: "View all 12 services", mr: "सर्व 12 सेवा पहा", gu: "બધી 12 સેવાઓ જુઓ" },
  "service.status.title": { hi: "स्थिति", en: "Status", mr: "स्थिती", gu: "સ્થિતિ" },
  "service.status.description": { hi: "किस्त व आवेदन स्थिति", en: "Instalment and application", mr: "हप्ता व अर्ज स्थिती", gu: "હપ્તો અને અરજીની સ્થિતિ" },
  "service.ekyc.title": { hi: "e-KYC", en: "e-KYC", mr: "e-KYC", gu: "e-KYC" },
  "service.ekyc.description": { hi: "आधार OTP सत्यापन", en: "Aadhaar OTP verification", mr: "आधार OTP पडताळणी", gu: "આધાર OTP ચકાસણી" },
  "service.registration.title": { hi: "पंजीकरण", en: "Registration", mr: "नोंदणी", gu: "રજિસ્ટ્રેશન" },
  "service.registration.description": { hi: "नया किसान पंजीकरण", en: "New farmer registration", mr: "नवीन शेतकरी नोंदणी", gu: "નવા ખેડૂતનું રજિસ્ટ્રેશન" },
  "service.schemes.title": { hi: "योजनाएं", en: "Schemes", mr: "योजना", gu: "યોજનાઓ" },
  "service.schemes.description": { hi: "पीएम किसान व अन्य", en: "PM-KISAN and others", mr: "पीएम किसान व इतर", gu: "પીએમ કિસાન અને અન્ય" },
  "service.payment.title": { hi: "भुगतान स्थिति", en: "Payment status", mr: "देयक स्थिती", gu: "ચુકવણીની સ્થિતિ" },
  "service.payment.description": { hi: "DBT व बैंक ट्रांसफर", en: "DBT and bank transfer", mr: "DBT व बँक हस्तांतरण", gu: "DBT અને બેંક ટ્રાન્સફર" },
  "service.eligibility.title": { hi: "पात्रता", en: "Eligibility", mr: "पात्रता", gu: "પાત્રતા" },
  "service.eligibility.description": { hi: "शर्तें व जरूरी दस्तावेज", en: "Rules and required documents", mr: "अटी व आवश्यक कागदपत्रे", gu: "શરતો અને જરૂરી દસ્તાવેજો" },
  "service.help.title": { hi: "सहायता", en: "Help", mr: "मदत", gu: "સહાય" },
  "service.help.description": { hi: "टोल-फ्री 1800-180-1551", en: "Toll-free 1800-180-1551", mr: "टोल-फ्री 1800-180-1551", gu: "ટોલ-ફ્રી 1800-180-1551" },
  "service.weather.title": { hi: "मौसम", en: "Weather", mr: "हवामान", gu: "હવામાન" },
  "service.weather.description": { hi: "स्थानीय पूर्वानुमान जानकारी", en: "Local forecast information", mr: "स्थानिक हवामान अंदाज", gu: "સ્થાનિક હવામાન આગાહી" },
  "home.schemes.title": { hi: "प्रमुख योजनाएं", en: "Key schemes", mr: "प्रमुख योजना", gu: "મુખ્ય યોજનાઓ" },
  "scheme.pmfby.name": { hi: "प्रधानमंत्री फसल बीमा योजना", en: "Pradhan Mantri Fasal Bima Yojana", mr: "प्रधानमंत्री पीक विमा योजना", gu: "પ્રધાનમંત્રી પાક વીમા યોજના" },
  "scheme.pmfby.purpose": { hi: "अधिसूचित फसल और मौसम के लिए फसल बीमा आवेदन तैयार करना।", en: "Prepare a crop-insurance application for a notified crop and season.", mr: "अधिसूचित पीक आणि हंगामासाठी पीक विमा अर्ज तयार करणे.", gu: "જાહેર કરેલા પાક અને મોસમ માટે પાક વીમાની અરજી તૈયાર કરવી." },
  "scheme.kcc.name": { hi: "किसान क्रेडिट कार्ड", en: "Kisan Credit Card", mr: "किसान क्रेडिट कार्ड", gu: "કિસાન ક્રેડિટ કાર્ડ" },
  "scheme.kcc.purpose": { hi: "खेती, फसल के बाद के खर्च और कृषि से जुड़ी कार्यशील पूँजी के लिए बैंक ऋण आवेदन तैयार करना।", en: "Prepare a bank-credit application for farming and related working capital.", mr: "शेती व संबंधित खेळत्या भांडवलासाठी बँक कर्ज अर्ज तयार करणे.", gu: "ખેતી અને સંબંધિત કાર્યકારી મૂડી માટે બેંક લોનની અરજી તૈયાર કરવી." },
  "scheme.pmkmy.name": { hi: "प्रधानमंत्री किसान मानधन योजना", en: "Pradhan Mantri Kisan Maandhan Yojana", mr: "प्रधानमंत्री किसान मानधन योजना", gu: "પ્રધાનમંત્રી કિસાન માનધન યોજના" },
  "scheme.pmkmy.purpose": { hi: "छोटे और सीमांत किसान के लिए स्वैच्छिक अंशदायी पेंशन नामांकन तैयार करना।", en: "Prepare voluntary contributory-pension enrolment for small and marginal farmers.", mr: "लहान व सीमांत शेतकऱ्यांसाठी ऐच्छिक अंशदायी निवृत्तीवेतन नोंदणी तयार करणे.", gu: "નાના અને સીમાંત ખેડૂતો માટે સ્વૈચ્છિક ફાળાદાર પેન્શન નોંધણી તૈયાર કરવી." },
  "home.result.title": { hi: "जाँच में क्या मिलेगा", en: "What the check provides", mr: "तपासणीत काय मिळेल", gu: "ચકાસણીમાં શું મળશે" },
  "home.result.reason.title": { hi: "रुकी किस्त का साफ कारण", en: "A clear reason for the stopped instalment", mr: "अडकलेल्या हप्त्याचे स्पष्ट कारण", gu: "અટકેલા હપ્તાનું સ્પષ્ટ કારણ" },
  "home.result.reason.description": { hi: "तकनीकी स्थिति को आसान हिंदी में समझाया जाएगा।", en: "The technical status is explained in simple language.", mr: "तांत्रिक स्थिती सोप्या भाषेत समजावली जाईल.", gu: "ટેકનિકલ સ્થિતિ સરળ ભાષામાં સમજાવવામાં આવશે." },
  "home.result.office.title": { hi: "सही कार्यालय और दस्तावेज", en: "The correct office and documents", mr: "योग्य कार्यालय आणि कागदपत्रे", gu: "યોગ્ય કચેરી અને દસ્તાવેજો" },
  "home.result.office.description": { hi: "निदान के अनुसार जाने की जगह और जरूरी कागज़ दिखेंगे।", en: "See where to go and which papers are needed for the diagnosis.", mr: "निदानानुसार कुठे जायचे आणि कोणती कागदपत्रे लागतील ते दिसेल.", gu: "નિદાન મુજબ ક્યાં જવું અને કયા કાગળો જોઈએ તે દેખાશે." },
  "home.result.script.title": { hi: "क्या बोलना है", en: "What to say", mr: "काय बोलायचे", gu: "શું કહેવું" },
  "home.result.script.description": { hi: "काउंटर पर कहने के लिए तैयार हिंदी स्क्रिप्ट मिलेगी।", en: "Get a ready-to-use script for speaking at the counter.", mr: "काउंटरवर बोलण्यासाठी तयार मजकूर मिळेल.", gu: "કાઉન્ટર પર કહેવા માટે તૈયાર લખાણ મળશે." },
  "home.demo.title": { hi: "नमूना किसान से जाँचें", en: "Try a sample farmer", mr: "नमुना शेतकऱ्याने तपासा", gu: "નમૂના ખેડૂતથી તપાસો" },
  "home.demo.description": { hi: "किसी नंबर को चुनकर पूरा निदान, कार्यालय और दस्तावेज देखें।", en: "Choose a number to see the full diagnosis, office and documents.", mr: "क्रमांक निवडून संपूर्ण निदान, कार्यालय आणि कागदपत्रे पहा.", gu: "નંબર પસંદ કરીને સંપૂર્ણ નિદાન, કચેરી અને દસ્તાવેજો જુઓ." },
  "voice.heading": { hi: "बोलकर बताइए", en: "Tell us by voice", mr: "बोलून सांगा", gu: "બોલીને જણાવો" },
  "voice.subtitle": { hi: "माइक दबाएँ और अपनी समस्या बोलें", en: "Press the mic and describe your problem", mr: "माइक दाबा आणि समस्या सांगा", gu: "માઇક દબાવો અને સમસ્યા જણાવો" },
  "voice.start": { hi: "बोलें 🎙️", en: "Speak 🎙️", mr: "बोला 🎙️", gu: "બોલો 🎙️" },
  "voice.listening": { hi: "सुन रहे हैं…", en: "Listening…", mr: "ऐकत आहोत…", gu: "સાંભળી રહ્યા છીએ…" },
  "voice.ready": { hi: "माइक तैयार है। बोलना शुरू करें।", en: "The microphone is ready. Start speaking.", mr: "माइक तयार आहे. बोलायला सुरुवात करा.", gu: "માઇક તૈયાર છે. બોલવાનું શરૂ કરો." },
  "voice.unsupported": { hi: "इस ब्राउज़र में आवाज़ उपलब्ध नहीं है। नीचे लिखकर बताइए।", en: "Voice input is unavailable in this browser. Type below instead.", mr: "या ब्राउझरमध्ये आवाज उपलब्ध नाही. खाली लिहा.", gu: "આ બ્રાઉઝરમાં વૉઇસ ઇનપુટ ઉપલબ્ધ નથી. નીચે લખો." },
  "voice.retry": { hi: "फिर बोलें", en: "Speak again", mr: "पुन्हा बोला", gu: "ફરી બોલો" },
  "voice.stop": { hi: "रोकें", en: "Stop", mr: "थांबा", gu: "રોકો" },
  "voice.close": { hi: "बंद करें", en: "Close", mr: "बंद करा", gu: "બંધ કરો" },
  "voice.heard": { hi: "आपकी आवाज़ लिख ली गई है। भेजने से पहले नीचे जाँच लें।", en: "Your speech has been written below. Review it before submitting.", mr: "तुमचे बोलणे खाली लिहिले आहे. पाठवण्यापूर्वी तपासा.", gu: "તમારું બોલેલું નીચે લખાયું છે. મોકલતાં પહેલાં તપાસો." },
  "voice.noSpeech": { hi: "आवाज़ साफ़ नहीं मिली। फिर बोलें या नीचे लिखें।", en: "We could not hear clearly. Try again or type below.", mr: "आवाज स्पष्ट ऐकू आला नाही. पुन्हा बोला किंवा खाली लिहा.", gu: "અવાજ સ્પષ્ટ સંભળાયો નહીં. ફરી બોલો અથવા નીચે લખો." },
  "voice.permission": { hi: "माइक की अनुमति नहीं मिली। ब्राउज़र में अनुमति दें या नीचे लिखें।", en: "Microphone permission was denied. Allow it in the browser or type below.", mr: "माइकची परवानगी मिळाली नाही. ब्राउझरमध्ये परवानगी द्या किंवा खाली लिहा.", gu: "માઇકની પરવાનગી મળી નથી. બ્રાઉઝરમાં પરવાનગી આપો અથવા નીચે લખો." },
  "voice.textLabel": { hi: "आपकी परेशानी", en: "Your problem", mr: "तुमची समस्या", gu: "તમારી સમસ્યા" },
  "voice.placeholder": { hi: "जैसे: पोर्टल पर eKYC बाकी दिखा रहा है…", en: "For example: the portal says my eKYC is pending…", mr: "उदा.: पोर्टलवर eKYC बाकी दाखवत आहे…", gu: "દા.ત.: પોર્ટલ પર eKYC બાકી બતાવે છે…" },
  "voice.submit": { hi: "परेशानी की वजह खोजें", en: "Find the reason", mr: "समस्येचे कारण शोधा", gu: "સમસ્યાનું કારણ શોધો" },
  "voice.submitting": { hi: "जाँच हो रही है…", en: "Checking…", mr: "तपासणी सुरू आहे…", gu: "ચકાસણી થઈ રહી છે…" },
  "voice.waking": { hi: "ऑनलाइन सेवा शुरू हो रही है…", en: "The online service is starting…", mr: "ऑनलाइन सेवा सुरू होत आहे…", gu: "ઑનલાઇન સેવા શરૂ થઈ રહી છે…" },
  "voice.wakingDetail": { hi: "पन्ना खुला रखें—आपकी बात मिल गई है और जाँच जारी है।", en: "Keep this page open—we received your request and the check is continuing.", mr: "पान उघडे ठेवा—तुमची माहिती मिळाली आहे आणि तपासणी सुरू आहे.", gu: "પાનું ખુલ્લું રાખો—તમારી માહિતી મળી છે અને ચકાસણી ચાલુ છે." },
  "voice.rateLimit": { hi: "एक मिनट में बहुत ज़्यादा कोशिशें हुईं। थोड़ी देर रुकें; नमूना निदान अभी भी काम करते हैं।", en: "Too many attempts in one minute. Wait briefly; the sample diagnoses still work.", mr: "एका मिनिटात खूप प्रयत्न झाले. थोडे थांबा; नमुना निदान अजूनही चालतात.", gu: "એક મિનિટમાં બહુ પ્રયત્ન થયા. થોડી વાર રાહ જુઓ; નમૂના નિદાન હજી કાર્ય કરે છે." },
  "voice.serviceError": { hi: "ऑनलाइन जाँच सेवा तक अभी पहुँचा नहीं जा सका। नीचे के नमूना नंबर अभी भी काम करते हैं।", en: "The online checking service is currently unreachable. The sample numbers below still work.", mr: "ऑनलाइन तपासणी सेवा सध्या उपलब्ध नाही. खालील नमुना क्रमांक अजूनही चालतात.", gu: "ઑનલાઇન ચકાસણી સેવા હાલમાં ઉપલબ્ધ નથી. નીચેના નમૂના નંબર હજી કાર્ય કરે છે." },
  "voice.clarify": { hi: "कृपया अपनी परेशानी थोड़ी और साफ़ बताएँ।", en: "Please describe your problem a little more clearly.", mr: "कृपया तुमची समस्या थोडी अधिक स्पष्ट सांगा.", gu: "કૃપા કરીને તમારી સમસ્યા થોડું વધુ સ્પષ્ટ જણાવો." },
  "voice.noDemo": { hi: "इस समस्या का डेमो रिकॉर्ड अभी उपलब्ध नहीं है। नीचे कोई डेमो नंबर चुनें।", en: "A demo record for this problem is not available. Choose a demo number below.", mr: "या समस्येची डेमो नोंद उपलब्ध नाही. खाली नमुना क्रमांक निवडा.", gu: "આ સમસ્યાનો ડેમો રેકોર્ડ ઉપલબ્ધ નથી. નીચે નમૂના નંબર પસંદ કરો." },
};

const documentLanguages: Record<SupportedLanguage, string> = {
  hi: "hi-IN",
  en: "en-IN",
  mr: "mr-IN",
  gu: "gu-IN",
};

const speechLanguages = documentLanguages;

interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  speechLocale: string;
  classifierLanguage: "hi" | "en";
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);


function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return value === "hi" || value === "en" || value === "mr" || value === "gu";
}


export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>("hi");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLanguage(requested)) {
      setLanguage(requested);
    } else if (isSupportedLanguage(saved)) {
      setLanguage(saved);
    }
    setReady(true);
  }, []);

  const t = useCallback(
    (key: string) => translations[key]?.[language] ?? translations[key]?.hi ?? key,
    [language],
  );

  useEffect(() => {
    if (!ready) return;

    document.documentElement.lang = documentLanguages[language];
    window.localStorage.setItem(STORAGE_KEY, language);

    const url = new URL(window.location.href);
    if (url.searchParams.get("lang") !== language) {
      url.searchParams.set("lang", language);
      window.history.replaceState(window.history.state, "", url);
    }

    document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (key) element.textContent = translations[key]?.[language] ?? translations[key]?.hi ?? element.textContent;
    });

    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;
      if (key) element.placeholder = translations[key]?.[language] ?? translations[key]?.hi ?? element.placeholder;
    });
  }, [language, ready]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      speechLocale: speechLanguages[language],
      classifierLanguage: language === "en" ? "en" : "hi",
      t,
    }),
    [language, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}


export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
