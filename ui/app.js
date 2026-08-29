/**
 * adchan - Kisan Seva Portal Logic
 * Pure Client-Side JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initProfileDrawer();
  initVoiceAssistant();
  initRegistrationSearch();
  initServiceModals();
  initBottomLinks();
  initStickyTopbar();
  initDesktopNavScroll();
});

/* ==========================================================================
   0. Sticky Header scroll effect
   ========================================================================== */
function initStickyTopbar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 15) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ==========================================================================
   1. Desktop Navigation & Smooth Scroll
   ========================================================================== */
function initDesktopNavScroll() {
  const navLinks = document.querySelectorAll('.desktop-nav .nav-item');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const toolKey = link.getAttribute('data-tool');
      if (toolKey) {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if (typeof openModal === 'function' && serviceData && serviceData[toolKey]) {
          openModal(serviceData[toolKey].title, serviceData[toolKey].html);
        }
        return;
      }

      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  const allServicesLink = document.getElementById('all-services-link');
  if (allServicesLink) {
    allServicesLink.addEventListener('click', () => {
      const toggleBtn = document.getElementById('profile-toggle-btn');
      if (toggleBtn) toggleBtn.click();
    });
  }
}

/* ==========================================================================
   2. Language Switcher
   ========================================================================== */
const navTranslations = {
  hi: {
    home: "होम",
    services: "सेवाएं",
    plans: "योजनाएं",
    aid: "सहायता",
    cur: "Hindi"
  },
  en: {
    home: "Home",
    services: "Services",
    plans: "Plans",
    aid: "Help",
    cur: "English"
  },
  mr: {
    home: "मुख्यपृष्ठ",
    services: "सेवा",
    plans: "योजना",
    aid: "मदत",
    cur: "Marathi"
  },
  gu: {
    home: "હોમ",
    services: "સેવાઓ",
    plans: "યોજનાઓ",
    aid: "સહાય",
    cur: "Gujarati"
  }
};

function applyLanguageToNav(langCode) {
  const t = navTranslations[langCode] || navTranslations.hi;
  
  const homeNav = document.querySelector('.desktop-nav [data-nav="home"]');
  if (homeNav) homeNav.textContent = t.home;

  const servicesNav = document.querySelector('.desktop-nav [data-nav="services"]');
  if (servicesNav) servicesNav.textContent = t.services;

  const plansNav = document.querySelector('.desktop-nav [data-nav="plans"]');
  if (plansNav) plansNav.textContent = t.plans;

  const aidNav = document.querySelector('.desktop-nav [data-nav="aid"], .desktop-nav [data-nav="help"]');
  if (aidNav) aidNav.textContent = t.aid;
}

function initLanguageSwitcher() {
  const langBox = document.getElementById('lang-box');
  const langBtn = document.getElementById('lang-btn');
  const curLang = document.getElementById('cur-lang');
  const options = document.querySelectorAll('.lang-opt');

  if (!langBox || !langBtn) return;

  // Initialize with Hindi default
  applyLanguageToNav('hi');

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = langBox.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      const langCode = opt.getAttribute('data-lang') || 'hi';
      const langText = opt.textContent.split(' ')[0]; // "Hindi", "English", etc.
      if (curLang) curLang.textContent = langText;
      
      // Update nav bar text in real time
      applyLanguageToNav(langCode);
      
      langBox.classList.remove('open');
      langBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', () => {
    langBox.classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
  });
}

/* ==========================================================================
   3. Profile Drawer (Housing all 12 Services)
   ========================================================================== */
function initProfileDrawer() {
  const toggleBtn = document.getElementById('profile-toggle-btn');
  const drawer = document.getElementById('profile-drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close');

  function openDrawer() {
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeModal();
      closeVoiceModal();
    }
  });
}

/* ==========================================================================
   4. Voice Assistant (Strictly Opens ONLY on User Click)
   ========================================================================== */
let closeVoiceModalRef = null;

function initVoiceAssistant() {
  const voiceBtn = document.getElementById('voice-btn');
  const backdrop = document.getElementById('voice-backdrop');
  const closeBtn = document.getElementById('voice-close-btn');
  const subHeading = document.getElementById('voice-sub');

  let recognition = null;
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  function openVoiceModal() {
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('modal-open');
    startListening();
  }

  function closeVoiceModal() {
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('modal-open');
    stopListening();
  }

  closeVoiceModalRef = closeVoiceModal;

  function startListening() {
    if (!SpeechRec) {
      if (subHeading) subHeading.textContent = "आपका ब्राउज़र वॉयस इनपुट को सपोर्ट नहीं करता। कृपया लिखकर खोजें।";
      return;
    }

    try {
      recognition = new SpeechRec();
      recognition.lang = 'hi-IN';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => {
        if (subHeading) subHeading.textContent = "सुन रहे हैं... कृपया बोलिए";
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (subHeading) subHeading.textContent = `आपने कहा: "${transcript}"`;
        
        // Auto search if registration or status keywords mentioned
        setTimeout(() => {
          if (transcript.length > 2) {
            closeVoiceModal();
            openModal("आवाज़ से खोजी गई जानकारी", `
              <div style="display:flex; flex-direction:column; gap:12px;">
                <p><strong>आपका सवाल:</strong> "${escapeHtml(transcript)}"</p>
                <div style="background:#F2F5EB; padding:14px; border-radius:12px; border:1px solid #CCD5C0;">
                  <p style="color:#287C49; font-weight:600;">✓ संबंधित कृषि सलाह व योजनाएं उपलब्ध हैं।</p>
                  <p style="margin-top:6px;">अधिक जानकारी के लिए किसान कॉल सेंटर <strong>1800-180-1551</strong> पर भी निशुल्क कॉल कर सकते हैं।</p>
                </div>
              </div>
            `);
          }
        }, 1800);
      };

      recognition.onerror = () => {
        if (subHeading) subHeading.textContent = "आवाज़ स्पष्ट नहीं आई, कृपया माइक पर पुनः क्लिक करें।";
      };

      recognition.onend = () => {
        // finished
      };

      recognition.start();
    } catch (e) {
      console.warn("Speech error:", e);
    }
  }

  function stopListening() {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {}
      recognition = null;
    }
  }

  if (voiceBtn) voiceBtn.addEventListener('click', openVoiceModal);
  if (closeBtn) closeBtn.addEventListener('click', closeVoiceModal);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeVoiceModal();
    });
  }
}

function closeVoiceModal() {
  if (closeVoiceModalRef) closeVoiceModalRef();
}

/* ==========================================================================
   5. Registration Number Search
   ========================================================================== */
function initRegistrationSearch() {
  const form = document.getElementById('reg-form');
  const input = document.getElementById('reg-input');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();

    if (!query) {
      openModal("पंजीकरण खोज", "<p style='color:#C53030; font-weight:600;'>कृपया अपना 11 या 12 अंकों का रजिस्ट्रेशन नंबर दर्ज करें।</p>");
      return;
    }

    openModal(
      "पंजीकरण एवं किस्त स्थिति",
      `<div style="display:flex; flex-direction:column; gap:12px;">
        <div style="background:#FBFDF6; padding:14px; border-radius:14px; border:1.5px solid #CCD5C0;">
          <p><strong>रजिस्ट्रेशन नंबर:</strong> <span style="font-family:monospace; font-size:1.1rem; color:#38422B;">${escapeHtml(query)}</span></p>
          <p style="color:#287C49; font-weight:700; margin-top:6px;">✓ पंजीकरण सक्रिय एवं सत्यापित है</p>
        </div>
        <div style="background:#F2F5EB; padding:14px; border-radius:12px; border:1px solid #CCD5C0; display:flex; flex-direction:column; gap:6px;">
          <p><strong>आधार सत्यापन:</strong> <span style="color:#287C49;">सफल (e-KYC पूर्ण)</span></p>
          <p><strong>बैंक खाता डीबीटी:</strong> <span style="color:#287C49;">NPCI लिंक्ड एवं सक्रिय</span></p>
          <p><strong>भूमि विवरण (Land Seeding):</strong> <span style="color:#287C49;">सत्यापित</span></p>
          <p><strong>आगामी किस्त स्थिति:</strong> FTO Generated - भुगतान प्रक्रियाधीन</p>
        </div>
      </div>`
    );
  });
}

/* ==========================================================================
   6. Service Modals (8 Primary + 12 Drawer Services)
   ========================================================================== */
const serviceData = {
  status: {
    title: "किस्त एवं आवेदन स्थिति",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>अपनी पिछली एवं आगामी किस्तों का विवरण व बैंक अंतरण स्थिति जांचें।</p>
      <div style="background:#F2F5EB; padding:14px; border-radius:12px; border:1px solid #CCD5C0; display:flex; flex-direction:column; gap:6px;">
        <p><strong>वर्तमान स्थिति:</strong> <span style="color:#287C49; font-weight:600;">सक्रिय (Active)</span></p>
        <p><strong>आधार e-KYC:</strong> सत्यापित</p>
        <p><strong>बैंक खाता:</strong> NPCI / DBT लिंक्ड</p>
        <p><strong>अंतिम किस्त:</strong> ₹2,000 सफल अंतरण</p>
      </div>
    </div>`
  },
  ekyc: {
    title: "आधार e-KYC सत्यापन",
    html: `<div style="display:flex; flex-direction:column; gap:14px;">
      <p>अपने 12 अंकों के आधार नंबर द्वारा OTP आधारित निःशुल्क e-KYC पूरा करें।</p>
      <input type="text" maxlength="12" placeholder="12 अंकों का आधार नंबर दर्ज करें" style="width:100%; height:48px; padding:0 14px; border:1.8px solid #CCD5C0; border-radius:12px; font-size:1.05rem;">
      <button type="button" onclick="alert('आधार लिंक्ड मोबाइल पर OTP भेजा गया है।')" style="height:48px; background:#38422B; color:#fff; border:none; border-radius:12px; font-weight:600; font-size:1.05rem; cursor:pointer;">OTP भेजें</button>
      <p style="font-size:0.88rem; color:#56644D;">* यदि बायोमेट्रिक से करना है तो नजदीकी CSC केंद्र पर संपर्क करें।</p>
    </div>`
  },
  registration: {
    title: "नया किसान पंजीकरण",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>नए किसान साथी पोर्टल पर अपना पंजीकरण कराएं।</p>
      <input type="text" placeholder="किसान का पूरा नाम (आधार अनुसार)" style="width:100%; height:46px; padding:0 14px; border:1.5px solid #CCD5C0; border-radius:12px;">
      <input type="tel" placeholder="मोबाइल नंबर" style="width:100%; height:46px; padding:0 14px; border:1.5px solid #CCD5C0; border-radius:12px;">
      <input type="text" placeholder="राज्य व जिला चुनें" style="width:100%; height:46px; padding:0 14px; border:1.5px solid #CCD5C0; border-radius:12px;">
      <button type="button" onclick="alert('पंजीकरण फॉर्म प्रक्रिया आगे बढ़ाई गई है।')" style="height:48px; background:#38422B; color:#fff; border:none; border-radius:12px; font-weight:600; font-size:1.05rem; cursor:pointer;">पंजीकरण आगे बढ़ाएं</button>
    </div>`
  },
  schemes: {
    title: "प्रमुख सरकारी कृषि योजनाएं",
    html: `<div style="display:flex; flex-direction:column; gap:10px;">
      <div style="padding:12px; border:1.5px solid #CCD5C0; border-radius:12px; background:#FBFDF6;">
        <strong style="color:#38422B;">1. प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)</strong>
        <p style="font-size:0.92rem; color:#56644D; margin-top:3px;">₹6,000 प्रति वर्ष (₹2,000 की 3 समान किस्तों में) सीधे बैंक खाते में।</p>
      </div>
      <div style="padding:12px; border:1.5px solid #CCD5C0; border-radius:12px; background:#FBFDF6;">
        <strong style="color:#38422B;">2. प्रधानमंत्री फसल बीमा योजना (PMFBY)</strong>
        <p style="font-size:0.92rem; color:#56644D; margin-top:3px;">बाढ़, सूखा व कीट प्रकोप से फसल क्षति पर न्यूनतम प्रीमियम में अधिकतम बीमा सुरक्षा।</p>
      </div>
      <div style="padding:12px; border:1.5px solid #CCD5C0; border-radius:12px; background:#FBFDF6;">
        <strong style="color:#38422B;">3. किसान क्रेडिट कार्ड (KCC)</strong>
        <p style="font-size:0.92rem; color:#56644D; margin-top:3px;">4% की सस्ती ब्याज दर पर ₹3 लाख तक कृषि कार्य हेतु आसान ऋण।</p>
      </div>
      <div style="padding:12px; border:1.5px solid #CCD5C0; border-radius:12px; background:#FBFDF6;">
        <strong style="color:#38422B;">4. प्रधानमंत्री कृषि सिंचाई योजना</strong>
        <p style="font-size:0.92rem; color:#56644D; margin-top:3px;">ड्रिप व स्प्रिंकलर सिंचाई यंत्रों पर 55% तक सरकारी सब्सिडी।</p>
      </div>
    </div>`
  },
  payment: {
    title: "भुगतान स्थिति एवं डीबीटी विवरण",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>अपने बैंक खाते में भेजी गई सरकारी सहायता राशि का विवरण देखें।</p>
      <div style="background:#F2F5EB; padding:14px; border-radius:12px; border:1px solid #CCD5C0; display:flex; flex-direction:column; gap:8px;">
        <p><strong>डीबीटी स्थिति:</strong> <span style="color:#287C49; font-weight:600;">सफल (Payment Success)</span></p>
        <p><strong>बैंक का नाम:</strong> स्टेट बैंक ऑफ इंडिया</p>
        <p><strong>खाता संख्या:</strong> ******3842</p>
        <p><strong>यूटीआर / रेफरेंस नंबर:</strong> 202608298912</p>
      </div>
    </div>`
  },
  eligibility: {
    title: "पात्रता एवं नियम व शर्तें",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>योजनाओं के लाभ हेतु अनिवार्य योग्यता एवं नियम:</p>
      <ul style="padding-left:20px; line-height:1.7; color:#21291B;">
        <li>किसान के नाम पर कृषि योग्य भूमि का मालिकाना हक (खसरा/खतौनी)।</li>
        <li>आधार कार्ड मोबाइल नंबर से लिंक होना अनिवार्य।</li>
        <li>बैंक खाता आधार एवं NPCI से डीबीटी हेतु सक्रिय होना चाहिए।</li>
        <li>संस्थागत किसान या आयकर दाता इस योजना के पात्र नहीं हैं।</li>
      </ul>
      <div style="background:#FBFDF6; padding:10px 14px; border-radius:10px; border:1px solid #CCD5C0; font-size:0.92rem; color:#56644D;">
        💡 सहायता हेतु अपने नजदीकी कृषि पर्यवेक्षक या लेखपाल से भी संपर्क कर सकते हैं।
      </div>
    </div>`
  },
  documents: {
    title: "जरूरी दस्तावेज सूची",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>कृषि योजनाओं एवं सेवाओं के लिए आवश्यक मुख्य दस्तावेज:</p>
      <div style="background:#F2F5EB; padding:14px; border-radius:12px; border:1px solid #CCD5C0; display:flex; flex-direction:column; gap:8px;">
        <p><strong>1. आधार कार्ड:</strong> मोबाइल नंबर से लिंक होना आवश्यक</p>
        <p><strong>2. भू-अभिलेख (खतौनी / खसरा):</strong> कृषि योग्य जमीन का अद्यतन रिकॉर्ड</p>
        <p><strong>3. बैंक पासबुक:</strong> आधार व NPCI से DBT सक्रिय बैंक खाता</p>
        <p><strong>4. मोबाइल नंबर:</strong> OTP सत्यापन एवं SMS सूचनाओं हेतु सक्रिय नंबर</p>
        <p><strong>5. पासपोर्ट साइज फोटो:</strong> नवीनतम रंगीन फोटो</p>
      </div>
      <div style="background:#FBFDF6; padding:10px 14px; border-radius:10px; border:1px solid #CCD5C0; font-size:0.92rem; color:#56644D;">
        💡 यदि कोई दस्तावेज अपडेट करना है तो नजदीकी CSC केंद्र या कृषि अधिकारी से संपर्क करें।
      </div>
    </div>`
  },
  crops: {
    title: "फसल सलाह व कीट प्रबंधन",
    html: `<p>आपकी मिट्टी एवं मौसम के अनुकूल खरीफ व रबी फसलों की वैज्ञानिक देखरेख, उर्वरक चक्र एवं जैविक कीट नियंत्रण की सलाह।</p>`
  },
  weather: {
    title: "मौसम पूर्वानुमान (7 दिवस)",
    html: `<div style="display:flex; flex-direction:column; gap:10px;">
      <p>तापमान: <strong>28°C - 34°C</strong> | आर्द्रता: <strong>65%</strong></p>
      <p style="color:#287C49; font-weight:600;">अगले 48 घंटों में हल्की से मध्यम वर्षा की संभावना। कीटनाशक छिड़काव अभी रोकें।</p>
    </div>`
  },
  fertilizer: {
    title: "उर्वरक एवं पोषक तत्व गणना",
    html: `<p>प्रति एकड़ यूरिया, डीएपी (DAP), पोटाश (MOP) एवं सूक्ष्म पोषक तत्वों की सटीक वैज्ञानिक मात्रा की गणना करें।</p>`
  },
  calculator: {
    title: "कृषि कैलकुलेटर",
    html: `<p>बीज दर, भूमि माप (बीघा, एकड़, हेक्टेयर) एवं प्रति एकड़ अनुमानित उत्पादन लागत का सरल व सटीक हिसाब।</p>`
  },
  notifications: {
    title: "ताज़ा सरकारी सूचनाएं व अलर्ट",
    html: `<p>कृषि विभाग की नई घोषणाएं, बीज सब्सिडी, बिजली कनेक्शन एवं मौसम की चेतावनी सूचनाएं।</p>`
  },
  help: {
    title: "किसान सहायता केंद्र एवं हेल्पलाइन",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>किसान भाई किसी भी तकनीकी या योजना संबंधी समस्या के लिए संपर्क करें:</p>
      <div style="background:#38422B; color:#fff; padding:16px; border-radius:14px; text-align:center;">
        <p style="font-size:0.95rem; opacity:0.9;">राष्ट्रीय किसान कॉल सेंटर (Toll-Free)</p>
        <h3 style="font-size:1.8rem; font-weight:700; margin:4px 0; color:#9FB873;">1800-180-1551</h3>
        <p style="font-size:0.9rem; opacity:0.85;">समय: सुबह 6:00 से रात 10:00 बजे (सातों दिन)</p>
      </div>
    </div>`
  },
  videos: {
    title: "कृषि वीडियो व ट्यूटोरियल",
    html: `<p>आधुनिक कृषि यंत्र, जैविक खाद निर्माण, पॉलीहाउस एवं उन्नत बागवानी तकनीकों के सरल वीडियो देखें।</p>`
  },
  profile: {
    title: "किसान प्रोफाइल व दस्तावेज",
    html: `<div style="display:flex; flex-direction:column; gap:10px;">
      <p><strong>नाम:</strong> किसान साथी</p>
      <p><strong>पंजीकरण स्थिति:</strong> सत्यापित (Verified)</p>
      <p><strong>आधार स्थिति:</strong> लिंक्ड</p>
      <p><strong>भूमि विवरण:</strong> 2.4 एकड़ दर्ज</p>
      <button type="button" style="height:44px; background:#38422B; color:#fff; border:none; border-radius:10px; font-weight:600; cursor:pointer; margin-top:8px;">दस्तावेज अपडेट करें</button>
    </div>`
  }
};

function initServiceModals() {
  const toolBtns = document.querySelectorAll('[data-tool]');
  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const toolKey = btn.dataset.tool;
      const data = serviceData[toolKey];
      if (data) {
        openModal(data.title, data.html);
      }
    });
  });

  const modalBackdrop = document.getElementById('modal-backdrop');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }
}

function openModal(title, contentHtml) {
  const backdrop = document.getElementById('modal-backdrop');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');

  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = contentHtml;
  if (backdrop) backdrop.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) backdrop.classList.remove('active');
  document.body.classList.remove('modal-open');
}

/* ==========================================================================
   7. Quick Information & Reset
   ========================================================================== */
function initBottomLinks() {
  const infoBtns = document.querySelectorAll('[data-info]');
  const resetBtn = document.getElementById('reset-btn');

  const infoTexts = {
    genuine: {
      title: "क्या असली है (Authenticity Verification)",
      html: `<div style="display:flex; flex-direction:column; gap:10px;">
        <p>adchan पोर्टल पर सभी सूचनाएं, योजनाएं और पात्रता शर्तें केवल आधिकारिक एवं प्रामाणिक स्रोतों के आधार पर संकलित की जाती हैं।</p>
        <p>किसी भी अनधिकृत लिंक या कॉल पर अपना ओटीपी या बैंक पासवर्ड साझा न करें।</p>
      </div>`
    },
    how: {
      title: "कैसे काम करता है (How It Works)",
      html: `<div style="display:flex; flex-direction:column; gap:10px;">
        <p>1. अपना रजिस्ट्रेशन नंबर दर्ज करें या बोलकर बताएं।</p>
        <p>2. पोर्टल तुरंत आपके आधार e-KYC और बैंक खाते की स्थिति जांचेगा।</p>
        <p>3. एक क्लिक में अपनी पात्रता और आगामी किस्त की जानकारी प्राप्त करें।</p>
      </div>`
    },
    research: {
      title: "शोध एवं वैज्ञानिक कृषि सलाह",
      html: `<div style="display:flex; flex-direction:column; gap:10px;">
        <p>भारतीय कृषि अनुसंधान परिषद (ICAR) और राज्य कृषि विश्वविद्यालयों के शोध पर आधारित तकनीकी सलाह।</p>
        <p>मिट्टी स्वास्थ्य कार्ड के अनुसार संतुलित खाद का प्रयोग करें।</p>
      </div>`
    }
  };

  infoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.info;
      const info = infoTexts[key];
      if (info) openModal(info.title, info.html);
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const input = document.getElementById('reg-input');
      if (input) input.value = '';
      openModal("डेमो रीसेट", "<p style='color:#287C49; font-weight:600;'>✓ पोर्टल डेमो सफलतापूर्वक रीसेट कर दिया गया है।</p>");
    });
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
