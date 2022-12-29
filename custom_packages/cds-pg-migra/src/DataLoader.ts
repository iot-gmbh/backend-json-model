import cds from '@sap/cds';
import fs from 'fs';
import path from 'path';

import { isdir, read } from './utils.js';
const { readdir } = fs.promises;

const help: any = cds;

/**
 * Data loader class handling imports of csv files (json maybe added).
 * Logic is mainly derived from cds lib but enhanced to support delta loads.
 *
 * @see @sap/cds/lib/srv/db/deploy.js
 */
export class DataLoader {
  private overwriteData: boolean;
  private model: any;

  constructor(model, overwriteData: boolean) {
    this.overwriteData = overwriteData;
    this.model = model;
  }

  async load(pgClient) {
    const locations = ['data', 'csv'];
    if (!this.model.$sources) return;
    const folders = new Set<string>();
    for (const model of this.model.$sources) {
      for (const data of locations) {
        for (const each of [model + '/../' + data]) {
          const folder = path.resolve(each);
          if (isdir(folder)) folders.add(folder);
        }
      }
    }

    if (folders.size === 0) return;
    for (const folder of folders) {
      const files = await readdir(folder);
      const filtered = files.filter(this._filterCsvFiles.bind(this));
      for (const each of filtered) {
        // Verify entity
        const name = each
          .replace(/-/g, '.')
          .slice(0, -path.extname(each).length);
        const entity = this._entity4(name);
        if (entity['@cds.persistence.skip'] === true) continue;
        // Load the content
        const file = path.join(folder, each);
        const src = await read(file, 'utf8');
        const [cols, ...rows] = help.parse.csv(src);
        const columnCount = cols.length;

        if (rows.length === 0) continue;

        const valuesToInsert = rows
          .map((row) => {
            // In case the mockdata is missing columns, fill it with empty values (by repeating ",")

            while (row.length < columnCount) row.push(',');

            const values = `(${row
              .map((element) => {
                // filter out empty values ("undefined") as it will lead to parsing errors e.g. for Integer-colums
                if (element === undefined) return 'null';
                return `'${element}'`;
              })
              .join(',')})`;
            return values;
          })
          .join(',');

        const entityKeys = Object.values(entity.keys)
          .map(({ name }) => name)
          .join(',');
        const columns = cols.join(',');
        const columnsPrefixed = cols.map((col) => `EXCLUDED.${col}`).join(',');
        const table = entity.name.replaceAll('.', '_');

        await pgClient.query(`
          ${this.overwriteData ? `TRUNCATE TABLE ${table};` : ''}
          INSERT INTO ${entity.name.replaceAll('.', '_')} (${columns})
          VALUES ${valuesToInsert}
          ON CONFLICT (${entityKeys}) DO UPDATE SET (${columns}) = (${columnsPrefixed});
        `);

        console.log('[cds-pg-migra] Load ' + entity.name);
      }
    }
  }

  /**
   *
   * @param filename
   * @param _
   * @param allFiles
   */
  private _filterCsvFiles(filename, _, allFiles) {
    if (filename[0] === '-' || !filename.endsWith('.csv')) return false;
    if (
      /_texts\.csv$/.test(filename) &&
      this._check_lang_file(filename, allFiles)
    ) {
      return false;
    }
    return true;
  }

  /**
   *
   * @param filename
   * @param allFiles
   */
  private _check_lang_file(filename, allFiles) {
    // ignores 'Books_texts.csv/json' if there is any 'Books_texts_LANG.csv/json'
    const basename = path.basename(filename);
    const monoLangFiles = allFiles.filter((file) =>
      new RegExp('^' + basename + '_').test(file),
    );
    if (monoLangFiles.length > 0) {
      //DEBUG && DEBUG (`ignoring '${filename}' in favor of [${monoLangFiles}]`)  // eslint-disable-line
      return true;
    }
    return false;
  }

  /**
   *
   * @param name
   */
  private _entity4(name) {
    const entity = this.model.definitions[name];
    if (!entity) {
      if (/(.+)_texts_?/.test(name)) {
        // 'Books_texts', 'Books_texts_de'
        const base = this.model.definitions[RegExp.$1];
        return base && this._entity4(base.elements.texts.target);
      } else return;
    }
    // We also support insert into simple views if they have no projection
    if (entity.query) {
      const { SELECT } = entity.query;
      if (
        SELECT &&
        !SELECT.columns &&
        SELECT.from.ref &&
        SELECT.from.ref.length === 1
      ) {
        if (this.model.definitions[SELECT.from.ref[0]]) return entity;
      }
    }
    return entity.name ? entity : { name, __proto__: entity };
  }
}
