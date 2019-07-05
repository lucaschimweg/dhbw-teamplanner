import {CachedJob, Job, JobParticipant, User} from "./dbObjects";
import {Database} from "./database";


export class JobScheduler {
    private jobs: Map<number, JobHierarchyObject> = new Map<number, JobHierarchyObject>();
    private readonly teamId: number;
    private users: User[] = [];

    private static readonly DAY_LENGTH = 24*60;

    constructor(teamId: number) {
        this.teamId = teamId;
    }

    private async loadJobs() {
        let jbs = (await Database.getInstance().getJobsByTeam(this.teamId));
        for (let job of jbs) {
            let jho = new JobHierarchyObject(job);
            jho.users = await Database.getInstance().getParticipantsForJob(job.id);
            this.jobs.set(job.id, jho);
            for (let u of jho.users) {
                if (this.users.filter(us => us.id == u.user.id).length == 0) {
                    this.users.push(u.user);
                }
            }
        }

        for (let obj of this.jobs) {
            let jP = obj[1];
            for (let d of await Database.getInstance().getParentJobs(jP.job.id)) {
                let j = this.jobs.get(d);
                if (j != null) jP.parents.push(j);
            }

            for (let d of await Database.getInstance().getChildJobs(jP.job.id)) {
                let j = this.jobs.get(d);
                if (j != null) jP.children.push(j);
            }
        }
    }

    private getEndJobs(): JobHierarchyObject[] {
        return Array.from(this.jobs.values()).filter(x => x.children.length == 0);
    }

    private scheduleUpwards(job: JobHierarchyObject, times: Map<number, number>) {
        if (job.startTime != -1) return;
        for (let parent of job.parents) {
            this.scheduleUpwards(parent, times);
        }

        job.startTime = Math.max(...job.users.map(usr => times.get(usr.user.id) || 0));;
        let days = Math.floor(job.startTime / JobScheduler.DAY_LENGTH);

        let startTimeOnDay = job.startTime - days*JobScheduler.DAY_LENGTH;

        for (let usr of job.users) {
            let time = usr.duration || job.job.plannedDuration;
            let dayOffset = (usr.user.startTime + JobScheduler.DAY_LENGTH) - usr.user.endTime;

            let daysUsr = days;
            let endTimeOnDay = startTimeOnDay + time;

            while (endTimeOnDay > usr.user.endTime) {
                job.cacheObjects.push(
                    new _CachedJob(usr.user.id, daysUsr, (daysUsr == days) ? startTimeOnDay : usr.user.startTime, usr.user.endTime, time)
                );
                endTimeOnDay += dayOffset;
                endTimeOnDay -= JobScheduler.DAY_LENGTH;
                ++daysUsr;
            }

            job.cacheObjects.push(
                new _CachedJob(usr.user.id, daysUsr, (daysUsr == days) ? startTimeOnDay : usr.user.startTime, endTimeOnDay, time)
            );

            if (endTimeOnDay == usr.user.endTime) {
                endTimeOnDay = usr.user.startTime;
                ++daysUsr;
            }

            times.set(usr.user.id, daysUsr * JobScheduler.DAY_LENGTH + endTimeOnDay);
        }
    }

    public createJobsWithTime(start: Date): JobWithTime[] {
        let startDate: Date = new Date(start);
        startDate.setUTCMinutes(0);
        startDate.setUTCHours(0);
        startDate.setUTCSeconds(0);
        startDate.setUTCMilliseconds(0);


        return Array.from(this.jobs.values()).map(x => {
            let dte = new Date(startDate);
            dte.setUTCMinutes(x.startTime);
            return new JobWithTime(x.job, dte, x.cacheObjects.map( co => {
                let dte = new Date(startDate);
                dte.setUTCHours(24*co.day);
                return new CachedJob(x.job.id, this.teamId, co.userId, dte, co.startTime, co.endTime, co.duration);
            }));
        });
    }

    private async writeToCache(jobsWithTime: JobWithTime[]) {
        await Database.getInstance().clearJobCache(this.teamId);

        for (let x of jobsWithTime) {
            for (let co of x.cacheObjects) {
                await Database.getInstance().addToJobCache(co.jobId, co.userId, co.teamId, co.day, co.startTime, co.endTime, co.duration);
            }
        }
    }

    public async scheduleJobs(startDate: Date, writeToCache: boolean = true): Promise<JobWithTime[]> {
        await this.loadJobs();

        let times = new Map<number, number>();

        for (let u of this.users) {
            times.set(u.id, u.startTime);
        }

        this.getEndJobs().forEach(job => this.scheduleUpwards(job, times));

        let jobs = this.createJobsWithTime(startDate);

        if (writeToCache) {
            await this.writeToCache(jobs);
        }

        return jobs;
    }

    public static getEndForJob(job: JobWithTime, usr: JobParticipant): Date {
        let time = usr.duration || job.job.plannedDuration;
        let dayOffset = (usr.user.startTime + JobScheduler.DAY_LENGTH) - usr.user.endTime;

        let daysUsr = 0;
        let endTimeOnDay = job.date.getUTCMinutes() + job.date.getUTCHours()*60 + time;

        while (endTimeOnDay >= usr.user.endTime) {
            endTimeOnDay += dayOffset;
            endTimeOnDay -= JobScheduler.DAY_LENGTH;
            ++daysUsr;
        }

        let endDate = new Date(job.date);
        endDate.setUTCHours(0);
        endDate.setUTCMinutes(endTimeOnDay + daysUsr*this.DAY_LENGTH);
        return endDate;
    }
}

class JobHierarchyObject {
    public readonly job: Job;
    public parents: JobHierarchyObject[] = [];
    public children: JobHierarchyObject[] = [];
    public users: JobParticipant[] = [];
    public startTime: number = -1;
    public cacheObjects: _CachedJob[] = [];

    constructor(job: Job) {
        this.job = job;
    }
}

class _CachedJob {

    public readonly userId: number;
    public day: number;
    public readonly startTime: number;
    public readonly endTime: number;
    public readonly duration: number;

    constructor(userId: number, day: number, startTime: number, endTime: number, duration: number) {
        this.userId = userId;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
    }
}

export class JobWithTime {
    public readonly job: Job;
    public readonly date: Date;
    public cacheObjects: CachedJob[] = [];

    constructor(job: Job, date: Date, cacheObjects: CachedJob[]) {
        this.job = job;
        this.date = date;
        this.cacheObjects = cacheObjects;
    }
}
