import * as express from "express";
import {SessionManager} from "../sessionManagement";
import {Database} from "../database";
import {JobScheduler} from "../jobScheduler";

export class ApiRoute {
    private router: express.Router = express.Router();

    private async doLogout(req: express.Request, res: express.Response) {
        res.cookie("teamplanner-session", undefined);
        SessionManager.getInstance().deleteSession(req.sessionId);
        res.redirect("/login.html");
    }

    private async postJobDuration(req: express.Request, res: express.Response) {
        let id = req.body.id;
        let newTime = req.body.duration;
        if (!id || !newTime) {
            res.status(400).end("Bad Request");
            return;
        }

        let partIds = await Database.getInstance().getJobParticipantIds(id);
        if (partIds.indexOf(req.user.id) == -1) {
            res.status(400).end("Bad Request");
            return;
        }

        await Database.getInstance().updateParticipantJobDuration(id, req.user.id, newTime);
        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }
        await new JobScheduler(req.user.teamId).scheduleJobs(team.start); // TODO takes long, implement background handling

        res.writeHead(303, {
            'Location': "/week?offset=" + (req.body.offset || 0)
        });
        res.end();
    }

    private async postTeamUser(req: express.Request, res: express.Response) {
        if (!("mail" in req.body && "password" in req.body && "firstname" in req.body && "lastname" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let mail = req.body.mail;
        let password = req.body.password;
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        if (await Database.getInstance().userExists(mail)) {
            res.writeHead(303, {
                'Location': '/team?error="User already exists with that mail!"'
            });
            return;
        }

        await Database.getInstance().createUser(mail, firstname, lastname, team.id, SessionManager.hashPassword(password));

        res.writeHead(303, {
            'Location': "/team"
        });
        res.end();
    }

    private async deleteTeamUser(req: express.Request, res: express.Response) {
        if (!("user")) {
            res.status(400).end("Bad Request");
            return;
        }

        let userId = req.body.user.substr(1);

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let user = await Database.getInstance().getUserById(userId);

        if (!user) {
            res.status(400).end("Bad Request");
            return;
        }

        if (user.teamId != team.id) {
            res.status(403).end("Forbidden");
            return;
        }

        await Database.getInstance().deleteUser(userId);

        res.writeHead(303, {
            'Location': "/team"
        });
        res.end();
    }

    constructor() {
        this.router.get("/doLogout", this.doLogout.bind(this));
        this.router.post("/jobDuration", this.postJobDuration.bind(this));
        this.router.post("/teamUser", this.postTeamUser.bind(this));
        this.router.post("/deleteTeamUser", this.deleteTeamUser.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

