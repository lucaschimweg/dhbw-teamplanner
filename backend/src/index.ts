import {Config} from "./config"
import {Database} from "./database";
import {SessionManager} from "./sessionManagement";
import {TeamplannerWebServer} from "./webserver";

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

    let usr = await SessionManager.getInstance().loginUser("l.schimweg@gmail.com", "5678");
    if (usr == null) {
        console.log("Could not log in user!");
        return;
    }
    console.log("logged in as " + usr[1].firstName);

    console.log("Jobs for user: ");
    console.log(await Database.getInstance().getJobsForUser(usr[1].id));

    //await Database.getInstance().addJobDependency(1, 2);
    //await Database.getInstance().addJobDependency(1, 3);

    console.log(await Database.getInstance().getChildJobs(1));
    console.log(await Database.getInstance().getParentJobs(2));
    //await Database.getInstance().deleteJobDependency(1, 3);
    //let team = await Database.getInstance().createTeam("Hammerteam!", "Das hier ist das beste Team überhaupt!", usr[1].id);
    /*if ( team == null ) {
        console.log("could not create team!");
        return;
    }*/

    //let jb = await Database.getInstance().createJob(team.id, "Implementation", "Implementiere halt", 180);

    //let u = await Database.getInstance().createUser("hleier@gmail.com", "Hendrik", "Leier", usr[1].teamId, SessionManager.hashPassword("1234"));
    //await Database.getInstance().addParticipantToJob(1, u.id);

    //console.log(await Database.getInstance().getJobById(1));
    //console.log(await Database.getInstance().getParticipantsForJob(1));


    //console.log("created team " + team.name);


    //console.log(await Database.getInstance().getUsersByTeam(1));



    /*console.log("Closing server!");
    await Database.getInstance().disconnect();*/

    const webserver = new TeamplannerWebServer();
    webserver.start();

    console.log("Server running!");

})();