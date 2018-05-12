import { InvcService } from './../invc.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-invc-sync',
  templateUrl: './invc-sync.component.html',
  styles: []
})
export class InvcSyncComponent implements OnInit {

  @ViewChild('modalLoading') public modalLoading: any;
  loading = false;
  isSave = false;

  dosages = [];
  units = [];
  constructor(
    private invcService: InvcService
  ) { }

  ngOnInit() {
  }

  async sync() {
    try {
      this.isSave = true;
      this.modalLoading.show();
      const dbInv: any = await this.invcService.createConnection('config_invc.json');
      const dbMmis: any = await this.invcService.createConnection('config.json');
      const tables = [
        'mm_units',
        'mm_generic_dosages',
        'mm_generic_accounts',
        'mm_generic_types',
        // 'mm_generic_hosp',
        'mm_generic_groups',
        'mm_labelers',
        'mm_generics',
        'mm_products',
        'um_people'];
      await dbInv.connect();
      await dbMmis.connect();
      await this.invcService.truncate(dbMmis, tables);
      await this.getUnits(dbInv, dbMmis);
      await this.getGenericDosages(dbInv, dbMmis);
      await this.getGenericAccounts(dbInv, dbMmis);
      await this.getGenericTypes(dbInv, dbMmis);
      // await this.getGenericHosp(dbInv, dbMmis);
      await this.getGenericGroup(dbInv, dbMmis);
      await this.getLabelers(dbInv, dbMmis);
      await this.getGenerics(dbInv, dbMmis);
      // await this.getProducts(dbInv, dbMmis);
      // await this.getPeoples(dbInv, dbMmis);
      await dbInv.end();
      await dbMmis.end();
      this.modalLoading.hide(6000);
      this.isSave = false;
    } catch (error) {
      this.modalLoading.hide();
      this.isSave = false;
      // this.loading = false;
    }
  }

  async getUnits(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const unitsRs: any = await this.invcService.getUnitsInvc(dbInv);
        const units = [];
        let i = 1;
        for (const u of unitsRs) {
          if (this.checkNull(u.SALE_UNIT)) {
            const objUnit: any = {
              'unit_id': i,
              'unit_name': u.SALE_UNIT,
              'unit_code': u.SALE_UNIT,
              'is_primary': 'Y',
              'is_deleted': 'N'
            };
            units.push(objUnit);
            i++;
          }
        }
        this.units = _.clone(units);
        this.invcService.insert(dbMmis, 'mm_units', units)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      } catch (error) {
        console.log(error);

      }
    });
  }

  async getGenericAccounts(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        dbInv.connect();
        dbMmis.connect();
        const accountRs: any = await this.invcService.getAccountInvc(dbInv);
        const accounts = [];
        for (const u of accountRs) {
          const objAccounts = {
            'account_id': u.EDCODE,
            'account_name': u.EDNAME
          };
          accounts.push(objAccounts);
        }
        this.invcService.insert(dbMmis, 'mm_generic_accounts', accounts)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });

      } catch (error) {
        console.log(error);
      }
    });
  }

  async getGenericTypes(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        dbInv.connect();
        dbMmis.connect();
        const genericTypesRs: any = await this.invcService.getGenericTypeInvc(dbInv);
        const genericTypes = [];
        for (const u of genericTypesRs) {
          const objGenericType = {
            'generic_type_id': u.EDCODE,
            'generic_type_name': u.EDNAME
          };
          genericTypes.push(objGenericType);
        }
        this.invcService.insert(dbMmis, 'mm_generic_types', genericTypes)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async getGenericDosages(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        dbInv.connect();
        dbMmis.connect();
        const dosagesRs: any = await this.invcService.getDosageInvc(dbInv);
        const dosages = [];
        let i = 1;
        for (const u of dosagesRs) {
          if (this.checkNull(u.DOSAGE_FORM)) {
            const objDosages = {
              'dosage_id': i,
              'dosage_name': u.DOSAGE_FORM
            };
            dosages.push(objDosages);
            i++;
          }
        }
        this.dosages = _.clone(dosages);
        this.invcService.insert(dbMmis, 'mm_generic_dosages', dosages)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });

      } catch (error) {
        console.log(error);
      }
    });
  }

  async getGenericGroup(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const genericGroupRs: any = await this.invcService.getGenericGroupInvc(dbInv);
        const genericGroups = [];
        genericGroupRs.forEach(u => {
          const objGenericGroups = {
            'group_id': +u.RECORE_NUMBER,
            'group_code': u.CODE,
            'group_name': u.NAME
          };
          genericGroups.push(objGenericGroups);
        });
        this.invcService.insert(dbMmis, 'mm_generic_groups', genericGroups)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async getLabelers(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const labelerRs: any = await this.invcService.getLabelers(dbInv);
        const labelers = [];
        const labelerBanks = [];
        labelerRs.forEach(v => {
          if (this.checkNull(v.COMPANY_NAME)) {
            const objLabelers = {
              'labeler_id': v.RECORD_NUMBER,
              'labeler_code': v.COMPANY_CODE,
              'labeler_name': v.COMPANY_NAME,
              'labeler_name_po': v.COMPANY_NAME_PO,
              'description': v.COMPANY_CODE,
              'nin': v.TAX_NO,
              'address': v.ADDRESS,
              'short_code': v.COMPANY_CODE,
              'is_vendor': v.VENDOR_FLAG === 'V' ? 'Y' : 'N',
              'is_manufacturer': v.MANUFAC_FLAG === 'M' ? 'Y' : 'N',
              'is_deleted': v.HIDE_COMP === 'Y' ? 'Y' : 'N'
            };
            labelers.push(objLabelers);
          }
          if (this.checkNull(v.BOOK_BANK_NO)) {
            const objLabelerBank = {
              'bank_name': null,
              'account_no': v.BOOK_BANK_NO,
              'bank_type': null,
              'labeler_id': v.RECORD_NUMBER,
              'bank_branch': v.BANK_BRANCH,
              'account:name': null
            }
            labelerBanks.push(objLabelerBank);
          }

        });
        // this.invcService.insert(dbMmis, 'mm_labelers', labelers)
        //   .then(() => {
        //     resolve();
        //   })
        //   .catch(() => {
        //     reject();
        //   });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async getGenerics(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const genericRs: any = await this.invcService.getGenerics(dbInv);
        const generics = [];
        for (const v of genericRs) {

          let dosageId;
          let unitId;
          const idxDosageId = _.findIndex(this.dosages, { dosage_name: v.DOSAGE_FORM });
          if (idxDosageId > -1) {
            dosageId = this.dosages[idxDosageId].dosage_id;
          } else {
            dosageId = null;
          }
          const idxUnitId = _.findIndex(this.units, { unit_name: v.SALE_UNIT });
          if (idxUnitId > -1) {
            unitId = this.units[idxUnitId].unit_id;
          } else {
            unitId = null;
          }
          const objGenerics = {
            'generic_id': v.RECORD_NUMBER,
            'generic_name': v.DRUG_NAME,
            'working_code': v.WORKING_CODE,
            'description': v.NOTE,
            'keywords': null,
            'group_id': v.group_id,
            'account_id': v.ED_NED,
            'dosage_id': dosageId,
            'generic_type_id': v.ED_NED,
            'is_planning': 'Y',
            'mark_deleted': v.OUT_OF_LIST === 'Y' ? 'Y' : 'N',
            'standard_cost': v.STD_PRICE2,
            'unit_cost': v.STD_PRICE3,
            'min_qty': v.MIN_LEVEL,
            'max_qty': v.MAX_LEVEL,
            'generic_hosp_id': null,
            'primary_unit_id': unitId
          };
          generics.push(objGenerics);
        }
        this.invcService.insert(dbMmis, 'mm_generics', generics)
          .then(() => {
            resolve();
          })
          .catch(() => {
            reject();
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  checkNull(data: any) { // ถ้าว่าง ให้ return false;
    if (data == null || data === '' || data === ' ') {
      return false;
    } else {
      return true;
    }
  }
}
