import * as express from "express";
import * as xmlbuilder from "xmlbuilder"
import {Database} from "../database";
import {XmlGenerator} from "../xmlGenerator";

export class WeekRoute {
    private router: express.Router = express.Router();

    private static getLastMonday(offset: number): Date {
        let d = Database.getCurrentDate();
        let weekday = d.getUTCDay() - 1;
        if (weekday == -1) weekday = 6;

        d.setUTCDate(d.getUTCDate()-weekday + offset*7);
        return d;
    }

    private static getNextSunday(offset: number): Date {
        let d = Database.getCurrentDate();
        let weekday = d.getUTCDay();
        if (weekday != 0) weekday = 7 - weekday;

        d.setUTCDate(d.getUTCDate()+weekday + offset*7);
        return d;
    }


    private async getWeek(req: express.Request, res: express.Response) {
        let offset =  (req.query.offset as number) || 0;
        let monday = WeekRoute.getLastMonday(offset);
        let sunday = WeekRoute.getNextSunday(offset);
        let jobs = await Database.getInstance().getCachedJobs(
            req.user.id,
            monday,
            sunday
        );

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        let users = await Database.getInstance().getUsersByTeam(req.user.teamId);

        if (team == null || users == null) {
            res.status(500).end("Server Error!");
        } else {
            res.contentType("application/xml")
                .status(200)
                .end(XmlGenerator.getXmlWeekOverview(team, users, jobs, req.user.id, monday, sunday, offset));
        }
    }

    constructor() {
        this.router.get("/", this.getWeek.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

