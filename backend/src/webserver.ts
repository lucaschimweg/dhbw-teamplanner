import {Config} from "./config";
import * as express from "express";
import {WeekRoute} from "./routes/weekRoute";
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser";
import {LoginRoute} from "./routes/loginRoute";
import {User} from "./dbObjects";
import {SessionManager} from "./sessionManagement";
import {TeamRoute} from "./routes/teamRoute";
import * as send from "send";
import {ApiRoute} from "./routes/apiRoute";
import * as serveStatic from "serve-static";
import {CreateTeamRoute} from "./routes/createTeamRoute";

declare global {
    namespace Express {
        export interface Request {
            user: User;
            sessionId: string;
        }
    }
}

export class TeamplannerWebServer {
    private express: express.Application;

    constructor() {
        this.express = require('express')();
        this.registerRoutes();
        send.mime.define({
            "text/xsl": ["xsl"],
            "text/css": ["css"]
        }, true)
    }

    private static checkLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!("teamplanner-session" in req.cookies)) {
            res.redirect("/login.html");
            return;
        }
        let user = SessionManager.getInstance().getSession(req.cookies["teamplanner-session"]);
        if (user == null) {
            res.redirect("/login.html");
            return;
        }
        req.user = user;
        req.sessionId = req.cookies["teamplanner-session"];
        next();
    }

    private registerRoutes() {
        this.express.use(serveStatic("../frontend"));
        this.express.use(bodyParser.urlencoded({extended: false}));
        this.express.use(cookieParser());

        this.express.use("/api/doLogin", new LoginRoute().getRouter());
        this.express.use("/api/createTeam", new CreateTeamRoute().getRouter());

        this.express.use(TeamplannerWebServer.checkLogin);

        this.express.get("/", [(req: express.Request, res: express.Response) => {
            res.redirect("/week");
        }]);

        this.express.use("/week", new WeekRoute().getRouter());
        this.express.use("/team", new TeamRoute().getRouter());
        this.express.use("/api", new ApiRoute().getRouter());
    }

    public start() {
        this.express.listen(Config.getInstance().getWebServerConfig().port)
    }
}