import { useCallback, useState } from 'react';
import './App.css';
import 'devextreme/dist/css/dx.material.blue.light.compact.css';
import TabPanel, { Item } from 'devextreme-react/tab-panel';
import Switch, { type SwitchTypes } from 'devextreme-react/switch';
import TreeViewPlain from './components/TreeViewPlain.tsx';
import TreeViewHierarchy from './components/TreeViewHierarchy.tsx';

function App(): JSX.Element {
  const [shouldClearSelection, setShouldClearSelection] = useState(false);

  const switchValueChanged = useCallback((e: SwitchTypes.ValueChangedEvent) => {
    setShouldClearSelection(e.value);
  }, [shouldClearSelection]);

  const treeViewPlainRender = useCallback(
    () => <TreeViewPlain shouldClearSelection={shouldClearSelection}></TreeViewPlain>,
    [shouldClearSelection],
  );

  const treeViewHierarchyRender = useCallback(
    () => <TreeViewHierarchy shouldClearSelection={shouldClearSelection}></TreeViewHierarchy>,
    [shouldClearSelection],
  );

  return (
    <div className='main'>
      <div className='demo-header'>
        <h3>TreeView - Select multiple items and drag&apos;n&apos;drop</h3>
        <div id='toggle-container'>
          <span>Clear selection after drop</span>
          <Switch id='clear-after-drop-switch' value={shouldClearSelection} onValueChanged={switchValueChanged}></Switch>
        </div>
      </div>
      <TabPanel>
        <Item title='Plain Data' render={treeViewPlainRender}></Item>
        <Item title='Hierarchical Data' render={treeViewHierarchyRender}></Item>
      </TabPanel>
    </div>
  );
}

export default App;
