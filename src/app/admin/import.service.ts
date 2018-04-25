import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

@Injectable()
export class ImportService {

  constructor() { }

  importPeople(db: IConnection, data: any) {
    return new Promise((resolve, reject) => {
      db.query('CREATE TABLE tmp_people (id int NOT NULL AUTO_INCREMENT,title_name varchar(255),fname varchar(255),lname varchar(255),position_name varchar(255),title_id int(10),position_id int(10),PRIMARY KEY (id))');

      let sql = `INSERT INTO tmp_people (title_name,fname,lname,position_name) VALUES ${data}`;
      db.query(sql, (error: any, results: any) => {

        if (error) {
          reject(error);
        } else {
          resolve(results);
        };
      })
    })
  }

  importLabeler(db: IConnection, data: any) {
    return new Promise((resolve, reject) => {
      // db.query('CREATE TABLE tmp_labeler (id int NOT NULL AUTO_INCREMENT,labeler_name varchar(255),description varchar(255),nin varchar(255),labeler_type varchar(255),labeler_status varchar(255),address varchar(255),tambon_code varchar(255),ampur_code varchar(255),province_code varchar(255),zipcode varchar(255),phone varchar(255),PRIMARY KEY (id))');

      // let sql = `INSERT INTO tmp_labeler (labeler_name,description,nin,labeler_type,labeler_status,address,tambon_code,ampur_code,province_code,zipcode,phone) VALUES ${data}`;

      // db.query(sql, (error: any, results: any) => {
      //   if (error) {
      //     reject(error);
      //   } else {
      //     resolve(results);
      //   };
      // })
      resolve(true);
    })
  }

  selectTempLabeler(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_labeler`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  selectProvince(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_province`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }
  
  selectAmpur(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_ampur`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }
  
  selectTambon(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_tambon`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  selectTempPeople(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_people`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  selectTitle(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM um_titles`, (error: any, results: any) => {
        resolve(results)

      })
    })
  }

  selectPosition(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM um_positions`, (error: any, results: any) => {
        resolve(results)

      })
    })
  }

  insertPeople(db: IConnection, data: any) {
    return new Promise((resolve, reject) => {
      let sql = `INSERT INTO um_people (title_id,fname,lname,position_id) VALUES ${data}`;

      db.query(sql, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else resolve(results);
      })
    })
  }

  deleteTempPeople(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`DROP TABLE tmp_people`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else resolve(results);
      })
    })
  }

  dbConnec(db: IConnection) {
    db.connect();
  }
  dbClose(db: IConnection) {
    db.end();
  }
}
