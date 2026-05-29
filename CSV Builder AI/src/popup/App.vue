<template>
  <div class="app-container">

    <!-- Header -->
    <div class="app-header">
      <div class="logo">Ω</div>
      <div class="header-text">
        <h1>Omni Capture</h1>
        <p>MULTI-PLATFORM SCRAPER</p>
      </div>
      <span class="badge">Queue: {{ queue.length }}</span>
    </div>

    <!-- Not on a supported platform -->
    <div v-if="!currentPlatform.detected" class="alert-view">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <p>Navigate to a supported platform page to begin.</p>
      <div class="supported-list">
        <span v-for="key in uniquePlatforms" :key="key">{{ key }}</span>
      </div>
    </div>

    <!-- Workspace -->
    <div v-else class="workspace">

      <!-- Platform meta row -->
      <div class="meta-row">
        <div class="meta-pill">{{ workspaceData.Product }}</div>
        <div class="meta-pill accent">{{ workspaceData.Platform }}</div>
        <div class="meta-pill" v-if="workspaceData.PlatformType">{{ workspaceData.PlatformType }}</div>
      </div>

      <!-- Inline status message -->
      <div class="status-bar" :class="statusType">
        <div class="status-dot"></div>
        <span>{{ statusMessage }}</span>
      </div>

      <!-- Form -->
      <div class="scrollable-form">

        <div class="form-group">
          <label>Name <span class="required">*</span></label>
          <input
            v-model="workspaceData.Name"
            @paste="handlePaste($event, 'Name')"
            @input="saveState"
            placeholder="Auto-filled or paste to teach…"
            :class="{ 'field-alert': !workspaceData.Name }"
          />
          <span v-if="learnedFields.Name" class="learned-tag">✓ Learned</span>
        </div>

        <div class="form-group">
          <label>Description <span class="required">*</span></label>
          <textarea
            v-model="workspaceData.Description"
            @paste="handlePaste($event, 'Description')"
            @input="saveState"
            placeholder="Auto-filled or paste to teach…"
            :class="{ 'field-alert': !workspaceData.Description }"
          ></textarea>
          <span v-if="learnedFields.Description" class="learned-tag">✓ Learned</span>
        </div>

        <div class="form-group">
          <label>Image URL</label>
          <input
            v-model="workspaceData.Image"
            @paste="handlePaste($event, 'Image')"
            @input="saveState"
            placeholder="Auto-filled or paste image URL…"
          />
          <span v-if="learnedFields.Image" class="learned-tag">✓ Learned</span>
        </div>

        <div class="form-group">
          <label>Owner / Handle <span class="required">*</span></label>
          <input
            v-model="workspaceData.Owner"
            @paste="handlePaste($event, 'Owner')"
            @input="saveState"
            placeholder="Auto-filled or paste to teach…"
            :class="{ 'field-alert': !workspaceData.Owner }"
          />
          <span v-if="learnedFields.Owner" class="learned-tag">✓ Learned</span>
        </div>

        <div class="section-divider">Metadata</div>

        <!-- PlatformID — only for MARKETPLACES -->
        <div class="form-group" v-if="workspaceData.Product === 'MARKETPLACES'">
          <label>Platform ID (ASIN) <span class="required">*</span></label>
          <input
            v-model="workspaceData.PlatformID"
            @input="saveState"
            placeholder="e.g. B07FXV75QC"
            :class="{ 'field-alert': !workspaceData.PlatformID }"
          />
        </div>

        <!-- PlatformType — only for SOCIAL -->
        <div class="form-group" v-if="workspaceData.Product === 'SOCIAL'">
          <label>Platform Type <span class="required">*</span></label>
          <input
            v-model="workspaceData.PlatformType"
            @input="saveState"
            placeholder="Page, Profile, or Group"
            :class="{ 'field-alert': !workspaceData.PlatformType }"
          />
        </div>

        <div class="form-group">
          <label>Locale</label>
          <input v-model="workspaceData.Locale" @input="saveState" placeholder="e.g. United States" />
        </div>

        <div class="form-group">
          <label>URL</label>
          <input v-model="workspaceData.Url" readonly class="readonly-field" />
        </div>

      </div>

      <!-- Actions -->
      <div class="button-footer">
        <button @click="confirmEntry" :disabled="!isFormValid" class="btn-confirm">
          Confirm Entry
        </button>
        <button
          @click="copySnippet"
          class="btn-snippet"
          :class="{ 'has-learned': hasLearnedSelectors }"
          title="Copy current selectors as code snippet to send to developer"
        >
          Copy Snippet
        </button>
      </div>

      <!-- Queue actions -->
      <div class="queue-actions">
        <button :disabled="!queue.length" @click="downloadCSV" class="btn-download">
          ↓ Download CSV ({{ queue.length }})
        </button>
        <button @click="openOptions" class="btn-link">Recipes Manager →</button>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { masterRecipes } from '../config/recipes.js';

export default {
  setup() {
    const queue = ref([]);
    const currentTab = ref(null);
    const currentPlatform = ref({ detected: false, domainKey: '', config: null });
    const statusMessage = ref('Detecting platform…');
    const statusType = ref('neutral');
    const learnedFields = ref({ Name: false, Description: false, Image: false, Owner: false });
    const runtimeSelectors = ref({});

    const workspaceData = ref({
      Product: '', Platform: '', PlatformID: '', PlatformType: '',
      Name: '', Url: '', Status: 'Active', Locale: '', Image: '', Description: '', Owner: ''
    });

    // Deduplicated platform names for the unsupported page view
    const uniquePlatforms = computed(() =>
      [...new Set(Object.values(masterRecipes).map(r => r.Platform))]
    );

    // ── Init ──
    onMounted(async () => {
      chrome.storage.local.get(['scraperQueue'], (res) => {
        if (res.scraperQueue) queue.value = res.scraperQueue;
      });
      await detectPlatform();
    });

    // ── Platform Detection ──
    const detectPlatform = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      currentTab.value = tab;

      const url = tab.url || '';

      // Longest key wins for specificity (amazon.co.uk before amazon.com)
      const matchKey = Object.keys(masterRecipes)
        .sort((a, b) => b.length - a.length)
        .find(key => url.includes(key));

      if (!matchKey) {
        setStatus('neutral', 'Navigate to a supported platform page.');
        return;
      }

      currentPlatform.value = {
        detected: true,
        domainKey: matchKey,
        config: masterRecipes[matchKey]
      };

      // Try to restore saved state for this exact URL
      chrome.storage.local.get(['tempWorkspaceState', 'tempSelectorsState', 'tempLearnedFields'], (res) => {
        if (res.tempWorkspaceState && res.tempWorkspaceState.Url === url) {
          workspaceData.value = res.tempWorkspaceState;
          if (res.tempSelectorsState) runtimeSelectors.value = res.tempSelectorsState;
          if (res.tempLearnedFields) learnedFields.value = res.tempLearnedFields;
          setStatus('ready', 'Workspace restored. Review and confirm when ready.');
        } else {
          initForm(matchKey, tab);
        }
      });
    };

    // ── Form Initialisation ──
    const initForm = (key, tab) => {
      const config = masterRecipes[key];
      runtimeSelectors.value = { ...config.selectors };

      workspaceData.value = {
        Product: config.Product,
        Platform: config.Platform,
        PlatformID: extractASIN(tab.url),
        PlatformType: extractPlatformType(tab.url, config.Product),
        Name: '',
        Url: tab.url,
        Status: 'Active',
        Locale: config.defaultLocale || 'United States',
        Image: '',
        Description: '',
        Owner: ''
      };

      saveState();
      runScrape(tab, config.selectors);
    };

    // ── Run Scrape ──
    const runScrape = (tab, selectors) => {
      setStatus('loading', 'Auto-filling fields from page…');

      chrome.tabs.sendMessage(tab.id, { action: 'runSelectors', selectors }, (res) => {
        if (chrome.runtime.lastError || !res) {
          setStatus('warning', 'Could not reach page — please refresh the tab and reopen the extension.');
          return;
        }
        if (res.success) {
          workspaceData.value.Name        = res.data.Name        || '';
          workspaceData.value.Description = res.data.Description || '';
          workspaceData.value.Image       = res.data.Image       || '';
          workspaceData.value.Owner       = res.data.Owner       || '';

          const missing = ['Name', 'Description', 'Owner'].filter(f => !workspaceData.value[f]);
          if (missing.length === 0) {
            setStatus('ready', 'All fields filled. Review and confirm.');
          } else {
            setStatus('warning', `Could not auto-fill: ${missing.join(', ')}. Paste the correct text into those fields to teach the extension.`);
          }
          saveState();
        }
      });
    };

    // ── URL Parsers ──
    const extractASIN = (url) => {
      const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
      return match ? match[1] : '';
    };

    const extractPlatformType = (url, product) => {
      if (product !== 'SOCIAL') return '';
      if (url.includes('/groups/')) return 'Group';
      if (url.includes('/in/')) return 'Profile';
      return 'Page';
    };

    // ── Paste-to-Learn ──
    const handlePaste = (event, field) => {
      const text = event.clipboardData.getData('text');
      if (!text || !currentTab.value) return;

      // Immediately update workspaceData so isFormValid reacts right away
      // (v-model hasn't processed the paste yet at this point)
      workspaceData.value[field] = text.trim();
      saveState();

      chrome.tabs.sendMessage(
        currentTab.value.id,
        { action: 'traceTextSelector', text: text.trim() },
        (res) => {
          if (res && res.success && res.selector) {
            runtimeSelectors.value[field] = res.selector;
            learnedFields.value[field] = true;
            saveState();
            setStatus('ready', `✓ Selector learned for "${field}" — Copy Snippet will include it.`);
          } else {
            setStatus('warning', `Value saved for "${field}" but no selector found — paste-to-learn only works with text visible on the page.`);
          }
        }
      );
    };

    // ── State Persistence ──
    const saveState = () => {
      chrome.storage.local.set({
        tempWorkspaceState: workspaceData.value,
        tempSelectorsState: runtimeSelectors.value,
        tempLearnedFields: learnedFields.value
      });
    };

    // ── Confirm Entry ──
    const confirmEntry = () => {
      queue.value.push({ ...workspaceData.value });
      chrome.storage.local.set({ scraperQueue: queue.value });
      chrome.storage.local.remove(['tempWorkspaceState', 'tempSelectorsState', 'tempLearnedFields']);

      learnedFields.value = { Name: false, Description: false, Image: false, Owner: false };

      setStatus('ready', `✓ Entry added (${queue.value.length} in queue). Ready for next.`);

      // Reset scraped fields only — keep platform context
      workspaceData.value.Name        = '';
      workspaceData.value.Description = '';
      workspaceData.value.Image       = '';
      workspaceData.value.Owner       = '';
      workspaceData.value.PlatformID  = extractASIN(workspaceData.value.Url);

      // Re-scrape immediately so button re-enables if selectors still work
      if (currentTab.value && currentPlatform.value.config) {
        runScrape(currentTab.value, runtimeSelectors.value);
      }
    };

    // ── Copy Snippet ──
    // Outputs just the inner entry so it can be dropped straight into recipes.js
    const copySnippet = () => {
      const key = currentPlatform.value.domainKey;
      const entry = {
        Product: workspaceData.value.Product,
        Platform: workspaceData.value.Platform,
        defaultLocale: workspaceData.value.Locale,
        selectors: { ...runtimeSelectors.value }
      };
      // Format as a single key-value pair ready to paste into the masterRecipes object
      const inner = JSON.stringify(entry, null, 2)
        .split('\n')
        .map((line, i) => i === 0 ? line : '  ' + line)
        .join('\n');
      const output = `"${key}": ${inner},`;
      navigator.clipboard.writeText(output);
      setStatus('ready', '✓ Snippet copied — paste this entry directly into recipes.js.');
    };

    // ── CSV Download ──
    const downloadCSV = () => {
      const columns = ['Product', 'Platform', 'PlatformID', 'PlatformType', 'Name', 'Url', 'Status', 'Locale', 'Image', 'Description', 'Owner'];
      const escape = (val) => {
        const s = String(val ?? '');
        return (s.includes(',') || s.includes('"') || s.includes('\n'))
          ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const rows = [columns.join(',')];
      queue.value.forEach(row => rows.push(columns.map(c => escape(row[c])).join(',')));

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `omni_capture_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    };

    // ── Helpers ──
    const setStatus = (type, message) => {
      statusType.value = type;
      statusMessage.value = message;
    };

    const openOptions = () => chrome.runtime.openOptionsPage();

    const isFormValid = computed(() => {
      const base = workspaceData.value.Name && workspaceData.value.Description && workspaceData.value.Owner;
      if (workspaceData.value.Product === 'MARKETPLACES') return base && workspaceData.value.PlatformID;
      if (workspaceData.value.Product === 'SOCIAL') return base && workspaceData.value.PlatformType;
      return base;
    });

    const hasLearnedSelectors = computed(() =>
      Object.values(learnedFields.value).some(Boolean)
    );

    return {
      queue, currentPlatform, workspaceData, statusMessage, statusType,
      learnedFields, uniquePlatforms, isFormValid, hasLearnedSelectors,
      handlePaste, saveState, confirmEntry, copySnippet, downloadCSV, openOptions
    };
  }
};
</script>

<style scoped>
.app-container {
  width: 380px;
  max-height: 580px;
  background: #0a0a0f;
  color: #e8e8f0;
  font-family: 'IBM Plex Sans', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 12px;
  background: #111118;
  border-bottom: 1px solid #2a2a38;
  flex-shrink: 0;
}
.logo {
  width: 28px; height: 28px;
  background: #0a66c2;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; color: #fff;
  flex-shrink: 0;
}
.header-text h1 { font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
.header-text p { font-size: 10px; color: #555568; letter-spacing: 0.06em; margin-top: 1px; }
.badge {
  margin-left: auto;
  background: #1a1a24; border: 1px solid #3a3a52;
  padding: 2px 8px; border-radius: 4px;
  font-size: 11px; color: #00c896;
}

.alert-view {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 30px 20px; text-align: center; color: #555568;
  gap: 12px;
}
.alert-view p { font-size: 13px; line-height: 1.5; }
.supported-list {
  display: flex; flex-wrap: wrap; gap: 6px; justify-content: center;
}
.supported-list span {
  background: #1a1a24; border: 1px solid #2a2a38;
  padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #8888a8;
}

.workspace {
  flex: 1; display: flex; flex-direction: column;
  padding: 12px 16px; overflow: hidden;
}

.meta-row { display: flex; gap: 6px; margin-bottom: 10px; flex-shrink: 0; }
.meta-pill {
  font-size: 10px; padding: 2px 8px; border-radius: 3px;
  background: #1a1a24; border: 1px solid #2a2a38; color: #8888a8;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.meta-pill.accent { border-color: #0a66c2; color: #1177d4; }

.status-bar {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 8px 10px; border-radius: 5px;
  background: #111118; border: 1px solid #2a2a38;
  margin-bottom: 12px; font-size: 11px; color: #8888a8;
  flex-shrink: 0; line-height: 1.4;
}
.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #555568; flex-shrink: 0; margin-top: 3px;
}
.status-bar.ready .status-dot { background: #00c896; box-shadow: 0 0 5px #00c896; }
.status-bar.ready { color: #e8e8f0; }
.status-bar.warning .status-dot { background: #ffa502; box-shadow: 0 0 5px #ffa502; }
.status-bar.warning { color: #ffa502; border-color: rgba(255,165,2,0.3); }
.status-bar.loading .status-dot { background: #0a66c2; animation: blink 1s infinite; }
.status-bar.error .status-dot { background: #ff4757; box-shadow: 0 0 5px #ff4757; }
.status-bar.error { color: #ff4757; border-color: rgba(255,71,87,0.3); }

@keyframes blink {
  0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
}

.scrollable-form {
  flex: 1; overflow-y: auto; padding-right: 4px;
}
.scrollable-form::-webkit-scrollbar { width: 4px; }
.scrollable-form::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 2px; }

.section-divider {
  font-size: 10px; color: #555568; text-transform: uppercase;
  letter-spacing: 0.06em; margin: 14px 0 10px;
  border-bottom: 1px dashed #2a2a38; padding-bottom: 4px;
}

.form-group { margin-bottom: 10px; position: relative; }
.form-group label {
  display: block; font-size: 10px; color: #8888a8;
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;
}
.required { color: #ffa502; }

.form-group input,
.form-group textarea {
  width: 100%; background: #111118; border: 1px solid #2a2a38;
  color: #e8e8f0; padding: 7px 9px; border-radius: 4px;
  font-size: 12px; box-sizing: border-box; outline: none;
  transition: border-color 0.15s;
}
.form-group input:focus,
.form-group textarea:focus { border-color: #3a3a52; }
.form-group textarea { height: 60px; resize: none; }
.readonly-field { color: #555568 !important; cursor: default; }
.field-alert { border-color: #ffa502 !important; background: rgba(255,165,2,0.03) !important; }

.learned-tag {
  position: absolute; right: 8px; top: 0;
  font-size: 9px; color: #00c896; letter-spacing: 0.04em;
}

.button-footer {
  display: flex; gap: 8px; margin-top: 14px; flex-shrink: 0;
}
.btn-confirm {
  flex: 2; background: #00c896; color: #fff;
  border: none; padding: 10px; border-radius: 4px;
  font-weight: 600; font-size: 13px; cursor: pointer;
  transition: opacity 0.15s;
}
.btn-confirm:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-confirm:hover:not(:disabled) { opacity: 0.9; }

.btn-snippet {
  flex: 1; background: #1a1a24; border: 1px solid #2a2a38;
  color: #8888a8; padding: 10px; border-radius: 4px;
  font-size: 12px; cursor: pointer; transition: border-color 0.15s, color 0.15s;
}
.btn-snippet:hover { border-color: #3a3a52; color: #e8e8f0; }
.btn-snippet.has-learned { border-color: #0a66c2; color: #1177d4; }

.queue-actions {
  margin-top: 12px; padding-top: 10px;
  border-top: 1px solid #2a2a38;
  display: flex; flex-direction: column; gap: 6px; flex-shrink: 0;
}
.btn-download {
  width: 100%; background: #0a66c2; color: #fff;
  border: none; padding: 9px; border-radius: 4px;
  font-weight: 600; font-size: 12px; cursor: pointer;
  transition: opacity 0.15s;
}
.btn-download:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-download:hover:not(:disabled) { opacity: 0.88; }

.btn-link {
  background: none; border: none; color: #555568;
  font-size: 11px; cursor: pointer; text-align: center;
}
.btn-link:hover { color: #8888a8; }
</style>
