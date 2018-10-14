import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { IConnection } from 'mysql';
import { ImportInventoryService } from "../import-inventory.service";
import * as _ from 'lodash'
import { AlertService } from "../../alert.service";

@Component({
  selector: 'app-import-inventory',
  templateUrl: './import-inventory.component.html',
  styleUrls: ['./import-inventory.component.css']
})
export class ImportInventoryComponent implements OnInit {
  warehouses: any = [];
  warehouseSelect: any = '';
  genericTypeSelect: any = '';
  genericTypes: any = [];
  products:any = [];
  db: IConnection
  currentPage = 1
  pageSize = 10;
  totalItems = 0
  @ViewChild('modalLoading') public modalLoading: any;

  constructor(
    private connectionService: ConnectionService,
    private importInventoryService: ImportInventoryService,
    private alertService: AlertService
  ) {
    this.db = this.connectionService.createConnection('config.json');
  }

  ngOnInit() {
    this.db.connect();
    this.getWarehouses()
  }
  async getWarehouses() {

    this.modalLoading.show();
    try {
      const rs: any = await this.importInventoryService.getWarehouse(this.db);
      this.modalLoading.hide();
      if (rs.length) {
        this.warehouses = _.cloneDeep(_.sortBy(rs, 'short_code'));
      }
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
      console.error(error);
    }
  }
  async onSelectWarehouses(event) {
    this.modalLoading.show();
    try {
      const rs: any = await this.importInventoryService.getGenericType(this.db);
      this.modalLoading.hide();
      if (rs.length) {
        this.genericTypes = _.cloneDeep(rs);
      }
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
      console.error(error);
    }
  }

  async getGenerics() {
    this.modalLoading.show();
    try {
      console.log(this.warehouseSelect);
      
      const rs: any = await this.importInventoryService.getGenerics(this.db,this.warehouseSelect,this.genericTypeSelect);
      this.modalLoading.hide();
      console.log(rs);
      
      if (rs.length) {
        this.products = _.cloneDeep(rs);
        this.totalItems = this.products.length
      }
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
      console.error(error);
    }
  }
}
