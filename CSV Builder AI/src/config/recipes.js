// src/config/recipes.js

export const masterRecipes = {
  "linkedin.com": {
    Product: "SOCIAL",
    Platform: "LinkedIn",
    defaultLocale: "en-US //or// US",
    selectors: {
      Name: 'meta[property="og:title"]',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"]'
    }
  },
  "facebook.com": {
    Product: "SOCIAL",
    Platform: "Facebook",
    defaultLocale: "en-US //or// US",
    selectors: {
      Name: 'meta[property="og:title"]',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"]'
    }
  },
  "amazon.com": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "en-US //or// US",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront"
    }
  },
  "amazon.co.uk": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "en-GB //or// GB",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront"
    }
  },
  "amazon.ca": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "en-CA //or// CA",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront"
    }
  },
  "amazon.com.br": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    defaultLocale: "pt-BR //or// BR",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets .a-list-item, #productDescription p",
      Image: "#landingImage, #imgBlkFront"
    }
  },
  "blogspot.com": {
    Product: "WEBSITES",
    Platform: "Blogspot",
    defaultLocale: "en-US //or// US",
    selectors: {
      Name: 'meta[property="og:title"], title',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"]'
    }
  },
  "9apps.com": {
    Product: "APPS",
    Platform: "9apps",
    defaultLocale: "en-US //or// US",
    selectors: {
      Name: 'meta[property="og:title"], h1',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"], .app-icon img'
    }
  }
};
