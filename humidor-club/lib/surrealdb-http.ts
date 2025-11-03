/**
 * SurrealDB HTTP Client
 * Simple HTTP-based client for SurrealDB using fetch
 */

const SURREAL_URL = process.env.SURREALDB_URL || 'http://localhost:8000';
const SURREAL_USER = process.env.SURREALDB_USER || 'root';
const SURREAL_PASS = process.env.SURREALDB_PASS || 'root';
const SURREAL_NS = process.env.SURREALDB_NAMESPACE || 'humidor_club';
const SURREAL_DB = process.env.SURREALDB_DATABASE || 'production';

export class SurrealHTTPClient {
  private static authToken: string | null = null;

  private static getAuthHeaders(): HeadersInit {
    const basic = Buffer.from(`${SURREAL_USER}:${SURREAL_PASS}`).toString('base64');
    return {
      'Accept': 'application/json',
      'NS': SURREAL_NS,
      'DB': SURREAL_DB,
      'Authorization': `Basic ${basic}`,
    };
  }

  static async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    try {
      let queryString = sql;
      
      // Replace variables in SQL
      if (vars) {
        for (const [key, value] of Object.entries(vars)) {
          const val = typeof value === 'string' ? `"${value}"` : String(value);
          queryString = queryString.replace(new RegExp(`\\$${key}`, 'g'), val);
        }
      }

      const response = await fetch(`${SURREAL_URL}/sql`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: queryString,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SurrealDB HTTP error: ${error}`);
      }

      const results = await response.json();
      
      // SurrealDB returns an array of results for each statement
      if (Array.isArray(results) && results.length > 0) {
        const first = results[0];
        if (first.status === 'OK' && first.result) {
          return Array.isArray(first.result) ? first.result : [first.result];
        } else if (first.status === 'ERR') {
          throw new Error(first.result || 'Query failed');
        }
      }

      return [];
    } catch (error) {
      console.error('SurrealDB HTTP query error:', error);
      throw error;
    }
  }

  static async create<T = any>(table: string, data: Partial<T>): Promise<T> {
    const sql = `CREATE ${table} CONTENT ${JSON.stringify(data)}`;
    const result = await this.query<T>(sql);
    return result[0];
  }

  static async select<T = any>(table: string): Promise<T[]> {
    const sql = `SELECT * FROM ${table}`;
    return await this.query<T>(sql);
  }
}

export const dbHttp = SurrealHTTPClient;

