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

  truncate: any = [
    'mm_generic_dosages',
    'mm_generic_groups',
    'mm_units',
    'mm_unit_generics',
    'mm_generics',
    'mm_products'
  ];
  deleteTmp: any = [
    'tmp_product_dos'
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
  }

  selectPath() {
    const path = dialog.showOpenDialog({ properties: ['openFile'] });
    if (path) {
      this.path = path.toString();
    }
  }

  closeModal() {
    this.openModal_people = false;
    this.openModal_labeler = false;
    this.openModal_warehouse = false;
    this.openModal_generics = false;
  }

  async importWareHouse() {
    const db: IConnection = this.connectionService.createConnection('config.json');
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
        if (fileData[i][1]) warehouseData.push(obj);
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
      console.log(fileData)

      let labelerData = [];
      for (let i in fileData) {
        const obj = {
          'labeler_name': fileData[i][3] + fileData[i][4] + fileData[i][5],
          'description': fileData[i][0],
          'is_vendor': fileData[i][1] ? 'Y' : 'N',
          'is_manufacturer': fileData[i][2] ? 'Y' : 'N',
          'phone': fileData[i][10]
        }
        if (fileData[i][4]) labelerData.push(obj);
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
      await this.importService.createTmpProductDos(db);
      await this.importService.truncateTable(db, this.truncate);

      let productData = [];
      for (let i in fileData) {
        const obj = {
          'c1': fileData[i][1],
          'c2': fileData[i][2],
          'c3': fileData[i][3],
          'c4': fileData[i][4],
          'c5': fileData[i][5],
          'c6': fileData[i][6],
          'c7': fileData[i][7],
          'c8': fileData[i][8],
          'c9': fileData[i][9],
          'c10': fileData[i][10],
          'c11': fileData[i][24]
        }
        if (fileData[i][2]) productData.push(obj);
      }

      let rs = await this.importService.insertTmpProductDos(db, productData);
      if (rs) {
        let tmpProductDos: any = await this.importService.getTempProductDos(db);
        let dosagesRs: any = await this.importService.getTempProductDosages(db);
        let unitsRs: any = await this.importService.getTempProductUnits(db);
        let groupsRs: any = await this.importService.getTempProductGroups(db);

        let dosages = [];
        let units = [];
        let groups = [];

        let c: number = 1;

        for (let v of dosagesRs) {
          const objDosage = {
            'dosage_name': v.c3
          }
          if (v.c3) dosages.push(objDosage);
        }

        for (let v of unitsRs) {
          const objUnits = {
            'unit_name': v.c4,
            'unit_code': v.c4
          }
          c === 1 ? units.push({ 'unit_name': 'BOX', 'unit_code': 'BOX' }) : null;
          c++;
          if (v.c4) units.push(objUnits);
        }

        for (let v of groupsRs) {
          const objGroups = {
            'group_name': v.c6
            // 'group_code': v.c11
          }
          if (v.c6) groups.push(objGroups);
        }
        let rs1 = await this.importService.importUnits(db, units);
        let rs2 = await this.importService.importDosages(db, dosages);
        let rs3 = await this.importService.importGroups(db, groups);

        if (rs1 && rs2 && rs3) {
          let unitsRs: any = await this.importService.getUnits(db);
          let groupsRs: any = await this.importService.getGroups(db);
          let dosageRs: any = await this.importService.getDosages(db);

          let generics: any = []
          let products: any = []
          let unitGenerics: any = []

          for (let v of fileData) {
            const idxUnits = _.findIndex(unitsRs, { 'unit_name': v[4] });
            const unit_id = idxUnits > -1 ? unitsRs[idxUnits].unit_id : null;

            const idxDosage = _.findIndex(dosageRs, { 'dosage_name': v[3] });
            const dosage_id = idxDosage > -1 ? dosageRs[idxDosage].dosage_id : null;

            const idxGroup = _.findIndex(groupsRs, { 'group_name': v[6] });
            const group_id = idxGroup > -1 ? groupsRs[idxGroup].group_id : null;

            let unit_cost = v[9] / v[10];
            !unit_cost ? unit_cost = 0 : null;
            unit_cost === Infinity ? unit_cost = 0 : null;

            const objGenerics = {
              'generic_id': v[1],
              'generic_name': v[2],
              'working_code': v[1],
              'account_id': 1,
              'generic_type_id': 1,
              'primary_unit_id': unit_id,
              'group_id': group_id,
              'dosage_id': dosage_id,
              'standard_cost': 0,
              'unit_cost': unit_cost
            }

            const objProducts = {
              'product_id': Math.random().toString(6).substr(2, 10),
              'product_name': v[5],
              'working_code': v[1] + Math.random().toString(6).substr(2, 3),
              'generic_id': v[1],
              'primary_unit_id': unit_id,
              'product_group_id': 1
            }

            const objUnitGenerics = {
              'from_unit_id': unit_id,
              'to_unit_id': unit_id,
              'qty': 1,
              'cost': unit_cost,
              'generic_id': v[1]
            };

            if (v[10] > 1) {
              unitGenerics.push({
                'from_unit_id': unitsRs[0].unit_id,
                'to_unit_id': unit_id,
                'qty': v[10],
                'cost': v[9],
                'generic_id': v[1]
              });
            }
            if (v[1] && unit_id) unitGenerics.push(objUnitGenerics);
            if (v[2] && unit_id) generics.push(objGenerics);
            if (v[5] && unit_id) products.push(objProducts);
          }
          await this.importService.insertUnitGenerics(db, unitGenerics);
          await this.importService.insertGenerics(db, generics);
          await this.importService.insertProducts(db, products);
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

  async getGeneric() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.genericRs = await this.importService.getGenericDos(db);
  }

  async mappingLabeler() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    if (this.path) {
      await this.modalLoading.show();
      let fileData = await this.convertFile(this.path);
      await this.importService.createTmpMappingDos(db);

      let mapping = [];
      for (let i in fileData) {
        const obj = {
          'c1': fileData[i][1],
          'c2': fileData[i][2]
        }
        if (fileData[i][2]) mapping.push(obj);
      }
      let rs = await this.importService.importMapping(db, mapping);
      if (rs) {
        let mappingRs = await this.importService.getTmpMapping(db);
        let labelerRs = await this.importService.getLabelers(db);
        let productRs = await this.importService.getGenericDos(db);

        for (let v in productRs) {
          
        }
      }
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