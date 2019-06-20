import {Config} from "./config"
import {Database} from "./database";
import {SessionManager} from "./sessionManagement";

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

    //let myusr = await Database.getInstance().createUser("l.schimweg@gmail.com", "Luca", "Schimweg", 1, SessionManager.hashPassword("1234"));

    //await Database.getInstance().updateUserPassword(myusr.id, SessionManager.hashPassword("5678"));

    let usr = await SessionManager.getInstance().loginUser("l.schimweg@gmail.com", "5678");
    if (usr == null) {
        console.log("Could not log in user!");
    } else {
        console.log(usr[1].firstName);
    }

    //console.log(await Database.getInstance().getUsersByTeam(1));



    /*console.log("Closing server!");
    await Database.getInstance().disconnect();*/

})();