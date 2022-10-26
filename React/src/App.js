import { useCallback, useState } from 'react';

import 'devextreme/dist/css/dx.common.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import './App.css';

import TabPanel, { Item } from 'devextreme-react/tab-panel';
import Switch from 'devextreme-react/switch';
import TreeViewPlain from './TreeViewPlain';
import TreeViewHierarchy from './TreeViewHierarchy';

function App() {
  const [shouldClearSelection, setShouldClearSelection] = useState(false);

  const switchValueChanged = useCallback((e) => {
    setShouldClearSelection(e.value);
  }, [shouldClearSelection]);

  const treeViewPlainRender = useCallback(() => {
    console.log("Plain render", shouldClearSelection);
    return <TreeViewPlain shouldClearSelection={shouldClearSelection}></TreeViewPlain>
  }, [shouldClearSelection])

  const treeViewHierarchyRender = useCallback(() => {
    return <TreeViewHierarchy shouldClearSelection={shouldClearSelection}></TreeViewHierarchy>
  }, [shouldClearSelection])

  return (
    <div className="App">
      <div className="demo-header">
        <h3>TreeView - Select multiple items and drag'n'drop</h3>
        <div id="toggle-container">
            <span>Clear selection after drop</span>
            <Switch id="clearAfterDropSwitch" value={shouldClearSelection} onValueChanged={switchValueChanged}></Switch>
        </div>
      </div>
      <TabPanel>
        <Item title="Plain Data" render={treeViewPlainRender}></Item> 
        <Item title="Hierarchical Data" render={treeViewHierarchyRender}></Item>
      </TabPanel>
    </div>
  );
}

export default App;
