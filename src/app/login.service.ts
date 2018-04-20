import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

import * as crypto from 'crypto';

@Injectable()
export class LoginService {

  constructor() { }

  doLogin(db: IConnection, username: string, password: string) {

    return new Promise((resolve, reject) => {
      db.connect();

      let encPassword = crypto.createHash('md5').update(password).digest('hex');

      let sql = `
      SELECT u.*, p.fname, p.lname
      FROM um_users as u
      INNER JOIN um_people_users as um on um.user_id=u.user_id
      INNER JOIN um_people as p on p.people_id=um.people_id and um.inuse='Y'
      WHERE u.username=? and u.password=?`;
      db.query(sql, [username, encPassword], (error: any, results: any) => {
        db.end();
        if (error) reject(error);
        else resolve(results);
      });
    });
  
  }

}
