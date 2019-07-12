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

    constructor() {
        this.router.get("/doLogout", this.doLogout.bind(this));
        this.router.post("/jobDuration", this.postJobDuration.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

