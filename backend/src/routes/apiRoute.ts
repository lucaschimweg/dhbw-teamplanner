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
        await new JobScheduler(req.user.teamId).scheduleJobs(team.start);

        res.writeHead(303, {
            'Location': "/week?offset=" + (req.body.offset || 0)
        });
        res.end();
    }

    private async postTeamUser(req: express.Request, res: express.Response) {
        if (!("mail" in req.body && "password" in req.body && "firstname" in req.body && "lastname" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let mail = req.body.mail;
        let password = req.body.password;
        let firstname = req.body.firstname;
        let lastname = req.body.lastname;

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        if (await Database.getInstance().userExists(mail)) {
            res.writeHead(303, {
                'Location': '/team?error="User already exists with that mail!"'
            }).end();
            return;
        }

        await Database.getInstance().createUser(mail, firstname, lastname, team.id, SessionManager.hashPassword(password));

        res.writeHead(303, {
            'Location': "/team"
        });
        res.end();
    }

    private async deleteTeamUser(req: express.Request, res: express.Response) {
        if (!("user" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let userId = req.body.user.substr(1);

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let user = await Database.getInstance().getUserById(userId);

        if (!user) {
            res.status(400).end("Bad Request");
            return;
        }

        if (user.teamId != team.id) {
            res.status(403).end("Forbidden");
            return;
        }

        await Database.getInstance().deleteUser(userId);

        await new JobScheduler(req.user.teamId).scheduleJobs(team.start);

        res.writeHead(303, {
            'Location': "/team"
        });
        res.end();
    }

    private async addJobUser(req: express.Request, res: express.Response) {
        if (!("user" in req.body && "job" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let jobId = req.body.job;
        let userId = req.body.user.substr(1);
        if (userId == "one" ) {
            res.writeHead(303, {
                'Location': "/team#" + "j" + jobId
            });
            res.end();
            return;
        }

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let user = await Database.getInstance().getUserById(userId);

        if (!user) {
            res.status(400).end("Bad Request");
            return;
        }

        if (user.teamId != team.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let job = await Database.getInstance().getJobById(jobId);

        if (!job) {
            res.status(400).end("Bad Request");
            return;
        }

        if (job.teamId != team.id) {
            res.status(400).end("Bad Request");
            return;
        }

        await Database.getInstance().addParticipantToJob(jobId, userId);

        await new JobScheduler(req.user.teamId).scheduleJobs(team.start);

        res.writeHead(303, {
            'Location': "/team#" + "j" + jobId
        });
        res.end();
    }

    private async deleteJobUser(req: express.Request, res: express.Response) {
        if (!("user" in req.body && "job" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let userId = req.body.user.substr(1);
        let jobId = req.body.job;

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let user = await Database.getInstance().getUserById(userId);

        if (!user) {
            res.status(400).end("Bad Request");
            return;
        }

        if (user.teamId != team.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let job = await Database.getInstance().getJobById(jobId);

        if (!job) {
            res.status(400).end("Bad Request");
            return;
        }

        if (job.teamId != team.id) {
            res.status(400).end("Bad Request");
            return;
        }

        let part = await Database.getInstance().getParticipantsForJob(jobId);

        // if user does not exist in job nothing will happen
        await Database.getInstance().removeParticipantFromJob(jobId, userId);

        await new JobScheduler(req.user.teamId).scheduleJobs(team.start);

        res.writeHead(303, {
            'Location': "/team#" + "j" + jobId
        });
        res.end();
    }

    private async addJobDependency(req: express.Request, res: express.Response) {
        if (!("parent" in req.body && "job" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let jobId = req.body.job;
        let parentId = req.body.parent;
        if (parentId == "none" ) {
            res.writeHead(303, {
                'Location': "/team#" + "j" + jobId
            });
            res.end();
            return;
        }

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let parent = await Database.getInstance().getJobById(jobId);

        if (!parent) {
            res.status(400).end("Bad Request");
            return;
        }

        if (parent.teamId != team.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let job = await Database.getInstance().getJobById(jobId);

        if (!job) {
            res.status(400).end("Bad Request");
            return;
        }

        if (job.teamId != team.id) {
            res.status(400).end("Bad Request");
            return;
        }

        let parents = await Database.getInstance().getParentJobs(jobId);
        if (parents.indexOf(parentId) != -1) {  // Parent already parent of job
            res.status(400).end("Bad Request");
            return;
        }

        await Database.getInstance().addJobDependency(parentId, jobId);

        await new JobScheduler(req.user.teamId).scheduleJobs(team.start);

        res.writeHead(303, {
            'Location': "/team#" + "j" + jobId
        });
        res.end();
    }

    private async deleteJobDependency(req: express.Request, res: express.Response) {
        if (!("parent" in req.body && "job" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let parentId = req.body.parent;
        let jobId = req.body.job;

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let parent = await Database.getInstance().getJobById(jobId);

        if (!parent) {
            res.status(400).end("Bad Request");
            return;
        }

        if (parent.teamId != team.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let job = await Database.getInstance().getJobById(jobId);

        if (!job) {
            res.status(400).end("Bad Request");
            return;
        }

        if (job.teamId != team.id) {
            res.status(400).end("Bad Request");
            return;
        }

        // if parent does not exist in job nothing will happen
        await Database.getInstance().deleteJobDependency(parentId, jobId);

        await new JobScheduler(req.user.teamId).scheduleJobs(team.start);

        res.writeHead(303, {
            'Location': "/team#" + "j" + jobId
        });
        res.end();
    }

    private async createJob(req: express.Request, res: express.Response) {
        if (!("name" in req.body && "duration" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let name = req.body.name;
        let descr = req.body.description || "";
        let duration = req.body.duration;


        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let job = await Database.getInstance().createJob(team.id, name, descr, duration);

        res.writeHead(303, {
            'Location': "/team#j" + job.id
        });
        res.end();
    }

    private async deleteJob(req: express.Request, res: express.Response) {
        if (!("job" in req.body)) {
            res.status(400).end("Bad Request");
            return;
        }

        let jobId = req.body.job;

        let team = await Database.getInstance().getTeamById(req.user.teamId);
        if (!team) {
            res.status(500).end("Server error");
            return;
        }

        if (team.leader.id != req.user.id) {
            res.status(403).end("Forbidden");
            return;
        }

        let job = await Database.getInstance().getJobById(jobId);

        if (!job) {
            res.status(400).end("Bad Request");
            return;
        }

        if (job.teamId != team.id) {
            res.status(400).end("Bad Request");
            return;
        }

        await Database.getInstance().deleteJob(jobId);

        await new JobScheduler(req.user.teamId).scheduleJobs(team.start);

        res.writeHead(303, {
            'Location': "/team"
        });
        res.end();
    }

    constructor() {
        this.router.get("/doLogout", this.doLogout.bind(this));
        this.router.post("/jobDuration", this.postJobDuration.bind(this));
        this.router.post("/addTeamUser", this.postTeamUser.bind(this));
        this.router.post("/deleteTeamUser", this.deleteTeamUser.bind(this));
        this.router.post("/addJobUser", this.addJobUser.bind(this));
        this.router.post("/deleteJobUser", this.deleteJobUser.bind(this));
        this.router.post("/addJobDependency", this.addJobDependency.bind(this));
        this.router.post("/deleteJobDependency", this.deleteJobDependency.bind(this));
        this.router.post("/createJob", this.createJob.bind(this));
        this.router.post("/deleteJob", this.deleteJob.bind(this));
    }

    public getRouter(): express.Router {
        return this.router;
    }

}

