declare var require: any;

import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router'

import { AlertService } from '../../alert.service';
import { JwtHelper } from 'angular2-jwt';
import { ConnectionService } from '../../connection.service';

import { IConnection } from 'mysql';
import { LoginService } from '../../login.service';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  username: string;
  password: string;
  jwtHelper: JwtHelper = new JwtHelper();
  isLogging = false;

  hospitalName: string;

  constructor(
    private zone: NgZone,
    private loginService: LoginService,
    private router: Router,
    private alert: AlertService,
    private connectionService: ConnectionService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.getHospitalName();
  }

  getHospitalName() {
    let db: IConnection = this.connectionService.createConnection();
    db.connect();

    let sql = `select * from sys_settings where action_name='SYS_HOSPITAL'`;

    db.query(sql, (error, results, fields) => {
      if (error) {
        this.alertService.error(error.message);
      } else {
        let rs: any = JSON.parse(results[0].value);
        this.zone.run(() => {
          this.hospitalName = rs.hospname;
        });
      }

    });

    db.end();

  }

  enterLogin(event) {
    // enter login
    if (event.keyCode === 13) {
      this.doLogin();
    }
  }

  async doLogin() {
    let db: IConnection = this.connectionService.createConnection();
    try {
      let rs: any = await this.loginService.doLogin(db, this.username, this.password);
      if (rs.length) {
        console.log(rs[0].access_right);
        let _rights = rs[0].access_right;
        if (_rights) {
          let rights = rs[0].access_right.split(',');
          let isAdmin = rights.indexOf('UM_ADMIN');

          let fullname = rs[0].fname + ' ' + rs[0].lname;

          sessionStorage.setItem('fullname', fullname);

          if (isAdmin === -1) {
            this.alertService.error('คุณไม่มีสิทธิเข้าใช้งาน');
          } else {
            this.router.navigate(['/admin']);
          }
          
        } else {
          this.alertService.error('คุณไม่มีสิทธิเข้าใช้งาน');
        }


      } else {
        this.alertService.error('ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง')
      }
    } catch (error) {
      console.log(error);
      this.alertService.error(error.message);
    }
  }
}
