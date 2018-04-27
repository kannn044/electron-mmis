import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

@Injectable()
export class ImportService {

  constructor() { }

  createTmp(db: IConnection) {
    const sql = `CREATE TABLE tmp_people (id int NOT NULL AUTO_INCREMENT,title_name varchar(255),fname varchar(255),lname varchar(255),position_name varchar(255),PRIMARY KEY(id))`;
    db.query(sql, function (error, results, fields) {
      if (error) {
        throw error;
      }
    });
    return true;
  }

  importPeople(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO tmp_people SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
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

  getTempLabeler(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_labeler`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  getProvince(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_province`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  getAmpur(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_ampur`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  getTambon(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_tambon`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  getTempPeople(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_people`, (error: any, results: any) => {
        resolve(results)
      })
    })
  }

  getTitle(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM um_titles`, (error: any, results: any) => {
        resolve(results)

      })
    })
  }

  getpeople(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT
      up.people_id,
      ut.title_name,
      up.fname,
      up.lname,
      upp.position_name
    FROM
      um_people up
    JOIN um_titles ut ON ut.title_id = up.title_id
    JOIN um_positions upp ON upp.position_id = up.position_id`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getPosition(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM um_positions`, (error: any, results: any) => {
        resolve(results)

      })
    })
  }

  insertPeople(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO um_people SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
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

  clearData(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE um_people`, (error: any, results: any) => {
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
