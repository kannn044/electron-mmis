import { browser } from 'protractor';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { IConnection } from 'mysql';

import { AlertService } from '../../alert.service';
import { ImportService } from '../../admin/import.service';

import xlsx from 'node-xlsx';

import * as _ from 'lodash';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { InvdosService } from '../invdos.service';
import { group } from '@angular/animations';
const { dialog } = require('electron').remote
const iconv = require('iconv-lite');
@Component({
  selector: 'app-invdos',
  templateUrl: './invdos.component.html'
})
export class InvdosComponent implements OnInit {

  path: string;
  button: boolean = false;

  openModal_people: boolean = false;
  openModal_labeler: boolean = false;
  openModal_warehouse: boolean = false;
  openModal_generics: boolean = false;

  peopleEdit = {};
  lablerEdit = {};
  warehousesEdit = {};

  warehousesRS: any = [];
  labelersRs: any = [];
  genericRs: any = [];
  tradeRs: any = [];

  truncate: any = [
    'mm_generic_dosages',
    'wm_generic_expired_alert',
    'mm_generic_groups',
    'mm_units',
    'mm_unit_generics',
    'mm_generics',
    'mm_products'
  ];
  deleteTmp: any = [
    'tmp_mapping_dos',
    'tmp_products_dos'
  ]

  @ViewChild('modalLoading') public modalLoading: any;
  constructor(
    private connectionService: ConnectionService,
    private alertService: AlertService,
    private importService: ImportService
  ) { }

  ngOnInit() {
    this.getWarehouses();
    this.getLabeler();
    this.getGeneric();
    this.getTrade();
  }

  async refresh() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    await this.importService.updatePurchaseUnitId(db);
    this.getWarehouses();
    this.getLabeler();
    this.getGeneric();
    this.getTrade();
  }

  selectPath() {
    const path = dialog.showOpenDialog({ properties: ['openFile'] });
    if (path) {
      this.button = true;
      this.path = path.toString();
    } else this.button = false;
  }

  closeModal() {
    this.openModal_people = false;
    this.openModal_labeler = false;
    this.openModal_warehouse = false;
    this.openModal_generics = false;
  }

  async importWareHouse() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    await this.importService.deleteTableTmp(db, this.deleteTmp);
    db.connect();

    if (this.path) {
      await this.modalLoading.show();
      let fileData = await this.convertFile(this.path);

      let warehouseData = [];
      for (let i in fileData) {
        const obj = {
          'short_code': fileData[i][0],
          'warehouse_name': fileData[i][1]
        }
        if (this.checkNull(fileData[i][1])) warehouseData.push(obj);
      }

      await this.importService.clearDataWareHouse(db);
      let rs = await this.importService.importWareHouses(db, warehouseData);
      if (rs) {
        await this.modalLoading.hide(6000);
        await this.alertService.success();
      }
      else await this.alertService.error();
    }
    await this.getWarehouses();
  }

  async getWarehouses() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.warehousesRS = await this.importService.getWarehouses(db);
  }

  async getLabeler() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.labelersRs = await this.importService.getLabelers(db);
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
      })
  }

  async importLabeler() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    if (this.path) {
      await this.modalLoading.show();
      let fileData = await this.convertFile(this.path);

      let labelerData = [];
      for (let i in fileData) {
        const obj = {
          'labeler_name': fileData[i][3] + fileData[i][4] + fileData[i][5],
          'labeler_code': fileData[i][0],
          'is_vendor': fileData[i][1] ? 'Y' : 'N',
          'is_manufacturer': fileData[i][2] ? 'Y' : 'N',
          'phone': fileData[i][10]
        }
        if (this.checkNull(fileData[i][4])) labelerData.push(obj);
      }

      await this.importService.clearDataLabeler(db);
      let rs = await this.importService.insertLabeler(db, labelerData);
      if (rs) {
        await this.modalLoading.hide(6000);
        await this.alertService.success();
      }
      else await this.alertService.error();
    }
    await this.getLabeler();
  }

  async getLabelers() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.labelersRs = await this.importService.getLabelers(db);
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

  async importGenerics() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    if (this.path) {
      await this.modalLoading.show();
      let fileData = await this.convertFile(this.path);
      await this.importService.truncateTable(db, this.truncate);
      await this.importService.createTmpProductDos(db);

      let productData = [];
      for (let i in fileData) {
        const obj = {
          'RECNUM': fileData[i][0],
          'STANDARD_CODE': fileData[i][1],
          'WORKING_CODE': '',
          'DRUG_NAME_KEY': '',
          'DRUG_NAME': fileData[i][2],
          'DOSAGE_FORM': fileData[i][3],
          'SALE_UNIT': fileData[i][4],
          'COMPOSITION': fileData[i][5],
          'GROUP_KEY': fileData[i][6],
          'GROUP_NAME': fileData[i][6],
          'STD_PRICE1': fileData[i][7],
          'STD_RATIO1': fileData[i][8],
          'STD_PRICE2': fileData[i][9],
          'STD_RATIO2': fileData[i][10],
          'STD_PRICE3': fileData[i][11],
          'STD_RATIO3': fileData[i][12],
          'SALE_UNIT_PRICE': fileData[i][13],
          'TOTAL_COST': fileData[i][14],
          'QTY_ON_HAND': fileData[i][15],
          'REORDER_QTY': fileData[i][16],
          'MIN_LEVEL': fileData[i][17],
          'RATE_PER_MONTH': fileData[i][18],
          'PRODUCTION': fileData[i][19],
          'OK': fileData[i][20],
          'TOTAL_VALUE': fileData[i][21],
          'WORK_CODE_KEY': fileData[i][22],
          'MAX_LEVEL': fileData[i][23],
          'SPECIAL_CODE': fileData[i][24],
          'DATE_ENTER': fileData[i][25],
          'GROUP_CODE': fileData[i][26],
          'SUPPLY_TYPE': fileData[i][27],
          'ED_LIST_CODE': fileData[i][28],
          'RESERVE1': fileData[i][29],
          'RESERVE2': fileData[i][30],
          'RESERVE3': fileData[i][31],
          'NOTE': fileData[i][32],
          'LOCATION': fileData[i][33]
        }
        if (this.checkNull(fileData[i][2])) productData.push(obj);
      }

      console.log(productData);

      let rs = await this.importService.insertTmpProductDos(db, productData);
      if (rs) {
        let tmpProductDos: any = await this.importService.getTempProductDos(db);
        let dosagesRs: any = await this.importService.getTempProductDosages(db);
        let unitsRs: any = await this.importService.getTempProductUnits(db);
        // let groupsRs: any = await this.importService.getTempProductGroups(db);

        let dosages = [];
        let units = [];
        //   let groups = [];

        let c: number = 1;

        for (let v of dosagesRs) {
          const objDosage = {
            'dosage_name': v.DOSAGE_FORM
          }
          if (v.DOSAGE_FORM) dosages.push(objDosage);
        }

        for (let v of unitsRs) {
          const objUnits = {
            'unit_name': v.SALE_UNIT,
            'unit_code': v.SALE_UNIT,
            'is_primary': 'Y'
          }
          c === 1 ? units.push({ 'unit_name': 'BOX', 'unit_code': 'BOX' }) : null;
          c++;
          if (v.SALE_UNIT) units.push(objUnits);
        }

        //   for (let v of groupsRs) {
        //     const objGroups = {
        //       'group_name': v.c6
        //       // 'group_code': v.c11
        //     }
        //     if (v.c6) groups.push(objGroups);
        //   }
        let rs1 = await this.importService.importUnits(db, units);
        let rs2 = await this.importService.importDosages(db, dosages);
        //   let rs3 = await this.importService.importGroups(db, groups);

        if (rs1 && rs2) {
          let unitsRs: any = await this.importService.getUnits(db);
          // let groupsRs: any = await this.importService.getGroups(db);
          let dosageRs: any = await this.importService.getDosages(db);

          let generics: any = []
          let products: any = []
          let expired: any = []
          let unitGenerics: any = []

          for (let v of tmpProductDos) {
            const idxUnits = _.findIndex(unitsRs, { 'unit_name': v.SALE_UNIT });
            const unit_id = idxUnits > -1 ? unitsRs[idxUnits].unit_id : null;

            const idxDosage = _.findIndex(dosageRs, { 'dosage_name': v.DOSAGE_FORM });
            const dosage_id = idxDosage > -1 ? dosageRs[idxDosage].dosage_id : null;

            // const idxGroup = _.findIndex(groupsRs, { 'group_name': v[6] });
            // const group_id = idxGroup > -1 ? groupsRs[idxGroup].group_id : null;

            let unit_cost = v.STD_PRICE1 > 0 ? v.STD_PRICE1 / v.STD_RATIO1
              : v.STD_PRICE2 > 0 ? v.STD_PRICE2 / v.STD_RATIO2
                : v.STD_PRICE3 > 0 ? v.STD_PRICE3 / v.STD_RATIO3
                  : 0;

            let pack_ratio = v.STD_RATIO1 > 0 ? v.STD_RATIO1
              : v.STD_RATIO2 > 0 ? v.STD_RATIO2
                : v.STD_RATIO3 ? v.STD_RATIO3
                  : 0;

            let price = v.STD_PRICE1 > 0 ? v.STD_PRICE1
              : v.STD_PRICE2 > 0 ? v.STD_PRICE2
                : v.STD_PRICE3 ? v.STD_PRICE3
                  : 0;

            let generic_type_id = 1;
            if (v.STANDARD_CODE > 3999999) generic_type_id = 2;
            if (v.STANDARD_CODE > 5999999) generic_type_id = 3;

            const objGenerics = {
              'generic_id': v.STANDARD_CODE,
              'generic_name': v.DRUG_NAME,
              'working_code': v.STANDARD_CODE,
              'account_id': v.SPECIAL_CODE ? 1 : 3,
              'min_qty': 100,
              'max_qty': 1000,
              'generic_type_id': generic_type_id,
              'primary_unit_id': unit_id ? unit_id : unitsRs[0].unit_id,
              // 'group_id': group_id,
              'dosage_id': dosage_id,
              'standard_cost': unit_cost,
              'unit_cost': unit_cost
            }

            const objExpired = {
              'generic_id': v.STANDARD_CODE,
              'num_days': 180
            }

            // const objProducts = {
            //   'product_id': Math.random().toString(6).substr(2, 10),
            //   'product_name': v[5],
            //   'working_code': v[1] + Math.random().toString(6).substr(2, 3),
            //   'generic_id': v[1],
            //   'primary_unit_id': unit_id ? unit_id : unitsRs[0].unit_id,
            //   'product_group_id': 1
            // }

            const objUnitGenerics = {
              'from_unit_id': unit_id ? unit_id : unitsRs[0].unit_id,
              'to_unit_id': unit_id ? unit_id : unitsRs[0].unit_id,
              'qty': 1,
              'cost': unit_cost,
              'generic_id': v[1]
            };

            if (pack_ratio > 1 && v.STANDARD_CODE) {
              unitGenerics.push({
                'from_unit_id': unitsRs[0].unit_id,
                'to_unit_id': unit_id ? unit_id : unitsRs[0].unit_id,
                'qty': pack_ratio,
                'cost': price,
                'generic_id': v.STANDARD_CODE
              });
            }
            if (this.checkNull(v.STANDARD_CODE) && this.checkNull(unit_id)) unitGenerics.push(objUnitGenerics);
            if (this.checkNull(v.STANDARD_CODE) && this.checkNull(unit_id)) {
              generics.push(objGenerics);
              expired.push(objExpired);
            }
            // if (this.checkNull(v[5]) && this.checkNull(unit_id)) products.push(objProducts);
          }
          await this.importService.insertUnitGenerics(db, unitGenerics);
          await this.importService.insertGenerics(db, generics);
          await this.importService.insertExpired(db, expired);
          // await this.importService.insertProducts(db, products);
        }
      }
      else await this.alertService.error();
    }
    await this.importService.deleteTableTmp(db, this.deleteTmp);
    await this.getGeneric();
    await this.getLabeler();
    await this.getWarehouses();
    await this.modalLoading.hide();
    await this.alertService.success();
  }

  async importTrade() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    if (this.path) {
      await this.modalLoading.show();
      await this.importService.truncateTable(db, ['mm_products']);
      let results: any = await this.importService.getTempProductDos(db);
      let fileData = await this.convertFile(this.path);

      let productData = [];
      for (let i in fileData) {
        const obj = {
          'generic_id': fileData[i][0],
          'v_labeler_code': fileData[i][1],
          'product_name': fileData[i][2],
          'm_labeler_code': fileData[i][5]
        }
        productData.push(obj);
      }
      let rs = await this.pushProducts(db, productData);

      let rsProducts = await this.importService.insertProducts(db, rs);
      if (rsProducts) {
        await this.modalLoading.hide();
        await this.alertService.success();
        this.path = '';
      } else {
        await this.modalLoading.hide();
        await this.alertService.error();
        this.path = '';
      }
    }
  }

  async pushProducts(db: IConnection, data: any) {
    const products = [];

    const unitsRs: any = await this.importService.getUnits(db);
    const labelerRs: any = await this.importService.getLabelers(db);
    const genericRs: any = await this.importService.getGenerics(db);

    for (let v of data) {
      const idxGenerics = _.findIndex(genericRs, { 'generic_id': v.generic_id });
      const primary_unit_id = idxGenerics > -1 ? genericRs[idxGenerics].primary_unit_id : null;

      const idxMlabeler = _.findIndex(labelerRs, { 'labeler_code': v.m_labeler_code });
      const m_labeler_id = idxMlabeler > -1 ? labelerRs[idxMlabeler].labeler_id : null;

      const idxVlabeler = _.findIndex(labelerRs, { 'labeler_code': v.v_labeler_code });
      const v_labeler_id = idxVlabeler > -1 ? labelerRs[idxVlabeler].labeler_id : null;

      const objProducts = {
        'product_id': Math.random().toString(12).substr(2, 12),
        'product_name': v.product_name,
        'working_code': v.generic_id + Math.random().toString(6).substr(2, 3),
        'generic_id': v.generic_id,
        'primary_unit_id': primary_unit_id ? primary_unit_id : unitsRs[0].unit_id,
        'm_labeler_id': m_labeler_id,
        'v_labeler_id': v_labeler_id
      };
      if (this.checkNull(v.product_name)) products.push(objProducts);
    }
    return products;
  }

  async getGeneric() {
    await this.modalLoading.show();
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.genericRs = await this.importService.getGenericDos(db);
    await this.modalLoading.hide();
  }

  async getTrade() {
    await this.modalLoading.show();
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.tradeRs = await this.importService.getTrade(db);
    //console.log(this.tradeRs)
    await this.modalLoading.hide();
  }

  async mappingLabeler() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    if (this.path) {
      await this.modalLoading.show();
      let fileData = await this.convertFile(this.path);
      let createTmp = await this.importService.createTmpMappingDos(db);

      if (createTmp) {
        let mapping = [];
        for (let i in fileData) {
          const obj = {
            'c1': fileData[i][0],
            'c2': fileData[i][6],
            'c3': fileData[i][7],
            'c4': fileData[i][1]
          }
          if (this.checkNull(fileData[i][0]) && this.checkNull(fileData[i][6]) && this.checkNull(fileData[i][7]) && this.checkNull(fileData[i][1])) mapping.push(obj);
        }

        let rs = await this.importService.importMapping(db, mapping);
        if (rs) {
          let mappingRs: any = await this.importService.getTmpMapping(db);
          let labelerRs: any = await this.importService.getLabelers(db);
          let productRs: any = await this.importService.getGenericDos(db);

          if (mappingRs) {
            let updateLabeler: any = [];
            for (let v of productRs) {
              const idxMapping_v = _.findIndex(mappingRs, { 'c1': v.generic_id });
              const v_labeler_code = idxMapping_v > -1 ? mappingRs[idxMapping_v].c2 : null;

              const idxMapping_m = _.findIndex(mappingRs, { 'c1': v.generic_id });
              const m_labeler_code = idxMapping_m > -1 ? mappingRs[idxMapping_m].c3 : null;

              const idxLabelers_v = _.findIndex(labelerRs, { 'labeler_code': v_labeler_code });
              const v_labeler_id = idxLabelers_v > -1 ? labelerRs[idxLabelers_v].labeler_id : null;

              const idxLabelers_m = _.findIndex(labelerRs, { 'labeler_code': m_labeler_code });
              const m_labeler_id = idxLabelers_m > -1 ? labelerRs[idxLabelers_m].labeler_id : null;


              const objUpdateLabeler = {
                'generic_id': v.generic_id,
                'm_labeler_id': m_labeler_id,
                'v_labeler_id': v_labeler_id,
              }
              if (this.checkNull(m_labeler_id) || this.checkNull(v_labeler_id)) updateLabeler.push(objUpdateLabeler);
            }

            let rs = await this.importService.updateLabelersProduct(db, updateLabeler);
            if (rs) {
              await this.modalLoading.hide();
              await this.alertService.success();
              await this.importService.deleteTableTmp(db, this.deleteTmp);
            } else {
              await this.alertService.error();
              await this.modalLoading.hide();
              await this.importService.deleteTableTmp(db, this.deleteTmp);
            }
          }
        }
      }
    }
  }

  checkNull(data: any) {
    if (data == null || data === '' || data === ' ' || data === undefined || data === Infinity || data === NaN) {
      return false;
    } else {
      return true;
    }
  }

  async convertFile(pathFile: any) {
    let convert = iconv.decode((fs.readFileSync(pathFile)), 'tis-620');

    let _data = convert.split('\n');
    let data = [];
    _data.forEach(v => {
      if (v !== '') {
        data.push(v.split(','));
      }
    });

    for (let i in data) {
      for (let j in data[i]) {
        data[i][j] = data[i][j].replace(/"/g, '');
      }
    }
    return data;
  }
}