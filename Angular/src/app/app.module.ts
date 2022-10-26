import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DxTreeViewModule, DxTabPanelModule, DxSwitchModule, DxSortableModule } from "devextreme-angular";
import { TreeViewPlainComponent } from './components/tree-view-plain/tree-view-plain.component';
import { TreeViewHierarchyComponent } from './components/tree-view-hierarchical/tree-view-hierarchy.component';

@NgModule({
  declarations: [
    AppComponent, TreeViewPlainComponent, TreeViewHierarchyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DxTreeViewModule, DxTabPanelModule, DxSwitchModule, DxSortableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
