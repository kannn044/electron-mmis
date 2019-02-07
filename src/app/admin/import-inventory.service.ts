import { Injectable } from '@angular/core';
import { IConnection } from 'mysql';
import { resolve } from 'path';
import { reject } from 'q';

@Injectable()
export class ImportInventoryService {

  constructor() { }
  getWmProducts(db: IConnection, warehouseId: any) {
    return new Promise((rs, reject) => {
      db.query(`SELECT wp.*,mp.generic_id FROM wm_products wp JOIN mm_products mp ON mp.product_id = wp.product_id WHERE wp.warehouse_id = ${warehouseId}`, (error: any, results: any) => {
        rs(results);
      })
    })
  }

  getBalanceProduct(db: IConnection, productId, warehouseId) {
    return new Promise((rs, rj) => {
      const sql = `select sum(qty) as qty from 
      wm_products wp
      where wp.warehouse_id = '${warehouseId}'
      and wp.product_id = '${productId}'
      group by wp.qty
      `;
      db.query(sql, (error: any, results: any) => {
        rs(results);
      });
    });
  }

  getBalanceGeneric(db: IConnection, genericId, warehouseId) {
    return new Promise((rs, rj) => {
      const sql = `select sum(qty) as qty from 
      wm_products wp
      join mm_products mp on mp.product_id = wp.product_id
      where wp.warehouse_id = '${warehouseId}'
      and mp.generic_id = '${genericId}'
      group by wp.qty
      `;
      db.query(sql, (error: any, results: any) => {
        rs(results);
      });
    });
  }

  deleteWmProducts(db: IConnection, warehouseId: any) {
    return new Promise((resolve, reject) => {
      db.query(`DELETE FROM wm_products WHERE warehouse_id = '${warehouseId}'`, (error: any, results: any) => {
        if (error) reject(error);
        resolve(results);
      })
    })
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

  insertStockCard(db: IConnection, data: any) {
    data.forEach(v => {
      const sql = `INSERT INTO wm_stock_card SET ?`;
      db.query(sql, v, function (error, results, fields) {
        if (error) {
          throw error;
        }
      });
    });
    return true;
  }

  adjustStock1(db: IConnection, warehouseId) {
    return new Promise((rs, rj) => {
      const sql = `SELECT
      generic_id
      FROM
      view_stock_card_warehouse 
      where warehouse_id = '${warehouseId}'
      GROUP BY
      generic_id
      `;
      db.query(sql, (error: any, results: any) => {
        rs(results);
      });
    });
  }

  adjustStock2(db: IConnection, genericId, warehouseId) {
    return new Promise((rs, rj) => {
      const sql = `SELECT
      *
      FROM
      view_stock_card_warehouse 
      where warehouse_id = '${warehouseId}' 
      and generic_id = '${genericId}'
      ORDER BY stock_card_id
      `;
      db.query(sql, (error: any, results: any) => {
        rs(results);
      });
    });
  }

  adjustStock3(db: IConnection, genericId, warehouseId) {
    return new Promise((rs, rj) => {
      const sql = `SELECT
      product_id
      FROM
      view_stock_card_warehouse 
      where warehouse_id = '${warehouseId}' 
      and generic_id = '${genericId}'
      group by product_id
      `;
      db.query(sql, (error: any, results: any) => {
        rs(results);
      });
    });
  }

  adjustStockUpdate(db: IConnection, data) {
    return new Promise((rs, rj) => {
      let stock_card_id = data.stock_card_id;
      let product_id = data.product_id;
      let balance_qty = data.balance_qty;
      let balance_generic_qty = data.balance_generic_qty;
      let balance_lot_qty = data.balance_lot_qty;
      let sql = `update wm_stock_card set product_id = ${product_id},balance_lot_qty = ${balance_lot_qty},balance_qty = ${balance_qty},balance_generic_qty = ${balance_generic_qty} where stock_card_id = ${stock_card_id}`;
      console.log(sql);
      
      db.query(sql, (error: any, results: any) => {
        rs(results);
      });
    });
  }

  deleteStockCardWarehouse(db: IConnection, warehouseId: any) {
    let sql = `DELETE FROM wm_stock_card WHERE stock_card_id IN (
      SELECT * FROM (
        SELECT stock_card_id FROM view_stock_card_warehouse WHERE warehouse_id = '${warehouseId}'
        ) as p
      )`;
    return new Promise((resolve, reject) => {
      db.query(sql, (error: any, results: any) => {
        if (error) reject(error);
        resolve(results);
      })
    })
  }

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
        if (error) reject(error);
        resolve(results);
      });

    });
  }

  getGenericType(db: IConnection) {
    const sql = `select gt.* from mm_generic_types as gt`;
    return new Promise((resolve, reject) => {
      db.query(sql, (error: any, results: any) => {
        if (error) reject(error);
        resolve(results);
      });

    });
  }
  getGenerics(db: IConnection, warehouseId: any, genericType: any) {
    const sql = `
    SELECT
    muc.unit_generic_id,
    mg.working_code AS generic_code,
    mg.generic_name AS generic_name,
    mp.product_id,
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
        if (error) reject(error);
        resolve(results);
      });
    });
  }

}
