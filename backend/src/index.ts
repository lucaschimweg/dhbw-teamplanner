import {Config} from "./config"
import {Database} from "./database";
import {SessionManager} from "./sessionManagement";
import {TeamplannerWebServer} from "./webserver";
import {JobScheduler} from "./jobScheduler";
import {XmlGenerator} from "./xmlGenerator";

(async () => {
    console.log("Starting Teamplanner-Server!");

    Config.loadConfigFrom("config.json");
    let connected = await Database.createWithProperties(Config.getInstance().getDatabaseConnectionProperties()).connect();
    if (!connected) {
        console.log("Could not connect DB!");
        return;
    }
    console.log("Connected DB!");

    SessionManager.initializeSessionManager();

    //let myusr = await Database.getInstance().createUser("l.schimweg@gmail.com", "Luca", "Schimweg", 1, SessionManager.hashPassword("5678"));

    //await Database.getInstance().updateUserPassword(myusr.id, SessionManager.hashPassword("5678"));

    const webserver = new TeamplannerWebServer();
    webserver.start();

    console.log("Server running!");


    //let x = await new JobScheduler(1).scheduleJobs();
    let jobs = await Database.getInstance().getCachedJobs(1, new Date("2019-06-30"), new Date("2019-07-02"));
    let team = await Database.getInstance().getTeamById(1);
    let usrs = await Database.getInstance().getUsersByTeam(1);

    if (team != null && usrs != null)
        console.log(XmlGenerator.getXmlWeekOverview(team, usrs, jobs));

})();