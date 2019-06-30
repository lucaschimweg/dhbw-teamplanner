import {Config} from "./config";
import * as express from "express";
import {WeekRoute} from "./routes/weekRoute";
import * as bodyParser from "body-parser"
import * as cookieParser from "cookie-parser";
import {LoginRoute} from "./routes/loginRoute";
import {User} from "./dbObjects";
import {SessionManager} from "./sessionManagement";

declare global {
    namespace Express {
        export interface Request {
            user: User;
        }
    }
}

export class TeamplannerWebServer {
    private express: express.Application;

    constructor() {
        this.express = require('express')();
        this.registerRoutes();
    }

    private static checkLogin(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!("teamplanner-session" in req.cookies)) {
            res.status(401).end("Unauthorized!");
            return;
        }
        let user = SessionManager.getInstance().getSession(req.cookies["teamplanner-session"]);
        if (user == null) {
            res.status(401).end("Unauthorized");
            return;
        }
        req.user = user;
        next();
    }

    private registerRoutes() {
        this.express.use(express.static("../frontend"));
        this.express.use(bodyParser.urlencoded({extended: false}));
        this.express.use(cookieParser());

        this.express.get("/", [(req: express.Request, res: express.Response) => {
            res.end("Welcome!!");
        }]);

        this.express.use("/api/doLogin", new LoginRoute().getRouter());

        this.express.use(TeamplannerWebServer.checkLogin);

        this.express.use("/api/week", new WeekRoute().getRouter());
    }

    public start() {
        this.express.listen(Config.getInstance().getWebServerConfig().port)
    }
}