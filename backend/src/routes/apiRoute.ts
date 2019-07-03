import * as express from "express";
import {SessionManager} from "../sessionManagement";

export class ApiRoute {
    private router: express.Router = express.Router();

    private async doLogout(req: express.Request, res: express.Response) {
        res.cookie("teamplanner-session", undefined);
        SessionManager.getInstance().deleteSession(req.sessionId);
        res.redirect("/login.html");
    }

    constructor() {
        this.router.post("/doLogout", this.doLogout.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

