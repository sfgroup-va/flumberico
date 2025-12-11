interface WebsiteSchemaProps {
  siteUrl?: string;
  siteName?: string;
  description?: string;
}

export default function WebsiteSchema({
  siteUrl = "https://your-domain.com",
  siteName = "AI Job Board",
  description = "AI-powered job hunting platform that matches candidates with their dream jobs using advanced machine learning algorithms."
}: WebsiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org/",
    "@type": "Organization",
    "name": siteName,
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": description,
    "sameAs": [
      // Add social media URLs here
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-JOBS",
      "contactType": "customer service",
      "availableLanguage": ["English"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Tech Street",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    },
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "AI Job Board Team"
      }
    ],
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": 50
    },
    "serviceType": "Job Search and Recruitment",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Job Search Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI Job Matching",
            "description": "AI-powered job matching service"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Resume Enhancement",
            "description": "AI-enhanced job descriptions and resume optimization"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Application Tracking",
            "description": "Track job applications and responses"
          }
        }
      ]
    },
    "areaServed": {
      "@type": "Country",
      "name": "United States"
    },
    "knowsLanguage": ["English"],
    "legalName": "AI Job Board Inc.",
    "taxID": "12-3456789"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Jobs",
        "item": `${siteUrl}/jobs`
      }
    ]
  };

  const webSiteSchema = {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    "name": siteName,
    "url": siteUrl,
    "description": description,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema, null, 2)
        }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 2)
        }}
      />

      {/* WebSite Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema, null, 2)
        }}
      />
    </>
  );
}