import Reveal from "./Reveal";

/** Gemensam sidhuvud-block för undersidorna. */
export default function PageHead({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="relative overflow-hidden pb-8 pt-40 md:pt-52">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(46% 52% at 68% 12%, rgba(0,229,255,0.11), transparent 66%)",
        }}
      />
      <div className="shell">
        <Reveal as="p" className="eyebrow">
          {eyebrow}
        </Reveal>
        <Reveal as="h1" delay={80} className="display-lg mt-5 max-w-[16ch]">
          {title}
        </Reveal>
        {intro ? (
          <Reveal as="p" delay={160} className="lede mt-6">
            {intro}
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}
