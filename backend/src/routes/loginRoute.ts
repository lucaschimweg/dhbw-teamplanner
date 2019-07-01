import * as express from "express";
import {SessionManager} from "../sessionManagement";

export class LoginRoute {
    private router: express.Router = express.Router();

    private async doLogin(req: express.Request, res: express.Response) {
        if (!("mail" in req.body && "password" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let mail = req.body.mail;
        let password = req.body.password;

        let session = await SessionManager.getInstance().loginUser(mail, password);
        if (session == null) {
            res.redirect("/loginWithError.html");
            return;
        }

        res.cookie("teamplanner-session", session[0]);
        res.redirect("/week");
    }

    constructor() {
        this.router.post("/", this.doLogin.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

