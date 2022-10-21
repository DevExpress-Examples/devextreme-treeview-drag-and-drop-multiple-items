$(function () {
    function createTabItemTemplate(contentID) {
        return $("<div>").attr("id", contentID).addClass("tab-item-content");
    }
    $("#tabPanel").dxTabPanel({
        deferRendering: false,
        items: [{
            title: "Plain Data",
            template: function() {
                return createTabItemTemplate("treeViewPlainData");
            }
        }, {
            title: "Hierarchical Data",
            template: function() {
                return createTabItemTemplate("treeViewHierarchy");
            }
        }]
    })
    $("#clearAfterDropSwitch").dxSwitch({});
});