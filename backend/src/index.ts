import {Config} from "./config"
import {Database} from "./database";

(async () => {
    console.log("Starting Teamplanner-Server!");

    Config.loadConfigFrom("config.json");
    let connected = await Database.createWithProperties(Config.getInstance().getDatabaseConnectionProperties()).connect();
    if (!connected) {
        console.log("Could not connect DB!");
        return;
    }
    console.log("Connected DB!");

    // let user = await Database.getInstance().createUser("l.schimweg@gmail.com", "Luca", "Schimweg", 1, "12091u823");

    console.log("Closing server!");
    await Database.getInstance().disconnect();

})();