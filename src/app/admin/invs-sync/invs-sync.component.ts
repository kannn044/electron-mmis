import { InvsService } from './../invs.service';
import { Component, OnInit , ViewChild} from '@angular/core';
import * as _ from 'lodash';
@Component({
  selector: 'app-invs-sync',
  templateUrl: './invs-sync.component.html',
  styles: []
})
export class InvsSyncComponent implements OnInit {
  @ViewChild('modalLoading') public modalLoading: any;
  loading = false;
  isSave = false;
  constructor(
    private invsService: InvsService
  ) { }

  ngOnInit() {
  }

  async sync() {
    this.isSave = true;
    // try {
    // this.loading = true;
    await this.modalLoading.show();
    const dbInv: any = await this.invsService.createConnection('config_invs.json');
    const dbMmis: any = await this.invsService.createConnection('config.json');
    const tables = [
      'mm_units',
      'mm_generic_dosages',
      'mm_generic_hosp',
      'mm_generic_groups',
      'mm_generics',
      'mm_products',
      'mm_labelers',
      'um_people'];
    dbInv.connect();
    dbMmis.connect();
    await this.invsService.truncate(dbMmis, tables);
    // await this.getUnits(dbInv, dbMmis);
    // await this.getGenericDosages(dbInv, dbMmis);
    // await this.getGenericHosp(dbInv, dbMmis);
    // await this.getGenericGroup(dbInv, dbMmis);
    await this.getGenerics(dbInv, dbMmis);
    // await this.getProducts(dbInv, dbMmis);
    // await this.getLabelers(dbInv, dbMmis);
    // await this.getPeoples(dbInv, dbMmis);
    await dbInv.end();
    await dbMmis.end();
    // if (rs) {
      this.loading = false;
    
    this.modalLoading.hide();
    console.log('close');
    this.isSave = false;
    // } catch (error) {
    //   this.loading = false;
    // }
  }

  async getUnits(dbInv, dbMmis) {
    console.log('units');
    try {

      const unitsRs: any = await this.invsService.getUnits(dbInv);
      const units = [];
      for (const u of unitsRs) {
        const objUnit = {
          'unit_id': u.SU_ID,
          'unit_name': u.SALE_UNIT,
          'unit_code': u.SALE_UNIT,
          'is_primary': 'Y',
          'is_deleted': u.HIDE
        };
        units.push(objUnit);
      }
      await this.invsService.insertUnits(dbMmis, units);

    } catch (error) {
      console.log(error);

    }
  }

  async getGenericDosages(dbInv, dbMmis) {
    console.log('generic dosage');
    try {
      dbInv.connect();
      dbMmis.connect();
      const dosagesRs: any = await this.invsService.getDosages(dbInv);
      const dosages = [];
      for (const u of dosagesRs) {
        const objDosages = {
          'dosage_id': u.DFORM_ID,
          'dosage_name': u.DFORM_NAME
        };
        dosages.push(objDosages);
      }
      await this.invsService.insertDosages(dbMmis, dosages);

    } catch (error) {
      console.log(error);

    }
  }

  async getGenericHosp(dbInv, dbMmis) {
    console.log('generic hospital');
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  async getGenericGroup(dbInv, dbMmis) {
    console.log('generic group');
    try {
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
    } catch (error) {
      console.log(error);

    }
  }

  async getGenerics(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      console.log('generics');
      try {
        const genericRs: any = await this.invsService.getGenerics(dbInv);
        const generics = [];
        for (const v of genericRs) {
          const objGenerics = {
            'generic_id': v.WORKING_CODE,
            'generic_name': v.DRUG_NAME,
            'working_code': v.WORKING_CODE,
            'description': v.NOTE,
            'keywords': v.DRUG_NAME_KEY,
            'group_id': v.GROUP_CODE ? +v.GROUP_CODE : null,
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
        }
        // console.log(generics);

        this.invsService.foreach(dbMmis, 'mm_generics', generics)
          .then(() => {
            resolve();
          })
          .catch(() => {
          reject();
        });
        // .then((t) => {
        //   console.log(t);
        //   resolve(true);
        // })
        // .catch((err) => {
        //   throw err;
        // });

      } catch (error) {
        console.log(error);

      }
    });
  }

  async getProducts(dbInv, dbMmis) {
    console.log('products');

    dbInv.connect();
    dbMmis.connect();
    const productRs: any = await this.invsService.getProducts(dbInv);
    const products = [];
    productRs.forEach(v => {
      const objProducts = {
        'product_id': v.TRADE_CODE,
        'product_name': v.TRADE_NAME,
        'working_code': v.TRADE_CODE,
        'm_labeler_id': v.MANUFAC_CODE,
        'v_labeler_id': v.VENDOR_CODE,
        'reg_no': v.REGIST_NO
      };
      products.push(objProducts);
    });
    console.log(products);

    await this.invsService.insertProducts(dbMmis, products);
    dbInv.end();
    dbMmis.end();
  }

  async getLabelers(dbInv, dbMmis) {
    console.log('labeler');

    dbInv.connect();
    dbMmis.connect();
    const labelerRs: any = await this.invsService.getLabelers(dbInv);
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
    await this.invsService.insertLabelers(dbMmis, labelers);
    dbInv.end();
    dbMmis.end();
  }

  async getPeoples(dbInv, dbMmis) {
    console.log('peoples');

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
