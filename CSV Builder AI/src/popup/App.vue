<template>
  <div class="app-container">
    <div class="app-header">
      <h1>Omni Capture Hub</h1>
      <span class="badge">Stash: {{ queue.length }}</span>
    </div>

    <div v-if="!currentPlatform.detected" class="alert-view">
      <p>Pipeline Offline. Navigate to a supported record asset profile page.</p>
    </div>

    <div v-else class="workspace-form">
      <div class="meta-row">
        <span><strong>Vertical:</strong> {{ workspaceData.Product }}</span>
        <span><strong>Platform:</strong> {{ workspaceData.Platform }}</span>
      </div>

      <div class="scrollable-form">
        
        <div class="form-group">
          <label>Name Mapping Target *</label>
          <input 
            v-model="workspaceData.Name" 
            @paste="handleLearningPaste($event, 'Name')" 
            @input="saveTemporaryState"
            placeholder="Paste text here to map element manually..."
            :class="{ 'field-alert': !workspaceData.Name }"
          />
        </div>

        <div class="form-group">
          <label>Profile Description Data *</label>
          <textarea 
            v-model="workspaceData.Description" 
            @paste="handleLearningPaste($event, 'Description')" 
            @input="saveTemporaryState"
            placeholder="Paste text here to map element manually..."
            :class="{ 'field-alert': !workspaceData.Description }"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Image Resource Reference</label>
          <input 
            v-model="workspaceData.Image" 
            @paste="handleLearningPaste($event, 'Image')" 
            @input="saveTemporaryState"
            placeholder="Paste asset URL link text here..."
            :class="{ 'field-alert': !workspaceData.Image }"
          />
        </div>

        <div class="section-divider">Template Ingestion Criteria</div>

        <div class="form-group">
          <label>Platform ID (e.g. ASIN / App Pkg) <span v-if="workspaceData.Product === 'MARKETPLACES'">*</span></label>
          <input 
            v-model="workspaceData.PlatformID" 
            @paste="handleLearningPaste($event, 'PlatformID')"
            @input="saveTemporaryState"
            placeholder="Required for Marketplaces"
            :class="{ 'field-alert': !workspaceData.PlatformID && workspaceData.Product === 'MARKETPLACES' }"
          />
        </div>

        <div class="form-group">
          <label>Platform Type <span v-if="workspaceData.Product === 'SOCIAL'">*</span></label>
          <input 
            v-model="workspaceData.PlatformType" 
            @paste="handleLearningPaste($event, 'PlatformType')"
            @input="saveTemporaryState"
            placeholder="e.g. Page, Profile, Group"
            :class="{ 'field-alert': !workspaceData.PlatformType && workspaceData.Product === 'SOCIAL' }"
          />
        </div>

        <div class="form-group">
          <label>Owner / Handle Slug</label>
          <input 
            v-model="workspaceData.Owner" 
            @input="saveTemporaryState"
            placeholder="Unique profile handle or brand owner"
          />
        </div>

        <div class="form-group">
          <label>Locale / Country Code</label>
          <input 
            v-model="workspaceData.Locale" 
            @input="saveTemporaryState"
            placeholder="e.g. en-US, pt-BR, US"
          />
        </div>
      </div>

      <div class="button-footer">
        <button @click="stashToQueue" :disabled="!isFormValid" class="btn-confirm">
          Confirm Entry
        </button>
        <button @click="copySnippet" class="btn-snippet" title="Generate raw text patch asset code">
          Copy Snippet
        </button>
      </div>

      <div class="queue-summary-actions">
        <button :disabled="!queue.length" @click="downloadMasterCSV" class="btn-download">
          Download Export CSV ({{ queue.length }})
        </button>
        <button @click="openDeveloperOptions" class="btn-link">Open Recipes Engine Manager →</button>
      </div>
    </div>
  </div>
</template>

<script>
// Replace your entire <script> section in App.vue with this updated logic
import { ref, onMounted, computed } from 'vue';
import { masterRecipes } from '../config/recipes.js';

export default {
  setup() {
    const queue = ref([]);
    const currentTab = ref(null);
    const currentPlatform = ref({ detected: false, domainKey: '', config: null });
    
    const workspaceData = ref({
      Product: '', Platform: '', PlatformID: '', PlatformType: '',
      Name: '', Url: '', Status: 'Active', Locale: 'en-US', Image: '', Description: '', Owner: ''
    });

    const runtimeSelectors = ref({});

    onMounted(async () => {
      chrome.storage.local.get(['scraperQueue'], (res) => {
        if (res.scraperQueue) queue.value = res.scraperQueue;
      });
      await inspectActiveEnvironment();
    });

    const inspectActiveEnvironment = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) return;
      currentTab.value = tab;

      const url = tab.url || '';
      let matchKey = Object.keys(masterRecipes).find(key => url.includes(key));

      if (matchKey) {
        currentPlatform.value = { detected: true, domainKey: matchKey, config: masterRecipes[matchKey] };
        
        chrome.storage.local.get(['tempWorkspaceState'], (res) => {
          if (res.tempWorkspaceState && res.tempWorkspaceState.Url === url) {
            workspaceData.value = res.tempWorkspaceState;
            chrome.storage.local.get(['tempSelectorsState'], (selRes) => {
              if (selRes.tempSelectorsState) runtimeSelectors.value = selRes.tempSelectorsState;
            });
          } else {
            initializeForm(matchKey);
          }
        });
      }
    };

    const initializeForm = (key) => {
      const config = masterRecipes[key];
      runtimeSelectors.value = { ...config.selectors };

      workspaceData.value = {
        Product: config.Product,
        Platform: config.Platform,
        PlatformID: key === 'amazon.' ? (currentTab.value.url.match(/\/dp\/([A-Z0-9]{10})/i) || ['', ''])[1] : '',
        PlatformType: currentTab.value.url.includes('/groups/') ? 'Group' : currentTab.value.url.includes('/in/') ? 'Profile' : 'Page',
        Name: 'Auto-fetching...', 
        Url: currentTab.value.url, 
        Status: 'Active', 
        Locale: 'en-US', 
        Image: '', 
        Description: '', 
        Owner: parseOwner(currentTab.value.url)
      };

      saveTemporaryState();

      // Reliable messaging loop with fallback error catcher
      chrome.tabs.sendMessage(currentTab.value.id, { action: "runSelectors", selectors: config.selectors }, (res) => {
        if (chrome.runtime.lastError || !res) {
          // Connection dropped (tab needs manual reload refresh)
          workspaceData.value.Name = '';
          workspaceData.value.Description = '';
          alert("Extension reloaded! Please refresh the current webpage tab to re-establish connection.");
          return;
        }
        if (res && res.success) {
          workspaceData.value.Name = res.data.Name || '';
          workspaceData.value.Description = res.data.Description || '';
          workspaceData.value.Image = res.data.Image || '';
          saveTemporaryState();
        }
      });
    };

    const saveTemporaryState = () => {
      chrome.storage.local.set({ tempWorkspaceState: workspaceData.value });
      chrome.storage.local.set({ tempSelectorsState: runtimeSelectors.value });
    };

    const handleLearningPaste = (event, field) => {
      const text = event.clipboardData.getData('text');
      if (!text) return;

      chrome.tabs.sendMessage(currentTab.value.id, { action: "traceTextSelector", text: text }, (res) => {
        if (res && res.success && res.selector) {
          // Update selectors object dynamically
          runtimeSelectors.value[field] = res.selector;
          saveTemporaryState();
          alert(`Successfully mapped component indicator: ${field} => ${res.selector}`);
        }
      });
    };

    const stashToQueue = () => {
      queue.value.push({ ...workspaceData.value });
      chrome.storage.local.set({ scraperQueue: queue.value });
      chrome.storage.local.remove(['tempWorkspaceState', 'tempSelectorsState']);
      resetActiveWorkspace();
    };

    const copySnippet = () => {
      const patchSnippet = {
        [currentPlatform.value.domainKey]: {
          Product: workspaceData.value.Product,
          Platform: workspaceData.value.Platform,
          selectors: { ...runtimeSelectors.value } // Locks in the newly learned parameters
        }
      };
      navigator.clipboard.writeText(JSON.stringify(patchSnippet, null, 2));
      alert("Platform recipe code block copied successfully! Ready to update recipes.js.");
    };

    const downloadMasterCSV = () => {
      const columns = ["Product", "Platform", "PlatformID", "PlatformType", "Name", "Url", "Status", "Locale", "Image", "Description", "Owner"];
      const escape = (str) => {
        const s = String(str ?? "");
        return (s.includes(",") || s.includes('"') || s.includes("\n")) ? `"${s.replace(/"/g, '""')}"` : s;
      };

      const csvRows = [columns.join(",")];
      queue.value.forEach(row => {
        csvRows.push(columns.map(col => escape(row[col])).join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `ingest_manifest_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
    };

    const openDeveloperOptions = () => { chrome.runtime.openOptionsPage(); };
    const resetActiveWorkspace = () => { 
      workspaceData.value.Name = ''; workspaceData.value.Description = ''; workspaceData.value.Image = '';
      workspaceData.value.PlatformID = ''; workspaceData.value.PlatformType = '';
    };
    const parseOwner = (url) => { try { return new URL(url).pathname.split('/').filter(Boolean)[1] || ''; } catch(e) { return ''; } };
    
    const isFormValid = computed(() => {
      const base = workspaceData.value.Name && workspaceData.value.Description;
      if (workspaceData.value.Product === 'MARKETPLACES') return base && workspaceData.value.PlatformID;
      if (workspaceData.value.Product === 'SOCIAL') return base && workspaceData.value.PlatformType;
      return base;
    });

    return { queue, currentPlatform, workspaceData, isFormValid, handleLearningPaste, saveTemporaryState, stashToQueue, copySnippet, downloadMasterCSV, openDeveloperOptions };
  }
};
</script>

<style scoped>
.app-container { width: 380px; max-height: 560px; padding: 16px; background: #0a0a0f; color: #e8e8f0; font-family: sans-serif; display: flex; flex-direction: column; }
.app-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a2a38; padding-bottom: 8px; }
.badge { background: #1a1a24; border: 1px solid #3a3a52; padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #00c896; }
.meta-row { display: flex; justify-content: space-between; font-size: 11px; color: #8888a8; margin: 12px 0; flex-shrink: 0; }
.scrollable-form { flex: 1; overflow-y: auto; max-height: 320px; padding-right: 4px; }
.scrollable-form::-webkit-scrollbar { width: 4px; }
.scrollable-form::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 2px; }
.section-divider { font-size: 10px; color: #555568; text-transform: uppercase; letter-spacing: 0.05em; margin: 18px 0 10px 0; border-bottom: 1px dashed #2a2a38; padding-bottom: 4px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 11px; color: #8888a8; margin-bottom: 4px; text-transform: uppercase; }
.form-group input, .form-group textarea { width: 100%; background: #111118; border: 1px solid #2a2a38; color: #e8e8f0; padding: 8px; border-radius: 4px; font-size: 12px; box-sizing: border-box; }
.form-group textarea { height: 55px; resize: none; }
.field-alert { border-color: #ffa502 !important; background: rgba(255,165,2,0.03) !important; }
.button-footer { display: flex; gap: 8px; margin-top: 16px; flex-shrink: 0; }
.btn-confirm { flex: 2; background: #00c896; color: #fff; border: none; padding: 10px; border-radius: 4px; font-weight: bold; cursor: pointer; }
.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-snippet { flex: 1; background: #1a1a24; border: 1px solid #3a3a52; color: #e8e8f0; padding: 10px; border-radius: 4px; cursor: pointer; }
.queue-summary-actions { margin-top: 14px; padding-top: 12px; border-top: 1px solid #2a2a38; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
.btn-download { width: 100%; background: #0a66c2; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; }
.btn-download:disabled { opacity: 0.3; }
.btn-link { background: none; border: none; color: #8888a8; font-size: 11px; cursor: pointer; text-align: center; }
.alert-view { padding: 30px 10px; text-align: center; color: #555568; font-size: 13px; }
</style>