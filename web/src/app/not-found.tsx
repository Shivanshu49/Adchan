import Link from "@/components/PlainLink";


export default function NotFound() {
  return (
    <main id="main-content" className="page-shell">
      <section className="document-card p-5 sm:p-6">
        <p className="section-label">पन्ना नहीं मिला</p>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.35]">यह पता अड़चन में मौजूद नहीं है</h1>
        <p className="mt-4 text-[19px] leading-[1.6]">
          कोई जानकारी बदली नहीं है। मुखपृष्ठ पर आठ काल्पनिक नंबरों से तैयार निदान अभी भी देख सकते हैं।
        </p>
        <Link href="/#demo-numbers" className="primary-action mt-6 w-full">नमूना निदान देखें</Link>
      </section>
    </main>
  );
}
