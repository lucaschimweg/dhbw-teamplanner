import * as xmlbuilder from "xmlbuilder"
import {CachedJob, Team, User} from "./dbObjects";
import {XMLElement} from "xmlbuilder";
import {Database} from "./database";

export class XmlGenerator {
    private static formatTime(minutes: number) {
        return Math.floor(minutes / 60).toString().padStart(2, "0") + ":" + (minutes % 60).toString().padStart(2, "0");
    }

    private static getXmlForTeam(t: Team, users: User[]): xmlbuilder.XMLElement {
        let obj = xmlbuilder.create("team");

        obj.att("name", t.name);
        obj.att("leader", t.leader.id);

        if (t.description != null)
            obj.ele("description", t.description);

        for (let usr of users) {
            obj.ele("memberDefinition")
                .att("id", usr.id)
                .att("name", usr.firstName + " " + usr.lastName);
        }
        return obj;
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

    public static getXmlWeekOverview(t: Team, users: User[], c: CachedJob[]) {
        let root = this.getXmlForWeek(c);
        root.importDocument(this.getXmlForTeam(t, users));

        root.dec({version: "1.0", encoding: "UTF-8"});
        root.dtd({sysID: "https://teamplanner.schimweg.net/teamplanner.dtd"});

        root.att("xmlns", "https://teamplanner.schimweg.net/teamplanner.dtd");

        return root.end({pretty: true});
    }
}