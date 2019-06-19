import * as fs from "fs";

export class DbConnectionProperties {
    public readonly host: string;
    public readonly user: string;
    public readonly password: string;
    public readonly dbName: string;

    constructor(host: string, user: string, password: string, dbname: string) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.dbName = dbname;
    }
}

export class Config {
    private static _instance: Config;

    public static getInstance(): Config {
        return Config._instance;
    }

    private static defaultConfig = {
        "database": {
            "host": "",
            "user": "",
            "password": "",
            "dbname": ""
        }
    };

    public static loadConfigFrom(fileName: string) {
        console.log("Loading config...");

        let data: any;

        try {
            let str = fs.readFileSync(fileName);
            data = JSON.parse(str.toString());
        } catch (e) {
            console.log("Could not load config");

            fs.writeFileSync(fileName, JSON.stringify(Config.defaultConfig, null, 2));

            console.log("Written default config to file, put in data!");
            process.exit(-1);
        }
        this._instance = new Config(data);
    }

    private constructor(config: any) {
        this.config = config;
    }

    private config: any;

    getDatabaseConnectionProperties(): DbConnectionProperties {
        return new DbConnectionProperties(
            this.config.database.host,
            this.config.database.user,
            this.config.database.password,
            this.config.database.dbname
        );
    }
}