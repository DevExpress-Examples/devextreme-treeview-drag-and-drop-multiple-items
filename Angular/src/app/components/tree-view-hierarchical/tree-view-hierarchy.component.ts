import { Component, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { DxSortableModule, DxTreeViewComponent, DxTreeViewModule } from 'devextreme-angular';
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';
import dxTreeView, { Node, Item as TreeItem } from 'devextreme/ui/tree_view';

interface TreeFieldExpr {
  key: string;
  items: string;
}

@Component({
  selector: 'tree-view-hierarchy',
  templateUrl: './tree-view-hierarchy.component.html',
  standalone: true,
  imports: [CommonModule, DxTreeViewModule, DxSortableModule],
})
export class TreeViewHierarchyComponent {
  @ViewChild('treeView') treeView!: DxTreeViewComponent;

  @Input() shouldClearSelection = false;

  treeItems: TreeItem[];

  constructor(dataService: DataService) {
    this.treeItems = dataService.getHierarchicalData();
  }

  dragStart(e: DxSortableTypes.DragStartEvent): void {
    const treeView = this.treeView.instance;
    e.itemData = treeView.getSelectedNodes();
    e.cancel = !this.canDrag(treeView, e);
  }

  dragChange(e: DxSortableTypes.DragChangeEvent): void {
    const treeView = this.treeView.instance;
    e.cancel = !this.canDrop(treeView, e);
  }

  dragEnd(e: DxSortableTypes.DragEndEvent): void {
    const treeView = this.treeView.instance;
    const allItems: TreeItem[] | undefined = treeView.option('items');
    if (!allItems) return;
    if (this.canDrop(treeView, e)) {
      const toNode = this.getNodeByVisualIndex(treeView, this.calculateToIndex(e));
      const treeViewExpr: TreeFieldExpr = {
        items: treeView.option('itemsExpr') as string,
        key: treeView.option('keyExpr') as string,
      };
      this.moveNodes(allItems, e, toNode, treeViewExpr);
    }
    treeView.option('items', allItems);
    if (this.shouldClearSelection) {
      treeView.unselectAll();
    }
  }

  canDrag(treeView: dxTreeView, e: DxSortableTypes.DragStartEvent): boolean {
    const fromNode = this.getNodeByVisualIndex(treeView, e.fromIndex ?? 0);
    return !!(fromNode?.selected && e.itemData?.length);
  }

  canDrop(treeView: dxTreeView, e: DxSortableTypes.DragChangeEvent | DxSortableTypes.DragEndEvent): boolean {
    const toNode: Node | null = this.getNodeByVisualIndex(treeView, e.toIndex ?? 0);
    if (!toNode) return false;
    const canAcceptChildren = (e.dropInsideItem && toNode.itemData?.hasItems) || !e.dropInsideItem;
    const toNodeIsChild = toNode && e.itemData.some((i: Node) => this.isParent(toNode, i));
    const fromIndices = e.itemData.map((node: Node) => this.getVisualIndexByNode(treeView, node));
    const targetThemselves = !!(e.itemData.some((i: Node) => i.key === toNode?.key) || fromIndices.includes(e.toIndex ?? 0));
    return canAcceptChildren && !toNodeIsChild && !targetThemselves;
  }

  moveNodes(items: TreeItem[], e: DxSortableTypes.DragEndEvent, toNode: Node | null, treeFieldExpr: TreeFieldExpr): void {
    const nodesToMove = this.getTopNodes(e.itemData);
    nodesToMove.forEach((nodeToMove: Node) => {
      const fromNodeContainingArray = this.getNodeContainingArray(nodeToMove, items, treeFieldExpr.items);
      const fromIndex = this.getLocalIndex(fromNodeContainingArray, nodeToMove.key, treeFieldExpr.key);
      fromNodeContainingArray.splice(fromIndex, 1);
    });
    if (e.dropInsideItem) {
      if (!toNode?.itemData) return;
      const toIndex = (toNode.itemData[treeFieldExpr.items] as TreeItem[]).length;
      (toNode.itemData[treeFieldExpr.items] as TreeItem[]).splice(toIndex, 0, ...nodesToMove.map((i: Node) => i.itemData as TreeItem));
    } else {
      const toNodeContainingArray = this.getNodeContainingArray(toNode, items, treeFieldExpr.items);
      const toIndex = toNode === null
        ? items.length
        : this.getLocalIndex(toNodeContainingArray, toNode.key, treeFieldExpr.key);
      toNodeContainingArray.splice(toIndex, 0, ...nodesToMove.map((i: Node) => i.itemData as TreeItem));
    }
  }

  isParent(node: Node, possibleParentNode: Node): boolean {
    if (!node.parent) return false;
    return node.parent.key !== possibleParentNode.key ? this.isParent(node.parent as Node, possibleParentNode) : true;
  }

  getTopNodes(nodes: Node[]): Node[] {
    return nodes.filter((nodeToCheck: Node) => !nodes.some((n: Node) => this.isParent(nodeToCheck, n)));
  }

  getNodeContainingArray(node: Node | null, rootArray: TreeItem[], itemsExpr: string): TreeItem[] {
    return node === null || !node.parent || !node.parent.itemData
      ? rootArray
      : (node.parent.itemData[itemsExpr] as TreeItem[]);
  }

  getVisualIndexByNode(treeView: dxTreeView, node: TreeItem): number {
    const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
    const nodeElement = nodeElements.find((n: Element) => n.getAttribute('data-item-id') === String(node['key']));
    return nodeElements.indexOf(nodeElement as Element);
  }

  getNodeByVisualIndex(treeView: dxTreeView, index: number): Node | null {
    const nodeElement = treeView.element().querySelectorAll('.dx-treeview-node')[index];
    if (nodeElement) {
      return this.getNodeByKey(treeView.getNodes() as Node[], nodeElement.getAttribute('data-item-id'));
    }
    return null;
  }

  getNodeByKey(nodes: Node[], key: string | number | null): Node | null {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const foundNode = this.getNodeByKey(node.children as Node[], key);
        if (foundNode != null) {
          return foundNode;
        }
      }
    }
    return null;
  }

  calculateToIndex(e: DxSortableTypes.DragChangeEvent | DxSortableTypes.DragEndEvent): number {
    if (e.dropInsideItem) return e.toIndex ?? 0;
    const fromIndex = e.fromIndex ?? 0;
    const toIndex = e.toIndex ?? 0;
    return fromIndex >= toIndex ? toIndex : toIndex + 1;
  }

  getLocalIndex(array: TreeItem[], key: string | number, keyExpr: string): number {
    const idsArray = array.map((elem: TreeItem) => elem[keyExpr] as string | number);
    return idsArray.indexOf(key);
  }
}
