import Surreal from 'surrealdb';

/**
 * SurrealDB Client singleton
 * Manages connection to SurrealDB with proper error handling
 */

declare global {
  // eslint-disable-next-line no-var
  var surrealdb: Surreal | undefined;
}

class SurrealDBClient {
  private static instance: Surreal;
  private static isConnected: boolean = false;

  static async getInstance(): Promise<Surreal> {
    // Always create fresh instance in development to avoid caching issues
    if (process.env.NODE_ENV === 'production' && this.instance && this.isConnected) {
      return this.instance;
    }

    const instance = new Surreal();

    try {
      // Connect to SurrealDB
      await instance.connect(process.env.SURREALDB_URL || 'ws://localhost:8000/rpc');
      console.log('✓ Connected to SurrealDB');

      // Sign in
      await instance.signin({
        username: process.env.SURREALDB_USER || 'root',
        password: process.env.SURREALDB_PASS || 'root',
      });
      console.log('✓ Signed in to SurrealDB');

      // Select namespace and database
      const ns = process.env.SURREALDB_NAMESPACE || 'humidor_club';
      const dbName = process.env.SURREALDB_DATABASE || 'production';
      await instance.use({ namespace: ns, database: dbName });
      console.log(`✓ Using namespace: ${ns}, database: ${dbName}`);

      this.instance = instance;
      this.isConnected = true;

      return instance;
    } catch (error) {
      console.error('Failed to connect to SurrealDB:', error);
      throw error;
    }
  }

  static async query<T = any>(sql: string, vars?: Record<string, any>): Promise<T[]> {
    const db = await this.getInstance();
    // Ensure namespace/database are set before query
    await db.use({
      namespace: process.env.SURREALDB_NAMESPACE || 'humidor_club',
      database: process.env.SURREALDB_DATABASE || 'production',
    });
    const result = await db.query<T[][]>(sql, vars);
    return result[0] || [];
  }

  static async select<T extends Record<string, any> = any>(table: string): Promise<T[]> {
    const db = await this.getInstance();
    const result = await db.select<T>(table);
    return Array.isArray(result) ? result : [result];
  }

  static async create<T extends Record<string, any> = any>(table: string, data: Partial<T>): Promise<T> {
    const db = await this.getInstance();
    const result = await db.create<T>(table, data);
    return Array.isArray(result) ? result[0] : result;
  }

  static async update<T extends Record<string, any> = any>(thing: string, data: Partial<T>): Promise<T> {
    const db = await this.getInstance();
    return await db.update<T>(thing, data);
  }

  static async delete(thing: string): Promise<void> {
    const db = await this.getInstance();
    await db.delete(thing);
  }

  static async close(): Promise<void> {
    if (this.instance) {
      await this.instance.close();
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const db = SurrealDBClient;

// Type-safe query builder helpers
export class QueryBuilder {
  private conditions: string[] = [];
  private sorts: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;

  constructor(private table: string) {}

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.sorts.push(`${field} ${direction}`);
    return this;
  }

  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }

  build(): string {
    let query = `SELECT * FROM ${this.table}`;

    if (this.conditions.length > 0) {
      query += ` WHERE ${this.conditions.join(' AND ')}`;
    }

    if (this.sorts.length > 0) {
      query += ` ORDER BY ${this.sorts.join(', ')}`;
    }

    if (this.limitValue !== undefined) {
      query += ` LIMIT ${this.limitValue}`;
    }

    if (this.offsetValue !== undefined) {
      query += ` START ${this.offsetValue}`;
    }

    return query;
  }

  async execute<T = any>(): Promise<T[]> {
    return await db.query<T>(this.build());
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.close();
});

