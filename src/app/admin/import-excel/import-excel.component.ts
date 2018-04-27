import { browser } from 'protractor';
import { Component, OnInit } from '@angular/core';
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
    await this.importService.createTmp(db);

    const targetDir = path.join(os.homedir());
    const workSheetsFromFile = xlsx.parse(fs.readFileSync(`${targetDir}/template.xlsx`));

    for (let x = 0; x < workSheetsFromFile.length; x++) {
      const excelData = workSheetsFromFile[x].data;

      const arData: any = [];
      const text: any = '';
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

        }
      }
      if (x === 0) {
        await this.signPeople(db, arData);
      }
    }
    this.alertService.success();
  }

  // async signLabeler(db: IConnection, arData: any) {
  //   this.importService.dbConnec(db);
  //   let rs = await this.importService.importLabeler(db, arData);

  //   if (rs) {
  //     let rsProvince: any = await this.importService.selectProvince(db);
  //     let rsAmpur: any = await this.importService.selectAmpur(db);
  //     let rsTambon: any = await this.importService.selectTambon(db);
  //     let rsTmp: any = await this.importService.selectTempLabeler(db);

  //     let comma: number = 0;
  //     let sqlText: string = '';

  //     rsTmp.forEach(rs => {
  //       rsProvince.forEach(v => {
  //         v.province_code == rs.province_name ? rs.province_name = v.province_name : rs.province_name = v.province_name;
  //       });
  //       rsAmpur.forEach(v => {
  //         p.position_name == rs.position_name ? rs.position_id = p.position_id : rs.position_id = rs.position_id;
  //       });
  //       rsTambon.forEach(v => {
  //         p.position_name == rs.position_name ? rs.position_id = p.position_id : rs.position_id = rs.position_id;
  //       });
  //       comma > 0 ? sqlText += ',' : sqlText += '';
  //       sqlText += '(\'' + rs.title_id + '\',\'' + rs.fname + '\',\'' + rs.lname + '\',\'' + rs.position_id + '\')';
  //       comma++;
  //     });

  //     this.importService.insertPeople(db, sqlText)
  //       .then((results: any) => {
  //         this.importService.deleteTempPeople(db);
  //         this.importService.dbClose(db);
  //         this.alertService.success();
  //       })
  //       .catch((error: any) => {
  //         this.alertService.error();
  //       })
  //   } else {
  //     this.alertService.error();
  //   }
  // }

  async signPeople(db: IConnection, arData: any) {
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

      await this.importService.clearData(db);
      await this.importService.deleteTempPeople(db);
      await this.importService.insertPeople(db, peoples);
    } else {
      this.alertService.error();
    }
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
