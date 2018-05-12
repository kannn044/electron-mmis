import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

const mysql = require('mysql');
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as _ from 'lodash';

@Injectable()
export class InvcService {

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

  truncate(db: IConnection, table) {
    return new Promise((resolve, reject) => {
      table.forEach(v => {
        const sql = `TRUNCATE TABLE ${v}`;
        db.query(sql, function (error, results, fields) {
          if (error) {
            reject(error);
          }
          resolve();
        });
      });
    });
  }

  getUnitsInvc(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = 'select SALE_UNIT from `dbo.inv_md` group by SALE_UNIT';
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getDosageInvc(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = 'select DOSAGE_FORM from `dbo.inv_md` group by DOSAGE_FORM';
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getAccountInvc(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from `dbo.tbled_ned`';
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getGenericTypeInvc(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from `dbo.tbled_ned`';
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getGenericGroupInvc(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from `dbo.group`';
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getLabelers(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = 'select * from `dbo.company`';
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getGenerics(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT mg.*,mgg.RECORD_NUMBER as group_id from `dbo.inv_md` mg left join `dbo.group` mgg on mg.GROUP_D = mgg.`CODE`';
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  insert(db: IConnection, name, items) {
    return new Promise((resolve, reject) => {
      const sql = `insert into ${name} SET ?`;
      items.forEach(async (g) => {
        await this.insertTo(db, g, sql);
      });
      resolve();
      console.log(`insert ${name} done!`);
    });
  }

  insertTo(db: IConnection, item, sql) {
    return new Promise((resolve, reject) => {
      db.query(sql, item, function (error, results, fields) {
        if (error) {
          console.log(error);
          reject(error);
        }
        resolve(true);
      });
    });
  }
}
