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
  genericsRs: any = [];

  @ViewChild('modalLoading') public modalLoading: any;
  constructor(
    private connectionService: ConnectionService,
    private alertService: AlertService,
    private importService: ImportService
  ) { }

  ngOnInit() {
    this.getWarehouses();
    this.getLabeler();
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
      let fileData = await this.converFile(this.path);

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
        await this.modalLoading.hide();
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
      let fileData = await this.converFile(this.path);
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
        await this.modalLoading.hide();
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
      let fileData = await this.converFile(this.path);
      console.log(fileData)

      // let labelerData = [];
      // for (let i in fileData) {
      //   const obj = {
      //     'labeler_name': fileData[i][3] + fileData[i][4] + fileData[i][5],
      //     'description': fileData[i][0],
      //     'is_vendor': fileData[i][1] ? 'Y' : 'N',
      //     'is_manufacturer': fileData[i][2] ? 'Y' : 'N',
      //     'phone': fileData[i][10]
      //   }
      //   if (fileData[i][4]) labelerData.push(obj);
      // }

      // await this.importService.clearDataLabeler(db);
      // let rs = await this.importService.insertLabeler(db, labelerData);
      // if (rs) {
        await this.modalLoading.hide();
      //   await this.alertService.success();
      // }
      // else await this.alertService.error();
    }
    // await this.getLabeler();
  }

  async converFile(pathFile: any) {
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