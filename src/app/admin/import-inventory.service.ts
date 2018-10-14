import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';

@Injectable()
export class ImportInventoryService {

  constructor() { }
  getWarehouse(db: IConnection) {
    const sql = `select w.*, t.type_name, 
    (
      select group_concat(wm.his_warehouse) 
      from wm_his_warehouse_mappings as wm 
      where wm.mmis_warehouse=w.warehouse_id 
      group by wm.mmis_warehouse
    ) as his_warehouse
  from wm_warehouses as w
  left join wm_types as t on t.type_id=w.type_id
  where w.is_deleted = 'N'
  order by w.is_actived desc,w.short_code asc`;
    return new Promise((resolve, reject) => {
      db.query(sql, (error: any, results: any) => {
        if(error)reject(error);
        resolve(results);
      });
      
    });
  }

  getGenericType(db: IConnection) {
    const sql = `select gt.* from mm_generic_types as gt`;
    return new Promise((resolve, reject) => {
      db.query(sql, (error: any, results: any) => {
        if(error)reject(error);
        resolve(results);
      });
      
    });
  }
  getGenerics(db: IConnection,warehouseId:any,genericType:any) {
    const sql = `
    SELECT
	mg.working_code AS generic_code,
	mg.generic_name AS generic_name,
	mp.working_code AS trade_code,
	mp.product_name AS trade_name,
	mul.unit_name AS 'large_unit',
	muc.qty as conversion,
	mus.unit_name AS 'small_unit',
	'' as lot_no,
	'' as expired_date,
  '' as qty,
  ${warehouseId} as warehouse_id
FROM
	mm_generics mg
	LEFT JOIN mm_products AS mp ON mg.generic_id = mp.generic_id
	LEFT JOIN mm_generic_dosages AS mgdd ON mg.dosage_id = mgdd.dosage_id
	LEFT JOIN mm_unit_generics AS muc ON mg.generic_id = muc.generic_id
	LEFT JOIN mm_units AS mul ON muc.from_unit_id = mul.unit_id
	LEFT JOIN mm_units AS mus ON muc.to_unit_id = mus.unit_id
	LEFT JOIN mm_generic_types AS mgdt ON mg.generic_type_id = mgdt.generic_type_id
	where  mg.generic_type_id  = ${genericType}  
	order by
	mg.generic_name,mp.product_name
    `;
    return new Promise((resolve, reject) => {
      db.query(sql, (error: any, results: any) => {
        if(error)reject(error);
        resolve(results);
      });
      
    });
  }
}
