import { InvcService } from './invc.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

import { AdminRoutingModule } from './admin-routing.module';
import { MainPageComponent } from './main-page/main-page.component';
import { HelperModule } from '../helper/helper.module';
import { AuthModule } from '../auth/auth.module';

import { MainService } from './main.service';
import { AlertService } from '../alert.service';
import { LayoutComponent } from './layout/layout.component';
import { InvsConnectionComponent } from './invs-connection/invs-connection.component';
import { InvsSyncComponent } from './invs-sync/invs-sync.component';
import { ImportExcelComponent } from './import-excel/import-excel.component';
import { InvsService } from './invs.service';
import { LoadingModalComponent } from './loading-modal/loading-modal.component';
import { InvcConnectionComponent } from './invc-connection/invc-connection.component';
import { InvcSyncComponent } from './invc-sync/invc-sync.component';

@NgModule({
  imports: [
    CommonModule,
    AdminRoutingModule,
    HelperModule,
    FormsModule,
    ClarityModule,
    AuthModule
  ],
  declarations: [MainPageComponent, LayoutComponent, InvsConnectionComponent, InvsSyncComponent, ImportExcelComponent, LoadingModalComponent, InvcConnectionComponent, InvcSyncComponent],
  providers: [
    MainService,
    AlertService,
    InvsService,
    InvcService
  ]
})
export class AdminModule { }
