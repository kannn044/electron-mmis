import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { IConnection } from 'mysql';

import { AlertService } from '../../alert.service';
import { ImportService } from '../../admin/import.service';

const { dialog } = require('electron').remote;

import xlsx from 'node-xlsx';

import * as _ from 'lodash';
import * as fs from 'fs';

@Component({
  selector: 'app-import-excel',
  templateUrl: './import-excel.component.html',
  styles: []
})
export class ImportExcelComponent implements OnInit {

  @ViewChild('modalLoading') public modalLoading: any;
  constructor(
    private connectionService: ConnectionService,
    private importService: ImportService,
    private alertService: AlertService
  ) {
  }

  peopleRs: any;
  titleRs: any;
  positionRs: any;
  labelersRS: any;
  warehousesRS: any;
  genericRS: any;
  openModal_people = false;
  openModal_labeler = false;
  openModal_warehouse = false;
  openModal_generics = false;
  peopleEdit = {};
  lablerEdit = {};
  warehousesEdit = {};

  path: string;

  rs1: boolean;
  rs2: boolean;
  rs3: boolean;
  rs4: boolean;
  ngOnInit() {
    this.getpeople();
    this.getLabelers();
    this.getWarehouses();
    this.getGeneric();
  }

  async refresh() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.getpeople();
    this.getLabelers();
    this.getWarehouses();
    this.getGeneric();
  }

  async downloadFile() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.importService.deleteTempGenerics(db);
    this.importService.deleteTempProducts(db);
    this.importService.deleteTempPeople(db);
    this.importService.deleteTempLabeler(db);
  }

  async importExcel() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    if (this.path) {
      const workSheetsFromFile = xlsx.parse(fs.readFileSync(this.path));
      this.modalLoading.show();
      this.importService.deleteTempGenerics(db);
      this.importService.deleteTempProducts(db);
      for (let x = 0; x < workSheetsFromFile.length; x++) {
        const excelData = workSheetsFromFile[x].data;
        const arData: any = [];
        const arData1: any = [];

        for (let y = 1; y < excelData.length; y++) {
          const idGenerics = Math.random().toString(15).substr(2, 9);
          if (x === 0) {
            const obj = {
              'title_name': excelData[y][0],
              'fname': excelData[y][1],
              'lname': excelData[y][2],
              'position_name': excelData[y][3]
            };
            y === 1 ? arData.push({ 'title_name': 'นาย', 'fname': 'ผู้ดูแลระบบ', 'lname': '', 'position_name': 'นักวิชาการคอมพิวเตอร์' }) : null;
            if (this.checkNull(excelData[y][1])) {
              arData.push(obj);
            }
          }

          if (x === 1) {
            const obj = {
              'labeler_name': excelData[y][0],
              'labeler_name_po': excelData[y][1],
              'description': excelData[y][2],
              'nin': excelData[y][3],
              'address': excelData[y][4],
              'tambon_code': excelData[y][5],
              'ampur_code': excelData[y][6],
              'province_code': excelData[y][7],
              'zipcode': excelData[y][8],
              'phone': excelData[y][9],
              'labeler_type': excelData[y][10],
              'labeler_status': '1'
            };
            if (this.checkNull(excelData[y][0])) {
              arData.push(obj);
            }
          }

          if (x === 2) {
            const obj = {
              'warehouse_name': excelData[y][1],
              'location': excelData[y][2],
              'short_code': excelData[y][0],
              'his_hospcode': excelData[y][3],
              'his_dep_code': excelData[y][4],
            };
            if (this.checkNull(excelData[y][1])) {
              arData.push(obj);
            }
          }

          if (x === 3) {
            excelData[y][2] === undefined ? excelData[y][2] = idGenerics : excelData[y][2] = excelData[y][2];
            const obj = {
              'generic_id': excelData[y][2],
              'generic_name': excelData[y][0],
              'working_code': excelData[y][2],
              'account_id': excelData[y][3],
              'generic_type_id': excelData[y][4],
              'package': excelData[y][5],
              'conversion': excelData[y][6],
              'primary_unit_id': excelData[y][7],
              'standard_cost': excelData[y][8] === undefined ? 0 : excelData[y][8],
              'unit_cost': excelData[y][9] === undefined ? 0 : excelData[y][9],
              'package_cost': excelData[y][10] === undefined ? 0 : excelData[y][10],
              'min_qty': excelData[y][11] === undefined ? 100 : excelData[y][11],
              'max_qty': excelData[y][12] === undefined ? 1000 : excelData[y][12],
            };

            const obj1 = {
              'product_name': excelData[y][1] === undefined ? excelData[y][0] : excelData[y][1],
              'working_code': excelData[y][2],
              'generic_id': excelData[y][2],
              'primary_unit_id': excelData[y][7],
              'unit_cost': excelData[y][9] === undefined ? 0 : excelData[y][9],
              'm_labeler_id': excelData[y][13] === undefined ? '' : excelData[y][13],
              'v_labeler_id': excelData[y][14] === undefined ? '' : excelData[y][14],
              // 'remain_qty': excelData[y][15] === undefined ? '' : excelData[y][15],
              // 'warehouse_name': excelData[y][16] === undefined ? '' : excelData[y][16],
              // 'lot_no': excelData[y][17] === undefined ? Math.random().toString(10).substr(1, 8) : excelData[y][17],
              // 'expired_date': excelData[y][18] === undefined ? '' : excelData[y][18]
            };
            if (excelData[y][0] !== undefined) { arData.push(obj); }
            if (excelData[y][0] !== undefined) { arData1.push(obj1); }
          }
        }

        if (x === 0) {
          if (arData.length > 0) {
            this.rs1 = await this.signPeople(db, arData);
          }
        }
        if (x === 1) {
          if (arData.length > 0) {
            this.rs2 = await this.signLabeler(db, arData);
          }
        }
        if (x === 2) {
          if (arData.length > 0) {
            this.rs3 = await this.signWareHouses(db, arData);
          }
        }
        if (x === 3) {
          if (arData.length > 0 || arData1.length > 0) {
            this.rs4 = await this.signGenerics(db, arData, arData1);
          }
        }
      }
    } else {
      this.alertService.error('กรุณาเลือกไฟล์');
      await this.modalLoading.hide();
    }

    if (this.rs1 || this.rs2 || this.rs3 || this.rs4) {
      await this.getpeople();
      await this.getLabelers();
      await this.getWarehouses();
      await this.getGeneric();
      await this.importService.updatePurchaseUnitId(db);
      await this.modalLoading.hide();
      await this.alertService.success();
    } else {
      await this.modalLoading.hide();
      await this.alertService.error('นำเข้าข้อมูลไม่สำเร็จ โปรดตรวจสอบไฟล์นำเข้า');
    }
    await this.modalLoading.hide();
  }

  async signLabeler(db: IConnection, arData: any) {
    await this.importService.createTmpLabeler(db);
    await this.importService.clearDataLabeler(db);
    const importData: any = await this.importService.importLabeler(db, arData);

    if (importData) {
      const labelerRs: any = await this.importService.getTempLabeler(db);
      const tambonRs: any = await this.importService.getTambon(db);
      const ampurRs: any = await this.importService.getAmpur(db);
      const provinceRs: any = await this.importService.getProvince(db);
      const labeler = [];
      labelerRs.forEach(v => {
        const idxTcode = _.findIndex(tambonRs, { 'tambon_name': v.tambon_code });
        const tambon_code = idxTcode > -1 ? tambonRs[idxTcode].tambon_code : null;

        const idxAcode = _.findIndex(ampurRs, { 'ampur_name': v.ampur_code });
        const ampur_code = idxAcode > -1 ? ampurRs[idxAcode].ampur_code : null;

        const idxPcode = _.findIndex(provinceRs, { 'province_name': v.province_code });
        const province_code = idxPcode > -1 ? provinceRs[idxPcode].province_code : null;

        const objLabeler = {
          'labeler_name': v.labeler_name,
          'labeler_name_po': v.labeler_name_po,
          'description': v.description,
          'nin': v.nin,
          'labeler_type': v.labeler_type ? v.labeler_type : 1,
          'labeler_status': '1',
          'address': v.address,
          'tambon_code': tambon_code,
          'ampur_code': ampur_code,
          'province_code': province_code,
          'zipcode': v.zipcode,
          'phone': v.phone,
          'is_vendor': 'Y',
          'is_manufacturer': 'Y',
          'short_code': v.description
        };
        if (this.checkNull(v.labeler_name)) { labeler.push(objLabeler); }
      });
      await this.importService.insertLabeler(db, labeler);
      await this.importService.deleteTempLabeler(db);
      return true;
    } else {
      this.alertService.error();
      return false;
    }
  }

  async signPeople(db: IConnection, arData: any) {
    await this.importService.createTmpPeople(db);
    await this.importService.clearDataPeople(db);
    const importData: any = await this.importService.importPeople(db, arData);

    if (importData) {
      const peopleRs: any = await this.importService.getTempPeople(db);
      const titleRs: any = await this.importService.getTitle(db);
      const positionRs: any = await this.importService.getPosition(db);
      const peoples = [];
      peopleRs.forEach(v => {
        const idxTitle = _.findIndex(titleRs, { 'title_name': v.title_name });
        const title_id = idxTitle > -1 ? titleRs[idxTitle].title_id : null;

        const idxPosition = _.findIndex(positionRs, { 'position_name': v.position_name });
        const position_id = idxPosition > -1 ? positionRs[idxPosition].position_id : null;

        const objPeoples = {
          'title_id': title_id,
          'fname': v.fname,
          'lname': v.lname,
          'position_id': position_id
        };
        if (this.checkNull(v.fname)) { peoples.push(objPeoples); }
      });

      await this.importService.deleteTempPeople(db);
      await this.importService.insertPeople(db, peoples);
      return true;
    } else {
      this.alertService.error();
      return false;
    }
  }

  async signWareHouses(db: IConnection, arData: any) {
    await this.importService.clearDataWareHouse(db);
    const importData: any = await this.importService.importWareHouses(db, arData);

    if (!importData) { this.alertService.error(); return false; }
    return true;
  }

  async signGenerics(db: IConnection, arData: any, arData1: any) {
    await this.importService.clearDataGenerics(db);
    await this.importService.clearDataProducts(db);
    await this.importService.clearDataStockCard(db);
    await this.importService.clearDataWmProducts(db);
    await this.importService.clearDataUnitGenerics(db);
    await this.importService.clearExpiredAlert(db);

    let rsTmpG = await this.importService.createTmpGenerics(db);
    let rsTmpP = await this.importService.createTmpProducts(db);

    const rsg = await this.importService.importGenerics(db, arData);
    const rsp = await this.importService.importProducts(db, arData1);

    if (rsTmpG && rsTmpP) {
      if (rsg && rsp) {
        try {
          await this.importService.clearDataUnits(db);
          const unitNames: any = await this.importService.getUnitsTmp(db);
          const units = [];
          for (const v of unitNames) {
            if (this.checkNull(v.primary_unit_id)) {
              const objUnits = {
                'unit_name': v.primary_unit_id,
                'unit_code': v.primary_unit_id,
                'is_primary': 'Y'
              };
              units.push(objUnits);
            }
          }

          const rsUnits: any = await this.importService.importUnits(db, units);
          if (!rsUnits) { this.alertService.error('ข้อมูลหน่วยเล็กสุดไม่สมบูรณ์'); }

          const tmpGenericRs: any = await this.importService.getTempGenerics(db);
          const tmpProductRs: any = await this.importService.getTempProducts(db);
          const AccountRs: any = await this.importService.getGenericAccount(db);
          const typesRs: any = await this.importService.getGenericType(db);
          const unitsRs: any = await this.importService.getUnits(db);
          const labelerRs: any = await this.importService.getLabelers(db);

          const unitGenerics = [];
          const generics = [];
          const products = [];
          const expired = [];

          tmpGenericRs.forEach(v => {
            const idxUnitGenerics = _.findIndex(unitsRs, { 'unit_name': v.primary_unit_id });
            const primary_unit_id = idxUnitGenerics > -1 ? unitsRs[idxUnitGenerics].unit_id : null;

            const idxPackage = _.findIndex(unitsRs, { 'unit_name': v.package });
            const package_id = idxPackage > -1 ? unitsRs[idxPackage].unit_id : null;
            const idxAccount = _.findIndex(AccountRs, { 'account_name': v.account_id });
            const account_id = idxAccount > -1 ? AccountRs[idxAccount].account_id : null;

            const idxTypes = _.findIndex(typesRs, { 'generic_type_name': v.generic_type_id });
            const generic_type_id = idxTypes > -1 ? typesRs[idxTypes].generic_type_id : null;

            const objGenerics = {
              'generic_id': v.generic_id,
              'generic_name': v.generic_name,
              'working_code': v.working_code,
              'account_id': account_id,
              'generic_type_id': generic_type_id,
              'primary_unit_id': primary_unit_id,
              'standard_cost': v.standard_cost,
              'unit_cost': v.unit_cost,
              'min_qty': v.min_qty,
              'max_qty': v.max_qty
            };

            const objUnitGenerics = {
              'from_unit_id': primary_unit_id,
              'to_unit_id': primary_unit_id,
              'qty': 1,
              'cost': v.unit_cost,
              'generic_id': v.generic_id
            };

            const objExpired = {
              'generic_id': v.generic_id,
              'num_days': 365
            }

            if (this.checkNull(v.generic_id)) { expired.push(objExpired); }
            if (this.checkNull(v.generic_id)) { generics.push(objGenerics); }
            if (this.checkNull(v.generic_id)) { unitGenerics.push(objUnitGenerics); }
            if (v.conversion > 1 && (this.checkNull(v.generic_id))) {
              unitGenerics.push({
                'from_unit_id': package_id,
                'to_unit_id': primary_unit_id,
                'qty': v.conversion,
                'cost': v.package_cost,
                'generic_id': v.generic_id
              });
            }
          });

          for (let v of tmpProductRs) {
            const idxPrimaryUnit = _.findIndex(unitsRs, { 'unit_name': v.primary_unit_id });
            const primary_unit_id = idxPrimaryUnit > -1 ? unitsRs[idxPrimaryUnit].unit_id : null;

            const idxMlabeler = _.findIndex(labelerRs, { 'labeler_name': v.m_labeler_id });
            const m_labeler_id = idxMlabeler > -1 ? labelerRs[idxMlabeler].labeler_id : null;

            const idxVlabeler = _.findIndex(labelerRs, { 'labeler_name': v.v_labeler_id });
            const v_labeler_id = idxVlabeler > -1 ? labelerRs[idxVlabeler].labeler_id : null;

            let search = await this.importService.searchTempProducts(db, v.working_code);
            let setWorkingcode: any;
            if (this.checkNull(search)) {
              setWorkingcode = v.working_code + Math.random().toString(6).substr(2, 3);
            }
            else {
              setWorkingcode = v.working_code + '001';
            }

            const objProducts = {
              'product_id': v.product_id,
              'product_name': v.product_name,
              'working_code': setWorkingcode,
              'generic_id': v.generic_id,
              'primary_unit_id': primary_unit_id,
              'tmt_id': v.tmt_id,
              'm_labeler_id': m_labeler_id,
              'v_labeler_id': v_labeler_id
            };
            if (this.checkNull(v.product_name)) products.push(objProducts);
          }

          await this.importService.insertExpired(db, expired);
          await this.importService.insertGenerics(db, generics);
          await this.importService.insertProducts(db, products);
          await this.importService.insertUnitGenerics(db, unitGenerics);

          // if (rsGenerics && rsUnitGenerics && rsProducts) {
          // const unitGernericRs: any = await this.importService.getUnitGenericsId(db);
          // const warehousesRS: any = await this.importService.getWarehouses(db);

          // for (const v of tmpProductRs) {
          // const idxWH = _.findIndex(warehousesRS, { 'warehouse_name': v.warehouse_name });
          // const warehouse_id = idxWH > -1 ? warehousesRS[idxWH].warehouse_id : null;

          // const idxUnitGenericsId = _.findIndex(unitGernericRs, { 'product_name': v.product_name });
          // const unit_generic_id = idxUnitGenericsId > -1 ? unitGernericRs[idxUnitGenericsId].unit_generic_id : null;

          // const idxGenericsId = _.findIndex(unitGernericRs, { 'product_name': v.product_name });
          // const generic_id = idxGenericsId > -1 ? unitGernericRs[idxGenericsId].generic_id : null;

          // const balanceP: any = await this.importService.getBalanceProduct(db, v.product_id, warehouse_id);
          // const balanceG: any = await this.importService.getBalanceGeneric(db, generic_id, warehouse_id);
          // let balanceProduct;
          // let balanceGeneric;
          // if (!balanceP.length) {
          //   balanceProduct = 0;
          // } else {
          //   balanceProduct = balanceP[0].qty + v.remain_qty;
          // }
          // if (!balanceG.length) {
          //   balanceGeneric = 0;
          // } else {
          //   balanceGeneric = balanceG[0].qty + v.remain_qty;
          // }
          // const objwmProducts = {
          //   'wm_product_id': Math.random().toString(20).substr(2, 15),
          //   'warehouse_id': warehouse_id,
          //   'product_id': v.product_id,
          //   'cost': v.unit_cost,
          //   'price': v.unit_cost,
          //   'qty': v.remain_qty,
          //   'lot_no': v.lot_no,
          //   'unit_generic_id': unit_generic_id
          // };

          // const objStockCard = {
          //   'product_id': v.product_id,
          //   'generic_id': generic_id,
          //   'unit_generic_id': unit_generic_id,
          //   'transaction_type': 'SUMMIT',
          //   'in_qty': v.remain_qty,
          //   'in_unit_cost': v.unit_cost,
          //   'balance_generic_qty': balanceGeneric,
          //   'balance_qty': balanceProduct,
          //   'balance_unit_cost': v.unit_cost,
          //   'ref_src': warehouse_id,
          //   'comment': 'ยอดยกมาเพื่อเริ่มต้นระบบ MMIS',
          //   'lot_no': v.lot_no,
          //   'expired_date': v.expired_date
          // };
          // if (this.checkNull(v.product_name)) { wmProducts.push(objwmProducts); }
          // if (this.checkNull(v.product_name)) { wmStockCard.push(objStockCard); }
          // }

          // await this.importService.insertWmProducts(db, wmProducts);
          // await this.importService.insertStockCard(db, wmStockCard);
          await this.importService.deleteTempGenerics(db);
          await this.importService.deleteTempProducts(db);
          return true;
          // } else {
          //   this.alertService.error();
          //   this.importService.deleteTempGenerics(db);
          //   this.importService.deleteTempProducts(db);
          //   return false;
          // }
        } catch (error) {
          this.alertService.error(error.message);
          return false;
        }
      }
    } else {
      this.alertService.error('เกิดข้อผิดพลาด')
    }
  }

  closeModal() {
    this.openModal_people = false;
    this.openModal_labeler = false;
    this.openModal_warehouse = false;
    this.openModal_generics = false;
  }

  async getpeople() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.peopleRs = await this.importService.getPeople(db);
  }

  async onEditPeople(item) {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.titleRs = await this.importService.getTitle(db);
    this.positionRs = await this.importService.getPosition(db);
    this.peopleEdit = {
      'people_id': item.people_id,
      'title_id': item.title_id,
      'fname': item.fname,
      'lname': item.lname,
      'position_id': item.position_id
    };
    this.openModal_people = true;
  }

  async confirmEditPeople() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    await this.importService.updatePeople(db, this.peopleEdit);
    this.closeModal();
    this.alertService.success();
    this.getpeople();
  }

  async getLabelers() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.labelersRS = await this.importService.getLabelers(db);
  }

  async onEditLabelers(item) {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.lablerEdit = {
      'labeler_id': item.labeler_id,
      'labeler_name': item.labeler_name,
      'address': item.address,
      'phone': item.phone
    };
    this.openModal_labeler = true;
  }

  async confirmEditLabelers() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    await this.importService.updateLabelers(db, this.lablerEdit);
    this.closeModal();
    this.alertService.success();
    this.getLabelers();
  }

  selectPath() {
    const path = dialog.showOpenDialog({ properties: ['openFile'] });
    if (path) {
      this.path = path.toString();
    }
  }

  async getWarehouses() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.warehousesRS = await this.importService.getWarehouses(db);
  }

  async onEditWarehouses(item) {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.warehousesEdit = {
      'warehouse_id': item.warehouse_id,
      'warehouse_name': item.warehouse_name
    };
    this.openModal_warehouse = true;
  }

  async confirmEditWarehouses() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.importService.updateWarehouses(db, this.warehousesEdit)
      .then(() => {
        this.closeModal();
        this.alertService.success();
        this.getWarehouses();
      })
      .catch((error) => {
        this.alertService.error();
        console.log(error.message);
      });
  }

  async confirmEditGenerics() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.importService.updateWarehouses(db, this.warehousesEdit)
      .then(() => {
        this.closeModal();
        this.alertService.success();
        this.getGeneric();
      })
      .catch((error) => {
        this.alertService.error();
        console.log(error.message);
      });
  }

  async getGeneric() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.genericRS = await this.importService.getGeneric(db);
  }

  checkNull(data: any) {
    if (data == null || data === '' || data === ' ' || data === undefined || data === Infinity || data === NaN) {
      return false;
    } else {
      return true;
    }
  }
}
