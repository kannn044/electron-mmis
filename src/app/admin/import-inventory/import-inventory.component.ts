import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { IConnection } from 'mysql';
import { ImportInventoryService } from "../import-inventory.service";
import * as _ from 'lodash'
import { AlertService } from "../../alert.service";
import * as moment from "moment";
const path = require('path')
const fse = require('fs-extra');
const fs = require('fs');
const json2xls = require('json2xls');
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
  products: any = [];
  db: IConnection
  currentPage = 1
  pageSize = 10;
  totalItems = 0
  pathDownload:any ='' ;
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
      const rs: any = await this.importInventoryService.getGenerics(this.db, this.warehouseSelect, this.genericTypeSelect);
      this.modalLoading.hide();
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

  async downloadExecl() {
    this.modalLoading.show();
    try {
      console.log(this.pathDownload);
      
      let _tableName = `product`;

      let r = [];
      let i = 0;
      this.products.forEach(v => {
        i++;
        r.push({
          'ลำดับ': i,
          generic_code: v.generic_code,
          generic_name: v.generic_name,
          trade_code: v.trade_code,
          trade_name: v.trade_name,
          large_unit: v.large_unit,
          conversion: v.conversion,
          small_unit: v.small_unit,
          expired_date: v.expired_date,
          lot_no: v.lot_no,
          qty: v.qty,
          warehouse_id: v.warehouse_id
        })
      });
      // // create tmp file
      let tmpFile = `${_tableName}-${moment().format('DD-MM-YYYY')}.xls`;
      tmpFile = path.resolve('./download', tmpFile);
      let excel = json2xls(r);
      fs.writeFileSync(tmpFile, excel, 'binary');
      // // res.download(tmpFile, (err) => {
      // //   if (err) {
      // //     res.send({ ok: false, message: err })
      // //   } else {
      // //     fse.removeSync(tmpFile);
      // //   }
      // // })
      this.alertService.success('Download Success.');
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
      console.error(error);
    }
  }
}
