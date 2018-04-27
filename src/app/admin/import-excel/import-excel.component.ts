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
  ) { }

  peopleRs: any;
  openModal_people = false;

  ngOnInit() {
    this.getpeople();
  }

  async importExcel() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    const targetDir = path.join(os.homedir());
    const workSheetsFromFile = xlsx.parse(fs.readFileSync(`${targetDir}/template.xlsx`));
    this.modalLoading.show();
    for (let x = 0; x < workSheetsFromFile.length; x++) {
      const excelData = workSheetsFromFile[x].data;

      const arData: any = [];
      for (let y = 1; y < excelData.length; y++) {
        if (x === 0) {
          const obj = {
            'title_name': excelData[y][0],
            'fname': excelData[y][1],
            'lname': excelData[y][2],
            'position_name': excelData[y][3]
          };
          arData.push(obj);
        }

        if (x === 1) {
          const obj = {
            'labeler_name': excelData[y][0],
            'description': excelData[y][1],
            'nin': excelData[y][2],
            'address': excelData[y][3],
            'tambon_code': excelData[y][4].split(' '),
            'ampur_code': excelData[y][5].split(' '),
            'province_code': excelData[y][6].split(' '),
            'zipcode': excelData[y][7],
            'phone': excelData[y][8],
            'labeler_type': excelData[y][9],
            'labeler_status': '1'
          };
          arData.push(obj);
        }

        if (x === 2) {
          const obj = {
            'warehouse_id': excelData[y][0],
            'warehouse_name': excelData[y][1],
            'location': excelData[y][2],
            'short_code': excelData[y][2],
            'his_hospcode': excelData[y][3],
            'his_dep_code': excelData[y][4],
          };
          arData.push(obj);
        }

        if (x === 3) {
          const obj = {
            'warehouse_id': excelData[y][0],
            'warehouse_name': excelData[y][1],
            'location': excelData[y][2],
            'short_code': excelData[y][2],
            'his_hospcode': excelData[y][3],
            'his_dep_code': excelData[y][4],
          };
          arData.push(obj);
        }
      }
      if (x === 0) { await this.signPeople(db, arData); }
      if (x === 1) { await this.signLabeler(db, arData); }
      if (x === 2) { await this.signWareHouses(db, arData); }
      // if (x === 3) await this.signWareHouses(db, arData);
    }
    this.modalLoading.hide();
    this.alertService.success();
    this.getpeople();
    db.end();
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
          'description': v.description,
          'nin': v.nin,
          'labeler_type': v.labeler_type,
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
        labeler.push(objLabeler);
      });

      await this.importService.insertLabeler(db, labeler);
      await this.importService.deleteTempLabeler(db);
    } else {
      this.alertService.error();
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
        peoples.push(objPeoples);
      });

      await this.importService.insertPeople(db, peoples);
      await this.importService.deleteTempPeople(db);
    } else {
      this.alertService.error();
    }
  }

  async signWareHouses(db: IConnection, arData: any) {
    await this.importService.clearDataWareHouse(db);
    const importData: any = await this.importService.importWareHouses(db, arData);

    if (!importData) { this.alertService.error(); }
  }

  async signGenerics(db: IConnection, arData: any) {
    await this.importService.clearDataGenerics(db);
  }

  async close() {
    this.openModal_people = false;
  }

  async getpeople() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.peopleRs = await this.importService.getpeople(db);
  }

  async onEdit(item) {
    console.log(item.people_id);
    this.openModal_people = true;
  }
}
