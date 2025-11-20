import { Component } from '@angular/core';
import { DxSwitchModule, DxTabPanelModule } from 'devextreme-angular';
import { TreeViewPlainComponent } from './components/tree-view-plain/tree-view-plain.component';
import { TreeViewHierarchyComponent } from './components/tree-view-hierarchical/tree-view-hierarchy.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [DxTabPanelModule, DxSwitchModule, TreeViewPlainComponent, TreeViewHierarchyComponent],
})
export class AppComponent {
  clearSelectionAfterDrop = false;
}
