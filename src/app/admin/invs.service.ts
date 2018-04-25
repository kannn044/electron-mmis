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
      db.connect();
      const sql = `select * from sale_unit`;
      db.query(sql, (error: any, results: any) => {
        db.end();
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
      db.connect();
      const sql = `select * from DRUG_GN`;
      db.query(sql, (error: any, results: any) => {
        db.end();
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
      db.connect();
      const sql = `select * from DRUG_VN`;
      db.query(sql, (error: any, results: any) => {
        db.end();
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
      db.connect();
      const sql = `select * from company`;
      db.query(sql, (error: any, results: any) => {
        db.end();
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
      db.connect();
      const sql = `select * from DRUG_GN group by DOSAGE_FORM`;
      db.query(sql, (error: any, results: any) => {
        db.end();
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
      db.connect();
      const sql = `select * from hosp_list`;
      db.query(sql, (error: any, results: any) => {
        db.end();
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
      db.connect();
      const sql = `select * from ED_GROUP`;
      db.query(sql, (error: any, results: any) => {
        db.end();
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  insertDosages(db: IConnection, dosages) {
    db.connect();
    dosages.forEach(v => {
      const sql = `insert into mm_generic_dosages (dosage_name) values (?)`;
      db.query(sql, v.dosage_name, function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    db.end();
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
    db.connect();
    peoples.forEach(v => {
      const sql = `insert into mm_labelers (labeler_id,labeler_name,description,nin,address,short_code) values (?,?,?,?,?,?)`;
      db.query(sql, [v.labeler_id, v.labeler_name, v.description, v.nin, v.address, v.short_code], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    db.end();
    return;
  }

  insertGenericHosp(db: IConnection, dosages) {
    db.connect();
    dosages.forEach(v => {
      const sql = `insert into mm_generic_hosp (id,name) values (?,?)`;
      db.query(sql, [v.id, v.name], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    db.end();
    return;
  }

  insertGenericGroup(db: IConnection, dosages) {
    db.connect();
    dosages.forEach(v => {
      const sql = `insert into mm_generic_groups (group_id,group_name) values (?,?)`;
      db.query(sql, [v.group_id, v.group_name], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    db.end();
    return;
  }

  insertUnits(db: IConnection, units) {
    db.connect();
    units.forEach(v => {
      const sql = `insert into mm_units (unit_id,unit_name,unit_code,is_primary) values (?,?,?,?)`;
      db.query(sql, [v.unit_id, v.unit_name, v.unit_code, v.is_primary], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    db.end();
    return;
  }

  insertGenerics(db: IConnection, generics) {
    db.connect();
    generics.forEach(v => {
      const sql = `insert into mm_generics (generic_id,generic_name,working_code,description,keywords,
        group_id,account_id,dosage_id,standard_cost,unit_cost,min_qty,max_qty,generic_hosp_id,primary_unit_id) values (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
      db.query(sql, [v.generic_id, v.generic_name, v.working_code, v.description, v.keywords, v.group_id, v.account_id, v.dosage_id, v.standard_cost, v.unit_cost, v.min_qty, v.max_qty, v.generic_hosp_id, v.primary_unit_id], function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results.insertId);
      });
    });
    db.end();
    return;
  }

  closeConnection(db: IConnection) {
    db.end();
  }
}
