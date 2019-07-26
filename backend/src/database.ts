import {DbConnectionProperties} from "./config";
import * as mysql from 'mysql';
import {Pool, MysqlError} from "mysql";
import {DbRes} from "./res";
import {CachedJob, Job, JobParticipant, JobParticipation, Team, User} from "./dbObjects";

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

    public static formatDate(d: Date): string {
        return d.getUTCFullYear()
            + "-" + (d.getUTCMonth() + 1).toString().padStart(2, "0")
            + "-" + d.getUTCDate().toString().padStart(2, "0")
    }

    public static getCurrentDate(): Date {
        let d = new Date();
        return new Date(d.getTime() - d.getTimezoneOffset()*60*1000);
    }

    public static parseDate(str: string): Date {
        return new Date(str);
    }

    // endregion

    // region Connection

    private pool: Pool;

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
            await this.query(DbRes.CREATE_TEAMPLANNER_JOB_DEPENDENCIES);
            await this.query(DbRes.CREATE_TEAMPLANNER_JOB_CACHE);

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
        let id: number = (await this.query(DbRes.INSERT_USER, [email, firstName, lastName, team, 480, 1080]))[1][0].id;
        await this.query(DbRes.INSERT_USER_LOGIN, [email, passwordHash, id]);
        return new User(id, email, firstName, lastName, team, 480, 1080);
    }

    public async getUserIdByLoginData(email: string, passwordHash: string): Promise<number|null> {
        let obj = await this.query(DbRes.SELECT_USERID_BY_LOGIN, [email, passwordHash]);
        if (obj.length == 0) return null;
        return obj[0].user_id as number;
    }

    public async getUserByLoginData(email: string, passwordHash: string): Promise<User|null> {
        let id = await this.getUserIdByLoginData(email, passwordHash);
        if (id == null) return null;
        return await this.getUserById(id);
    }

    public async getUserById(id: number): Promise<User|null> {
        let obj = await this.query(DbRes.SELECT_USER_BY_ID, [id]);
        if (obj.length == 0) return null;
        return Database.createUserFromObject(obj[0]);
    }

    public async updateUserPassword(id: number, passwordHash: string) {
        return this.query(DbRes.UPDATE_USER_PW, [passwordHash, id]);
    }

    public async deleteUser(id: number) {
        return this.query(DbRes.DELETE_USER, [id, id, id]);
    }

    public async getUsersByTeam(teamId: number): Promise<User[]|null> {
        let obj = await this.query(DbRes.SELECT_USER_BY_TEAM, [teamId]);
        if (obj.length == 0) return null;
        return obj.map(Database.createUserFromObject);
    }

    public async userExists(mail: string): Promise<boolean> {
        let ids = await this.query(DbRes.SELECT_USERID_BY_MAIL, [mail]);
        return ids.length > 0;
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
        let obj = await this.query(DbRes.SELECT_TEAM_BY_ID, [id]);
        if (obj.length == 0) return null;
        let usr = await this.getUserById(obj[0].leader);
        if (usr == null) return null;
        return Database.createTeamFromObject(obj[0], usr);
    }

    public async createTeam(name: string, description: string, leaderMail: string, leaderFName: string, leaderLName: string, leaderPwHash: string, startDate: string): Promise<User> {
        let ldr = (await this.createUser(leaderMail, leaderFName, leaderLName, 0, leaderPwHash));

        let id: number = (await this.query(DbRes.INSERT_TEAM, [name, description, ldr.id, Database.parseDate(startDate)]))[1][0].id;
        await this.query(DbRes.UPDATE_USER_TEAM, [id, ldr.id]);
        return new User(ldr.id, ldr.email, ldr.firstName, ldr.lastName, id, ldr.startTime, ldr.endTime);
    }

    // endregion

    // region Job Management

    private static createJobFromObject(obj: any): Job {
        return new Job(
            obj.job_id,
            obj.team_id,
            obj.name,
            obj.description,
            obj.planned_duration
        );
    }

    public async getJobById(id: number): Promise<Job|null> {
        let obj = await this.query(DbRes.SELECT_JOB_BY_ID, [id]);
        if (obj.length == 0) return null;
        return Database.createJobFromObject(obj[0]);
    }

    public async getJobsByTeam(teamId: number): Promise<Job[]> {
        let obj = await this.query(DbRes.SELECT_JOBS_BY_TEAM, [teamId]);
        return obj.map(Database.createJobFromObject);
    }

    public async createJob(teamId: number, name: string, description: string, plannedDuration: number): Promise<Job> {
        let id: number = (await this.query(DbRes.INSERT_JOB, [teamId, name, description, plannedDuration]))[1][0].id;
        return new Job(id, teamId, name, description, plannedDuration);
    }

    public async deleteJob(jobId: number): Promise<void> {
        await this.query(DbRes.DELETE_JOB, [jobId, jobId, jobId, jobId]);
    }

    private static createJobParticipantFromObject(obj: any): JobParticipant {
        return new JobParticipant(
            Database.createUserFromObject(obj),
            obj.duration
        );
    }

    private static createJobParticipationFromObject(obj: any): JobParticipation {
        return new JobParticipation(
            Database.createJobFromObject(obj),
            obj.duration
        );
    }

    public async getParticipantsForJob(jobId: number): Promise<JobParticipant[]> {
        let obj = await this.query(DbRes.SELECT_JOB_PARTICIPANTS_BY_JOB, [jobId]);
        return obj.map(Database.createJobParticipantFromObject);
    }

    public async addParticipantToJob(jobId: number, userId: number) {
        await this.query(DbRes.INSERT_JOB_PARTICIPANT, [jobId, userId])
    }

    public async updateParticipantJobDuration(jobId: number, userId: number, duration: number) {
        await this.query(DbRes.UPDATE_JOB_PARTICIPANT, [duration, jobId, userId])
    }

    public async removeParticipantFromJob(jobId: number, userId: number) {
        await this.query(DbRes.DELETE_JOB_PARTICIPANT, [jobId, userId])
    }

    public async getJobsForUser(userId: number): Promise<JobParticipation[]> {
        let obj = await this.query(DbRes.SELECT_JOB_PARTICIPANTS_BY_USER, [userId]);
        return obj.map(Database.createJobParticipationFromObject);
    }

    public async getParentJobs(jobId: number): Promise<number[]> {
        return (await this.query(DbRes.SELECT_JOB_PARENTS, [jobId]))
            .map((x: any) => x.job_parent);
    }

    public async getChildJobs(jobId: number): Promise<number[]> {
        return (await this.query(DbRes.SELECT_JOB_CHILDREN, [jobId]))
            .map((x: any) => x.job_child);
    }

    public async deleteJobDependency(parentJob: number, childJob: number) {
        await this.query(DbRes.DELETE_JOB_DEPENDENCY, [parentJob, childJob])

    }

    public async addJobDependency(parentJob: number, childJob: number) {
        return await this.query(DbRes.INSERT_JOB_DEPENDENCY, [parentJob, childJob]);
    }

    public async getJobParticipantIds(job: number): Promise<number[]> {
         return (await this.query(DbRes.SELECT_JOB_PARTICIPANT_IDS, [job])).map(x => x.user_id);
    }

    // endregion

    // region Job Cache

    private static createCachedJobFromObject(obj: any): CachedJob {
        return new CachedJob(
            obj.job_id,
            obj.team_id,
            obj.user_id,
            Database.parseDate(obj.day),
            obj.start_time,
            obj.end_time,
            obj.duration,
            Database.createJobFromObject(obj)
        );
    }

    public async clearJobCache(teamId: number) {
        await this.query(DbRes.DELETE_JOB_CACHE_BY_TEAM, [teamId]);
    }

    public async addToJobCache(jobId: number, userId: number, teamId: number, date: Date, startTime: number, endTime: number, duration: number) {
        await this.query(DbRes.INSERT_JOB_CACHE,
            [jobId, teamId, userId, Database.formatDate(date), startTime, endTime, duration]);
    }

    public async getCachedJobs(usrId: number, dayFrom: Date, dayTo: Date): Promise<CachedJob[]> {
        let jobs = new  Map<number, number[]> ();

        let cachedJobs =
            (await this.query(DbRes.SELECT_JOB_CACHE_USER_DATES, [usrId, Database.formatDate(dayFrom), Database.formatDate(dayTo)]))
                .map(Database.createCachedJobFromObject);

        for (let cJob of cachedJobs) {
            let part = jobs.get(cJob.jobId);
            if (part == null) {
                part = await this.getJobParticipantIds(cJob.jobId);
                jobs.set(cJob.jobId, part);
            }
            cJob.participants = part;
        }

        return cachedJobs;
    }

    // endregion

}