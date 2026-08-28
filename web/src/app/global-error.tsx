"use client";

import Link from "@/components/PlainLink";


export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="hi">
      <body style={{ margin: 0, background: "#F2F4ED", color: "#21291B", font: "19px/1.6 sans-serif" }}>
        <header style={{ borderBottom: "1px solid #CCD5C0", background: "#FFFFFF" }}>
          <div style={{ maxWidth: 560, margin: "auto", padding: "16px 20px" }}>
            <strong>अड़चन</strong>
            <p style={{ margin: "4px 0 0", fontSize: 15 }}>स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।</p>
          </div>
        </header>
        <main style={{ maxWidth: 560, minHeight: "60vh", margin: "auto", padding: "32px 20px" }}>
          <section style={{ border: "2px solid #CCD5C0", borderRadius: 22, background: "#FBFDF6", padding: 20 }}>
            <h1>अभी पन्ना नहीं खुल पाया</h1>
            <p>कोई जानकारी बदली नहीं है। दोबारा कोशिश करें या ऑनलाइन सेवा बंद होने पर भी चलने वाले तैयार नमूना निदान देखें।</p>
            <button type="button" onClick={reset} style={{ minHeight: 56, border: 0, borderRadius: 14, padding: "12px 20px", color: "#FFFFFF", background: "#38422B", font: "inherit", fontWeight: 700 }}>
              पन्ना फिर खोलें
            </button>
            <p><Link href="/#demo-numbers" style={{ display: "inline-flex", minHeight: 56, alignItems: "center", color: "inherit", fontWeight: 700 }}>नमूना निदान देखें</Link></p>
          </section>
        </main>
        <footer style={{ borderTop: "1px solid #CCD5C0" }}>
          <p style={{ maxWidth: 560, margin: "auto", padding: "20px" }}>स्वतंत्र प्रोटोटाइप — किसी सरकारी संस्था से संबंधित नहीं।</p>
        </footer>
      </body>
    </html>
  );
}
