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

    const webserver = new TeamplannerWebServer();
    webserver.start();

    console.log("Server running!");

})();