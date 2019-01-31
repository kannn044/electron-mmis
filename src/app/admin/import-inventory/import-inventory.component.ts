import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { IConnection } from 'mysql';
import { ImportInventoryService } from "../import-inventory.service";
import * as _ from 'lodash'
import { AlertService } from "../../alert.service";
import * as moment from "moment";
import xlsx from 'node-xlsx';
const path = require('path')
const fs = require('fs');
const json2xls = require('json2xls');
const { dialog } = require('electron').remote;

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
  pathDownload: any = '';

  path: string;

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
      let _tableName = `product`;

      let r = [];
      this.products.forEach(v => {
        r.push({
          "รหัสหน่วยห้ามแก้": v.unit_generic_id,
          "รหัสยาสามัญห้ามแก้": v.generic_code,
          "ชื่อยาสามัญ": v.generic_name,
          "รหัสยาห้ามแก้": v.trade_code,
          "ชื่อยาทางการค้า": v.trade_name,
          "หน่วยใหญ่": v.large_unit,
          "conversion": v.conversion,
          "หน่วยเล็ก": v.small_unit,
          "วันหมดอายุ": v.expired_date,
          "lot_no": v.lot_no,
          "จำนวนคงเหลือ (หน่วยเล็กสุด)": v.qty,
          "ราคาต่อหน่วย": null,
          "รหัสคลังห้ามแก้": v.warehouse_id,
          "รหัสสินค้าห้ามแก้": v.product_id
        })
      });

      let tmpFile = `${_tableName}-${moment().format('DD-MM-YYYY')}.xls`;
      tmpFile = path.resolve('./download', tmpFile);
      let excel = json2xls(r);
      fs.writeFileSync(tmpFile, excel, 'binary');
      this.alertService.success('Download Success.');
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
      console.error(error);
    }
  }

  async selectPath() {
    const path = dialog.showOpenDialog({ properties: ['openFile'] });
    if (path) {
      this.path = path.toString();
    }
  }

  async importRemain() {
    if (this.path && this.warehouseSelect) {
      await this.modalLoading.show();
      try {
        const workSheetsFromFile = xlsx.parse(fs.readFileSync(this.path));
        let delRs = await this.importInventoryService.deleteWmProducts(this.db, this.warehouseSelect);
        let delRss = await this.importInventoryService.deleteStockCardWarehouse(this.db, this.warehouseSelect);

        if (delRs && delRss) {
          let arData: any = [];
          for (let x = 0; x < 1; x++) {
            const excelData = workSheetsFromFile[x].data;
            for (let y = 1; y < excelData.length; y++) {
              const data = {
                wm_product_id: Math.random().toString(15).substr(2, 12),
                unit_generic_id: excelData[y][0],
                product_id: excelData[y][13].toString(),
                expired_date: excelData[y][8].toString(),
                lot_no: excelData[y][9].toString(),
                qty: excelData[y][10],
                price: excelData[y][11],
                cost: excelData[y][11],
                warehouse_id: excelData[y][12]
              }

              if (this.checkNull(excelData[y][10])) arData.push(data);
            }
          }

          let wmRs = await this.importInventoryService.insertWmProducts(this.db, arData);

          if (wmRs) {
            await this.insertStockcard();
          } else {
            this.alertService.error('นำเข้าคงคลังไม่สำเร็จ');
          }

        } else {
          this.modalLoading.hide();
          this.alertService.error();
        }
        await this.modalLoading.hide();

      } catch (error) {
        this.modalLoading.hide();
        this.alertService.error(error.toString());
      }
    } else {
      this.alertService.error('กรุณาเลือกคลัง')
    }
  }

  async insertStockcard() {
    let dataWarehouses: any = await this.importInventoryService.getWmProducts(this.db, this.warehouseSelect)

    let arDatas: any = [];
    for (let v of dataWarehouses) {
      const objStockCard = {
        'product_id': v.product_id,
        'generic_id': v.generic_id,
        'unit_generic_id': v.unit_generic_id,
        'transaction_type': 'SUMMIT',
        'in_qty': v.qty,
        'in_unit_cost': v.price,
        'balance_generic_qty': 0,
        'balance_qty': 0,
        'balance_unit_cost': v.price,
        'ref_src': v.warehouse_id,
        'comment': 'ยอดยกมาเพื่อเริ่มต้นระบบ MMIS',
        'lot_no': v.lodash,
        'expired_date': v.expired_date
      };

      arDatas.push(objStockCard);
    }

    let wmRss = await this.importInventoryService.insertStockCard(this.db, arDatas);

    if (wmRss) {
      let generics = await this.importInventoryService.adjustStock1(this.db, this.warehouseSelect);
      for (const g of generics[0]) {
        console.log(g)
        let product: any = [];
        let products = await this.importInventoryService.adjustStock2(this.db, g.generic_id, this.warehouseSelect); // รายการทั้งหทก
        let productId = await this.importInventoryService.adjustStock3(this.db, g.generic_id, this.warehouseSelect); //product id
        for (const pd of productId[0]) {
          const obj: any = {
            generic_id: g.generic_id,
            product_id: pd.product_id,
            product_qty: 0,
            generic_qty: 0
          }
          product.push(obj);
        }
        for (const pd of products[0]) {
          const idxG = _.findIndex(product, { generic_id: g.generic_id });
          if (idxG > -1) {
            product[idxG].generic_qty += +pd.in_qty;
            product[idxG].generic_qty -= +pd.out_qty;
            const idx = _.findIndex(product, { product_id: pd.product_id });
            if (idx > -1) {
              product[idx].product_qty += +pd.in_qty;
              product[idx].product_qty -= +pd.out_qty;
            }
            const obj: any = {
              stock_card_id: pd.stock_card_id,
              product_id: pd.product_id,
              balance_qty: product[idx].product_qty,
              balance_generic_qty: product[idxG].generic_qty
            }
            if (pd.balance_qty != obj.balance_qty || pd.balance_generic_qty != obj.balance_generic_qty) {
              await this.importInventoryService.adjustStockUpdate(this.db, obj);
            }
          }
        }
      }
      this.alertService.success('เสร็จสิ้น');
    } else {
      this.alertService.error();
    }
  }


  checkNull(data: any) {
    if (data == null || data === '' || data === ' ' || data === undefined || data === Infinity || data === NaN) {
      return false;
    } else {
      return true;
    }
  }
}
