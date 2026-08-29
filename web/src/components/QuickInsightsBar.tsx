"use client";

import React from "react";
import Link from "@/components/PlainLink";
import { resetDemoState } from "@/actions/mock-auth";

export default function QuickInsightsBar() {
  return (
    <section className="quick-insights-bar" aria-label="पोर्टल जानकारी">
      <Link href="/whats-real" prefetch={false} className="quick-link-btn">
        <span className="material-symbols-outlined b-icon" aria-hidden="true">
          verified_user
        </span>
        <span>क्या असली है</span>
      </Link>
      <Link href="/how-it-works" prefetch={false} className="quick-link-btn">
        <span className="material-symbols-outlined b-icon" aria-hidden="true">
          help
        </span>
        <span>कैसे काम करता है</span>
      </Link>
      <Link href="/research" prefetch={false} className="quick-link-btn">
        <span className="material-symbols-outlined b-icon" aria-hidden="true">
          menu_book
        </span>
        <span>शोध एवं सलाह</span>
      </Link>
      <form action={resetDemoState} className="inline-flex">
        <button type="submit" className="quick-link-btn reset-action" id="reset-btn">
          <span className="material-symbols-outlined b-icon" aria-hidden="true">
            restart_alt
          </span>
          <span>डेमो रीसेट करें</span>
        </button>
      </form>
    </section>
  );
}
