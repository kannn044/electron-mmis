import { InvsService } from './../invs.service';
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-invs-sync',
  templateUrl: './invs-sync.component.html',
  styles: []
})
export class InvsSyncComponent implements OnInit {

  constructor(
    private invsService: InvsService
  ) { }

  ngOnInit() {
  }

  async sync() {
    const dbInv: any = await this.invsService.createConnection('config_invs.json');
    const dbMmis: any = await this.invsService.createConnection('config.json');
    // this.getUnits(dbInv, dbMmis);
    // this.getGenericDosages(dbInv, dbMmis);
    // this.getGenericHosp(dbInv, dbMmis);
    // this.getGenericGroup(dbInv, dbMmis);

    // this.getGenerics(dbInv, dbMmis);
    // this.getProducts(dbInv, dbMmis);
    // this.getLabelers(dbInv, dbMmis);
    this.getPeoples(dbInv, dbMmis);
    // this.invsService.closeConnection(dbInv);
    // this.invsService.closeConnection(dbMmis);
    

  }

  async getUnits(dbInv, dbMmis) {
    const unitsRs: any = await this.invsService.getUnits(dbInv);
    const units = [];
    unitsRs.forEach(u => {
      const objUnit = {
        'unit_id': u.SU_ID,
        'unit_name': u.SALE_UNIT,
        'unit_code': u.SALE_UNIT,
        'is_primary': 'Y',
        'id_deleted': u.HIDE
      };
      units.push(objUnit);
    });
    await this.invsService.insertUnits(dbMmis, units);
  }

  async getGenericDosages(dbInv, dbMmis) {
    const dosagesRs: any = await this.invsService.getDosages(dbInv);
    const dosages = [];
    dosagesRs.forEach(u => {
      const objDosages = {
        'dosage_name': u.DOSAGE_FORM
      };
      dosages.push(objDosages);
    });
    await this.invsService.insertDosages(dbMmis, dosages);
  }

  async getGenericHosp(dbInv, dbMmis) {
    const genericHospsRs: any = await this.invsService.getGenericHosp(dbInv);
    const genericHosps = [];
    genericHospsRs.forEach(u => {
      const objGenericHosps = {
        'id': u.HOSP_LIST_CODE,
        'name': u.HOSP_LIST_DESC
      };
      genericHosps.push(objGenericHosps);
    });
    await this.invsService.insertGenericHosp(dbMmis, genericHosps);
  }

  async getGenericGroup(dbInv, dbMmis) {
    const genericGroupRs: any = await this.invsService.getGenericGroup(dbInv);
    const genericGroups = [];
    genericGroupRs.forEach(u => {
      const objGenericGroups = {
        'group_id': +u.CODE,
        'group_name': u.NAME
      };
      genericGroups.push(objGenericGroups);
    });
    await this.invsService.insertGenericGroup(dbMmis, genericGroups);
  }

  async getGenerics(dbInv, dbMmis) {
    const genericRs: any = await this.invsService.getGenerics(dbInv);
    const generics = [];
    genericRs.forEach(v => {
      const objGenerics = {
        'generic_id': v.WORKING_CODE,
        'generic_name': v.DRUG_NAME,
        'working_code': v.WORKING_CODE,
        'description': v.NOTE,
        'keywords': v.DRUG_NAME_KEY,
        'group_id': +v.ED_GROUP,
        'account_id': +v.IS_ED === 1 || +v.IS_ED === 2 ? v.IS_ED : null,
        'dosage_id': v.DFORM_ID,
        'standard_cost': v.STD_PRICE1,
        'unit_cost': v.SALE_UNIT_PRICE,
        'min_qty': v.MIN_LEVEL,
        'max_qty': v.MAX_LEVEL,
        'generic_hosp_id': v.HOSP_LIST,
        'primary_unit_id': v.SALE_UNIT_ID
      };
      generics.push(objGenerics);
    });
    console.log(generics);

    // await this.invsService.insertGenerics(dbMmis, generics);
  }

  async getProducts(dbInv, dbMmis) {
    const genericRs: any = await this.invsService.getProducts(dbInv);
    const generics = [];
    genericRs.forEach(v => {
      const objGenerics = {
        'product_id': v.TRADE_CODE,
        'product_name': v.TRADE_NAME,
        'working_code': v.TRADE_CODE,
        'm_labeler_id': v.MANUFAC_CODE,
        'v_labeler_id': v.VENDOR_CODE,
        'reg_no': v.REGIST_NO
      };
      generics.push(objGenerics);
    });
    console.log(generics);

    // await this.invsService.insertProducts(dbMmis, dosages);
  }

  async getLabelers(dbInv, dbMmis) {
    const labelerRs: any = await this.invsService.getProducts(dbInv);
    const labelers = [];
    labelerRs.forEach(v => {
      const objLabelers = {
        'labeler_id': v.COMPANY_CODE,
        'labeler_name': v.COMPANY_NAME,
        'description': v.KEY_WORD,
        'nin': v.TAX_ID,
        'address': v.ADDRESS,
        'short_code': v.KEY_WORD
      };
      labelers.push(objLabelers);
    });
    console.log(labelers);

    // await this.invsService.insertLabelers(dbMmis, labelers);
  }

  async getPeoples(dbInv, dbMmis) {
    dbMmis.connect();
    dbInv.connect();
    const peopleRs: any = await this.invsService.getPeoples(dbInv);
    const titleRs: any = await this.invsService.getTitleName(dbMmis);
    const positionRs: any = await this.invsService.getPositionName(dbMmis);
    const peoples = [];
    peopleRs.forEach(v => {
      const idxTitle = _.findIndex(titleRs, { 'title_name': v.TITLE_NAME });
      const title_id = idxTitle > -1 ? titleRs[idxTitle].title_id : null;

      const idxPosition = _.findIndex(positionRs, { 'position_name': v.POSITION });
      const position_id = idxPosition > -1 ? positionRs[idxPosition].position_id : null;

      const objPeoples = {
        'people_id': v.AIC_CODE,
        'title_id': title_id,
        'fname': v.AIC_NAME.split(' ')[0],
        'lname': v.AIC_NAME.split(' ')[1],
        'position_id': position_id,
      };
      peoples.push(objPeoples);
    });
    await this.invsService.insertPeoples(dbMmis, peoples);
    dbMmis.end();
    dbInv.end();
  }
}
