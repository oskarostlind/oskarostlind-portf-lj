import { site } from "@/lib/site";

export default function JsonLd({ locale }: { locale: string }) {
  const url = locale === "sv" ? site.url : `${site.url}/${locale}`;

  const data = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url,
      email: `mailto:${site.email}`,
      jobTitle: locale === "sv" ? "Webbutvecklare" : "Web developer",
      sameAs: [site.github, site.linkedin],
      knowsAbout: [
        "Next.js",
        "React",
        "TypeScript",
        "Node.js",
        "PostgreSQL",
        "Prisma",
        "Stripe",
        "CRM",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: site.name,
      url,
      areaServed: "SE",
      email: site.email,
      description:
        locale === "sv"
          ? "Kompletta hemsidor, frontend, backend och CRM-system."
          : "Complete websites, frontend, backend and CRM systems.",
      serviceType: [
        "Web development",
        "Frontend development",
        "Backend development",
        "CRM integration",
      ],
    },
  ];

  return (
    <script
      type="application/ld+json"
      // Datan är statisk och innehåller ingen användarinmatning.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
