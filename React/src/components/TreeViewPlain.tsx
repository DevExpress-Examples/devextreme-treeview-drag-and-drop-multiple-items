import { useCallback, useRef } from 'react';
import TreeView from 'devextreme-react/tree-view';
import Sortable from 'devextreme-react/sortable';
import dxTreeView, { type Node, type Item as TreeItem } from 'devextreme/ui/tree_view';
import { type SortableTypes } from 'devextreme-react/sortable';
import { itemsDrivePlain as plainData } from '../data.ts';

interface TreeFieldExpr {
  key: string;
  parentKey: string;
}

interface TreeViewPlainProps {
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

function canDrop(treeView: dxTreeView, e: SortableTypes.DragChangeEvent | SortableTypes.DragEndEvent, toNode: Node | null): boolean {
  if (!toNode) return false;
  const canAcceptChildren = (e.dropInsideItem && toNode.itemData && toNode.itemData.hasItems) || !e.dropInsideItem;
  const toNodeIsChild = toNode && e.itemData.some((i: Node) => isParent(toNode, i));
  const fromIndices = e.itemData.map((i: Node) => getVisualIndexByNode(treeView, i.key));
  const targetThemselves = toNode && (e.itemData.some((i: Node) => i.key === toNode.key) || fromIndices.includes(e.toIndex));
  return canAcceptChildren && !toNodeIsChild && !targetThemselves;
}

function moveNodes(items: TreeItem[], e: SortableTypes.DragEndEvent, toNode: Node | null, treeFieldExpr: TreeFieldExpr): void {
  const nodesToMove = getTopNodes(e.itemData);
  const fromIndices = nodesToMove.map((i: Node) => getLocalIndex(items, i.key, treeFieldExpr.key)).reverse();
  fromIndices.forEach((i: number) => items.splice(i, 1));
  const toIndex = toNode === null || !toNode.itemData
    ? items.length
    : getLocalIndex(items, toNode.itemData[treeFieldExpr.key] as string | number, treeFieldExpr.key);
  items.splice(toIndex, 0, ...nodesToMove.map((i: Node) => i.itemData as TreeItem).filter((item): item is TreeItem => item !== undefined));
  nodesToMove.forEach((i: Node) => {
    if (i.itemData && toNode?.itemData) {
      if (e.dropInsideItem) {
        i.itemData[treeFieldExpr.parentKey] = toNode.itemData[treeFieldExpr.key];
      } else {
        i.itemData[treeFieldExpr.parentKey] = toNode != null ? toNode.itemData[treeFieldExpr.parentKey] : undefined;
      }
    }
  });
}

function isParent(node: Node, possibleParentNode: Node): boolean {
  if (!node.parent) return false;
  return node.parent.key !== possibleParentNode.key ? isParent(node.parent, possibleParentNode) : true;
}

function getTopNodes(nodes: Node[]): Node[] {
  return nodes.filter((nodeToCheck: Node) => !nodes.some((n: Node) => isParent(nodeToCheck, n)));
}

function getVisualIndexByNode(treeView: dxTreeView, key: string | number): number {
  const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
  const nodeElement = nodeElements.find((n: Element) => n.getAttribute('data-item-id') === key);
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
      const foundNode = getNodeByKey(node.children, key);
      if (foundNode != null) {
        return foundNode;
      }
    }
  }
  return null;
}

function getLocalIndex(array: TreeItem[], key: string | number, keyExpr: string): number {
  const idsArray = array.map((elem: TreeItem) => elem[keyExpr] as string | number);
  return idsArray.indexOf(key);
}

function calculateToIndex(e: SortableTypes.DragChangeEvent | SortableTypes.DragEndEvent): number {
  if (e.dropInsideItem) return e.toIndex ?? 0;
  const fromIndex = e.fromIndex ?? 0;
  const toIndex = e.toIndex ?? 0;
  return fromIndex >= toIndex ? toIndex : toIndex + 1;
}

function TreeViewPlain(props: TreeViewPlainProps): JSX.Element {
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
    const toNode = getNodeByVisualIndex(treeView, calculateToIndex(e));
    e.cancel = !canDrop(treeView, e, toNode);
  }, []);

  const dragEnd = useCallback((e: SortableTypes.DragEndEvent) => {
    const treeView = treeViewRef.current?.instance();
    if (!treeView) return;
    const toNode = getNodeByVisualIndex(treeView, calculateToIndex(e));
    const allItems = treeView.option('items') as TreeItem[];
    const treeViewExpr = {
      key: treeView.option('keyExpr') as string,
      parentKey: treeView.option('parentIdExpr') as string,
    };
    if (canDrop(treeView, e, toNode)) {
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
        items={plainData}
        className='tab-item-content'
        expandNodesRecursive={false}
        selectNodesRecursive={false}
        showCheckBoxesMode='normal'
        dataStructure='plain'
        displayExpr='name'
        width={300}
      ></TreeView>
    </Sortable>
  );
}

export default TreeViewPlain;
