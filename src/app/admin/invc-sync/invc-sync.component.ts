import { InvcService } from './../invc.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as crypto from 'crypto';

@Component({
  selector: 'app-invc-sync',
  templateUrl: './invc-sync.component.html',
  styles: []
})
export class InvcSyncComponent implements OnInit {

  @ViewChild('modalLoading') public modalLoading: any;
  loading = false;
  isSave = false;
  passwordAdmin: string;
  modalPassword = false;

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
        'mm_unit_generics',
        'mm_products',
        'um_people',
        'um_people_users',
        'um_users',
        'wm_receive_types',
        'wm_warehouses',
        'bm_bgtype',
        'bm_budget_source',
        'wm_requisition_type',
        'wm_products'];
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
      await this.getUnitGenerics(dbInv, dbMmis);
      await this.getProducts(dbInv, dbMmis);
      await this.getReceiveTypes(dbInv, dbMmis);
      await this.getWarehouses(dbInv, dbMmis);
      await this.getBgTypes(dbInv, dbMmis);
      await this.getBgSource(dbInv, dbMmis);
      await this.getRequisitionType(dbInv, dbMmis);
      await this.insertAdmin(dbMmis);
      await this.insertPeople(dbMmis);
      await this.insertUser(dbMmis);
      await this.insertPeopleUser(dbMmis);
      // await this.getRemainQty(dbInv, dbMmis);
      await dbInv.end();
      await dbMmis.end();
      await this.modalLoading.hide(6000);
      await setTimeout(() => {
        this.openModalPassword();
      }, 6000);
      // await this.openModalPassword();
      this.isSave = false;
    } catch (error) {
      this.modalLoading.hide();
      this.isSave = false;
      this.modalPassword = false;
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
            'group_id': +u.RECORD_NUMBER,
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
            };
            labelerBanks.push(objLabelerBank);
          }

        });
        this.invcService.insert(dbMmis, 'mm_labelers', labelers)
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
          // mm_generics
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

  async getUnitGenerics(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const genericRs: any = await this.invcService.getGenerics(dbInv);
        const unitGenerics = [];
        for (const v of genericRs) {
          let toUnitId;
          let fromUnitId;
          const idxUnitId = _.findIndex(this.units, { unit_name: v.SALE_UNIT });
          if (idxUnitId > -1) {
            toUnitId = this.units[idxUnitId].unit_id;
          } else {
            toUnitId = null;
          }
          const idxFromUnitId = _.findIndex(this.units, { unit_name: v.PACK_UNIT });
          if (idxFromUnitId > -1) {
            fromUnitId = this.units[idxFromUnitId].unit_id;
          } else {
            fromUnitId = toUnitId;
          }
          // mm_unit_generics
          let objUnitGenenrics = {
            'from_unit_id': fromUnitId,
            'to_unit_id': toUnitId,
            'qty': v.STD_RATIO1,
            'cost': v.STD_PRICE1,
            'generic_id': v.RECORD_NUMBER
          };
          unitGenerics.push(objUnitGenenrics);
          objUnitGenenrics = {
            'from_unit_id': fromUnitId,
            'to_unit_id': toUnitId,
            'qty': v.STD_RATIO3,
            'cost': v.STD_PRICE3,
            'generic_id': v.RECORD_NUMBER
          };
          unitGenerics.push(objUnitGenenrics);
        }
        this.invcService.insert(dbMmis, 'mm_unit_generics', unitGenerics)
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

  async getProducts(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const productRs: any = await this.invcService.getProducts(dbInv);
        const products = [];
        productRs.forEach(v => {
          let unitId;
          const idxUnitId = _.findIndex(this.units, { unit_name: v.SALE_UNIT });
          if (idxUnitId > -1) {
            unitId = this.units[idxUnitId].unit_id;
          } else {
            unitId = null;
          }
          const objProducts = {
            'product_id': v.RECORD_NUMBER,
            'product_name': v.TRADE_NAME,
            'working_code': v.WORKING_CODE,
            'generic_id': v.generic_id,
            'primary_unit_id': unitId,
            'm_labeler_id': v.manufac_id,
            'v_labeler_id': v.vendor_id,
            'reg_no': this.checkNull(v.REGIST_NO) ? v.REGIST_NO : null,
            'tmt_id': this.checkNull(v.TMT_CODE) ? v.TMT_CODE : null,
            'std_code': this.checkNull(v.STD_CODE) ? v.STD_CODE : null,
            'barcode': this.checkNull(v.BAR_CODE) ? v.BAR_CODE : null
          };
          products.push(objProducts);
        });
        // await this.invsService.insertProducts(dbMmis, products);
        this.invcService.insert(dbMmis, 'mm_products', products)
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

  async getReceiveTypes(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const receiveTypesRs: any = await this.invcService.getReceiveTypeInvc(dbInv);
        const receiveTypes = [];
        for (const u of receiveTypesRs) {
          const objReceiveType = {
            'receive_type_id': +u.RCV_TYPE_CODE,
            'receive_type_name': u.RCV_NAME
          };
          receiveTypes.push(objReceiveType);
        }
        this.invcService.insert(dbMmis, 'wm_receive_types', receiveTypes)
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

  async getWarehouses(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const rs: any = await this.invcService.getWarehousesInvc(dbInv);
        const array = [];
        for (const u of rs) {
          const obj = {
            'warehouse_id': +u.RECORD_NUMBER,
            'warehouse_name': u.DEPT_NAME,
            'short_code': u.DEPT_ID
          };
          array.push(obj);
        }
        this.invcService.insert(dbMmis, 'wm_warehouses', array)
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

  async getBgTypes(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const rs: any = await this.invcService.getBgTypeInvc(dbInv);
        const array = [];
        for (const u of rs) {
          const obj = {
            'bgtype_id': +u.BDGCODE,
            'bgtype_name': u.BDGNAME
          };
          array.push(obj);
        }
        this.invcService.insert(dbMmis, 'bm_bgtype', array)
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

  async getBgSource(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const rs: any = await this.invcService.getBgSourceInvc(dbInv);
        const array = [];
        for (const u of rs) {
          const obj = {
            'bgsource_id': +u.B_SOURCE,
            'bgsource_name': u.B_SOURCE_NAME
          };
          array.push(obj);
        }
        this.invcService.insert(dbMmis, 'bm_budget_source', array)
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

  async getRequisitionType(dbInv, dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const rs: any = await this.invcService.getRequisitionTypeInvc(dbInv);
        const array = [];
        for (const u of rs) {
          const obj = {
            'requisition_type_id': +u.DISP_TYPE_CODE,
            'requisition_type': u.DISP_NAME,
            'requisition_type_desc': u.DISP_NAME
          };
          array.push(obj);
        }
        this.invcService.insert(dbMmis, 'wm_requisition_type', array)
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

  async insertPeople(dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const array = [];
        const obj: any = {
          'people_id': 1,
          'title_id': 1,
          'fname': 'ผู้ดูแลระบบ',
          'lname': ''
        };
        array.push(obj);
        this.invcService.insert(dbMmis, 'um_people', array)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject();
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  async insertUser(dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const array = [];
        const right = 'WM_HIS_MAPPING,WM_MINMAX_PLANNING,WM_SHIPPING_NETWORKS,MM_ADMIN,UM_ADMIN,WM_ADMIN,CM_ADMIN,PO_ADMIN,WM_HIS_TRANSACTION,WM_REQUISITION,WM_CANCEL_BORROW,PO_CANCEL,PO_CANCEL_AFFTER_APPROVE,PO_CONFIRM,BM_ADMIN,WM_RECEIVE,PO_CREATE,WM_APPROVE_BORROW,WM_REQUISITION_APPROVE,WM_RECEIVE_APPROVE,WM_RECEIVE_OTHER_APPROVE,WM_ISSUE_APPROVE,PO_APPROVE,WM_TRANSFER_APPROVE,WM_WAREHOUSE_MANAGEMENT,PO_EDIT,PO_EDIT_AFFTER_APPROVE,WM_TRANSFER';
        this.passwordAdmin = Math.random().toString(15).substr(2, 6);
        const hashPassword = crypto.createHash('md5').update(this.passwordAdmin).digest('hex');
        const obj: any = {
          'user_id': 1,
          'username': 'admin',
          'password': hashPassword,
          'access_right': right
        };
        array.push(obj);
        this.invcService.insert(dbMmis, 'um_users', array)
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

  async insertPeopleUser(dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const array = [];
        const obj: any = {
          'people_user_id': 1,
          'people_id': 1,
          'user_id': 1
        };
        array.push(obj);
        this.invcService.insert(dbMmis, 'um_people_users', array)
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

  async insertAdmin(dbMmis) {
    return new Promise(async (resolve, reject) => {
      try {
        const people: any = {
          'people_id': 1,
          'title': 1,
          'fname': 'ผู้ดูแลระบบ',
          'lname': ''
        };
        const peopleUser: any = {
          'people_user_id': 1,
          'people_id': 1,
          'user_id': 1
        };
        const right = 'WM_HIS_MAPPING,WM_MINMAX_PLANNING,WM_SHIPPING_NETWORKS,MM_ADMIN,UM_ADMIN,WM_ADMIN,CM_ADMIN,PO_ADMIN,WM_HIS_TRANSACTION,WM_REQUISITION,WM_CANCEL_BORROW,PO_CANCEL,PO_CANCEL_AFFTER_APPROVE,PO_CONFIRM,BM_ADMIN,WM_RECEIVE,PO_CREATE,WM_APPROVE_BORROW,WM_REQUISITION_APPROVE,WM_RECEIVE_APPROVE,WM_RECEIVE_OTHER_APPROVE,WM_ISSUE_APPROVE,PO_APPROVE,WM_TRANSFER_APPROVE,WM_WAREHOUSE_MANAGEMENT,PO_EDIT,PO_EDIT_AFFTER_APPROVE,WM_TRANSFER';
        this.passwordAdmin = Math.random().toString(15).substr(2, 6);
        const hashPassword = crypto.createHash('md5').update(this.passwordAdmin).digest('hex');
        const user: any = {
          'user_id': 1,
          'username': 'admin',
          'password': hashPassword,
          'access_right': right
        };
        console.log('user');

        this.invcService.insert(dbMmis, 'um_people', people)
          .then(() => {
            console.log('insert um_people done!');
            this.invcService.insert(dbMmis, 'um_people_users', people)
              .then(() => {
                console.log('insert um_people_users done!');
                this.invcService.insert(dbMmis, 'um_users', people)
                  .then(() => {
                    console.log('insert um_users done!');
                    resolve();
                  })
                  .catch(() => {
                    reject();
                  });
              })
              .catch(() => {
                reject();
              });
          })
          .catch(() => {
            reject();
          });
      } catch (error) {
        console.log(error);
      }
    });
  }

  // async getRemainQty(dbInv, dbMmis) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const rs: any = await this.invcService.getRemainQtyInvc(dbInv);
  //       const array = [];
  //       for (const u of rs) {
  //         const obj = {
  //           'requisition_type_id': +u.DISP_TYPE_CODE,
  //           'requisition_type': u.DISP_NAME,
  //           'requisition_type_desc': u.DISP_NAME
  //         };
  //         array.push(obj);
  //       }
  //       this.invcService.insert(dbMmis, 'wm_requisition_type', array)
  //         .then(() => {
  //           resolve();
  //         })
  //         .catch(() => {
  //           reject();
  //         });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   });
  // }

  checkNull(data: any) { // ถ้าว่าง ให้ return false;
    if (data == null || data === '' || data === ' ') {
      return false;
    } else {
      return true;
    }
  }

  openModalPassword() {
    this.modalPassword = true;
    console.log(this.openModalPassword);

  }
}
