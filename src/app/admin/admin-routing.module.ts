import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../auth-guard.service';
import { LayoutComponent } from './layout/layout.component';
// pages
import { MainPageComponent } from './main-page/main-page.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { ImportExcelComponent } from './import-excel/import-excel.component';
<<<<<<< HEAD

import { InvsConnectionComponent } from './invs-connection/invs-connection.component';
import { InvcConnectionComponent } from './invc-connection/invc-connection.component';
import { InvsSyncComponent } from './invs-sync/invs-sync.component';
import { InvcSyncComponent } from './invc-sync/invc-sync.component';
=======
import { InvdosComponent } from './invdos/invdos.component';
>>>>>>> 45a35956ef6be6d73005e0a5227f956126c8c361
const routes: Routes = [
  {
    path: 'admin',
    component: LayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'import-excel', pathMatch: 'full' },
      { path: 'main', component: MainPageComponent },
      { path: 'import-excel', component: ImportExcelComponent },
      { path: 'invs', component: InvsConnectionComponent },
      { path: 'invc', component: InvcConnectionComponent },
      { path: 'invs-sync', component: InvsSyncComponent },
<<<<<<< HEAD
      { path: 'invc-sync', component: InvcSyncComponent },
=======
      { path: 'invdos', component: InvdosComponent },
>>>>>>> 45a35956ef6be6d73005e0a5227f956126c8c361
      { path: '**', component: PageNotFoundComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
