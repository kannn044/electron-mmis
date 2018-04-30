import { browser } from 'protractor';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ConnectionService } from '../../connection.service';
import { IConnection } from 'mysql';

import { AlertService } from '../../alert.service';
import { ImportService } from '../../admin/import.service';

import xlsx from 'node-xlsx';

import * as _ from 'lodash';
import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

@Component({
  selector: 'app-import-excel',
  templateUrl: './import-excel.component.html',
  styles: []
})
export class ImportExcelComponent implements OnInit {

  @ViewChild('modalLoading') public modalLoading: any;
  constructor(
    private connectionService: ConnectionService,
    private importService: ImportService,
    private alertService: AlertService
  ) {
  }

  peopleRs: any;
  titleRs: any;
  positionRs: any;
  labelersRS: any;
  openModal_people = false;
  openModal_labeler = false;
  peopleEdit = {};
  lablerEdit = {};

  file: any;
  fileName: any;

  ngOnInit() {
    this.getpeople();
    this.getLabelers();
  }

  fileChangeEvent(fileInput: any) {
    this.file = <Array<File>>fileInput.target.files;
    this.fileName = this.file[0].name;
  }

  async downloadFile() {

  }

  async importExcel() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    db.connect();

    const targetDir = path.join(os.homedir());
    const workSheetsFromFile = xlsx.parse(fs.readFileSync(`${targetDir}/template.xlsx`));
    this.modalLoading.show();
    for (let x = 0; x < workSheetsFromFile.length; x++) {
      const excelData = workSheetsFromFile[x].data;

      const arData: any = [];
      const arData1: any = [];
      console.log('true', x)
      for (let y = 1; y < excelData.length; y++) {
        const idGenerics = Math.random().toString(15).substr(2, 9);
        if (x === 0) {
          const obj = {
            'title_name': excelData[y][0],
            'fname': excelData[y][1],
            'lname': excelData[y][2],
            'position_name': excelData[y][3]
          };
          arData.push(obj);
        }

        if (x === 1) {
          const obj = {
            'labeler_name': excelData[y][0],
            'description': excelData[y][1],
            'nin': excelData[y][2],
            'address': excelData[y][3],
            'tambon_code': excelData[y][4].split(' '),
            'ampur_code': excelData[y][5].split(' '),
            'province_code': excelData[y][6].split(' '),
            'zipcode': excelData[y][7],
            'phone': excelData[y][8],
            'labeler_type': excelData[y][9],
            'labeler_status': '1'
          };
          arData.push(obj);
        }

        if (x === 2) {
          const obj = {
            'warehouse_id': excelData[y][0],
            'warehouse_name': excelData[y][1],
            'location': excelData[y][2],
            'short_code': excelData[y][2],
            'his_hospcode': excelData[y][3],
            'his_dep_code': excelData[y][4],
          };
          arData.push(obj);
        }

        if (x === 3) {
          excelData[y][2] === undefined ? excelData[y][2] = idGenerics : excelData[y][2] = excelData[y][2];
          const obj = {
            'generic_id': excelData[y][2],
            'generic_name': excelData[y][0],
            'working_code': excelData[y][2],
            'account_id': excelData[y][3],
            'generic_type_id': excelData[y][4],
            'package': excelData[y][5],
            'conversion': excelData[y][6],
            'primary_unit_id': excelData[y][7],
            'standard_cost': excelData[y][8],
            'unit_cost': excelData[y][9],
            'package_cost': excelData[y][10],
            'min_qty': excelData[y][11],
            'max_qty': excelData[y][12],
          };

          const obj1 = {
            'product_name': excelData[y][1],
            'working_code': excelData[y][2],
            'generic_id': excelData[y][2],
            'primary_unit_id': excelData[y][7],
            'm_labeler_id': excelData[y][13],
            'v_labeler_id': excelData[y][14],
          };
          arData.push(obj);
          arData1.push(obj1);
        }
      }
      if (x === 0) { await this.signPeople(db, arData); }
      if (x === 1) { await this.signLabeler(db, arData); }
      if (x === 2) { await this.signWareHouses(db, arData); }
      if (x === 3) { await this.signGenerics(db, arData, arData1); }
    }
    await this.modalLoading.hide();
    await this.getpeople();
    await db.end();
  }

  async signLabeler(db: IConnection, arData: any) {
    await this.importService.createTmpLabeler(db);
    await this.importService.clearDataLabeler(db);
    const importData: any = await this.importService.importLabeler(db, arData);

    if (importData) {
      const labelerRs: any = await this.importService.getTempLabeler(db);
      const tambonRs: any = await this.importService.getTambon(db);
      const ampurRs: any = await this.importService.getAmpur(db);
      const provinceRs: any = await this.importService.getProvince(db);
      const labeler = [];
      labelerRs.forEach(v => {
        const idxTcode = _.findIndex(tambonRs, { 'tambon_name': v.tambon_code });
        const tambon_code = idxTcode > -1 ? tambonRs[idxTcode].tambon_code : null;

        const idxAcode = _.findIndex(ampurRs, { 'ampur_name': v.ampur_code });
        const ampur_code = idxAcode > -1 ? ampurRs[idxAcode].ampur_code : null;

        const idxPcode = _.findIndex(provinceRs, { 'province_name': v.province_code });
        const province_code = idxPcode > -1 ? provinceRs[idxPcode].province_code : null;

        const objLabeler = {
          'labeler_name': v.labeler_name,
          'description': v.description,
          'nin': v.nin,
          'labeler_type': v.labeler_type,
          'labeler_status': '1',
          'address': v.address,
          'tambon_code': tambon_code,
          'ampur_code': ampur_code,
          'province_code': province_code,
          'zipcode': v.zipcode,
          'phone': v.phone,
          'is_vendor': 'Y',
          'is_manufacturer': 'Y',
          'short_code': v.description
        };
        labeler.push(objLabeler);
      });

      await this.importService.insertLabeler(db, labeler);
      await this.importService.deleteTempLabeler(db);
    } else {
      this.alertService.error();
    }
  }

  async signPeople(db: IConnection, arData: any) {
    await this.importService.createTmpPeople(db);
    await this.importService.clearDataPeople(db);
    const importData: any = await this.importService.importPeople(db, arData);

    if (importData) {
      const peopleRs: any = await this.importService.getTempPeople(db);
      const titleRs: any = await this.importService.getTitle(db);
      const positionRs: any = await this.importService.getPosition(db);
      const peoples = [];
      peopleRs.forEach(v => {
        const idxTitle = _.findIndex(titleRs, { 'title_name': v.title_name });
        const title_id = idxTitle > -1 ? titleRs[idxTitle].title_id : null;

        const idxPosition = _.findIndex(positionRs, { 'position_name': v.position_name });
        const position_id = idxPosition > -1 ? positionRs[idxPosition].position_id : null;

        const objPeoples = {
          'title_id': title_id,
          'fname': v.fname,
          'lname': v.lname,
          'position_id': position_id
        };
        peoples.push(objPeoples);
      });

      await this.importService.insertPeople(db, peoples);
      await this.importService.deleteTempPeople(db);
    } else {
      this.alertService.error();
    }
  }

  async signWareHouses(db: IConnection, arData: any) {
    await this.importService.clearDataWareHouse(db);
    const importData: any = await this.importService.importWareHouses(db, arData);

    if (!importData) { this.alertService.error(); }
  }

  async signGenerics(db: IConnection, arData: any, arData1: any) {
    await this.importService.clearDataGenerics(db);
    await this.importService.clearDataProducts(db);
    await this.importService.clearDataUnitGenerics(db);

    await this.importService.createTmpGenerics(db);
    await this.importService.createTmpProducts(db);

    const rsg = await this.importService.importGenerics(db, arData);
    const rsp = await this.importService.importProducts(db, arData1);

    if (rsg && rsp) {
      try {
        await this.importService.clearDataUnits(db);
        const unitNames: any = await this.importService.getUnitsTmp(db);
        const units = [];
        unitNames.forEach(v => {
          if (v.primary_unit_id !== null) {
            const objUnits = {
              'unit_name': v.primary_unit_id,
              'unit_code': v.primary_unit_id
            };
            units.push(objUnits);
          }
        });

        const rsUnits: any = await this.importService.importUnits(db, units);
        if (!rsUnits) { this.alertService.error('ข้อมูลหน่วยเล็กสุดไม่สมบูรณ์'); }

        const tmpGenericRs: any = await this.importService.getTempGenerics(db);
        const tmpProductRs: any = await this.importService.getTempProducts(db);
        const AccountRs: any = await this.importService.getGenericAccount(db);
        const typesRs: any = await this.importService.getGenericType(db);
        const unitsRs: any = await this.importService.getUnits(db);
        const labelerRs: any = await this.importService.getLabelers(db);

        const unitGenerics = [];
        const generics = [];
        const products = [];

        tmpGenericRs.forEach(v => {
          const idxUnitGenerics = _.findIndex(unitsRs, { 'unit_name': v.primary_unit_id });
          const primary_unit_id = idxUnitGenerics > -1 ? unitsRs[idxUnitGenerics].unit_id : null;

          const idxPackage = _.findIndex(unitsRs, { 'unit_name': v.package });
          const package_id = idxPackage > -1 ? unitsRs[idxUnitGenerics].unit_id : null;

          const idxAccount = _.findIndex(AccountRs, { 'account_name': v.account_id });
          const account_id = idxAccount > -1 ? AccountRs[idxAccount].account_id : null;

          const idxTypes = _.findIndex(typesRs, { 'generic_type_name': v.generic_type_id });
          const generic_type_id = idxTypes > -1 ? typesRs[idxTypes].generic_type_id : null;

          const objGenerics = {
            'generic_id': v.generic_id,
            'generic_name': v.generic_name,
            'working_code': v.working_code,
            'account_id': account_id,
            'generic_type_id': generic_type_id,
            'primary_unit_id': primary_unit_id,
            'standard_cost': v.standard_cost,
            'unit_cost': v.unit_cost,
            'min_qty': v.min_qty,
            'max_qty': v.max_qty
          };

          const objUnitGenerics = {
            'from_unit_id': primary_unit_id,
            'to_unit_id': primary_unit_id,
            'qty': 1,
            'cost': v.unit_cost,
            'generic_id': v.generic_id
          };

          generics.push(objGenerics);
          unitGenerics.push(objUnitGenerics);

          if (v.conversion > 1) {
            unitGenerics.push({
              'from_unit_id': idxPackage,
              'to_unit_id': primary_unit_id,
              'qty': v.conversion,
              'cost': v.package_cost,
              'generic_id': v.generic_id
            })
          }
        });

        tmpProductRs.forEach(v => {
          const idxPrimaryUnit = _.findIndex(unitsRs, { 'unit_name': v.primary_unit_id });
          const primary_unit_id = idxPrimaryUnit > -1 ? unitsRs[idxPrimaryUnit].unit_id : null;

          const idxMlabeler = _.findIndex(labelerRs, { 'labeler_name': v.m_labeler_id });
          const m_labeler_id = idxMlabeler > -1 ? labelerRs[idxMlabeler].lebeler_id : null;

          const idxVlabeler = _.findIndex(labelerRs, { 'labeler_name': v.v_labeler_id });
          const v_labeler_id = idxVlabeler > -1 ? labelerRs[idxVlabeler].lebeler_id : null;

          const objProducts = {
            'product_id': v.product_id,
            'product_name': v.product_name,
            'working_code': v.working_code,
            'generic_id': v.generic_id,
            'primary_unit_id': primary_unit_id,
            'm_labeler_id': m_labeler_id,
            'v_labeler_id': v_labeler_id
          };

          products.push(objProducts);
        });

        const rsGenerics = await this.importService.insertGenerics(db, generics);
        const rsProducts = await this.importService.insertProducts(db, products);
        const rsUnitGenerics = await this.importService.insertUnitGenerics(db, unitGenerics);

        if (rsGenerics && rsUnitGenerics && rsProducts) {
          await this.importService.deleteTempGenerics(db);
          await this.importService.deleteTempProducts(db);
        } else {
          this.alertService.error();
        }
      } catch (error) {
        this.alertService.error(error.message);
      }
    }
  }

  closeModal() {
    this.openModal_people = false;
    this.openModal_labeler = false;
  }

  async getpeople() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.peopleRs = await this.importService.getPeople(db);
  }

  async onEditPeople(item) {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.titleRs = await this.importService.getTitle(db);
    this.positionRs = await this.importService.getPosition(db);
    this.peopleEdit = {
      'people_id': item.people_id,
      'title_id': item.title_id,
      'fname': item.fname,
      'lname': item.lname,
      'position_id': item.position_id
    };
    this.openModal_people = true;
  }

  async confirmEditPeople() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    await this.importService.updatePeople(db, this.peopleEdit);
    this.closeModal();
    this.alertService.success();
    this.getpeople();
  }

  async getLabelers() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.labelersRS = await this.importService.getLabelers(db);
  }

  async onEditLabelers(item) {
    const db: IConnection = this.connectionService.createConnection('config.json');
    this.lablerEdit = {
      'labeler_id' : item.labeler_id,
      'labeler_name': item.labeler_name,
      'address': item.address,
      'phone': item.phone
    };
    console.log(this.lablerEdit);
    this.openModal_labeler = true;
  }

  async confirmEditLabelers() {
    const db: IConnection = this.connectionService.createConnection('config.json');
    await this.importService.updateLabelers(db, this.lablerEdit);
    this.closeModal();
    this.alertService.success();
    this.getLabelers();
  }
}
