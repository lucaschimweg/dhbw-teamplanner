import {Job, JobParticipant, User} from "./dbObjects";
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
            console.log("added")
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

            while (endTimeOnDay >= usr.user.endTime) {
                endTimeOnDay += dayOffset;
                endTimeOnDay -= JobScheduler.DAY_LENGTH;
                ++daysUsr;
            }

            times.set(usr.user.id, daysUsr * JobScheduler.DAY_LENGTH + endTimeOnDay);
        }
    }

    public createJobsWithTime(): JobWithTime[] {
        let startDate: Date = new Date();
        startDate.setUTCMinutes(0);
        startDate.setUTCHours(0);
        startDate.setUTCSeconds(0);
        startDate.setUTCMilliseconds(0);


        return Array.from(this.jobs.values()).map(x => {
            let dte = new Date(startDate.getTime());
            dte.setUTCMinutes(x.startTime);
            return new JobWithTime(x.job, dte);
        });
    }

    public async scheduleJobs(): Promise<JobWithTime[]> {
        await this.loadJobs();

        let times = new Map<number, number>();

        for (let u of this.users) {
            times.set(u.id, u.startTime);
        }

        this.getEndJobs().forEach(job => this.scheduleUpwards(job, times));

        return this.createJobsWithTime();
    }

}

class JobHierarchyObject {
    public readonly job: Job;
    public parents: JobHierarchyObject[] = [];
    public children: JobHierarchyObject[] = [];
    public users: JobParticipant[] = [];
    public startTime: number = -1;

    constructor(job: Job) {
        this.job = job;
    }
}

export class JobWithTime {
    public readonly job: Job;
    public readonly date: Date;


    constructor(job: Job, date: Date) {
        this.job = job;
        this.date = date;
    }
}
