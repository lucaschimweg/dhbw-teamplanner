import {DbConnectionProperties} from "./config";
import * as mysql from 'mysql';
import {Pool} from "mysql";
import {MysqlError} from "mysql";
import {DbRes} from "./res";

export class Database {

    private static _instance: Database;

    public static getInstance(): Database{
        return Database._instance;
    }

    public static createWithProperties(properties: DbConnectionProperties): Database {
        Database._instance = new Database(properties);
        return Database._instance;
    }


    private pool: Pool;

    private constructor(properties: DbConnectionProperties) {
        this.pool = mysql.createPool({
            connectionLimit: 16,
            host: properties.host,
            user: properties.user,
            password: properties.password,
            database: properties.dbName
        });
    }

    public async connect(): Promise<boolean> {
        return this.bootstrap();
    }

    public async disconnect() {
        return new Promise((resolve, reject) => {
            this.pool.end((err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }));
        });
    }

    private query(query: string, values: any = null): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.pool.query(query, values, function (error: MysqlError | null, res: any[]) {
                if (error) {
                    reject(error);
                } else {
                    resolve(res);
                }
            });
        });
    }

    private async bootstrap(): Promise<boolean> {
        try {
            await this.query(DbRes.CREATE_TEAMPLANNER_USERS);

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }


}