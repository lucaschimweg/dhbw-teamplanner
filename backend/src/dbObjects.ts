export class User {
    public readonly id: number;
    public readonly email: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly team: number;
    public readonly startTime: number;
    public readonly endTime: number;

    constructor(id: number, email: string, firstName: string, lastName: string, team: number, startTime: number, endTime: number) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.team = team;
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