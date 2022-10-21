<!-- default badges list -->
![](https://img.shields.io/endpoint?url=https://codecentral.devexpress.com/api/v1/VersionRange/555418630/22.1.6%2B)
[![](https://img.shields.io/badge/Open_in_DevExpress_Support_Center-FF7200?style=flat-square&logo=DevExpress&logoColor=white)](https://supportcenter.devexpress.com/ticket/details/T1123138)
[![](https://img.shields.io/badge/📖_How_to_use_DevExpress_Examples-e9f6fc?style=flat-square)](https://docs.devexpress.com/GeneralInformation/403183)
<!-- default badges end -->
# DevExtreme TreeView - How to drag and drop multiple items
This example demonstrates how to implement the Drag and Drop functionality for multiple selected items in [TreeView](https://js.devexpress.com/Documentation/Guide/UI_Components/TreeView/Getting_Started_with_TreeView/). It contains implementations for both plain and hierarchical data structures.

Use the following demos if you want to implement Drag and Drop of single items:

[TreeView - Drag & Drop for Plain Data Structure](https://js.devexpress.com/Demos/WidgetsGallery/Demo/TreeView/DragAndDropPlainDataStructure/jQuery/Light/)

[TreeView - Drag & Drop for Hierarchical Data Structure](https://js.devexpress.com/Demos/WidgetsGallery/Demo/TreeView/DragAndDropHierarchicalDataStructure/jQuery/Light/)

## Implementation Details
TreeView doesn't have a built-in Drag and Drop functionality. This example is based on the [DevExtreme Sortable](https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxSortable/) component, which adds the capability of reordering items.
