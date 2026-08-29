import Image from "next/image";
import type { ReactNode } from "react";

import ApiWarmup from "@/components/ApiWarmup";
import DemoRegistrationList from "@/components/DemoRegistrationList";
import MockBadge from "@/components/MockBadge";
import ServiceIcon from "@/components/ServiceIcon";
import VoiceComplaint from "@/components/VoiceComplaint";
import schemes from "@/lib/schemes";
import personas from "@/types/personas";


interface HomeProps {
  searchParams: Promise<{ reset?: string }>;
}


interface ServiceCardProps {
  title: string;
  titleKey: string;
  description: string;
  descriptionKey: string;
  icon: ReactNode;
  href: string;
}


function ServiceCard({ title, titleKey, description, descriptionKey, icon, href }: ServiceCardProps) {
  return (
    <a className="service-card" href={href}>
      <span className="service-icon" aria-hidden="true">{icon}</span>
      <strong data-i18n={titleKey}>{title}</strong>
      <span data-i18n={descriptionKey}>{description}</span>
    </a>
  );
}


export default async function Home({ searchParams }: HomeProps) {
  const { reset } = await searchParams;

  return (
    <main id="main-content" className="page-shell home-page">
      <ApiWarmup />
      {reset === "done" && (
        <p role="status" className="state-working home-alert" data-i18n="home.reset">
          इस ब्राउज़र का डेमो साफ़ हो गया। अब किसी भी नमूना नंबर से फिर शुरू करें।
        </p>
      )}

      <section className="home-hero" aria-labelledby="landing-question">
        <div className="home-hero-copy">
          <p className="home-eyebrow"><span aria-hidden="true" /><span data-i18n="home.eyebrow">डिजिटल किसान सेवा केंद्र</span></p>
          <h1 id="landing-question"><span data-i18n="home.greeting">नमस्ते किसान!</span> <span className="greeting-wave" aria-hidden="true">👋</span></h1>
          <p className="home-intro" data-i18n="home.intro">PM-KISAN किस्त कहाँ रुकी और अब क्या करना है—साफ़ हिंदी में जानिए।</p>

          <form id="registration" action="/status" method="get" className="home-registration-card">
            <label htmlFor="regNo" className="home-registration-label">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5V3m8 2V3M6 7h12m-1 14H7a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3Z"/><circle cx="9" cy="12" r="2"/><path d="M7 17c.8-2 3.2-2 4 0m3-5h3m-3 4h3"/></svg>
              <span data-i18n="home.registration.label">रजिस्ट्रेशन नंबर डालिए</span>
            </label>
            <div className="home-registration-row">
              <div className="home-input-wrap">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg>
                <input
                  id="regNo"
                  name="regNo"
                  type="text"
                  required
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="रजिस्ट्रेशन नंबर (उदा. UP-DEMO-0001)"
                  data-i18n-placeholder="home.registration.placeholder"
                  aria-describedby="reg-help"
                />
              </div>
              <button type="submit" className="home-search-button" data-i18n="home.registration.search">खोजें</button>
            </div>
            <p id="reg-help" className="home-security-note">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 7 3v5c0 5-2.6 8.4-7 10-4.4-1.6-7-5-7-10V6l7-3Z"/><path d="m9 12 2 2 4-5"/></svg>
              <span data-i18n="home.registration.security">कोई लॉगिन नहीं, कोई कैप्चा नहीं। आपकी जानकारी सुरक्षित है।</span>
            </p>
          </form>
        </div>

        <div className="home-hero-side">
          <div className="home-banner">
            <Image
              src="/adchan-home-banner.webp"
              alt="नमस्ते किसान — आसान जानकारी, सही समय पर"
              fill
              sizes="(max-width: 900px) calc(100vw - 28px), 560px"
              priority
            />
          </div>
          <VoiceComplaint
            matches={personas.map((persona) => ({
              code: persona.failureCode,
              regNo: persona.regNo,
            }))}
          />
        </div>
      </section>

      <section id="services" className="home-services" aria-labelledby="services-title">
        <div className="home-section-heading">
          <div>
            <h2 id="services-title" data-i18n="home.services.title">मुख्य किसान सेवाएं</h2>
            <p data-i18n="home.services.subtitle">अपनी आवश्यकता अनुसार सेवा चुनें और तुरंत विवरण देखें</p>
          </div>
          <a href="#all-services"><span data-i18n="home.services.all">सभी 12 सेवाएं देखें</span> <span aria-hidden="true">→</span></a>
        </div>

        <div id="all-services" className="services-grid">
          <ServiceCard href="#registration" title="स्थिति" titleKey="service.status.title" description="किस्त व आवेदन स्थिति" descriptionKey="service.status.description" icon={<ServiceIcon name="money" />} />
          <ServiceCard href="#registration" title="e-KYC" titleKey="service.ekyc.title" description="आधार OTP सत्यापन" descriptionKey="service.ekyc.description" icon={<ServiceIcon name="shield" />} />
          <ServiceCard href="#registration" title="पंजीकरण" titleKey="service.registration.title" description="नया किसान पंजीकरण" descriptionKey="service.registration.description" icon={<ServiceIcon name="register" />} />
          <ServiceCard href="#schemes" title="योजनाएं" titleKey="service.schemes.title" description="पीएम किसान व अन्य" descriptionKey="service.schemes.description" icon={<ServiceIcon name="building" />} />
          <ServiceCard href="#registration" title="भुगतान स्थिति" titleKey="service.payment.title" description="DBT व बैंक ट्रांसफर" descriptionKey="service.payment.description" icon={<ServiceIcon name="card" />} />
          <ServiceCard href="#eligibility" title="पात्रता" titleKey="service.eligibility.title" description="शर्तें व जरूरी दस्तावेज" descriptionKey="service.eligibility.description" icon={<ServiceIcon name="checklist" />} />
          <ServiceCard href="#help" title="सहायता" titleKey="service.help.title" description="टोल-फ्री 1800-180-1551" descriptionKey="service.help.description" icon={<ServiceIcon name="help" />} />
          <ServiceCard href="#help" title="मौसम" titleKey="service.weather.title" description="स्थानीय पूर्वानुमान जानकारी" descriptionKey="service.weather.description" icon={<ServiceIcon name="weather" />} />
        </div>
      </section>

      <section className="home-info-grid">
        <article id="schemes" className="home-info-card">
          <h2><ServiceIcon name="building" /> <span data-i18n="home.schemes.title">प्रमुख योजनाएं</span></h2>
          <div className="home-info-list">
            {schemes.slice(0, 3).map((scheme) => (
              <div key={scheme.id}>
                <h3 data-i18n={`scheme.${scheme.id}.name`}>{scheme.name.hi}</h3>
                <p data-i18n={`scheme.${scheme.id}.purpose`}>{scheme.purpose.hi}</p>
              </div>
            ))}
          </div>
          <a className="home-info-cta" href="#help">
            <span data-i18n="home.schemes.cta">सभी योजनाएं देखें</span>
            <span aria-hidden="true">→</span>
          </a>
        </article>

        <article id="eligibility" className="home-info-card">
          <h2><ServiceIcon name="checklist" /> <span data-i18n="home.result.title">जाँच में क्या मिलेगा</span></h2>
          <div className="home-info-list">
            <div>
              <h3 data-i18n="home.result.reason.title">रुकी किस्त का साफ कारण</h3>
              <p data-i18n="home.result.reason.description">तकनीकी स्थिति को आसान हिंदी में समझाया जाएगा।</p>
            </div>
            <div>
              <h3 data-i18n="home.result.office.title">सही कार्यालय और दस्तावेज</h3>
              <p data-i18n="home.result.office.description">निदान के अनुसार जाने की जगह और जरूरी कागज़ दिखेंगे।</p>
            </div>
            <div>
              <h3 data-i18n="home.result.script.title">क्या बोलना है</h3>
              <p data-i18n="home.result.script.description">काउंटर पर कहने के लिए तैयार हिंदी स्क्रिप्ट मिलेगी।</p>
            </div>
          </div>
          <a className="home-info-cta" href="#registration">
            <span data-i18n="home.result.cta">पात्रता जाँचें</span>
            <span aria-hidden="true">→</span>
          </a>
        </article>
      </section>

      <section id="help" className="home-demo-panel" aria-labelledby="demo-title">
        <div className="home-section-heading">
          <div>
            <h2 id="demo-title" data-i18n="home.demo.title">नमूना किसान से जाँचें</h2>
            <p data-i18n="home.demo.description">किसी नंबर को चुनकर पूरा निदान, कार्यालय और दस्तावेज देखें।</p>
          </div>
          <MockBadge />
        </div>
        <DemoRegistrationList compact />
      </section>
    </main>
  );
}
