// src/content/engine.js - Multi-Platform Scraper Engine

// ── Selector Runner ──
// Strict fail-empty: returns "" if nothing found. No fallbacks, no guessing.
function runStrictSelectors(selectors) {
  const extracted = {};

  for (const [key, selectorString] of Object.entries(selectors)) {
    try {
      let value = '';
      const queries = selectorString.split(',').map(q => q.trim());

      for (const query of queries) {
        const el = document.querySelector(query);
        if (!el) continue;

        if (key === 'Image') {
          value = el.content || el.src
            || el.getAttribute('data-delayed-url')
            || el.getAttribute('data-old-hires')
            || '';
        } else if (el.tagName === 'META') {
          value = el.content || '';
        } else {
          // For multi-element matches (e.g. Amazon bullet points), join text
          const allEls = document.querySelectorAll(query);
          if (allEls.length > 1) {
            value = Array.from(allEls)
              .map(e => e.textContent.trim())
              .filter(Boolean)
              .join('\n');
          } else {
            value = el.textContent.trim();
          }
        }

        if (value.trim()) break; // Stop at first hit
      }

      // Clean up name: strip trailing pipe sections (e.g. "Page Name | LinkedIn")
      if (key === 'Name' && value) {
        value = value.replace(/\s*\|.*$/, '').trim();
      }

      extracted[key] = value.trim();

    } catch (e) {
      extracted[key] = '';
    }
  }

  return extracted;
}

// ── Selector Path Calculator ──
// Climbs the DOM to build a resilient CSS selector.
// Prioritises IDs and semantic tags. Ignores dynamic utility classes.
function calculatePathSelector(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';

  // ID is the most reliable anchor
  if (el.id) return `#${el.id}`;

  const tag = el.tagName.toLowerCase();

  // Semantic heading tags are reliable on their own
  if (['h1', 'h2', 'h3', 'title'].includes(tag)) return tag;

  // Meta tags — use property or name attribute as selector
  if (tag === 'meta') {
    if (el.getAttribute('property')) return `meta[property="${el.getAttribute('property')}"]`;
    if (el.getAttribute('name')) return `meta[name="${el.getAttribute('name')}"]`;
  }

  // Filter out dynamic/framework-generated class names
  // (short random classes, classes starting with numbers, underscore-heavy names)
  if (el.className && typeof el.className === 'string') {
    const stableClasses = el.className.split(/\s+/).filter(c =>
      c.length > 2 &&
      !c.match(/^[0-9]/) &&
      !c.match(/^x[a-z0-9]{2,}/i) &&
      !c.match(/(_[a-z0-9]{4,}|--[a-z0-9]{4,})/i) &&
      !c.match(/^(css|sc|emotion|style)-/i)
    );
    if (stableClasses.length) {
      return `${tag}.${stableClasses.join('.')}`;
    }
  }

  // Recurse up the tree
  const parent = el.parentElement;
  if (!parent || parent.tagName === 'BODY') return tag;
  return `${calculatePathSelector(parent)} > ${tag}`;
}

// ── Text-to-Element Locator ──
// Searches DOM for an exact text match in a leaf node.
function locateTextContainer(textString) {
  const needle = textString.trim();
  if (!needle || needle.length < 2) return null;

  // Prioritise meaningful content elements
  const candidates = document.querySelectorAll(
    'h1, h2, h3, h4, span, p, a, div, li, td, th, title'
  );

  // First pass: exact leaf node match
  for (const node of candidates) {
    if (node.children.length === 0 && node.textContent.trim() === needle) {
      return node;
    }
  }

  // Second pass: contains match in leaf node (handles minor whitespace wrapping)
  for (const node of candidates) {
    if (node.children.length === 0 && node.textContent.trim().includes(needle)) {
      return node;
    }
  }

  return null;
}

// ── Message Router ──
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.action === 'runSelectors') {
    const data = runStrictSelectors(request.selectors);
    sendResponse({ success: true, data });
  }

  else if (request.action === 'traceTextSelector') {
    const el = locateTextContainer(request.text);
    if (el) {
      const selector = calculatePathSelector(el);
      sendResponse({ success: true, selector });
    } else {
      sendResponse({ success: false });
    }
  }

  return true; // Keep message channel open for async
});
