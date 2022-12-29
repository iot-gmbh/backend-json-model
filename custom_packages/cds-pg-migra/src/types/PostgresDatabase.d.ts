import { DatabaseService } from '@sap/cds/apis/services.js';

export interface PostgresDatabase extends DatabaseService {
  cdssql2pgsql(query: string): string;
}
