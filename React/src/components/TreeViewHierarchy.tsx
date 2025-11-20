import { useCallback, useRef } from 'react';
import TreeView from 'devextreme-react/tree-view';
import Sortable from 'devextreme-react/sortable';
import { type SortableTypes } from 'devextreme-react/sortable';
import dxTreeView, { type Node, type Item as TreeItem } from 'devextreme/ui/tree_view';
import { itemsDriveHierarchy as treeData } from '../data';

interface TreeFieldExpr {
  key: string;
  items: string;
}

interface TreeViewHierarchyProps {
  shouldClearSelection: boolean;
}

function draggedItemsRender(data: SortableTypes.DragTemplateData): JSX.Element {
  const draggedItems = data.itemData.map((node: Node) => <div key={node.text} className='dragged-item'>{node.text}</div>);
  return (<div>{draggedItems}</div>);
}

function canDrag(treeView: dxTreeView, e: SortableTypes.DragStartEvent): boolean {
  const fromNode = getNodeByVisualIndex(treeView, e.fromIndex);
  return !!(fromNode?.selected && e.itemData?.length);
}

function canDrop(treeView: dxTreeView, e: SortableTypes.DragChangeEvent | SortableTypes.DragEndEvent): boolean {
  const toNode: Node | null = getNodeByVisualIndex(treeView, e.toIndex ?? 0);
  if (!toNode) return false;
  const canAcceptChildren = (e.dropInsideItem && toNode.itemData?.hasItems) || !e.dropInsideItem;
  const toNodeIsChild = toNode && e.itemData.some((i: Node) => isParent(toNode, i));
  const fromIndices = e.itemData.map((node: Node) => getVisualIndexByNode(treeView, node));
  const targetThemselves = toNode && (e.itemData.some((i: Node) => i.key === toNode.key) || fromIndices.includes(e.toIndex));
  return canAcceptChildren && !toNodeIsChild && !targetThemselves;
}

function moveNodes(items: TreeItem[], e: SortableTypes.DragEndEvent, toNode: Node | null, treeFieldExpr: TreeFieldExpr): void {
  const nodesToMove = getTopNodes(e.itemData);
  nodesToMove.forEach((nodeToMove: Node) => {
    const fromNodeContainingArray = getNodeContainingArray(nodeToMove, items, treeFieldExpr.items);
    const fromIndex = getLocalIndex(fromNodeContainingArray, nodeToMove.key, treeFieldExpr.key);
    fromNodeContainingArray.splice(fromIndex, 1);
  });
  if (e.dropInsideItem) {
    if (!toNode?.itemData) return;
    const toIndex = toNode.itemData[treeFieldExpr.items].length;
    toNode.itemData[treeFieldExpr.items].splice(toIndex, 0, ...nodesToMove.map((i: Node) => i.itemData));
  } else {
    const toNodeContainingArray = getNodeContainingArray(toNode, items, treeFieldExpr.items);
    const toIndex = toNode === null
      ? items.length
      : getLocalIndex(toNodeContainingArray, toNode.key, treeFieldExpr.key);
    toNodeContainingArray.splice(toIndex, 0, ...nodesToMove.map((i: Node) => i.itemData as TreeItem));
  }
}

function isParent(node: Node, possibleParentNode: Node): boolean {
  if (!node.parent) return false;
  return node.parent.key !== possibleParentNode.key ? isParent(node.parent, possibleParentNode) : true;
}

function getTopNodes(nodes: Node[]): Node[] {
  return nodes.filter((nodeToCheck: Node) => !nodes.some((n: Node) => isParent(nodeToCheck, n)));
}

function getNodeContainingArray(node: Node | null, rootArray: TreeItem[], itemsExpr: string): TreeItem[] {
  return node === null || !node.parent || !node.parent.itemData
    ? rootArray
    : (node.parent.itemData[itemsExpr] as TreeItem[]);
}

function getVisualIndexByNode(treeView: dxTreeView, node: TreeItem): number {
  const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
  const nodeElement = nodeElements.find((n: Element) => n.getAttribute('data-item-id') === node.key);
  return nodeElements.indexOf(nodeElement as Element);
}

function getNodeByVisualIndex(treeView: dxTreeView, index: number): Node | null {
  const nodeElement = treeView.element().querySelectorAll('.dx-treeview-node')[index];
  if (nodeElement) {
    return getNodeByKey(treeView.getNodes(), nodeElement.getAttribute('data-item-id'));
  }
  return null;
}

function getNodeByKey(nodes: Node[], key: string | number | null): Node | null {
  for (const node of nodes) {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      const foundNode = getNodeByKey(node.children as Node[], key);
      if (foundNode != null) {
        return foundNode;
      }
    }
  }
  return null;
}

function calculateToIndex(e: SortableTypes.DragChangeEvent | SortableTypes.DragEndEvent): number {
  if (e.dropInsideItem) return e.toIndex ?? 0;
  const fromIndex = e.fromIndex ?? 0;
  const toIndex = e.toIndex ?? 0;
  return fromIndex >= toIndex ? toIndex : toIndex + 1;
}

function getLocalIndex(array: TreeItem[], key: string | number, keyExpr: string): number {
  const idsArray = array.map((elem: TreeItem) => elem[keyExpr] as string | number);
  return idsArray.indexOf(key);
}

function TreeViewHierarchy(props: TreeViewHierarchyProps): JSX.Element {
  const treeViewRef = useRef<dxTreeView>(null);

  const dragStart = useCallback((e: SortableTypes.DragStartEvent) => {
    const treeView = treeViewRef.current?.instance();
    if (!treeView) return;
    e.itemData = treeView.getSelectedNodes();
    e.cancel = !canDrag(treeView, e);
  }, []);

  const dragChange = useCallback((e: SortableTypes.DragChangeEvent) => {
    const treeView = treeViewRef.current?.instance();
    if (!treeView) return;
    e.cancel = !canDrop(treeView, e);
  }, []);

  const dragEnd = useCallback((e: SortableTypes.DragEndEvent) => {
    const treeView = treeViewRef.current?.instance();
    if (!treeView) return;
    const allItems = treeView.option('items') as TreeItem[];
    if (canDrop(treeView, e)) {
      const toNode = getNodeByVisualIndex(treeView, calculateToIndex(e));
      const treeViewExpr = {
        items: treeView.option('itemsExpr') as string,
        key: treeView.option('keyExpr') as string,
      };
      moveNodes(allItems, e, toNode, treeViewExpr);
    }
    treeView.option('items', allItems);
    if (props.shouldClearSelection) {
      treeView.unselectAll();
    }
  }, [props.shouldClearSelection]);

  return (
    <Sortable filter='.dx-treeview-item'
      allowDropInsideItem={true}
      allowReordering={true}
      onDragStart={dragStart}
      onDragChange={dragChange}
      onDragEnd={dragEnd}
      dragRender={draggedItemsRender}
    >
      <TreeView ref={treeViewRef}
        items={treeData}
        className='tab-item-content'
        expandNodesRecursive={false}
        selectNodesRecursive={false}
        showCheckBoxesMode='normal'
        dataStructure='tree'
        displayExpr='name'
        width={300}
      ></TreeView>
    </Sortable>
  );
}

export default TreeViewHierarchy;
