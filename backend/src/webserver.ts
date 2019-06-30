import {Database} from "./database";
import {Config} from "./config";
import * as express from "express";
import {WeekRoute} from "./routes/weekRoute";

export class TeamplannerWebServer {
    private express: express.Application;

    constructor() {
        this.express = require('express')();
        this.registerRoutes();
    }

    private registerRoutes() {
        this.express.get("/", [(req: express.Request, res: express.Response) => {
            res.end("Works!");
        }]);

        this.express.use("/week", new WeekRoute().getRouter())
    }

    public start() {
        this.express.listen(Config.getInstance().getWebServerConfig().port)
    }
}