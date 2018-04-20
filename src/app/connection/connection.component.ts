
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

  dbHost: string = 'localhost';
  dbPort: number = 3306;
  dbName: string = 'mmis';
  dbUser: string = 'root';
  dbPassword: string = 'root';

  targetDir: string = null;

  constructor(
    private alertService: AlertService,
    private zone: NgZone,
    private connectionService: ConnectionService
  ) {

  }

  ngOnInit() {
    let config: any = this.connectionService.getSetting();
    this.zone.run(() => {
      this.dbHost = config.dbHost;
      this.dbPort = +config.dbPort;
      this.dbName = config.dbName;
      this.dbPassword = config.dbPassword;
    });
  }

  saveSetting() {
    let obj: any = {};

    obj.dbHost = this.dbHost;
    obj.dbPort = +this.dbPort;
    obj.dbName = this.dbName;
    obj.dbUser = this.dbUser;
    obj.dbPassword = this.dbPassword;

    let targetDir = path.join(os.homedir(), '.mmis_config');
    fse.ensureDirSync(targetDir);

    let jsonFile = path.join(targetDir, 'config.json');
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
