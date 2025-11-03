/**
 * Simple SurrealDB Client using direct fetch
 * Works around SDK compatibility issues
 */

const SURREAL_URL = process.env.SURREALDB_URL || 'http://localhost:8000';
const SURREAL_USER = process.env.SURREALDB_USER || 'root';
const SURREAL_PASS = process.env.SURREALDB_PASS || 'root';
const SURREAL_NS = process.env.SURREALDB_NAMESPACE || 'humidor_club';
const SURREAL_DB = process.env.SURREALDB_DATABASE || 'production';

export class SimpleSurrealDB {
  static async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    try {
      // Replace variables in SQL if provided
      let queryString = sql;
      if (vars) {
        for (const [key, value] of Object.entries(vars)) {
          const val = typeof value === 'string' ? `'${value}'` : String(value);
          queryString = queryString.replace(new RegExp(`\\$${key}`, 'g'), val);
        }
      }

      // Prepend USE statement to select namespace and database
      queryString = `USE NS ${SURREAL_NS} DB ${SURREAL_DB};\n${queryString}`;

      console.log('📤 Executing query:', queryString);

      const auth = Buffer.from(`${SURREAL_USER}:${SURREAL_PASS}`).toString('base64');
      
      const response = await fetch(`${SURREAL_URL}/sql`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'text/plain',
          'Authorization': `Basic ${auth}`,
        },
        body: queryString,
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ HTTP error:', response.status, text);
        throw new Error(`HTTP ${response.status}: ${text}`);
      }

      const results = await response.json();
      console.log('📥 Query results:', results);

      if (Array.isArray(results) && results.length > 0) {
        // Skip the first result (USE statement) and get the actual query result
        const queryResult = results.length > 1 ? results[1] : results[0];
        if (queryResult.status === 'OK') {
          return Array.isArray(queryResult.result) ? queryResult.result : [queryResult.result];
        } else if (queryResult.status === 'ERR') {
          throw new Error(queryResult.result || 'Query failed');
        }
      }

      return [];
    } catch (error) {
      console.error('❌ Query error:', error);
      throw error;
    }
  }

  static async create<T = any>(table: string, data: Partial<T>): Promise<T> {
    const sql = `CREATE ${table} CONTENT ${JSON.stringify(data)};`;
    const result = await this.query<T>(sql);
    return result[0];
  }

  static async select<T = any>(table: string): Promise<T[]> {
    const sql = `SELECT * FROM ${table};`;
    return await this.query<T>(sql);
  }
}

// Export as db for compatibility
export const db = SimpleSurrealDB;

