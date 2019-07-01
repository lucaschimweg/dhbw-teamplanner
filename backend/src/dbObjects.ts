export class User {
    public readonly id: number;
    public readonly email: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly teamId: number;
    public readonly startTime: number;
    public readonly endTime: number;

    constructor(id: number, email: string, firstName: string, lastName: string, team: number, startTime: number, endTime: number) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.teamId = team;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

export class Team {
    public readonly id: number;
    public readonly name: string;
    public readonly description: string;
    public readonly start: Date;
    public readonly leader: User;

    constructor(id: number, name: string, description: string, start: Date, leader: User) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.start = start;
        this.leader = leader;
    }
}


export class Job {
    public readonly id: number;
    public readonly teamId: number;
    public readonly name: string;
    public readonly description: string;
    public readonly plannedDuration: number;
    public _participants: number[] = [];
    public _parents: number[] = [];

    constructor(id: number, teamId: number, name: string, description: string, plannedDuration: number) {
        this.id = id;
        this.teamId = teamId;
        this.name = name;
        this.description = description;
        this.plannedDuration = plannedDuration;
    }
}

export class JobParticipant {
    public readonly user: User;
    public readonly duration: number|null;

    constructor(user: User, duration: number | null) {
        this.user = user;
        this.duration = duration;
    }
}

export class JobParticipation {
    public readonly job: Job;
    public readonly duration: number|null;

    constructor(job: Job, duration: number | null) {
        this.job = job;
        this.duration = duration;
    }
}

export class CachedJob {
    public readonly jobId: number;
    public readonly teamId: number;
    public readonly userId: number;
    public day: Date;
    public readonly startTime: number;
    public readonly endTime: number;
    public readonly duration: number;
    public readonly job: Job|null;
    public participants: number[];

    constructor(jobId: number, teamId: number, userId: number, day: Date, startTime: number, endTime: number, duration: number, job: Job|null = null, participants: number[] = []) {
        this.jobId = jobId;
        this.teamId = teamId;
        this.userId = userId;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.duration = duration;
        this.job = job;
        this.participants = participants
    }
}
