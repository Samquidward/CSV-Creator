<template>
  <div class="options-dashboard">
    <div class="sidebar">
      <div class="brand-meta">
        <div class="logo-box">Ω</div>
        <h2>Recipes Studio</h2>
      </div>
      <p class="description">Review active platform configuration files, safely bundle new submissions, and compile the final database asset.</p>
      
      <div class="control-actions">
        <button @click="copyCompleteFile" class="btn-action primary">Copy Master Code Block</button>
        <button @click="downloadRecipesFile" class="btn-action">Download recipes.js File</button>
      </div>
    </div>

    <div class="workspace-panel">
      <div class="panel-header">
        <h3>Active Platform Configuration Manifest (`recipes.js`)</h3>
        <span class="status-indicator">✓ Valid Compilation Engine</span>
      </div>
      
      <div class="code-view-container">
        <pre><code>{{ generatedFileContent }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { masterRecipes } from '../config/recipes.js';

export default {
  setup() {
    // Dynamically reconstruct code formatting structures for output asset compilation
    const generatedFileContent = computed(() => {
      const jsonString = JSON.stringify(masterRecipes, null, 2);
      return `// Compiled Platform Data Target Recipes Module Configuration\n\nexport const masterRecipes = ${jsonString};`;
    });

    const copyCompleteFile = () => {
      navigator.clipboard.writeText(generatedFileContent.value);
      alert("Complete master recipes.js source file code string successfully copied to clipboard.");
    };

    const downloadRecipesFile = () => {
      const blob = new Blob([generatedFileContent.value], { type: "application/javascript;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "recipes.js";
      link.click();
    };

    return { generatedFileContent, copyCompleteFile, downloadRecipesFile };
  }
};
</script>

<style scoped>
.options-dashboard { display: flex; min-height: 100vh; background: #0a0a0f; color: #e8e8f0; font-family: 'IBM Plex Sans', sans-serif; }
.sidebar { width: 320px; background: #111118; border-right: 1px solid #2a2a38; padding: 30px; box-sizing: border-box; }
.brand-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.logo-box { background: #0a66c2; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 18px; }
.sidebar h2 { font-size: 20px; font-weight: 600; margin: 0; }
.description { font-size: 13px; color: #8888a8; line-height: 1.6; margin-bottom: 40px; }
.control-actions { display: flex; flex-direction: column; gap: 12px; }
.btn-action { width: 100%; padding: 12px; background: #1a1a24; border: 1px solid #3a3a52; color: #e8e8f0; border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-action:hover { background: #222230; }
.btn-action.primary { background: #0a66c2; border: none; color: white; }
.btn-action.primary:hover { background: #1177d4; }
.workspace-panel { flex: 1; padding: 30px; display: flex; flex-direction: column; box-sizing: border-box; }
.panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.panel-header h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #8888a8; margin: 0; }
.status-indicator { font-size: 12px; color: #00c896; font-weight: 500; }
.code-view-container { flex: 1; background: #050508; border: 1px solid #2a2a38; border-radius: 8px; padding: 20px; overflow: auto; box-sizing: border-box; }
pre { margin: 0; font-family: 'IBM Plex Mono', monospace; font-size: 13px; color: #00c896; line-height: 1.5; }
</style>