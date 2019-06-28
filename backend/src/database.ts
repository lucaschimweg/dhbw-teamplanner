import {DbConnectionProperties} from "./config";
import * as mysql from 'mysql';
import {Pool, MysqlError} from "mysql";
import {DbRes} from "./res";
import {Job, JobParticipant, Team, User} from "./dbObjects";

export class Database {

    // region Static Part

    private static _instance: Database;

    public static getInstance(): Database{
        return Database._instance;
    }

    public static createWithProperties(properties: DbConnectionProperties): Database {
        Database._instance = new Database(properties);
        return Database._instance;
    }

    // endregion

    private pool: Pool;

    // region Connection

    private constructor(properties: DbConnectionProperties) {
        this.pool = mysql.createPool({
            connectionLimit: 16,
            host: properties.host,
            user: properties.user,
            password: properties.password,
            database: properties.dbName,
            multipleStatements: true
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
            await this.query(DbRes.CREATE_TEAMPLANNER_LOGIN);
            await this.query(DbRes.CREATE_TEAMPLANNER_USERS);
            await this.query(DbRes.CREATE_TEAMPLANNER_TEAMS);
            await this.query(DbRes.CREATE_TEAMPLANNER_JOBS);
            await this.query(DbRes.CREATE_TEAMPLANNER_JOB_PARTICIPANTS);

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    // endregion

    // region User Management

    private static createUserFromObject(obj: any): User {
        return new User(
            obj.user_id,
            obj.email,
            obj.first_name,
            obj.last_name,
            obj.team,
            obj.start_time,
            obj.end_time
        );
    }

    public async createUser(email: string, firstName: string, lastName: string, team: number, passwordHash: string): Promise<User> {
        let id: number = (await this.query(DbRes.INSERT_TEAMPLANNER_USER, [email, firstName, lastName, team, 460, 1190]))[1][0].id;
        await this.query(DbRes.INSERT_TEAMPLANNER_USER_LOGIN, [email, passwordHash, id]);
        return new User(id, email, firstName, lastName, team, 460, 1190);
    }

    public async getUserIdByLoginData(email: string, passwordHash: string): Promise<number|null> {
        let obj = await this.query(DbRes.SELECT_TEAMPLANNER_USERID_BY_LOGIN, [email, passwordHash]);
        if (obj.length == 0) return null;
        return obj[0].user_id as number;
    }

    public async getUserByLoginData(email: string, passwordHash: string): Promise<User|null> {
        let id = await this.getUserIdByLoginData(email, passwordHash);
        if (id == null) return null;
        return await this.getUserById(id);
    }

    public async getUserById(id: number): Promise<User|null> {
        let obj = await this.query(DbRes.SELECT_TEAMPLANNER_USER_BY_ID, [id]);
        if (obj.length == 0) return null;
        return Database.createUserFromObject(obj[0]);
    }

    public async updateUserPassword(id: number, passwordHash: string) {
        return this.query(DbRes.UPDATE_TEAMPLANNER_USER_PW, [passwordHash, id]);
    }

    public async deleteUser(id: number) {
        return this.query(DbRes.DELETE_TEAMPLANNER_USER, [id]);
    }

    public async getUsersByTeam(teamId: number): Promise<User[]|null> {
        let obj = await this.query(DbRes.SELECT_TEAMPLANNER_USER_BY_TEAM, [teamId]);
        if (obj.length == 0) return null;
        return obj.map(Database.createUserFromObject);
    }

    // endregion

    // region Team Management

    private static async createTeamFromObject(obj: any, usr: User): Promise<Team> {
        return new Team(
            obj.team_id,
            obj.name,
            obj.description,
            obj.start,
            Database.createUserFromObject(obj)
        );
    }

    public async getTeamById(id: number): Promise<Team|null> {
        let obj = await this.query(DbRes.SELECT_TEAMPLANNER_TEAM_BY_ID, [id]);
        if (obj.length == 0) return null;
        let usr = await this.getUserById(obj[0].leader);
        if (usr == null) return null;
        return Database.createTeamFromObject(obj[0], usr);
    }

    public async createTeam(name: string, description: string, leaderId: number): Promise<Team|null> {
        let id: number = (await this.query(DbRes.INSERT_TEAMPLANNER_TEAM, [name, description, leaderId]))[1][0].id;
        return await this.getTeamById(id);
    }

    // endregion

    // region Job Management

    private static async createJobFromObject(obj: any): Promise<Job> {
        return new Job(
            obj.job_id,
            obj.team_id,
            obj.name,
            obj.description,
            obj.planned_duration
        );
    }

    public async getJobById(id: number): Promise<Job|null> {
        let obj = await this.query(DbRes.SELECT_TEAMPLANNER_JOB_BY_ID, [id]);
        if (obj.length == 0) return null;
        return Database.createJobFromObject(obj[0]);
    }

    public async createJob(teamId: number, name: string, description: string, plannedDuration: number): Promise<Job> {
        let id: number = (await this.query(DbRes.INSERT_TEAMPLANNER_JOB, [teamId, name, description, plannedDuration]))[1][0].id;
        return new Job(id, teamId, name, description, plannedDuration);
    }

    private static createJobParticipantFromObject(obj: any): JobParticipant {
        return new JobParticipant(
            Database.createUserFromObject(obj),
            obj.duration
        );
    }

    public async getParticipantsForJob(jobId: number): Promise<JobParticipant[]> {
        let obj = await this.query(DbRes.SELECT_TEAMPLANNER_JOB_PARTICIPANTS_BY_JOB, [jobId]);
        return obj.map(Database.createJobParticipantFromObject);
    }

    public async addParticipantToJob(jobId: number, userId: number) {
        await this.query(DbRes.INSERT_TEAMPLANNER_JOB_PARTICIPANT, [jobId, userId])
    }

    public async updateParticipantJobDuration(jobId: number, userId: number, duration: number) {
        await this.query(DbRes.UPDATE_TEAMPLANNER_JOB_PARTICIPANT, [duration, jobId, userId])
    }

    public async removeParticipantFromJob(jobId: number, userId: number) {
        await this.query(DbRes.DELETE_TEAMPLANNER_JOB_PARTICIPANT, [jobId, userId])
    }

    public async getJobsForUser(userId: number): Promise<JobParticipant[]> {
        let obj = await this.query(DbRes.SELECT_TEAMPLANNER_JOB_PARTICIPANTS_BY_JOB, [userId]);
        return obj.map(Database.createJobParticipantFromObject);
    }


    // endregion

}