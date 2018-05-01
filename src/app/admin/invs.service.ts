import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

const mysql = require('mysql');
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as _ from 'lodash';

@Injectable()
export class InvsService {

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
  getUnits(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = `select * from sale_unit where hide = 'N'`;
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

      const sql = `select * from DRUG_GN`;
      db.query(sql, (error: any, results: any) => {

        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getProducts(db: IConnection) {
    return new Promise((resolve, reject) => {

      const sql = `select * from DRUG_VN`;
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

      const sql = `select * from company`;
      db.query(sql, (error: any, results: any) => {

        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getDosages(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = `select * from dosage_form where hide = 'n'`;
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getGenericHosp(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = `select * from hosp_list`;
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getPeoples(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = `select * from aic_name`;
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getTitleName(db: IConnection) {
    return new Promise((resolve, reject) => {

      const sql = `select * from um_titles`;
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getPositionName(db: IConnection) {
    return new Promise((resolve, reject) => {
      const sql = `select * from um_positions`;
      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  getGenericGroup(db: IConnection) {
    return new Promise((resolve, reject) => {

      const sql = `select * from ED_GROUP`;
      db.query(sql, (error: any, results: any) => {

        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  insertDosages(db: IConnection, dosages) {
    for (const v of dosages) {
      const sql = `insert into mm_generic_dosages set ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          console.log(error);
        }
        console.log(results.insertId);
      });
    }
    return;
  }

  insertPeoples(db: IConnection, peoples) {
    peoples.forEach(v => {
      const sql = `insert into um_people (people_id,title_id,fname,lname,position_id) values (?,?,?,?,?)`;
      db.query(sql, [v.people_id, v.title_id, v.fname, v.lname, v.position_id], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    return;
  }

  insertLabelers(db: IConnection, peoples) {
    peoples.forEach(v => {
      const sql = `insert into mm_labelers (labeler_id,labeler_name,description,nin,address,short_code) values (?,?,?,?,?,?)`;
      db.query(sql, [v.labeler_id, v.labeler_name, v.description, v.nin, v.address, v.short_code], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    return;
  }

  insertGenericHosp(db: IConnection, dosages) {
    dosages.forEach(v => {
      const sql = `insert into mm_generic_hosp (id,name) values (?,?)`;
      db.query(sql, [v.id, v.name], function (error, results, fields) {
        if (error) {
          console.log(error);
        }
        console.log(results.insertId);
      });
    });
    return;
  }

  insertGenericGroup(db: IConnection, dosages) {
    dosages.forEach(v => {
      const sql = `insert into mm_generic_groups (group_id,group_name) values (?,?)`;
      db.query(sql, [v.group_id, v.group_name], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    return;
  }

  insertUnits(db: IConnection, units) {
    units.forEach(v => {
      const sql = `insert into mm_units SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          // throw error;
          console.log(error);
        }
        console.log(results.insertId);
      });
    });
    return;
  }

  insert(db: IConnection, item, sql) {
    console.log('insert');
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

  foreach(db: IConnection, name, items) {
    return new Promise((resolve, reject) => {
      const sql = `insert into ${name} SET ?`;
      items.forEach(async (g) => {
        await this.insert(db, g, sql);
      });
      resolve();
      console.log(`insert ${name} done!`);
    });
  }


  insertGenerics(db: IConnection, generics) {
    return new Promise((resolve, reject) => {
      for (const v of generics) {
        const sql = `insert into mm_generics SET ?`;
        db.query(sql, v, function (error, results, fields) {
          if (error) {
            console.log(error);
            reject(error);
          }
          console.log(results.insertId);
        });
      }
      console.log('succsee');
      resolve(true);
    });
  }

  insertProducts(db: IConnection, generics) {
    generics.forEach(v => {
      const sql = `insert into mm_products SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    return;
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

  truncate2(db: IConnection, table) {
    const sql = `TRUNCATE TABLE ${table}`;
    db.query(sql, function (error, results, fields) {
      if (error) {
        console.log(error);
      }
      return;
    });
  }

}
