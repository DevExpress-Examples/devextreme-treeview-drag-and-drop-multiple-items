<template>
  <div>
    <div className="demo-header">
      <h3>TreeView - Select multiple items and drag'n'drop</h3>
      <div id="toggle-container">
          <span>Clear selection after drop</span>
          <DxSwitch id="clearAfterDropSwitch" v-model:value="shouldClearSelection"></DxSwitch>
      </div>
    </div>
    <DxTabPanel>
      <DxItem title="Plain Data">
          <TreeViewPlain :should-clear-selection="shouldClearSelection"></TreeViewPlain>
      </DxItem> 
      <DxItem title="Hierarchical Data">
        <TreeViewHierarchy :should-clear-selection="shouldClearSelection"></TreeViewHierarchy>
      </DxItem>
    </DxTabPanel>
  </div>
</template>

<script>

import DxTabPanel, { DxItem } from 'devextreme-vue/tab-panel';
import DxSwitch from 'devextreme-vue/switch';
import TreeViewPlain from './TreeViewPlain.vue';
import TreeViewHierarchy from './TreeViewHierarchy.vue';

export default {
  name: 'Home',
  components: {
    DxTabPanel, DxItem, DxSwitch, TreeViewPlain, TreeViewHierarchy
  },
  data(){
    return {
      shouldClearSelection: false
    }
  },
  computed: {
    getText(){
       return `Click count: ${this.count}`;
    }
  },
  methods: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .demo-header {
    display: flex;
    justify-content: space-between;
  }
  #toggle-container {
    padding-top: 20px;
  }
  #clearAfterDropSwitch {
    vertical-align: text-bottom;
  }
  #toggle-container span {
    padding-right: 10px;
  }
</style>
