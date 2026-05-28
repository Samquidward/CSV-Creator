// src/config/recipes.js

export const masterRecipes = {
  "linkedin.com": {
    Product: "SOCIAL",
    Platform: "LinkedIn", // Fixed: Removed "IE:" prefix
    selectors: {
      // Uses the exact working fallbacks from your original script
      Name: 'meta[property="og:title"], h1.org-top-card-summary__title, h1.top-card-layout__title, .org-top-card-summary__title, h1',
      Description: 'meta[property="og:description"], meta[name="description"], section#about-section, .pv-about-section',
      Image: 'meta[property="og:image"], .org-top-card-primary-content__logo img, .top-card__profile-image img, img'
    }
  },
  "facebook.com": {
    Product: "SOCIAL",
    Platform: "Facebook",
    selectors: {
      Name: 'meta[property="og:title"], h1',
      Description: 'meta[property="og:description"], meta[name="description"]',
      Image: 'meta[property="og:image"], svg image'
    }
  },
  "amazon.": {
    Product: "MARKETPLACES",
    Platform: "Amazon",
    selectors: {
      Name: "#productTitle",
      Description: "#feature-bullets",
      Image: "#landingImage, #imgBlkFront"
    }
  }
};