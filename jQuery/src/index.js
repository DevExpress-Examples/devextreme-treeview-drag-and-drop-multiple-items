$(() => {
  function createTabItemTemplate(contentID) {
    return $('<div>').attr('id', contentID).addClass('tab-item-content');
  }

  $('#tabPanel').dxTabPanel({
    deferRendering: false,
    items: [
      {
        title: 'Plain Data',
        template: () => createTabItemTemplate('treeViewPlainData'),
      }, {
        title: 'Hierarchical Data',
        template: () => createTabItemTemplate('treeViewHierarchy'),
      },
    ],
  });

  $('#clear-after-drop-switch').dxSwitch({});
});
