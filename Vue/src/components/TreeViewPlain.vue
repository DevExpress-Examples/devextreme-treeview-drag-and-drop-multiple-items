<template>
    <DxSortable filter=".dx-treeview-item"
        :allow-drop-inside-item="true"
        :allow-reordering="true"
        @drag-start="dragStart"
        @drag-change="dragChange"
        @drag-end="dragEnd"
        dragTemplate="draggedItemsRender"
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
            data-structure="plain"
            display-expr="name"
            :width="300"
        ></DxTreeView>
    </DxSortable>
  </template>
  
  <script>
  
  import DxTreeView from 'devextreme-vue/tree-view';
  import DxSortable from 'devextreme-vue/sortable';
  import { plainData } from '../data.js';
  
    const treeViewRefKey = "tree-view";

    function canDrag(treeView, e) {
        const fromNode = getNodeByVisualIndex(treeView, e.fromIndex);
        return fromNode.selected && e.itemData && e.itemData.length;
    }
    function canDrop(treeView, e, toNode) {
        const canAcceptChildren = (e.dropInsideItem && toNode.itemData.isDirectory) || !e.dropInsideItem;
        const toNodeIsChild = toNode && e.itemData.some(i => isParent(toNode, i));
        const fromIndices = e.itemData.map(i => getVisualIndexByKey(treeView, i.key));
        const targetThemselves = toNode && (e.itemData.some(i => i.key === toNode.key) || fromIndices.includes(e.toIndex));
        return canAcceptChildren && !toNodeIsChild && !targetThemselves;
    }
    function moveNodes(items, e, toNode, treeFieldExpr) {
        const nodesToMove = getTopNodes(e.itemData);
        const fromIndices = nodesToMove.map(i => getLocalIndex(items, i.key, treeFieldExpr.key)).reverse();
        fromIndices.forEach(i => items.splice(i, 1));
        const toIndex = toNode === null
            ? items.length
            : getLocalIndex(items, toNode.itemData[treeFieldExpr.key], treeFieldExpr.key);
        items.splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
        nodesToMove.forEach(i => {
            if (e.dropInsideItem) {
                i.itemData[treeFieldExpr.parentKey] = toNode.itemData[treeFieldExpr.key];
            } else {
                i.itemData[treeFieldExpr.parentKey] = toNode != null ? toNode.itemData[treeFieldExpr.parentKey] : undefined;
            }
        });
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
    function getVisualIndexByKey(treeView, key) {
        const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
        const nodeElement = nodeElements.find(n => n.getAttribute('data-item-id') === key);
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
    function getLocalIndex(array, key, keyExpr) {
        const idsArray = array.map((elem) => elem[keyExpr]);
        return idsArray.indexOf(key);
    }
    function calculateToIndex(e) {
        if (e.dropInsideItem) return e.toIndex;
        return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
    }

  export default {
    name: 'TreeViewPlain',
    components: {
        DxTreeView, DxSortable
    },
    props: {
        shouldClearSelection: Boolean
    },
    data() {
        return {
            treeItems: plainData,
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
            const toNode = getNodeByVisualIndex(treeView, calculateToIndex(e));
            e.cancel = !canDrop(treeView, e, toNode,);
        },
        dragEnd(e) {
            const treeView = this.$refs[treeViewRefKey].instance;
            const toNode = getNodeByVisualIndex(treeView, calculateToIndex(e));
            const allItems = treeView.option("items");
            const treeViewExpr = {
                key: treeView.option("keyExpr"),
                parentKey: treeView.option("parentIdExpr")
            }
            if (canDrop(treeView, e, toNode)) {
                moveNodes(allItems, e, toNode, treeViewExpr);
            }
            treeView.option("items", allItems);
            if (this.shouldClearSelection)
                treeView.unselectAll();
        }
    }
  }
  </script>
  