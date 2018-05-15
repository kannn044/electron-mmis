import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

@Injectable()
export class ImportService {

  constructor() { }

  createTmpPeople(db: IConnection) {
    const sql = `CREATE TABLE tmp_people (id int NOT NULL AUTO_INCREMENT,title_name varchar(255),fname varchar(255),lname varchar(255),position_name varchar(255),PRIMARY KEY(id))`;
    db.query(sql, function (error, results, fields) {
      if (error) {
        throw error;
      }
    });
    return true;
  }

  createTmpProductDos(db: IConnection) {
    const sql = `CREATE TABLE tmp_product_dos (id int NOT NULL AUTO_INCREMENT,c1 varchar(255),c2 varchar(255),c3 varchar(255),c4 varchar(255),c5 varchar(255),c6 varchar(255),c7 varchar(255),c8 varchar(255),c9 varchar(255),c10 varchar(255),c11 varchar(255),PRIMARY KEY(id))`;
    db.query(sql, function (error, results, fields) {
      if (error) {
        throw error;
      }
    });
    return true;
  }

  createTmpGenerics(db: IConnection) {
    const sql = `CREATE TABLE tmp_generics (generic_id varchar(255) NOT NULL,generic_name varchar(255),working_code varchar(255),account_id varchar(255),generic_type_id varchar(255),package varchar(255),conversion varchar(255),primary_unit_id varchar(255),standard_cost int(10) DEFAULT 0,unit_cost int(10) DEFAULT 0,package_cost int(10) DEFAULT 0,min_qty int(10),max_qty int(10),PRIMARY KEY(generic_id),UNIQUE (generic_name))`;
    db.query(sql, function (error, results, fields) {
      if (error) {
        throw error;
      }
    });
    return true;
  }

  createTmpProducts(db: IConnection) {
    const sql = `CREATE TABLE tmp_products (product_id int NOT NULL AUTO_INCREMENT,product_name varchar(255),working_code varchar(255),generic_id varchar(255),primary_unit_id varchar(255),m_labeler_id varchar(255),v_labeler_id varchar(255),remain_qty int(10),warehouse_name varchar(255),tmt_id varchar(255),PRIMARY KEY(product_id),UNIQUE (product_name))`;
    db.query(sql, function (error, results, fields) {
      if (error) {
        throw error;
      }
    });
    return true;
  }

  createTmpLabeler(db: IConnection) {
    const sql = `CREATE TABLE tmp_labelers (id int NOT NULL AUTO_INCREMENT,labeler_name varchar(255),description varchar(255),nin varchar(255),labeler_type varchar(255),labeler_status varchar(255),address varchar(255),tambon_code varchar(255),ampur_code varchar(255),province_code varchar(255),zipcode varchar(255),phone varchar(255),PRIMARY KEY (id))`;

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

  importGenerics(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO tmp_generics SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  importUnits(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO mm_units SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }
  
  importGroups(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO mm_generic_groups SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }
  
  importDosages(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO mm_generic_dosages SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  importProducts(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO tmp_products SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  importWareHouses(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO wm_warehouses SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  importLabeler(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO tmp_labelers SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  getTempLabeler(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_labelers`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getTempProductDos(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_product_dos`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }
  getTempProductDosages(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_product_dos GROUP BY c3`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }
  getTempProductGroups(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_product_dos GROUP BY c6`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }
  getTempProductUnits(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_product_dos GROUP BY c4`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getTempGenerics(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_generics`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getTempProducts(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_products`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  searchTempProducts(db: IConnection, genericId: any) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT generic_id,count(generic_id) as count FROM tmp_products WHERE generic_id = ${genericId} GROUP BY generic_id`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getProducts(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM mm_products`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getProvince(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_province`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getAmpur(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_ampur`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getTambon(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM l_tambon`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getTempPeople(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM tmp_people`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getTitle(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM um_titles`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getUnitsTmp(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT primary_unit_id FROM tmp_generics GROUP BY primary_unit_id`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getGenericAccount(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM mm_generic_accounts`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getGenericType(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM mm_generic_types`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getGeneric(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT
      mg.generic_name,
      mp.product_name,
      mul.unit_name AS large_unit,
      max(mug.qty) AS qty,
      mus.unit_name AS small_unit,
      mg.unit_cost,
      mug.cost,
    FROM
      mm_products mp
      JOIN mm_generics mg ON mg.generic_id = mp.generic_id
      LEFT JOIN mm_generic_types mgt ON mgt.generic_type_id = mg.generic_type_id
      LEFT JOIN mm_generic_accounts mga ON mga.account_id = mg.account_id
      LEFT JOIN mm_unit_generics mug ON mug.generic_id = mg.generic_id
      LEFT JOIN mm_units mus ON mus.unit_id = mug.to_unit_id
      LEFT JOIN mm_units mul ON mul.unit_id = mug.from_unit_id 
    GROUP BY
      mg.generic_name 
    ORDER BY
      mgt.generic_type_id,
      mg.generic_name`, (error: any, results: any) => {
          resolve(results);
        });
    });
  }

  getUnits(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM mm_units`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getDosages(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM mm_generic_dosages`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }
  
  getGroups(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM mm_generic_groups`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getLabelers(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM mm_labelers`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getPeople(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT
      up.people_id,
      up.title_id,
      ut.title_name,
      up.fname,
      up.lname,
      up.position_id,
      upp.position_name
    FROM
      um_people up
    JOIN um_titles ut ON ut.title_id = up.title_id
    JOIN um_positions upp ON upp.position_id = up.position_id`, (error: any, results: any) => {
          resolve(results);
        });
    });
  }

  getWarehouses(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM wm_warehouses`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getUnitGenericsId(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT mup.unit_generic_id,mp.product_id,mp.product_name,max( mup.qty ) AS max_qty FROM mm_unit_generics mup JOIN mm_products mp ON mp.generic_id = mup.generic_id GROUP BY mp.product_id, mp.product_name`, (error: any, results: any) => {
        resolve(results);
      });
    });
  }

  getPosition(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`SELECT * FROM um_positions`, (error: any, results: any) => {
        resolve(results);
      });
    });
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

  insertGenerics(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO mm_generics SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  insertProducts(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO mm_products SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  insertWmProducts(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO wm_products SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  insertUnitGenerics(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO mm_unit_generics SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  insertLabeler(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO mm_labelers SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }
  
  insertTmpProductDos(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO tmp_product_dos SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  truncateTable(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `TRUNCATE TABLE ${v}`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  deleteTableTmp(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `DROP TABLE ${v}`;
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
        } else { resolve(results); }
      });
    });
  }

  deleteTempGenerics(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`DROP TABLE tmp_generics`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  deleteTempProducts(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`DROP TABLE tmp_products`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  deleteTempLabeler(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`DROP TABLE tmp_labelers`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataPeople(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE um_people`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataUnits(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE mm_units`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataWareHouse(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE wm_warehouses`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataGenerics(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE mm_generics`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataProducts(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE mm_products`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataWmProducts(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE wm_products`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataUnitGenerics(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE mm_unit_generics`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  clearDataLabeler(db: IConnection) {
    return new Promise((resolve, reject) => {
      db.query(`TRUNCATE TABLE mm_labelers`, (error: any, results: any) => {
        if (error) {
          reject(error);
        } else { resolve(results); }
      });
    });
  }

  updatePeople(db: IConnection, peopleEdit: any) {
    return new Promise((resolve, reject) => {
      db.query(`UPDATE um_people AS up
      SET up.title_id = '${peopleEdit.title_id}' ,
      up.fname = '${peopleEdit.fname}' ,
      up.lname = '${peopleEdit.lname}' ,
      up.position_id = '${peopleEdit.position_id}'
      WHERE up.people_id = '${peopleEdit.people_id}';`, (error: any, results: any) => {
          if (error) {
            reject(error);
          } else { resolve(results); }
        });
    });
  }

  updateLabelers(db: IConnection, lablerEdit: any) {
    return new Promise((resolve, reject) => {
      db.query(`UPDATE mm_labelers AS ml
      SET ml.labeler_name = '${lablerEdit.labeler_name}' ,
      ml.address = '${lablerEdit.address}' ,
      ml.phone = '${lablerEdit.phone}'
      WHERE ml.labeler_id = '${lablerEdit.labeler_id}';`, (error: any, results: any) => {
          if (error) {
            reject(error);
          } else { resolve(results); }
        });
    });
  }

  updateWarehouses(db: IConnection, warehousesEdit: any) {
    return new Promise((resolve, reject) => {
      db.query(`UPDATE wm_warehouses AS ww
      SET ww.warehouse_name = '${warehousesEdit.warehouse_name}'
      WHERE ww.warehouse_id = '${warehousesEdit.warehouse_id}'`, (error: any, results: any) => {
          if (error) {
            reject(error);
          } else { resolve(results); }
        });
    });
  }
}
