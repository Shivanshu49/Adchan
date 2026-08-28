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
});

/* ==========================================================================
   1. Language Switcher
   ========================================================================== */
function initLanguageSwitcher() {
  const langBox = document.getElementById('lang-box');
  const langBtn = document.getElementById('lang-btn');
  const curLang = document.getElementById('cur-lang');
  const options = document.querySelectorAll('.lang-opt');

  if (!langBox || !langBtn) return;

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langBox.classList.toggle('open');
  });

  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      curLang.textContent = opt.textContent;
      langBox.classList.remove('open');
    });
  });

  document.addEventListener('click', () => {
    langBox.classList.remove('open');
  });
}

/* ==========================================================================
   2. Profile Drawer (Housing all 12 Services)
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
    if (e.key === 'Escape') closeDrawer();
  });
}

/* ==========================================================================
   3. Voice Assistant (Strictly Opens ONLY on User Click)
   ========================================================================== */
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

  function startListening() {
    if (!SpeechRec) {
      if (subHeading) subHeading.textContent = "आपका ब्राउज़र वॉयस इनपुट को सपोर्ट नहीं करता। कृपया बोलकर या लिखकर खोजें।";
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
      };

      recognition.onerror = () => {
        if (subHeading) subHeading.textContent = "आवाज़ स्पष्ट नहीं आई, कृपया पुनः प्रयास करें।";
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

/* ==========================================================================
   4. Registration Number Search
   ========================================================================== */
function initRegistrationSearch() {
  const form = document.getElementById('reg-form');
  const input = document.getElementById('reg-input');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();

    if (!query) {
      openModal("पंजीकरण खोज", "<p style='color:#C53030;'>कृपया अपना रजिस्ट्रेशन नंबर दर्ज करें।</p>");
      return;
    }

    openModal(
      "पंजीकरण स्थिति",
      `<div style="display:flex; flex-direction:column; gap:10px;">
        <p><strong>रजिस्ट्रेशन नंबर:</strong> ${escapeHtml(query)}</p>
        <p style="color:#287C49; font-weight:600;">✓ पंजीकरण सत्यापित और सक्रिय है</p>
        <p>अगली किस्त का विवरण एवं आधार e-KYC की स्थिति ठीक है।</p>
      </div>`
    );
  });
}

/* ==========================================================================
   5. Service Modals (Starting 4 on Home + 12 in Profile Drawer)
   ========================================================================== */
const serviceData = {
  status: {
    title: "स्थिति (Status)",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>अपनी पिछली व आगामी किस्तों की स्थिति जांचें।</p>
      <div style="background:#F2F5EB; padding:12px; border-radius:12px; border:1px solid #CCD5C0;">
        <p><strong>वर्तमान स्थिति:</strong> सक्रिय (Active)</p>
        <p><strong>आधार सत्यापन:</strong> सफल</p>
        <p><strong>बैंक खाता:</strong> NPCI लिंक्ड</p>
      </div>
    </div>`
  },
  ekyc: {
    title: "e-KYC सत्यापन",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>अपने आधार नंबर द्वारा OTP आधारित e-KYC पूरा करें।</p>
      <input type="text" placeholder="12 अंकों का आधार नंबर दर्ज करें" style="width:100%; height:44px; padding:0 12px; border:1.5px solid #CCD5C0; border-radius:10px; font-size:1rem;">
      <button type="button" style="height:44px; background:#38422B; color:#fff; border:none; border-radius:10px; font-weight:600; font-size:1rem; cursor:pointer;">OTP भेजें</button>
    </div>`
  },
  registration: {
    title: "नया किसान पंजीकरण",
    html: `<div style="display:flex; flex-direction:column; gap:12px;">
      <p>नए किसान पोर्टल पर अपना पंजीकरण दर्ज करवाएं।</p>
      <input type="text" placeholder="किसान का पूरा नाम" style="width:100%; height:44px; padding:0 12px; border:1.5px solid #CCD5C0; border-radius:10px;">
      <input type="tel" placeholder="मोबाइल नंबर" style="width:100%; height:44px; padding:0 12px; border:1.5px solid #CCD5C0; border-radius:10px;">
      <button type="button" style="height:44px; background:#38422B; color:#fff; border:none; border-radius:10px; font-weight:600; font-size:1rem; cursor:pointer;">आगे बढ़ें</button>
    </div>`
  },
  schemes: {
    title: "सरकारी योजनाएं",
    html: `<div style="display:flex; flex-direction:column; gap:8px;">
      <div style="padding:10px; border:1px solid #CCD5C0; border-radius:10px;">
        <strong>प्रधानमंत्री किसान सम्मान निधि</strong>
        <p style="font-size:0.9rem; color:#56644D;">₹6,000 प्रति वर्ष 3 समान किस्तों में।</p>
      </div>
      <div style="padding:10px; border:1px solid #CCD5C0; border-radius:10px;">
        <strong>प्रधानमंत्री फसल बीमा योजना</strong>
        <p style="font-size:0.9rem; color:#56644D;">प्राकृतिक आपदाओं से फसलों का व्यापक बीमा।</p>
      </div>
      <div style="padding:10px; border:1px solid #CCD5C0; border-radius:10px;">
        <strong>किसान क्रेडिट कार्ड (KCC)</strong>
        <p style="font-size:0.9rem; color:#56644D;">कम ब्याज दर पर 3 लाख तक की ऋण सुविधा।</p>
      </div>
    </div>`
  },
  crops: {
    title: "फसल सलाह (Crops)",
    html: `<p>आपकी मिट्टी और मौसम के अनुकूल खरीफ व रबी फसलों की वैज्ञानिक देखरेख एवं कीट नियंत्रण की जानकारी।</p>`
  },
  weather: {
    title: "मौसम पूर्वानुमान",
    html: `<p>अगले 7 दिनों का तापमान, वर्षा और हवा की गति का सटीक पूर्वानुमान।</p>`
  },
  fertilizer: {
    title: "उर्वरक एवं पोषण",
    html: `<p>यूरिया, डीएपी और पोटाश की फसलवार अनुशंसित मात्रा की गणना करें।</p>`
  },
  calculator: {
    title: "कृषि कैलकुलेटर",
    html: `<p>बीज दर, भूमि माप (बीघा/एकड़/हेक्टेयर) एवं उत्पादन लागत का सटीक हिसाब।</p>`
  },
  notifications: {
    title: "ताज़ा सूचनाएं",
    html: `<p>कृषि विभाग की नई घोषणाएं, एडवाइजरी और मौसम चेतावनियां।</p>`
  },
  help: {
    title: "किसान सहायता केंद्र",
    html: `<p>टोल-फ्री हेल्पलाइन: <strong>1800-180-1551</strong> (सुबह 6 से रात 10 बजे तक)</p>`
  },
  videos: {
    title: "कृषि वीडियो व ट्यूटोरियल",
    html: `<p>आधुनिक कृषि तकनीकों और जैविक खेती के ज्ञानवर्धक वीडियो।</p>`
  },
  profile: {
    title: "किसान प्रोफाइल",
    html: `<p>अपनी व्यक्तिगत जानकारी, भूमि दस्तावेज और बैंक खाता प्रबंधित करें।</p>`
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
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
   6. Bottom Quick Links
   ========================================================================== */
function initBottomLinks() {
  const infoBtns = document.querySelectorAll('[data-info]');
  const resetBtn = document.getElementById('reset-btn');

  const infoTexts = {
    genuine: {
      title: "क्या असली है (Authenticity)",
      html: "<p>adchan पोर्टल पर दी गई सभी सूचनाएं और योजनाएं प्रामाणिक एवं आधिकारिक स्रोतों पर आधारित हैं।</p>"
    },
    how: {
      title: "कैसे काम करता है (How It Works)",
      html: "<p>अपना रजिस्ट्रेशन नंबर दर्ज करें या बोलकर बताएं। पोर्टल आपको तुरंत सही व सटीक जानकारी उपलब्ध कराएगा।</p>"
    },
    research: {
      title: "शोध एवं नवाचार (Research)",
      html: "<p>भारतीय कृषि अनुसंधान परिषद (ICAR) और राज्य कृषि विश्वविद्यालयों के शोध पर आधारित तकनीकी सलाह।</p>"
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
      openModal("रीसेट", "<p>फॉर्म सफलतापूर्वक रीसेट कर दिया गया है।</p>");
    });
  }
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
