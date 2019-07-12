import * as xmlbuilder from "xmlbuilder"
import {CachedJob, Job, Team, User} from "./dbObjects";
import {XMLElement, XMLWriter} from "xmlbuilder";
import {Database} from "./database";

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
                .att("id", "u" + usr.id)
                .att("name", usr.firstName + " " + usr.lastName);
            if (usr.id == t.leader.id) {
                o.att("leader", "true");
            }
            if (usr.id == curUserId) {
                o.att("you", "true");
                o.att("startTime", this.formatTime(usr.startTime));
                o.att("endTime", this.formatTime(usr.endTime));
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
                    .att("id", "u" + part);
            }
        }
        return root;
    }

    private static fillEmptyDays(rootElem: XMLElement, curDateObj: Date, curDate: string, curDayObj: XMLElement, targetDate: Date): [XMLElement, string, Date] {
        let tar = Database.formatDate(targetDate);
        if (curDate != tar) {
            do {
                curDateObj.setUTCDate(curDateObj.getUTCDate() + 1);

                curDate = Database.formatDate(curDateObj);
                curDayObj = rootElem.ele("day");
                if (curDate == Database.formatDate(Database.getCurrentDate())) {
                    curDayObj.att("today", "true")
                }
                curDayObj.att("date", curDate);
            } while (curDate != tar);
        }
        return [curDayObj, curDate, curDateObj];
    }

    private static getXmlForWeek(jobs: CachedJob[], firstDate: Date, lastDate: Date, offset: number): XMLElement {
        let handledJobs: number[] = [];

        jobs.sort((c1, c2) => {
            if (c1.day == c2.day) return 0;
            if (c1.day < c2.day) return -1;
            return 1;
        });

        let rootElem = xmlbuilder.create("week");
        rootElem.att("offset", offset);

        let curDate = Database.formatDate(firstDate);
        let curDateObj = firstDate;
        let curDayObj: XMLElement = rootElem.ele("day");
        if (curDate == Database.formatDate(Database.getCurrentDate())) {
            curDayObj.att("today", "true")
        }
        curDayObj.att("date", curDate);

        for (let job of jobs) {
            [curDayObj, curDate, curDateObj] = this.fillEmptyDays(rootElem, curDateObj, curDate, curDayObj, job.day);

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
                            .att("id", "u" + part);
                    }
                }
            }
        }
        this.fillEmptyDays(rootElem, curDateObj, curDate, curDayObj, lastDate);
        return rootElem;
    }

    public static getXmlWeekOverview(t: Team, users: User[], c: CachedJob[], curUserId: number, firstDay: Date, lastDay: Date, offset: number) {
        let root = this.getXmlForWeek(c, firstDay, lastDay, offset);
        root.importDocument(this.getXmlForTeam(t, users, curUserId));

        root.dec({version: "1.0", encoding: "UTF-8"});
        root.dtd( {sysID: "https://planner.schimweg.net/dtd/teamplanner.dtd"});

        root.att("xmlns", "https://planner.schimweg.net/dtd/teamplanner.dtd");

        return this.injectXmlStylesheet(root.doc().end({pretty: true}), "/xslt/week.xsl");
    }

    public static getXmlTeamOverview(t: Team, users: User[], jobs: Job[], curUserId: number) {
        let root = this.getXmlForJobDefinitions(jobs);
        root.importDocument(this.getXmlForTeam(t, users, curUserId));

        root.dec("1.0", "UTF-8");
        root.dtd({sysID: "https://planner.schimweg.net/dtd/teamplanner.dtd"});

        root.att("xmlns", "https://planner.schimweg.net/dtd/teamplanner.dtd");

        return this.injectXmlStylesheet(root.doc().end({pretty: true}), "/xslt/manage.xsl");
    }

    public static injectXmlStylesheet(doc: string, path: string): string {
        let ind = doc.indexOf("?>");
        return doc.substr(0, ind+3)
            + '<?xml-stylesheet type="text/xsl" href="' + path + '"?>\n'
            + doc.substr(ind+3);

    }
}