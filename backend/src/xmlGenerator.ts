import * as xmlbuilder from "xmlbuilder"
import {CachedJob, Job, Team, User} from "./dbObjects";
import {XMLElement, XMLWriter} from "xmlbuilder";
import {Database} from "./database";
import {Config} from "./config";

export class XmlGenerator {
    private static formatTime(minutes: number) {
        return Math.floor(minutes / 60).toString().padStart(2, "0") + ":" + (minutes % 60).toString().padStart(2, "0");
    }

    private static getXmlForTeam(t: Team, users: User[], curUserId: number): xmlbuilder.XMLElement {
        let obj = xmlbuilder.create("team");

        obj.att("name", t.name);

        if (t.description != null)
            obj.ele("description", t.description);

        for (let usr of users) {
            let o = obj.ele("memberDefinition")
                .att("id", usr.id)
                .att("name", usr.firstName + " " + usr.lastName);
            if (usr.id == t.leader.id) {
                o.att("leader", "true");
            }
            if (usr.id == curUserId) {
                o.att("you", "true");
            }
        }
        return obj;
    }

    private static getXmlForJobDefinitions(jobs: Job[]): XMLElement {
        let root = xmlbuilder.create("teamOverview");

        for (let job of jobs) {
            let el = root.ele("jobDefinition")
                .att("name", job.name)
                .att("duration", job.plannedDuration)
                .att("id", job.id);
            if (job.description != "") {
                el.ele("description", job.description)
            }
            for (let parent of job._parents) {
                el.ele("dependsOn")
                    .att("id", parent);
            }
            for (let part of job._participants) {
                el.ele("member")
                    .att("id", part);
            }
        }
        return root;
    }

    private static getXmlForWeek(jobs: CachedJob[]): XMLElement {
        let handledJobs: number[] = [];

        jobs.sort((c1, c2) => {
            if (c1.day == c2.day) return 0;
            if (c1.day < c2.day) return -1;
            return 1;
        });

        let rootElem = xmlbuilder.create("week");

        let curDate = "";
        let curDayObj: XMLElement|null = null;

        for (let job of jobs) {
            if (Database.formatDate(job.day) != curDate || curDayObj == null) {
                curDayObj = rootElem.ele("day");
                curDayObj.att("date", Database.formatDate(job.day));
                curDate = Database.formatDate(job.day);
            }
            if (handledJobs.indexOf(job.jobId) != -1) {
                curDayObj.ele("jobContinuation")
                    .att("job", job.jobId)
                    .att("timeFrom", XmlGenerator.formatTime(job.startTime))
                    .att("timeTo", XmlGenerator.formatTime(job.endTime));
            } else {
                handledJobs.push(job.jobId);
                if (job.job != null) {
                    let obj = curDayObj.ele("job")
                        .att("id", job.jobId)
                        .att("timeFrom", XmlGenerator.formatTime(job.startTime))
                        .att("timeTo", XmlGenerator.formatTime(job.endTime))
                        .att("duration", job.duration)
                        .att("name", job.job.name);
                    if (job.job.description != "") {
                        obj.ele("description", job.job.description);
                    }
                    for (let part of job.participants) {
                        obj.ele("member")
                            .att("id", part);
                    }
                }
            }
        }
        return rootElem;
    }

    public static getXmlWeekOverview(t: Team, users: User[], c: CachedJob[], curUser: number) {
        let root = this.getXmlForWeek(c);
        root.importDocument(this.getXmlForTeam(t, users, curUser));

        root.dec({version: "1.0", encoding: "UTF-8"});
        root.dtd( {sysID: Config.getInstance().getWebServerHostname() + "/dtd/teamplanner.dtd"});

        root.att("xmlns", Config.getInstance().getWebServerHostname() + "/dtd/teamplanner.dtd");

        return this.injectXmlStylesheet(root.doc().end({pretty: true}), "/xslt/week.xsl");
    }

    public static getXmlTeamOverview(t: Team, users: User[], jobs: Job[], curUser: number) {
        let root = this.getXmlForJobDefinitions(jobs);
        root.importDocument(this.getXmlForTeam(t, users, curUser));

        root.dec("1.0", "UTF-8");
        root.dtd({sysID: Config.getInstance().getWebServerHostname() + "/dtd/teamplanner.dtd"});

        root.att("xmlns", Config.getInstance().getWebServerHostname() + "/dtd/teamplanner.dtd");

        return this.injectXmlStylesheet(root.doc().end({pretty: true}), "/xslt/team.xsl");
    }

    public static injectXmlStylesheet(doc: string, path: string): string {
        let ind = doc.indexOf("?>");
        return doc.substr(0, ind+3)
            + '<?xml-stylesheet type="text/xsl" href="' + path + '"?>\n'
            + doc.substr(ind+3);

    }
}