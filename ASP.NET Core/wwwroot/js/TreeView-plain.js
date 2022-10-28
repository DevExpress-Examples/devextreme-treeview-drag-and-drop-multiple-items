function dragTemplateP(dragData) {
    const itemsContainer = $("<div>");
    dragData.itemData.forEach((node => {
        const itemContainer = $("<div>").html(node.text).addClass("dragged-item");
        itemsContainer.append(itemContainer);
    }));
    return itemsContainer;
}
function dragStartP(e) {
    const treeView = $("#tree-view-plain").dxTreeView("instance");
    e.itemData = treeView.getSelectedNodes();
    e.cancel = !canDragP(treeView, e);
}
function dragChangeP(e) {
    const treeView = $("#tree-view-plain").dxTreeView("instance");
    const toNode = getNodeByVisualIndexP(treeView, calculateToIndexP(e));
    e.cancel = !canDropP(treeView, e, toNode);
}
function dragEndP(e) {
    const treeView = $("#tree-view-plain").dxTreeView("instance");
    const toNode = getNodeByVisualIndexP(treeView, calculateToIndexP(e));
    const allItems = treeView.option("items");
    const treeViewExpr = {
        key: treeView.option("keyExpr"),
        parentKey: treeView.option("parentIdExpr")
    }
    if (canDropP(treeView, e, toNode)) {
        moveNodesP(allItems, e, toNode, treeViewExpr);
    }
    treeView.option("items", allItems);
    if (shouldClearSelectionP())
        treeView.unselectAll();
}
function canDragP(treeView, e) {
    const fromNode = getNodeByVisualIndexP(treeView, e.fromIndex);
    return fromNode.selected && e.itemData && e.itemData.length;
}
function canDropP(treeView, e, toNode) {
    const canAcceptChildren = (e.dropInsideItem && toNode.itemData.isDirectory) || !e.dropInsideItem;
    const toNodeIsChild = toNode && e.itemData.some(i => isParentP(toNode, i));
    const fromIndices = e.itemData.map(i => getVisualIndexByKeyP(treeView, i.key));
    const targetThemselves = toNode && (e.itemData.some(i => i.key === toNode.key) || fromIndices.includes(e.toIndex));
    return canAcceptChildren && !toNodeIsChild && !targetThemselves;
}
function moveNodesP(items, e, toNode, treeFieldExpr) {
    const nodesToMove = getTopNodesP(e.itemData);
    const fromIndices = nodesToMove.map(i => getLocalIndexP(items, i.key, treeFieldExpr.key)).reverse();
    fromIndices.forEach(i => items.splice(i, 1));
    const toIndex = toNode === null
        ? items.length
        : getLocalIndexP(items, toNode.itemData[treeFieldExpr.key], treeFieldExpr.key);
    items.splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
    nodesToMove.forEach(i => {
        if (e.dropInsideItem) {
            i.itemData[treeFieldExpr.parentKey] = toNode.itemData[treeFieldExpr.key];
        } else {
            i.itemData[treeFieldExpr.parentKey] = toNode != null ? toNode.itemData[treeFieldExpr.parentKey] : undefined;
        }
    });
}
function isParentP(node, possibleParentNode) {
    if (!node.parent) return false;
    return node.parent.key !== possibleParentNode.key ? isParentP(node.parent, possibleParentNode) : true;
}
function getTopNodesP(nodes) {
    return nodes.filter(nodeToCheck => {
        return !nodes.some(n => isParentP(nodeToCheck, n));
    });
}
function getNodeByVisualIndexP(treeView, index) {
    const nodeElement = treeView.element().find('.dx-treeview-node')[index];
    if (nodeElement) {
        return getNodeByKeyP(treeView.getNodes(), nodeElement.getAttribute('data-item-id'));
    }
    return null;
}
function getVisualIndexByKeyP(treeView, key) {
    const nodeElements = treeView.element().find('.dx-treeview-node').toArray();
    const nodeElement = nodeElements.find(n => n.getAttribute('data-item-id') === key);
    return nodeElements.indexOf(nodeElement);
}
function getNodeByKeyP(nodes, key) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].key == key) {
            return nodes[i];
        }
        if (nodes[i].children) {
            const node = getNodeByKeyP(nodes[i].children, key);
            if (node != null) {
                return node;
            }
        }
    }
    return null;
}
function getLocalIndexP(array, key, keyExpr) {
    const idsArray = array.map((elem) => elem[keyExpr]);
    return idsArray.indexOf(key);
}
function calculateToIndexP(e) {
    if (e.dropInsideItem) return e.toIndex;
    return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
}
function shouldClearSelectionP() {
    return $("#clearAfterDropSwitch").dxSwitch("option", "value");
}
