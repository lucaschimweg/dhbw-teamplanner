import {Config} from "./config"
import {Database} from "./database";
import {SessionManager} from "./sessionManagement";
import {TeamplannerWebServer} from "./webserver";

(async () => {
    console.log("Starting Teamplanner-Server!");

    console.log("Loading config...");
    Config.loadConfigFrom("config.json");

    console.log("Loaded config! Connecting DB!");
    let connected = await Database.createWithProperties(Config.getInstance().getDatabaseConnectionProperties()).connect();
    if (!connected) {
        console.log("Could not connect DB!");
        return;
    }
    console.log("Connected DB!");

    SessionManager.initializeSessionManager();

    console.log("Starting WebServer on Port " + Config.getInstance().getWebServerConfig().port + "!");

    const webServer = new TeamplannerWebServer();
    webServer.start();

    console.log("Server running!");

})();