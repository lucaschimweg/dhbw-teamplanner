import * as express from "express";
import {Database} from "../database";
import {XmlGenerator} from "../xmlGenerator";

export class TeamRoute {
    private router: express.Router = express.Router();

    private async getTeam(req: express.Request, res: express.Response) {
        let jobs = await Database.getInstance().getJobsByTeam(req.user.teamId);
        for (let job of jobs) {
            job._participants = await Database.getInstance().getJobParticipantIds(job.id);
            job._parents = await Database.getInstance().getParentJobs(job.id);
        }

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (team == null) {
            res.status(500).end("Server Error!");
            return;
        }

        if (req.user.id != team.leader.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let users = await Database.getInstance().getUsersByTeam(req.user.teamId);

        if (users == null) {
            res.status(500).end("Server Error!");
        } else {
            res.contentType("application/xml")
                .status(200)
                .end(XmlGenerator.getXmlTeamOverview(team, users, jobs));
        }
    }

    constructor() {
        this.router.get("/", this.getTeam.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

