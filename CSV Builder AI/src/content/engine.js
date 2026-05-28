// src/content/engine.js - Unified Multi-Platform Scraper Engine

function runStrictSelectors(selectors) {
  const extracted = {};
  
  for (const [key, multipleQueries] of Object.entries(selectors)) {
    try {
      let foundElement = null;
      let textValue = '';
      
      const queries = multipleQueries.split(',').map(q => q.trim());
      for (const query of queries) {
        const el = document.querySelector(query);
        if (el) {
          foundElement = el;
          break;
        }
      }

      if (foundElement) {
        if (key === 'Image') {
          textValue = foundElement.content || foundElement.src || foundElement.getAttribute("data-delayed-url") || foundElement.getAttribute("data-old-hires") || '';
        } else if (foundElement.tagName === 'META') {
          textValue = foundElement.content;
        } else {
          textValue = foundElement.textContent;
        }
      }

      // Universal metadata extraction safety backup net
      if (!textValue || textValue.trim() === '') {
        if (key === 'Name') {
          const ogTitle = document.querySelector('meta[property="og:title"]');
          textValue = ogTitle ? ogTitle.content : document.title;
        } else if (key === 'Description') {
          const ogDesc = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="description"]');
          textValue = ogDesc ? ogDesc.content : '';
        } else if (key === 'Image') {
          const ogImg = document.querySelector('meta[property="og:image"]');
          textValue = ogImg ? ogImg.content : '';
        }
      }

      if (textValue) {
        textValue = textValue.trim();
        if (key === 'Name') {
          textValue = textValue.replace(/\s*\|.*$/, "").replace(/\s*\|\s*Facebook.*$/i, "").trim();
        }
        extracted[key] = textValue;
      } else {
        extracted[key] = '';
      }

    } catch (e) {
      extracted[key] = '';
    }
  }
  return extracted;
}

function calculatePathSelector(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return '';
  if (el.id) return `#${el.id}`;
  
  let tag = el.tagName.toLowerCase();
  if (['h1', 'h2', 'h3', 'title'].includes(tag)) return tag;

  if (el.className && typeof el.className === 'string') {
    const cleanClasses = el.className.split(/\s+/)
      .filter(c => c && !c.match(/(^x[0-9]|_|\-[0-9]|^app)/i))
      .join('.');
    if (cleanClasses) return `${tag}.${cleanClasses}`;
  }
  return calculatePathSelector(el.parentNode) + ' > ' + tag;
}

function locateTextContainer(textString) {
  const cleanQuery = textString.trim();
  if (!cleanQuery || cleanQuery.length < 2) return null;

  const nodes = document.querySelectorAll('h1, h2, h3, span, div, p, a, li, td, th');
  for (const node of nodes) {
    if (node.textContent.trim().includes(cleanQuery) && node.children.length === 0) {
      return node;
    }
  }
  return null;
}

// Fixed Router
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "runSelectors") {
    // Fixed: Now accurately targets the internal execution function name
    const data = runStrictSelectors(request.selectors);
    sendResponse({ success: true, data: data });
  } 
  else if (request.action === "traceTextSelector") {
    const targetElement = locateTextContainer(request.text);
    if (targetElement) {
      const computedPath = calculatePathSelector(targetElement);
      sendResponse({ success: true, selector: computedPath });
    } else {
      sendResponse({ success: false });
    }
  }
  return true;
});