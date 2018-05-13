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
const { dialog } = require('electron').remote

@Component({
  selector: 'app-invdos',
  templateUrl: './invdos.component.html'
})
export class InvdosComponent implements OnInit {

  path: string;

  constructor(
    private connectionService: ConnectionService
  ) { }

  ngOnInit() {
  }

  selectPath() {
    const path = dialog.showOpenDialog({ properties: ['openFile'] });
    if (path) {
      this.path = path.toString();
    }
  }

  importTxt() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    if (this.path) {
      const workSheetsFromFile = fs.readFileSync(this.path, { encoding: 'UTF-8' });
      console.log(workSheetsFromFile);
      // for (let x = 0; x < workSheetsFromFile.length; x++) {
      //   const data = workSheetsFromFile[x].data;
      //   console.log(data);
      // }
    }
  }
}
