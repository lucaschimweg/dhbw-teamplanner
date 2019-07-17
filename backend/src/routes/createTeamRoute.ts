import * as express from "express";
import {SessionManager} from "../sessionManagement";
import {Database} from "../database";

export class CreateTeamRoute {
    private router: express.Router = express.Router();

    private async createTeam(req: express.Request, res: express.Response) {
        if (!("mail" in req.body && "password" in req.body && "firstname" in req.body && "lastname" in req.body && "teamname" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let mail = req.body.mail;
        let password = req.body.password;
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;
        let teamname = req.body.teamname;

        if (await Database.getInstance().userExists(mail)) {
            res.redirect("/registerEmailInUse.html");
            return;
        }

        let ldr = await Database.getInstance().createTeam(teamname, "", mail, firstname, lastname, SessionManager.hashPassword(password));

        let session = SessionManager.getInstance().ceateUncheckedSession(ldr);

        res.cookie("teamplanner-session", session);
        res.redirect("/week");
    }

    constructor() {
        this.router.post("/", this.createTeam.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

