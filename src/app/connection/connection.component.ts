
import { Component, OnInit, NgZone } from '@angular/core';

import { AlertService } from '../alert.service';
import { ConnectionService } from '../connection.service';

import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

@Component({
  selector: 'app-connection',
  templateUrl: './connection.component.html',
  styles: []
})
export class ConnectionComponent implements OnInit {

  dbHost = 'localhost';
  dbPort = 3306;
  dbName = 'mmis';
  dbUser = 'root';
  dbPassword = 'root';

  targetDir: string = null;

  constructor(
    private alertService: AlertService,
    private zone: NgZone,
    private connectionService: ConnectionService
  ) {

  }

  ngOnInit() {
    const config: any = this.connectionService.getSetting('config.json');
    this.zone.run(() => {
      this.dbHost = config.dbHost;
      this.dbPort = +config.dbPort;
      this.dbName = config.dbName;
      this.dbUser = config.dbUser;
      this.dbPassword = config.dbPassword;
    });
  }

  saveSetting() {
    const obj: any = {};

    obj.dbHost = this.dbHost;
    obj.dbPort = +this.dbPort;
    obj.dbName = this.dbName;
    obj.dbUser = this.dbUser;
    obj.dbPassword = this.dbPassword;

    const targetDir = path.join(os.homedir(), '.mmis_config');
    fse.ensureDirSync(targetDir);

    const jsonFile = path.join(targetDir, 'config.json');
    fse.writeJson(jsonFile, obj)
      .then(() => {
        this.alertService.success();
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.error(JSON.stringify(error));
      });
  }

}
