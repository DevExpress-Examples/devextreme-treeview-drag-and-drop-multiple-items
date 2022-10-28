function dragTemplateH(dragData) {
    const itemsContainer = $("<div>");
    dragData.itemData.forEach((node => {
        const itemContainer = $("<div>").html(node.text).addClass("dragged-item");
        itemsContainer.append(itemContainer);
    }));
    return itemsContainer;
}
function dragStartH(e) {
    const treeView = $("#tree-view-hierarchy").dxTreeView("instance");
    e.itemData = treeView.getSelectedNodes();
    e.cancel = !canDragH(treeView, e);
}
function dragChangeH(e) {
    const treeView = $("#tree-view-hierarchy").dxTreeView("instance");
    e.cancel = !canDropH(treeView, e);
}
function dragEndH(e) {
    const treeView = $("#tree-view-hierarchy").dxTreeView("instance");
    const allItems = treeView.option("items");
    if (canDropH(treeView, e)) {
        const toNode = getNodeByVisualIndexH(treeView, calculateToIndexH(e));
        const treeViewExpr = {
            items: treeView.option("itemsExpr"),
            key: treeView.option("keyExpr")
        }
        moveNodesH(allItems, e, toNode, treeViewExpr);
    }
    treeView.option("items", allItems);
    if (shouldClearSelectionH())
        treeView.unselectAll();
}
function canDragH(treeView, e) {
    const fromNode = getNodeByVisualIndexH(treeView, e.fromIndex);
    return fromNode.selected && e.itemData && e.itemData.length;
}
function canDropH(treeView, e) {
    const toNode = getNodeByVisualIndexH(treeView, e.toIndex);
    const canAcceptChildren = (e.dropInsideItem && toNode.itemData.isDirectory) || !e.dropInsideItem;
    const toNodeIsChild = toNode && e.itemData.some(i => isParentH(toNode, i));
    const fromIndices = e.itemData.map(node => getVisualIndexByNodeH(treeView, node));
    const targetThemselves = toNode && (e.itemData.some(i => i.key === toNode.key) || fromIndices.includes(e.toIndex));
    return canAcceptChildren && !toNodeIsChild && !targetThemselves;
}
function moveNodesH(items, e, toNode, treeFieldExpr) {
    const nodesToMove = getTopNodesH(e.itemData);
    nodesToMove.forEach(nodeToMove => {
        const fromNodeContainingArray = getNodeContainingArrayH(nodeToMove, items, treeFieldExpr.items);
        const fromIndex = getLocalIndexH(fromNodeContainingArray, nodeToMove.key, treeFieldExpr.key);
        fromNodeContainingArray.splice(fromIndex, 1);
    });
    if (e.dropInsideItem) {
        const toIndex = toNode.itemData[treeFieldExpr.items].length;
        toNode.itemData[treeFieldExpr.items].splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
    } else {
        const toNodeContainingArray = getNodeContainingArrayH(toNode, items, treeFieldExpr.items);
        const toIndex = toNode === null
            ? items.length
            : getLocalIndexH(toNodeContainingArray, toNode.key, treeFieldExpr.key);
        toNodeContainingArray.splice(toIndex, 0, ...nodesToMove.map(i => i.itemData));
    }
}
function isParentH(node, possibleParentNode) {
    if (!node.parent) return false;
    return node.parent.key !== possibleParentNode.key ? isParentH(node.parent, possibleParentNode) : true;
}
function getTopNodesH(nodes) {
    return nodes.filter(nodeToCheck => {
        return !nodes.some(n => isParentH(nodeToCheck, n));
    });
}
function getNodeContainingArrayH(node, rootArray, itemsExpr) {
    return node === null || node.parent === null
        ? rootArray
        : node.parent.itemData[itemsExpr];
}
function getVisualIndexByNodeH(treeView, node) {
    const nodeElements = treeView.element().find('.dx-treeview-node').toArray();
    const nodeElement = nodeElements.find(n => n.getAttribute('data-item-id') === node.key);
    return nodeElements.indexOf(nodeElement);
}
function getNodeByVisualIndexH(treeView, index) {
    const nodeElement = treeView.element().find('.dx-treeview-node')[index];
    if (nodeElement) {
        return getNodeByKeyH(treeView.getNodes(), nodeElement.getAttribute('data-item-id'));
    }
    return null;
}
function getNodeByKeyH(nodes, key) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].key == key) {
            return nodes[i];
        }
        if (nodes[i].children) {
            const node = getNodeByKeyH(nodes[i].children, key);
            if (node != null) {
                return node;
            }
        }
    }
    return null;
}
function calculateToIndexH(e) {
    if (e.dropInsideItem) return e.toIndex;
    return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
}
function getLocalIndexH(array, key, keyExpr) {
    const idsArray = array.map((elem) => elem[keyExpr]);
    return idsArray.indexOf(key);
}
function shouldClearSelectionH() {
    return $("#clearAfterDropSwitch").dxSwitch("option", "value");
}