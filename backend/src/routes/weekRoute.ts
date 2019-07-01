import * as express from "express";
import * as xmlbuilder from "xmlbuilder"
import {Database} from "../database";
import {XmlGenerator} from "../xmlGenerator";

export class WeekRoute {
    private router: express.Router = express.Router();

    private static getLastMonday(): Date {
        let d = new Date();
        let weekday = d.getUTCDay() - 1;
        if (weekday == -1) weekday = 6;

        d.setUTCDate(d.getUTCDate()-weekday);
        return d;
    }

    private static getNextSunday(): Date {
        let d = new Date();
        let weekday = d.getUTCDay();
        if (weekday != 0) weekday = 7 - weekday;

        d.setUTCDate(d.getUTCDate()+weekday);
        return d;
    }


    private async getWeek(req: express.Request, res: express.Response) {
        let jobs = await Database.getInstance().getCachedJobs(
            req.user.id,
            new Date(Database.formatDate(WeekRoute.getLastMonday())),
            new Date(Database.formatDate(WeekRoute.getNextSunday()))
        );

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        let users = await Database.getInstance().getUsersByTeam(req.user.teamId);

        if (team == null || users == null) {
            res.status(500).end("Server Error!");
        } else {
            res.contentType("application/xml")
                .status(200)
                .end(XmlGenerator.getXmlWeekOverview(team, users, jobs, req.user.id));
        }
    }

    constructor() {
        this.router.get("/", this.getWeek.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

