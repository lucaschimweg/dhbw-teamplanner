export class User {
    public readonly id: number;
    public readonly email: string;
    public readonly firstName: string;
    public readonly lastName: string;
    public readonly team: number;

    constructor(id: number, email: string, firstName: string, lastName: string, team: number) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.team = team;
    }
}