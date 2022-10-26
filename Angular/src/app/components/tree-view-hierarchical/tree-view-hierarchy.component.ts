import { Component, ViewChild, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { DxTreeViewComponent } from 'devextreme-angular';

@Component({
  selector: 'tree-view-hierarchy',
  templateUrl: './tree-view-hierarchy.component.html'
})
export class TreeViewHierarchyComponent {
  @ViewChild("treeView") treeView: DxTreeViewComponent;
  @Input() shouldClearSelection: boolean;
  treeItems: any[];
  constructor(dataService: DataService) {
    this.treeItems = dataService.getHierarchicalData();
  }
  dragStart(e) {
    const treeView = this.treeView.instance;
    e.itemData = treeView.getSelectedNodes();
    e.cancel = !this.canDrag(treeView, e);
  }
  dragChange(e) {
    const treeView = this.treeView.instance;
    e.cancel = !this.canDrop(treeView, e);
  }
  dragEnd(e) {
    const treeView = this.treeView.instance;
    const allItems = treeView.option("items");
    if (this.canDrop(treeView, e)) {
        const toNode = this.getNodeByVisualIndex(treeView, this.calculateToIndex(e));
        const treeViewExpr = {
            items: treeView.option("itemsExpr"),
            key: treeView.option("keyExpr")
        }
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
  canDrop(treeView, e) {
      const toNode = this.getNodeByVisualIndex(treeView, e.toIndex);
      const canAcceptChildren = (e.dropInsideItem && toNode.itemData.isDirectory) || !e.dropInsideItem;
      const toNodeIsChild = toNode && e.itemData.some(i => this.isParent(toNode, i));
      const fromIndices = e.itemData.map(node => this.getVisualIndexByNode(treeView, node));
      const targetThemselves = toNode && (e.itemData.some(i => i.key === toNode.key) || fromIndices.includes(e.toIndex));
      return canAcceptChildren && !toNodeIsChild && !targetThemselves;
  }
  moveNodes(items, e, toNode, treeFieldExpr) {
      const nodesToMove = this.getTopNodes(e.itemData);
      nodesToMove.forEach(nodeToMove => {
          const fromNodeContainingArray = this.getNodeContainingArray(nodeToMove, items, treeFieldExpr.items);
          const fromIndex = this.getLocalIndex(fromNodeContainingArray, nodeToMove.key, treeFieldExpr.key);
          fromNodeContainingArray.splice(fromIndex, 1);
      });
      if (e.dropInsideItem) {
          const toIndex = toNode.itemData[treeFieldExpr.items].length;
          toNode.itemData[treeFieldExpr.items].splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
      } else {
          const toNodeContainingArray = this.getNodeContainingArray(toNode, items, treeFieldExpr.items);
          const toIndex = toNode === null
              ? items.length
              : this.getLocalIndex(toNodeContainingArray, toNode.key, treeFieldExpr.key);
          toNodeContainingArray.splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
      }
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
  getNodeContainingArray(node, rootArray, itemsExpr) {
      return node === null || node.parent === null
          ? rootArray
          : node.parent.itemData[itemsExpr];
  }
  getVisualIndexByNode(treeView, node) {
      const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
      const nodeElement = nodeElements.find(n => (<Element>n).getAttribute('data-item-id') === node.key);
      return nodeElements.indexOf(nodeElement);
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
  calculateToIndex(e) {
      if (e.dropInsideItem) return e.toIndex;
      return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
  }
  getLocalIndex(array, key, keyExpr) {
      const idsArray = array.map((elem) => elem[keyExpr]);
      return idsArray.indexOf(key);
  }
}
