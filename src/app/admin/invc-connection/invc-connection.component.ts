import { Router } from '@angular/router';
import { Component, OnInit, NgZone } from '@angular/core';
import { AlertService } from '../../alert.service';
import { ConnectionService } from '../../connection.service';

import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

@Component({
  selector: 'app-invc-connection',
  templateUrl: './invc-connection.component.html',
  styles: []
})
export class InvcConnectionComponent implements OnInit {

  dbHost: any;
  dbPort: any;
  dbName: any;
  dbUser: any;
  dbPassword: any;
  testConnection = false;
  isSave = false;
  constructor(
    private alertService: AlertService,
    private zone: NgZone,
    private connectionService: ConnectionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getSetting();
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

    const jsonFile = path.join(targetDir, 'config_invc.json');
    fse.writeJson(jsonFile, obj)
      .then(() => {
        this.router.navigate(['/admin/invc-sync']);
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.error(JSON.stringify(error));
      });
  }

  getSetting() {
    const config: any = this.connectionService.getSetting('config_invc.json');
    this.zone.run(() => {
      this.dbHost = config.dbHost;
      this.dbPort = +config.dbPort;
      this.dbName = config.dbName;
      this.dbUser = config.dbUser;
      this.dbPassword = config.dbPassword;
    });
  }

  async testConnections() {
    this.testConnection = true;
    const conn: any = await this.connectionService.testConnection(this.dbHost, this.dbPort, this.dbUser, this.dbPassword, this.dbName);
    console.log(conn);

    if (!conn) {
      this.testConnection = false;
      this.alertService.error('เชื่อมต่อฐานข้อมูลผิดพลาด');
      this.isSave = false;
    } else if (conn) {
      this.isSave = true;
      this.alertService.success('เชื่อมต่อฐานข้อมูลสำเร็จ');
      // console.log('success');
    }
  }

  reTest() {
    this.testConnection = false;
    this.isSave = false;
  }
}
