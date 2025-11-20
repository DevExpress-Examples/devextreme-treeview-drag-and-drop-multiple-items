import { Component, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { DxSortableModule, DxTreeViewComponent, DxTreeViewModule } from 'devextreme-angular';
import { DxSortableTypes } from 'devextreme-angular/ui/sortable';
import dxTreeView, { Node, Item as TreeItem } from 'devextreme/ui/tree_view';

interface TreeFieldExpr {
  key: string;
  parentKey: string;
}

@Component({
  selector: 'tree-view-plain',
  templateUrl: './tree-view-plain.component.html',
  standalone: true,
  imports: [CommonModule, DxTreeViewModule, DxSortableModule],
})
export class TreeViewPlainComponent {
  @ViewChild('treeView') treeView!: DxTreeViewComponent;

  @Input() shouldClearSelection = false;

  treeItems: TreeItem[];

  constructor(dataService: DataService) {
    this.treeItems = dataService.getPlainData();
    this.dragStart = this.dragStart.bind(this);
    this.dragChange = this.dragChange.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
  }

  dragStart(e: DxSortableTypes.DragStartEvent): void {
    const treeView = this.treeView.instance;
    e.itemData = treeView.getSelectedNodes();
    e.cancel = !this.canDrag(treeView, e);
  }

  dragChange(e: DxSortableTypes.DragChangeEvent): void {
    const treeView = this.treeView.instance;
    const toNode = this.getNodeByVisualIndex(treeView, this.calculateToIndex(e));
    e.cancel = !this.canDrop(treeView, e, toNode);
  }

  dragEnd(e: DxSortableTypes.DragEndEvent): void {
    const treeView = this.treeView.instance;
    const toNode = this.getNodeByVisualIndex(treeView, this.calculateToIndex(e));
    const allItems = treeView.option('items') as TreeItem[];
    if (!allItems) return;
    const treeViewExpr = {
      key: treeView.option('keyExpr') as string,
      parentKey: treeView.option('parentIdExpr') as string,
    };
    if (this.canDrop(treeView, e, toNode)) {
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

  canDrop(treeView: dxTreeView, e: DxSortableTypes.DragChangeEvent | DxSortableTypes.DragEndEvent, toNode: Node | null): boolean {
    if (!toNode) return false;
    const canAcceptChildren = (e.dropInsideItem && toNode.itemData && (toNode.itemData as Record<string, unknown>)['hasItems']) || !e.dropInsideItem;
    const toNodeIsChild = toNode && e.itemData.some((i: Node) => this.isParent(toNode, i));
    const fromIndices = e.itemData.map((i: Node) => this.getVisualIndexByKey(treeView, i.key));
    const targetThemselves = toNode && (e.itemData.some((i: Node) => i.key === toNode.key) || fromIndices.includes(e.toIndex ?? 0));
    return canAcceptChildren && !toNodeIsChild && !targetThemselves;
  }

  moveNodes(items: TreeItem[], e: DxSortableTypes.DragEndEvent, toNode: Node | null, treeFieldExpr: TreeFieldExpr): void {
    const nodesToMove = this.getTopNodes(e.itemData as Node[]);
    const fromIndices = nodesToMove.map((i: Node) => this.getLocalIndex(items, i.key, treeFieldExpr.key)).reverse();
    fromIndices.forEach((i: number) => items.splice(i, 1));
    const toIndex = toNode === null || !toNode.itemData
      ? items.length
      : this.getLocalIndex(items, toNode.itemData[treeFieldExpr.key] as string | number, treeFieldExpr.key);
    items.splice(toIndex, 0, ...nodesToMove.map((i: Node) => i.itemData).filter((item): item is TreeItem => item !== undefined));
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

  isParent(node: Node, possibleParentNode: Node): boolean {
    if (!node.parent) return false;
    return node.parent.key !== possibleParentNode.key ? this.isParent(node.parent, possibleParentNode) : true;
  }

  getTopNodes(nodes: Node[]): Node[] {
    return nodes.filter((nodeToCheck: Node) => !nodes.some((n: Node) => this.isParent(nodeToCheck, n)));
  }

  getVisualIndexByKey(treeView: dxTreeView, key: string | number): number {
    const nodeElements = Array.from(treeView.element().querySelectorAll('.dx-treeview-node'));
    const nodeElement = nodeElements.find((n: Element) => n.getAttribute('data-item-id') === String(key));
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
        const foundNode = this.getNodeByKey(node.children, key);
        if (foundNode != null) {
          return foundNode;
        }
      }
    }
    return null;
  }

  getLocalIndex(array: TreeItem[], key: string | number, keyExpr: string): number {
    const idsArray = array.map((elem: TreeItem) => elem[keyExpr] as string | number);
    return idsArray.indexOf(key);
  }

  calculateToIndex(e: DxSortableTypes.DragChangeEvent | DxSortableTypes.DragEndEvent): number {
    if (e.dropInsideItem) return e.toIndex ?? 0;
    const fromIndex = e.fromIndex ?? 0;
    const toIndex = e.toIndex ?? 0;
    return fromIndex >= toIndex ? toIndex : toIndex + 1;
  }
}
