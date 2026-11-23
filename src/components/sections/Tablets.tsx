/* Tablets of the Customers — the owner-provided artifact, embedded
   verbatim (public/artifacts/tablets.html) inside an isolated frame so
   the section renders exactly as the demo. Relative src resolves under
   the GitHub Pages base path (/kairo/). */
export default function Tablets() {
  return (
    <section id="tablets" data-section="tablets" className="bg-sand">
      <iframe
        src="artifacts/tablets.html"
        title="Tablets of the Customers — carved testimonial carousel"
        className="block w-full border-0"
        style={{ height: "min(92vh, 860px)", minHeight: 560 }}
        loading="lazy"
      />
    </section>
  );
}
