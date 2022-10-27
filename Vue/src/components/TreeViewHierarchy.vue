<template>
    <DxSortable filter=".dx-treeview-item"
        :allow-drop-inside-item="true"
        :allow-reordering="true"
        @drag-start="dragStart"
        @drag-change="dragChange"
        @drag-end="dragEnd"
        dragRender="draggedItemsRender"
    >
        <template #draggedItemsRender="{ data }">
            <div>
                <div v-for="node in data.itemData"
                    class="dragged-item"
                    v-bind:key="node.text">
                    {{node.text}}
                </div>
            </div>
        </template>
        <DxTreeView :ref="treeViewRefKey"
            :items="treeItems"
            class="tab-item-content"
            :expand-nodes-recursive="false"
            :select-nodes-recursive="false"
            show-check-boxes-mode="normal"
            data-structure="tree"
            display-expr="name"
            :width="300"
        ></DxTreeView>
    </DxSortable>
  </template>
  
  <script>
  
  import DxTreeView from 'devextreme-vue/tree-view';
  import DxSortable from 'devextreme-vue/sortable';
  import { treeData } from '../data.js';
  
    const treeViewRefKey = "tree-view";

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

  export default {
    name: 'TreeViewHierarchy',
    components: {
        DxTreeView, DxSortable
    },
    props: {
        shouldClearSelection: Boolean
    },
    data() {
        return {
            treeItems: treeData,
            treeViewRefKey
        }
    },
    methods: {
        dragStart(e) {
            const treeView = this.$refs[treeViewRefKey].instance;
            e.itemData = treeView.getSelectedNodes();
            e.cancel = !canDrag(treeView, e);
        },
        dragChange(e) {
            const treeView = this.$refs[treeViewRefKey].instance;
            e.cancel = !canDrop(treeView, e);
        },
        dragEnd(e) {
            const treeView = this.$refs[treeViewRefKey].instance;
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
            if (this.shouldClearSelection)
                treeView.unselectAll();
        },
        
    }
  }
  </script>
  