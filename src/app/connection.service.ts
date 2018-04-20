var mysql = require('mysql');
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';

import { Injectable } from '@angular/core';

@Injectable()
export class ConnectionService {

  constructor() { }

  createConnection() {

    let config: any = this.getSetting();
    
    return mysql.createConnection({
      host: config.dbHost,
      user: config.dbUser,
      port: +config.dbPort,
      password: config.dbPassword,
      database: config.dbName,
      pool: {
        min: 0,
        max: 7,
        afterCreate: (conn, done) => {
          conn.query('SET NAMES utf8', (err) => {
            done(err, conn);
          });
        }
      },
      debug: false,
      acquireConnectionTimeout: 10000
    });

  }

  getSetting() {

    let targetDir = path.join(os.homedir(), '.mmis_config');
    fse.ensureDirSync(targetDir);

    let jsonFile = path.join(targetDir, 'config.json');

    try {
      let config = fse.readJsonSync(jsonFile);
      return config;
    } catch (error) {
      let obj: any = {
        dbHost: 'localhost',
        dbPort: 3306,
        dbName: 'mmis',
        dbUser: 'root',
        dbPassword: '123456'
      }

      fse.writeJsonSync(jsonFile, obj);
      return obj;
    }
  }

}
