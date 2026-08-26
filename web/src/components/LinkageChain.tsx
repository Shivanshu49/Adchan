import { Fragment } from "react";

import MockBadge from "@/components/MockBadge";
import type { Linkage } from "@/types/personas";


interface LinkageChainProps {
  linkage: Linkage;
  brokenLink: string;
}

const LINKS: ReadonlyArray<{
  key: keyof Linkage;
  brokenLink: string;
  hi: string;
  en: string;
}> = [
  { key: "aadhaarSeeded", brokenLink: "aadhaar", hi: "आधार", en: "Aadhaar" },
  { key: "bankLinked", brokenLink: "bank", hi: "बैंक", en: "Bank" },
  { key: "landSeeded", brokenLink: "land", hi: "ज़मीन", en: "Land" },
  { key: "ekycDone", brokenLink: "ekyc", hi: "eKYC", en: "eKYC" },
];


export default function LinkageChain({ linkage, brokenLink }: LinkageChainProps) {
  const eligibilityCase = brokenLink === "eligibility";
  const brokenIndex = eligibilityCase
    ? -1
    : LINKS.findIndex((item) => item.brokenLink === brokenLink || !linkage[item.key]);
  const severedConnector = brokenIndex < 0 ? -1 : brokenIndex === 0 ? 0 : brokenIndex - 1;

  return (
    <section className="print-card" aria-labelledby="chain-title">
      <div className="flex flex-wrap items-center gap-2">
        <p className="section-label">रिकॉर्ड की कड़ियाँ</p>
        <MockBadge hi="नमूना जुड़ाव" />
      </div>
      <h2 id="chain-title" className="mt-2 text-[28px] font-semibold leading-[1.3] text-[var(--ink)]">
        पैसा कहाँ अटका है?
      </h2>
      <p className="secondary-copy mt-1" lang="en">
        The four records a payment passes through
      </p>

      <ol className="chain" aria-label="आधार, बैंक, ज़मीन और eKYC की जुड़ाव स्थिति">
        {LINKS.map((item, index) => {
          const linked = linkage[item.key];
          const isBroken = index === brokenIndex;

          return (
            <Fragment key={item.key}>
              <li className={`chain-node ${isBroken ? "chain-node-broken" : "chain-node-working"}`}>
                <span className="chain-state-mark" aria-hidden="true">{linked ? "✓" : "×"}</span>
                <span>
                  <strong className="block text-[24px] font-semibold leading-tight">{item.hi}</strong>
                  <span className="secondary-copy block" lang="en">{item.en}</span>
                  <span className="mt-2 block text-[19px] font-semibold">
                    {linked ? "जुड़ा है" : "टूटा है"}
                  </span>
                </span>
              </li>

              {index < LINKS.length - 1 && (
                <li
                  className={`chain-connector ${index === severedConnector ? "chain-connector-severed" : "chain-connector-intact"}`}
                  aria-label={index === severedConnector ? "यह कड़ी टूटी है" : "यह कड़ी जुड़ी है"}
                >
                  {index === severedConnector ? (
                    <>
                      <span className="chain-segment" aria-hidden="true" />
                      <span className="chain-break-label"><span aria-hidden="true">×</span> कड़ी टूटी</span>
                      <span className="chain-segment" aria-hidden="true" />
                    </>
                  ) : (
                    <span className="chain-solid" aria-hidden="true" />
                  )}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>

      {eligibilityCase && (
        <div className="eligibility-note">
          <p className="text-[22px] font-semibold leading-[1.5]">
            आपकी सारी कड़ियाँ जुड़ी हैं। दिक्कत कहीं और है।
          </p>
          <p className="secondary-copy mt-2" lang="en">
            All four links work; an eligibility check is blocking this payment.
          </p>
        </div>
      )}
    </section>
  );
}
