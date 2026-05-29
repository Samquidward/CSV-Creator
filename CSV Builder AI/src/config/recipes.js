// src/config/recipes.js

export const masterRecipes = {

  // ── SOCIAL ──────────────────────────────────────────────

"linkedin.com": {
    "Product": "SOCIAL",
    "Platform": "LinkedIn",
    "defaultLocale": "United States",
    "selectors": {
      "Description": "meta[property=\"og:description\"], meta[name=\"description\"], section#about-section, .pv-about-section",
      "Image": "meta[property=\"og:image\"], .org-top-card-primary-content__logo img, .top-card__profile-image img",
      "Name": "meta[property=\"og:title\"], h1.org-top-card-summary__title, h1.top-card-layout__title, .org-top-card-summary__title, h1",
      "Owner": "#ember32"
    }
  },

  "facebook.com": {
    Product: "SOCIAL",
    Platform: "Facebook",
    defaultLocale: "United States",
    selectors: {
      Name: 'meta[property="og:title"], h1',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"]',
      Owner: 'meta[property="og:url"], link[rel="canonical"]'
    }
  },

  // ── MARKETPLACES ─────────────────────────────────────────

  "amazon.com": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "United States",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.co.uk": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "United Kingdom",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.ca": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Canada",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.com.br": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Brazil",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.com.mx": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Mexico",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.de": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Germany",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.fr": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "France",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.es": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Spain",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.it": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Italy",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.nl": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Netherlands",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.co.jp": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Japan",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.in": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "India",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.com.au": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Australia",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.ae": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "United Arab Emirates",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.sa": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Saudi Arabia",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.sg": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Singapore",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.pl": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Poland",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.se": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Sweden",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  "amazon.com.tr": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "Turkey",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront",
      Owner: ".po-brand .a-span9 span, #bylineInfo, #brand"
    }
  },

  // ── WEBSITES ─────────────────────────────────────────────

  "blogspot.com": {
    Product: "WEBSITES",
    Platform: "Blogspot",
    defaultLocale: "United States",
    selectors: {
      Name: 'meta[property="og:title"], title',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"]',
      Owner: 'meta[property="og:url"], link[rel="canonical"]'
    }
  },

  // ── APPS ─────────────────────────────────────────────────

  "9apps.com": {
    Product: "APPS",
    Platform: "9apps",
    defaultLocale: "United States",
    selectors: {
      Name: 'meta[property="og:title"], h1',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"], .app-icon img',
      Owner: 'meta[property="og:url"], link[rel="canonical"]'
    }
  }

};
