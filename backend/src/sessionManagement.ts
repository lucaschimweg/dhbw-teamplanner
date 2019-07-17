import {User} from "./dbObjects";
import * as crypto from 'crypto';
import {Database} from "./database";

class Session {
    private timeLeft: number; // in minutes
    public readonly user: User;

    constructor(user: User, timeLeft: number) {
        this.user = user;
        this.timeLeft = timeLeft;
    }

    public timeTick(): boolean { // returns whether session time is over
        return --this.timeLeft == 0;
    }
}

export class SessionManager {

    //region Static Part

    private static _instance: SessionManager;

    public static getInstance(): SessionManager {
        return SessionManager._instance;
    }

    public static initializeSessionManager() {
        this._instance = new SessionManager();
    }

    // endregion

    private readonly sessions: Map<string, Session>;

    private constructor() {
        this.sessions = new Map<string, Session>();
        this.sessionTick();
    }

    public static hashPassword(password: string): string {
        return crypto.createHash('sha256').update('SaltiSalti&a!' + password + "09!kld").digest('hex');
    }

    private getSessionId(): string {
        let sess: string;
        do {
            sess = crypto.createHash('sha1').update(Math.random().toString()).digest('hex');
        } while (this.sessions.has(sess));
        return sess;
    }

    private sessionTick() {
        setTimeout(() => this.sessionTick(), 60000); // once per minute
        this.sessions.forEach((value, key) => {
            if (value.timeTick()) {
                this.sessions.delete(key);
            }
        })
    }

    public async loginUser(email: string, password: string): Promise<[string, User] | null> {
        let usr = await Database.getInstance().getUserByLoginData(email, SessionManager.hashPassword(password));
        if (!usr) return null;
        let sessId = this.getSessionId();
        this.sessions.set(sessId, new Session(usr, 4*60));
        return [sessId, usr];
    }

    public  ceateUncheckedSession(usr: User): string {
        let sessId = this.getSessionId();
        this.sessions.set(sessId, new Session(usr, 4*60));
        return sessId;
    }

    public getSession(sessId: string): User|null {
        let usr = this.sessions.get(sessId);
        if (usr == null) return null;
        return usr.user;
    }

    public deleteSession(sessId: string) {
        this.sessions.delete(sessId);
    }

}
