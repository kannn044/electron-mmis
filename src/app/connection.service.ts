const mysql = require('mysql');
// import * as mysql from 'mysql';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as _ from 'lodash';

import { Injectable } from '@angular/core';

@Injectable()
export class ConnectionService {
  success = true;
  constructor() { }

  createConnection(name: any) {

    const config: any = this.getSetting(name);
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

  getSetting(name: any) {

    const targetDir = path.join(os.homedir(), '.mmis_config');
    fse.ensureDirSync(targetDir);

    const jsonFile = path.join(targetDir, name);

    try {
      const config = fse.readJsonSync(jsonFile);
      return config;
    } catch (error) {
      const obj: any = {
        dbHost: 'localhost',
        dbPort: 3306,
        dbName: 'mmis',
        dbUser: 'root',
        dbPassword: '123456'
      };

      fse.writeJsonSync(jsonFile, obj);
      return obj;
    }
  }

  async testConnection(dbHost, dbPort, dbUser, dbPassword, dbName) {
    return new Promise((resolve, reject) => {

      const connection = mysql.createConnection({
        host: dbHost,
        user: dbUser,
        port: dbPort,
        password: dbPassword,
        database: dbName,
        debug: false,
        acquireConnectionTimeout: 10000
      });
      connection.connect(function (err) {
        if (err) {
          this.success = false;
          return resolve(false);
        }
        resolve(true);
      });
    });
  }
}
