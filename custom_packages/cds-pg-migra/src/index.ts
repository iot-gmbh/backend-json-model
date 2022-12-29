#!/usr/bin/env node

// https://itnext.io/how-to-create-your-own-typescript-cli-with-node-js-1faf7095ef89
import logProcessErrors from 'log-process-errors';
logProcessErrors();

import { DataLoader } from './DataLoader.js';
import { program } from 'commander';
import pg from 'pg';
import cds from '@sap/cds';
import { globby } from 'globby';

// import path from 'path';
import { exec } from 'child_process';
import fs from 'fs';

import ConnectionParameters from 'pg/lib/connection-parameters.js';

// console.log(
//   chalk.red(figlet.textSync('cds-pg-migra', { horizontalLayout: 'full' })),
// );

const Client = pg.Client;

program
  .version('0.0.1')
  .description('Deploy CDS to Postgres')
  .option('-c, --createDB', 'Create new database?')
  .option(
    '-o, --overwriteData',
    'Overwrite data (y) or merge with existing data  (n)?',
  )
  .parse(process.argv);

deploy();

const options = program.opts();

if (options.createDB) console.log('DB will be created');

async function connectToPG({ url, ssl }) {
  const client = new Client({
    connectionString: url,
    ssl,
  });
  await client.connect();
  return client;
}

async function getCdsModel() {
  const { model } = cds.env.requires['db'];

  const cdsModel = await cds.load(model);
  return cdsModel;
}

async function deploy() {
  // log.default({
  //   log(error, level, originalError) {
  //     winstonLogger[level](error.stack);
  //   },
  // });

  // try {
  await cds.connect();
  const model = await getCdsModel();

  if (options.createDB) {
    // TODO: implement
  }

  await updateReferenceDB(model);
  const diff = await getDatabaseDiff();

  logToFile(diff);

  await migrateTargetDB({ diff });

  await loadData(model);
  // } catch (error) {
  //   console.log(error.message);
  // }
}

async function loadData(model) {
  const {
    credentials: {
      target: { url, ssl },
    },
  } = cds.env.requires['db'];

  const loader = new DataLoader(model, options.overwriteData);

  const client = await connectToPG({ url, ssl });

  await loader.load(client);
  client.end();
}

function logToFile(diff) {
  if (!diff) return;

  const {
    credentials: {
      target: { url },
    },
  } = cds.env.requires['db'];

  const connectionParams = new ConnectionParameters(url);
  const dir = 'db_changelogs/' + connectionParams.database;
  const fileName = `${dir}/` + Date.now() + '.sql';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(`./` + fileName, diff.toString(), 'utf8');

  console.log('[cds-pg-migra] Changelog written to ' + fileName);
}

async function updateReferenceDB(model) {
  const {
    credentials: {
      reference: { url, ssl },
    },
  } = cds.env.requires['db'];

  const cdsSQL = cds.compile.to.sql(model) as unknown as string[];
  const serviceInstance: any = cds.services['db'];
  const sqlFiles = await globby('db/sql/*.sql');

  const cdsQueries = cdsSQL.map((q) => serviceInstance.cdssql2pgsql(q));
  const explicitSQLQueries = sqlFiles.map((fileName) => {
    return fs.readFileSync(fileName).toString();
  });

  const query = [...cdsQueries, ...explicitSQLQueries].join(' ');

  const client = await connectToPG({ url, ssl });
  await client.query('DROP SCHEMA public CASCADE');
  await client.query('CREATE SCHEMA public');

  // TODO: use a similar function to strftime in postgres (=> we need to add the 1 milisecond of the next line)
  const replaced = query
    .replaceAll("strftime('%Y-%m-%dT%H:%M:%S.001Z', 'now')", 'now()')
    .replaceAll("strftime('%Y-%m-%dT%H:%M:%S.000Z', 'now')", 'now()');
  await client.query(replaced);
  // await client.query(explicitSQLQueries);
  client.end();

  console.log('[cds-pg-migra] Update reference-DB: successful');
}

async function getDatabaseDiff() {
  const {
    credentials: {
      reference: { url: referenceURL },
      target: { url: targetURL },
    },
  } = cds.env.requires['db'];

  return new Promise((resolve, reject) => {
    exec(
      // Format of postgres-URL: postgresql://user:pw@host/database
      `migra --unsafe --schema public ${targetURL} ${referenceURL}`,
      (_, stdout, stderr) => {
        // error is always defined, even though the request was succesful => dont use it (cf https://github.com/nodejs/node-v0.x-archive/issues/4590)
        // if (error) {
        //   console.log(`error: ${error.message}`);
        //   return;
        // }
        if (stderr) {
          return reject(stderr);
        }
        return resolve(stdout);
      },
    );
  });
}

async function migrateTargetDB({ diff }) {
  const {
    credentials: {
      target: { url, ssl },
    },
  } = cds.env.requires['db'];

  const client = await connectToPG({ url, ssl });

  await client.query(diff);
  client.end();

  console.log('[cds-pg-migra] Migrate target-DB: successful');
}
