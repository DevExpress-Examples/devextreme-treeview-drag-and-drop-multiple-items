<script setup lang="ts">
import { ref } from 'vue';
import DxTreeView from 'devextreme-vue/tree-view';
import DxSortable, { type DxSortableTypes } from 'devextreme-vue/sortable';
import dxTreeView, { type Node, type Item as TreeItem } from 'devextreme/ui/tree_view';
import { itemsDriveHierarchy as treeData } from '../data';

interface TreeFieldExpr {
  key: string;
  items: string;
}

const props = defineProps({
  shouldClearSelection: {
    type: Boolean,
    default: false,
  },
});

const treeViewRef = ref<InstanceType<typeof DxTreeView>>();

function canDrag(treeView: dxTreeView, e: DxSortableTypes.DragStartEvent): boolean {
  const fromNode = getNodeByVisualIndex(treeView, e.fromIndex);
  return !!(fromNode?.selected && e.itemData?.length);
}

function canDrop(
  treeView: dxTreeView,
  e: DxSortableTypes.DragChangeEvent | DxSortableTypes.DragEndEvent
): boolean {
  const toNode: Node | null = getNodeByVisualIndex(treeView, e.toIndex ?? 0);
  if (!toNode) return false;
  const canAcceptChildren =
    (e.dropInsideItem && toNode.itemData?.hasItems) || !e.dropInsideItem;
  const toNodeIsChild = toNode && e.itemData.some((i: Node) => isParent(toNode, i));
  const fromIndices =
    e.itemData.map((node: Node) => getVisualIndexByNode(treeView, node));
  const targetThemselves =
    toNode &&
    (e.itemData.some((i: Node) => i.key === toNode.key) ||
      fromIndices.includes(e.toIndex));
  return canAcceptChildren && !toNodeIsChild && !targetThemselves;
}

function moveNodes(
  items: TreeItem[],
  e: DxSortableTypes.DragEndEvent,
  toNode: Node | null,
  treeFieldExpr: TreeFieldExpr
): void {
  const nodesToMove = getTopNodes(e.itemData);
  nodesToMove.forEach((nodeToMove: Node) => {
    const fromNodeContainingArray =
      getNodeContainingArray(nodeToMove, items, treeFieldExpr.items);
    const fromIndex =
      getLocalIndex(fromNodeContainingArray, nodeToMove.key, treeFieldExpr.key);
    fromNodeContainingArray.splice(fromIndex, 1);
  });
  if (e.dropInsideItem) {
    if (!toNode?.itemData) return;
    const toIndex = toNode.itemData[treeFieldExpr.items].length;
    toNode.itemData[treeFieldExpr.items].splice(
      toIndex,
      0,
      ...nodesToMove.map((i: Node) => i.itemData)
    );
  } else {
    const toNodeContainingArray =
      getNodeContainingArray(toNode, items, treeFieldExpr.items);
    const toIndex = toNode === null
      ? items.length
      : getLocalIndex(toNodeContainingArray, toNode.key, treeFieldExpr.key);
    toNodeContainingArray.splice(
      toIndex,
      0,
      ...nodesToMove.map((i: Node) => i.itemData as TreeItem)
    );
  }
}

function isParent(node: Node, possibleParentNode: Node): boolean {
  if (!node.parent) return false;
  return node.parent.key !== possibleParentNode.key
    ? isParent(node.parent, possibleParentNode)
    : true;
}

function getTopNodes(nodes: Node[]): Node[] {
  return nodes.filter(
    (nodeToCheck: Node) =>
      !nodes.some((n: Node) => isParent(nodeToCheck, n))
  );
}

function getNodeContainingArray(
  node: Node | null,
  rootArray: TreeItem[],
  itemsExpr: string
): TreeItem[] {
  return node === null || !node.parent || !node.parent.itemData
    ? rootArray
    : (node.parent.itemData[itemsExpr] as TreeItem[]);
}

function getVisualIndexByNode(treeView: dxTreeView, node: Node): number {
  const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
  const nodeElement = nodeElements.find(n => n.getAttribute('data-item-id') === node.key);
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
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].key == key) {
      return nodes[i];
    }
    if (nodes[i].children) {
      const node = getNodeByKey(nodes[i].children as Node[], key);
      if (node != null) {
        return node;
      }
    }
  }
  return null;
}

function calculateToIndex(
  e: DxSortableTypes.DragChangeEvent | DxSortableTypes.DragEndEvent
): number {
  if (e.dropInsideItem) return e.toIndex ?? 0;
  const fromIndex = e.fromIndex ?? 0;
  const toIndex = e.toIndex ?? 0;
  return fromIndex >= toIndex ? toIndex : toIndex + 1;
}

function getLocalIndex(
  array: TreeItem[],
  key: string | number,
  keyExpr: string
): number {
  const idsArray = array.map((elem) => elem[keyExpr]);
  return idsArray.indexOf(key);
}

function dragStart(e: DxSortableTypes.DragStartEvent) {
  const treeView = treeViewRef.value?.instance;
  if (!treeView) return;
  e.itemData = treeView.getSelectedNodes();
  e.cancel = !canDrag(treeView, e);
}

function dragChange(e: DxSortableTypes.DragChangeEvent) {
  const treeView = treeViewRef.value?.instance;
  if (!treeView) return;
  e.cancel = !canDrop(treeView, e);
}

function dragEnd(e: DxSortableTypes.DragEndEvent) {
  const treeView = treeViewRef.value?.instance;
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
}
</script>
<template>
  <DxSortable
    filter=".dx-treeview-item"
    :allow-drop-inside-item="true"
    :allow-reordering="true"
    @drag-start="dragStart"
    @drag-change="dragChange"
    @drag-end="dragEnd"
    drag-render="draggedItemsRender"
  >
    <template #draggedItemsRender="{ data }">
      <div>
        <div
          v-for="node in data.itemData"
          class="dragged-item"
          :key="node.text"
        >
          {{ node.text }}
        </div>
      </div>
    </template>
    <DxTreeView
      ref="treeViewRef"
      :items="treeData"
      class="tab-item-content"
      :expand-nodes-recursive="false"
      :select-nodes-recursive="false"
      show-check-boxes-mode="normal"
      data-structure="tree"
      display-expr="name"
      :width="300"
    />
  </DxSortable>
</template>
