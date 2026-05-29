// src/content/engine.js - Multi-Platform Scraper Engine

// ── Selector Runner ──
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

        } else if (key === 'Owner') {
          // For Owner, extract the slug from a URL value (og:url or canonical)
          const raw = el.content || el.getAttribute('href') || el.textContent || '';
          if (raw) {
            try {
              const path = new URL(raw).pathname;
              const parts = path.split('/').filter(Boolean);
              const skipSegments = ['company', 'in', 'school', 'showcase', 'groups', 'android-apps', 'dp', 'gp'];
              const idx = parts.findIndex(p => skipSegments.includes(p));
              if (idx !== -1 && parts[idx + 1]) {
                value = parts[idx + 1];
              } else {
                // Fallback: just use the element text directly (for brand fields)
                value = el.content || el.textContent.trim() || '';
              }
            } catch {
              value = el.content || el.textContent.trim() || '';
            }
          }

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

        if (value.trim()) break;
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
function calculatePathSelector(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';

  if (el.id) return `#${el.id}`;

  const tag = el.tagName.toLowerCase();

  if (['h1', 'h2', 'h3', 'title'].includes(tag)) return tag;

  if (tag === 'meta') {
    if (el.getAttribute('property')) return `meta[property="${el.getAttribute('property')}"]`;
    if (el.getAttribute('name')) return `meta[name="${el.getAttribute('name')}"]`;
  }

  if (tag === 'link') {
    if (el.getAttribute('rel')) return `link[rel="${el.getAttribute('rel')}"]`;
  }

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

  const parent = el.parentElement;
  if (!parent || parent.tagName === 'BODY') return tag;
  return `${calculatePathSelector(parent)} > ${tag}`;
}

// ── Text-to-Element Locator ──
function locateTextContainer(textString) {
  const needle = textString.trim();
  if (!needle || needle.length < 2) return null;

  const candidates = document.querySelectorAll(
    'h1, h2, h3, h4, span, p, a, div, li, td, th, title'
  );

  // First pass: exact leaf node match
  for (const node of candidates) {
    if (node.children.length === 0 && node.textContent.trim() === needle) {
      return node;
    }
  }

  // Second pass: contains match in leaf node
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

  return true;
});
