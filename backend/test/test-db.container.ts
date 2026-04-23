import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Listing } from '../src/listings/entities/listing.entity';
import { ListingSchedule } from '../src/listings/entities/listing-schedule.entity';
import { User } from '../src/users/entities/user.entity';
import { OauthAccount } from '../src/auth/entities/oauth_account.entity';
import { Provider } from '../src/auth/entities/provider.entity';

export class TestDbContainer {
  private container: StartedMySqlContainer;
  private dataSource: DataSource;

  async start(): Promise<DataSource> {
    // 1. MySQL 8.0 컨테이너 실행
    this.container = await new MySqlContainer('mysql:8.0')
      .withDatabase('test_db')
      .withRootPassword('test_pass')
      .start();

    // 2. TypeORM DataSource 설정 (root 계정 사용)
    this.dataSource = new DataSource({
      type: 'mysql',
      host: this.container.getHost(),
      port: this.container.getPort(),
      username: 'root',
      password: 'test_pass',
      database: 'test_db',
      entities: [Listing, ListingSchedule, User, OauthAccount, Provider],
      synchronize: false,
      logging: false,
    });

    await this.dataSource.initialize();

    // 3. init.sql의 DDL 실행 (스키마 생성)
    // backend/test/test-db.container.ts -> backend -> root -> docker/init.sql
    const initSqlPath = path.resolve(__dirname, '../../docker/init.sql');
    if (!fs.existsSync(initSqlPath)) {
      throw new Error(`init.sql not found at ${initSqlPath}`);
    }
    const initSql = fs.readFileSync(initSqlPath, 'utf8');
    
    // DDL 구문 추출: 주석 제거 및 구문 분리
    const ddlStatements = initSql
      .replace(/--.*$/gm, '') // SQL 한 줄 주석 제거
      .replace(/\/\*[\s\S]*?\*\//g, '') // SQL 여러 줄 주석 제거
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.toUpperCase().includes('INSERT INTO'));

    for (const statement of ddlStatements) {
      await this.dataSource.query(statement);
    }

    return this.dataSource;
  }

  async stop(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
    if (this.container) {
      await this.container.stop();
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }
}
