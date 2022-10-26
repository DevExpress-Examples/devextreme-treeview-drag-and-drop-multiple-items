import { useCallback, useRef } from 'react';
import TreeView from 'devextreme-react/tree-view';
import Sortable from 'devextreme-react/sortable';
import { treeData } from './data';

function draggedItemsRender(data) {
    const draggedItems = data.itemData.map((node) => 
        <div key={node.text} className="dragged-item">{node.text}</div>
    );
    return (<div>{draggedItems}</div>);
}

function canDrag(treeView, e) {
  const fromNode = getNodeByVisualIndex(treeView, e.fromIndex);
  return fromNode.selected && e.itemData && e.itemData.length;
}
function canDrop(treeView, e) {
    const toNode = getNodeByVisualIndex(treeView, e.toIndex);
    const canAcceptChildren = (e.dropInsideItem && toNode.itemData.isDirectory) || !e.dropInsideItem;
    const toNodeIsChild = toNode && e.itemData.some(i => isParent(toNode, i));
    const fromIndices = e.itemData.map(node => getVisualIndexByNode(treeView, node));
    const targetThemselves = toNode && (e.itemData.some(i => i.key === toNode.key) || fromIndices.includes(e.toIndex));
    return canAcceptChildren && !toNodeIsChild && !targetThemselves;
}
function moveNodes(items, e, toNode, treeFieldExpr) {
  const nodesToMove = getTopNodes(e.itemData);
      nodesToMove.forEach(nodeToMove => {
          const fromNodeContainingArray = getNodeContainingArray(nodeToMove, items, treeFieldExpr.items);
          const fromIndex = getLocalIndex(fromNodeContainingArray, nodeToMove.key, treeFieldExpr.key);
          fromNodeContainingArray.splice(fromIndex, 1);
      });
      if (e.dropInsideItem) {
          const toIndex = toNode.itemData[treeFieldExpr.items].length;
          toNode.itemData[treeFieldExpr.items].splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
      } else {
          const toNodeContainingArray = getNodeContainingArray(toNode, items, treeFieldExpr.items);
          const toIndex = toNode === null
              ? items.length
              : getLocalIndex(toNodeContainingArray, toNode.key, treeFieldExpr.key);
          toNodeContainingArray.splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
      }
}
function isParent(node, possibleParentNode) {
  if (!node.parent) return false;
      return node.parent.key !== possibleParentNode.key ? isParent(node.parent, possibleParentNode) : true;
}
function getTopNodes(nodes) {
  return nodes.filter(nodeToCheck => {
      return !nodes.some(n => isParent(nodeToCheck, n));
  });
}
function getNodeContainingArray(node, rootArray, itemsExpr) {
  return node === null || node.parent === null
      ? rootArray
      : node.parent.itemData[itemsExpr];
}
function getVisualIndexByNode(treeView, node) {
  const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
  const nodeElement = nodeElements.find(n => n.getAttribute('data-item-id') === node.key);
  return nodeElements.indexOf(nodeElement);
}
function getNodeByVisualIndex(treeView, index) {
  const nodeElement = treeView.element().querySelectorAll('.dx-treeview-node')[index];
  if (nodeElement) {
      return getNodeByKey(treeView.getNodes(), nodeElement.getAttribute('data-item-id'));
  }
  return null;
}
function getNodeByKey(nodes, key) {
  for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].key == key) {
          return nodes[i];
      }
      if (nodes[i].children) {
          const node = getNodeByKey(nodes[i].children, key);
          if (node != null) {
              return node;
          }
      }
  }
  return null;
}
function calculateToIndex(e) {
  if (e.dropInsideItem) return e.toIndex;
  return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
}
function getLocalIndex(array, key, keyExpr) {
  const idsArray = array.map((elem) => elem[keyExpr]);
  return idsArray.indexOf(key);
}

function TreeViewHierarchy(props) {
    const treeViewRef = useRef(null);

    const dragStart = useCallback((e) => {
        const treeView = treeViewRef.current.instance;
        e.itemData = treeView.getSelectedNodes();
        e.cancel = !canDrag(treeView, e);
    }, []);
    const dragChange = useCallback((e) => {
        const treeView = treeViewRef.current.instance;
        e.cancel = !canDrop(treeView, e);
    }, []);
    const dragEnd = useCallback((e) => {
        const treeView = treeViewRef.current.instance;
        const allItems = treeView.option("items");
        if (canDrop(treeView, e)) {
            const toNode = getNodeByVisualIndex(treeView, calculateToIndex(e));
            const treeViewExpr = {
                items: treeView.option("itemsExpr"),
                key: treeView.option("keyExpr")
            }
            moveNodes(allItems, e, toNode, treeViewExpr);
        }
        treeView.option("items", allItems);
        if (props.shouldClearSelection)
            treeView.unselectAll();
    }, [props.shouldClearSelection]);    

  return (
    <Sortable filter=".dx-treeview-item"
        allowDropInsideItem={true}
        allowReordering={true}
        onDragStart={dragStart}
        onDragChange={dragChange}
        onDragEnd={dragEnd}
        dragRender={draggedItemsRender}
    >
        <TreeView ref={treeViewRef}
            items={treeData}
            className="tab-item-content"
            expandNodesRecursive={false}
            selectNodesRecursive={false}
            showCheckBoxesMode="normal"
            dataStructure="tree"
            displayExpr="name"
            width={300}
        ></TreeView>
    </Sortable>
  );
}

export default TreeViewHierarchy;