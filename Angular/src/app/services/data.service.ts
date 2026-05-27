import { Injectable } from '@angular/core';
import { Item as TreeItem } from 'devextreme/ui/tree_view';

interface DriveItem extends TreeItem {
  name: string;
  items?: DriveItem[];
}

const itemsDrivePlain: DriveItem[] = [{
  id: '1',
  name: 'Documents',
  icon: 'activefolder',
  hasItems: true,
  expanded: true,
}, {
  id: '2',
  parentId: '1',
  name: 'Projects',
  icon: 'activefolder',
  hasItems: true,
  expanded: true,
}, {
  id: '3',
  parentId: '2',
  name: 'About.rtf',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '4',
  parentId: '2',
  name: 'Passwords.rtf',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '5',
  parentId: '2',
  name: 'About.xml',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '6',
  parentId: '2',
  name: 'Managers.rtf',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '7',
  parentId: '2',
  name: 'ToDo.txt',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '8',
  name: 'Images',
  icon: 'activefolder',
  hasItems: true,
  expanded: true,
}, {
  id: '9',
  parentId: '8',
  name: 'logo.png',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '10',
  parentId: '8',
  name: 'banner.gif',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '11',
  name: 'System',
  icon: 'activefolder',
  hasItems: true,
  expanded: true,
}, {
  id: '12',
  parentId: '11',
  name: 'Employees.txt',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '13',
  parentId: '11',
  name: 'PasswordList.txt',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '14',
  name: 'Description.rtf',
  icon: 'file',
  hasItems: false,
  expanded: true,
}, {
  id: '15',
  icon: 'file',
  name: 'Description.txt',
  hasItems: false,
  expanded: true,
}];

const itemsDriveHierarchy: DriveItem[] = [{
  id: '1',
  name: 'Documents',
  hasItems: true,
  icon: 'activefolder',
  expanded: true,
  items: [{
    id: '2',
    name: 'Projects',
    hasItems: true,
    icon: 'activefolder',
    expanded: true,
    items: [{
      id: '3',
      name: 'About.rtf',
      icon: 'file',
      hasItems: false,
    }, {
      id: '4',
      name: 'Passwords.rtf',
      icon: 'file',
      hasItems: false,
    },
    ],
  }, {
    id: '5',
    name: 'About.xml',
    icon: 'file',
    hasItems: false,
  }, {
    id: '6',
    name: 'Managers.rtf',
    icon: 'file',
    hasItems: false,
  }, {
    id: '7',
    name: 'ToDo.txt',
    icon: 'file',
    hasItems: false,
  }],
}, {
  id: '8',
  name: 'Images',
  hasItems: true,
  icon: 'activefolder',
  expanded: true,
  items: [{
    id: '9',
    name: 'logo.png',
    icon: 'file',
    hasItems: false,
  }, {
    id: '10',
    name: 'banner.gif',
    icon: 'file',
    hasItems: false,
  },
  ],
}, {
  id: '11',
  name: 'System',
  hasItems: true,
  icon: 'activefolder',
  expanded: true,
  items: [{
    id: '12',
    name: 'Employees.txt',
    icon: 'file',
    hasItems: false,
  }, {
    id: '13',
    name: 'PasswordList.txt',
    icon: 'file',
    hasItems: false,
  }],
}, {
  id: '14',
  name: 'Description.rtf',
  icon: 'file',
  hasItems: false,
}, {
  id: '15',
  name: 'Description.txt',
  icon: 'file',
  hasItems: false,
}];

@Injectable({
  providedIn: 'root',
})
export class DataService {
  getPlainData(): TreeItem[] {
    return itemsDrivePlain;
  }

  getHierarchicalData(): TreeItem[] {
    return itemsDriveHierarchy;
  }
}
