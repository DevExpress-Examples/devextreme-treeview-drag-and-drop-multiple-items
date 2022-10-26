import { Component, ViewChild, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DxTreeViewComponent } from 'devextreme-angular';

@Component({
  selector: 'tree-view-plain',
  templateUrl: './tree-view-plain.component.html'
})
export class TreeViewPlainComponent {
    @ViewChild("treeView") treeView: DxTreeViewComponent;
    @Input() shouldClearSelection: boolean;
    treeItems: any[];
    constructor(dataService: DataService) {
        this.treeItems = dataService.getPlainData();
        this.dragStart = this.dragStart.bind(this);
        this.dragChange = this.dragChange.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
    }
    dragStart(e) {
        const treeView = this.treeView.instance;
        e.itemData = treeView.getSelectedNodes();
        e.cancel = !this.canDrag(treeView, e);
    }
    dragChange(e) {
        const treeView = this.treeView.instance;
        const allItems = treeView.option("items");
        const toNode = this.getNodeByVisualIndex(treeView, this.calculateToIndex(e));
        e.cancel = !this.canDrop(allItems, e, toNode, treeView.option("keyExpr"));
    }
    dragEnd(e) {
        const treeView = this.treeView.instance;
        const toNode = this.getNodeByVisualIndex(treeView, this.calculateToIndex(e));
        const allItems = treeView.option("items");
        const treeViewExpr = {
            items: treeView.option("itemsExpr"),
            key: treeView.option("keyExpr"),
            parentKey: treeView.option("parentIdExpr")
        }
        if (this.canDrop(allItems, e, toNode, treeViewExpr.key)) {
            this.moveNodes(allItems, e, toNode, treeViewExpr);
        }
        treeView.option("items", allItems);
        if (this.shouldClearSelection)
            treeView.unselectAll();
    }
    canDrag(treeView, e) {
        const fromNode = this.getNodeByVisualIndex(treeView, e.fromIndex);
        return fromNode.selected && e.itemData && e.itemData.length;
    }
    canDrop(items, e, toNode, keyExpr) {
        const canAcceptChildren = (e.dropInsideItem && toNode.itemData.isDirectory) || !e.dropInsideItem;
        const toNodeIsChild = toNode && e.itemData.some(i => this.isParent(toNode, i));
        const fromIndices = e.itemData.map(i => this.getLocalIndex(items, i.key, keyExpr));
        const targetThemselves = toNode && (e.itemData.some(i => i.key === toNode.key) || fromIndices.includes(e.toIndex));
        return canAcceptChildren && !toNodeIsChild && !targetThemselves;
    }
    moveNodes(items, e, toNode, treeFieldExpr) {
        const nodesToMove = this.getTopNodes(e.itemData);
        const fromIndices = nodesToMove.map(i => this.getLocalIndex(items, i.key, treeFieldExpr.key)).reverse();
        fromIndices.forEach(i => items.splice(i, 1));
        const toIndex = toNode === null
            ? items.length
            : this.getLocalIndex(items, toNode.itemData[treeFieldExpr.key], treeFieldExpr.key);
        items.splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
        nodesToMove.forEach(i => {
            if (e.dropInsideItem) {
                i.itemData[treeFieldExpr.parentKey] = toNode.itemData[treeFieldExpr.key];
            } else {
                i.itemData[treeFieldExpr.parentKey] = toNode != null ? toNode.itemData[treeFieldExpr.parentKey] : undefined;
            }
        });
    }
    isParent(node, possibleParentNode) {
        if (!node.parent) return false;
        return node.parent.key !== possibleParentNode.key ? this.isParent(node.parent, possibleParentNode) : true;
    }
    getTopNodes(nodes) {
        return nodes.filter(nodeToCheck => {
            return !nodes.some(n => this.isParent(nodeToCheck, n));
        });
    }
    getNodeByVisualIndex(treeView, index) {
        const nodeElement = treeView.element().querySelectorAll('.dx-treeview-node')[index];
        if (nodeElement) {
            return this.getNodeByKey(treeView.getNodes(), nodeElement.getAttribute('data-item-id'));
        }
        return null;
    }
    getNodeByKey(nodes, key) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].key == key) {
                return nodes[i];
            }
            if (nodes[i].children) {
                const node = this.getNodeByKey(nodes[i].children, key);
                if (node != null) {
                    return node;
                }
            }
        }
        return null;
    }
    getLocalIndex(array, key, keyExpr) {
        const idsArray = array.map((elem) => elem[keyExpr]);
        return idsArray.indexOf(key);
    }
    calculateToIndex(e) {
        if (e.dropInsideItem) return e.toIndex;
        return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
    }
}
