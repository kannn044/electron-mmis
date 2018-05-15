import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

@Injectable()
export class InvdosService {

  constructor() { }

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
}