import { browser } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { IConnection } from 'mysql';

import { AlertService } from '../../alert.service';
import { ImportService } from '../../admin/import.service';

import xlsx from 'node-xlsx';

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


  ngOnInit() {
  }

  async importExcel() {
    const db: IConnection = this.connectionService.createConnection('config.json');

    const targetDir = path.join(os.homedir());
    const workSheetsFromFile = xlsx.parse(fs.readFileSync(`${targetDir}/template.xlsx`));

    for (let x = 0; x < workSheetsFromFile.length; x++) {
      const excelData = workSheetsFromFile[x].data;

      const arData = [];
      let text: any = '';
      for (let y = 1; y < excelData.length; y++) {
        if (x === 0) {
          y > 1 ? text += ',' : text += '';
          text += '(\'' + excelData[y][0] + '\',\'' + excelData[y][1] + '\',\'' + excelData[y][2] + '\',\'' + excelData[y][3] + '\')';
        }

        if (x === 1) {
          y > 1 ? text += ',' : text += '';
          text += '(\'' + excelData[y][0] + '\',\'' + excelData[y][1] + '\',\'' + excelData[y][2] + '\',\'' + excelData[y][3] + '\',\'' + excelData[y][4] + '\',\'' + excelData[y][5] + '\',\'' + excelData[y][6] + '\',\'' + excelData[y][7] + '\',\'' + excelData[y][8] + '\',\'' + excelData[y][9] + '\')';
        }
      }
      arData.push(text);

      if (x === 0) {
        // this.signPeople(db, arData);
      } else if (x === 1) {
        this.signLabeler(db, arData);
      }
    }
  }

  async signLabeler(db: IConnection, arData: any) {
    this.importService.dbConnec(db);
    const rs = await this.importService.importLabeler(db, arData);
  }

  async signPeople(db: IConnection, arData: any) {
    const title = [];
    const position = [];
    const tmp_people = [];

    this.importService.dbConnec(db);
    const rs = await this.importService.importPeople(db, arData);
    if (rs) {
      const rsTitle: any = await this.importService.selectTitle(db);
      const rsPosition: any = await this.importService.selectPosition(db);
      const rsTmp: any = await this.importService.selectTempPeople(db);

      let comma = 0;
      let sqlText = '';

      rsTmp.forEach(rs => {
        rsTitle.forEach(t => {
          t.title_name === rs.title_name ? rs.title_id = t.title_id : rs.title_id = rs.title_id;
        });
        rsPosition.forEach(p => {
          p.position_name === rs.position_name ? rs.position_id = p.position_id : rs.position_id = rs.position_id;
        });
        comma > 0 ? sqlText += ',' : sqlText += '';
        sqlText += '(\'' + rs.title_id + '\',\'' + rs.fname + '\',\'' + rs.lname + '\',\'' + rs.position_id + '\')';
        comma++;
      });
      this.importService.insertPeople(db, sqlText)
        .then((results: any) => {
          this.importService.deleteTempPeople(db);
          this.importService.dbClose(db);
          this.alertService.success();
        })
        .catch((error: any) => {
          this.alertService.error();
        });
    } else {
      this.alertService.error();
    }
  }
}
