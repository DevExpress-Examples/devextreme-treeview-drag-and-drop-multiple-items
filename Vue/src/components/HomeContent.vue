<script setup lang="ts">
import { ref } from 'vue';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import DxTabPanel, { DxItem } from 'devextreme-vue/tab-panel';
import DxSwitch from 'devextreme-vue/switch';
import TreeViewPlain from './TreeViewPlain.vue';
import TreeViewHierarchy from './TreeViewHierarchy.vue';

const shouldClearSelection = ref(false);
</script>
<template>
  <div>
    <div className="demo-header">
      <h3>TreeView - Select multiple items and drag'n'drop</h3>
      <div id="toggle-container">
        <span>Clear selection after drop</span>
        <DxSwitch
          id="clear-after-drop-switch"
          v-model:value="shouldClearSelection"
        />
      </div>
    </div>
    <DxTabPanel>
      <DxItem title="Plain Data">
        <TreeViewPlain :should-clear-selection="shouldClearSelection"/>
      </DxItem>
      <DxItem title="Hierarchical Data">
        <TreeViewHierarchy :should-clear-selection="shouldClearSelection"/>
      </DxItem>
    </DxTabPanel>
  </div>
</template>
<style scoped>
  .demo-header {
    display: flex;
    justify-content: space-between;
  }
  #toggle-container {
    padding-top: 20px;
  }
  #clear-after-drop-switch {
    vertical-align: text-bottom;
  }
  #toggle-container span {
    padding-right: 10px;
  }
</style>
