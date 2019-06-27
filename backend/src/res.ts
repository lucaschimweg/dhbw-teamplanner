
export class DbRes {

    public static CREATE_TEAMPLANNER_LOGIN: string = "CREATE TABLE IF NOT EXISTS `teamplanner_login` (\n" +
        "  `email` varchar(64) NOT NULL DEFAULT '',\n" +
        "  `password_hash` varchar(64) NOT NULL,\n" +
        "  `user_id` int(11) unsigned NOT NULL,\n" +
        "  PRIMARY KEY (`email`,`password_hash`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static CREATE_TEAMPLANNER_USERS: string = "CREATE TABLE IF NOT EXISTS `teamplanner_users` (\n" +
        "  `user_id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n" +
        "  `email` varchar(50) DEFAULT '',\n" +
        "  `first_name` tinytext,\n" +
        "  `last_name` tinytext,\n" +
        "  `team` int(11) unsigned NOT NULL,\n" +
        "  `start_time` int(11) unsigned NOT NULL,\n" +
        "  `end_time` int(11) unsigned NOT NULL,\n" +
        "  PRIMARY KEY (`user_id`),\n" +
        "  KEY `team` (`team`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static CREATE_TEAMPLANNER_TEAMS: string = "CREATE TABLE IF NOT EXISTS `teamplanner_teams` (\n" +
        "  `team_id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n" +
        "  `name` varchar(50) DEFAULT NULL,\n" +
        "  `description` tinytext,\n" +
        "  `start` timestamp NULL DEFAULT CURRENT_TIMESTAMP,\n" +
        "  `leader` int(11) unsigned NOT NULL,\n" +
        "  PRIMARY KEY (`team_id`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static INSERT_TEAMPLANNER_USER: string = "INSERT INTO teamplanner_users (`email`, `first_name`, `last_name`, `team`, `start_time`, `end_time`) VALUES (?, ?, ?, ?, ?, ?);" +
        "SELECT LAST_INSERT_ID() as id";

    public static INSERT_TEAMPLANNER_USER_LOGIN: string = "INSERT INTO teamplanner_login (`email`, `password_hash`, `user_id`) VALUES (?, ?, ?)";

    public static SELECT_TEAMPLANNER_USERID_BY_LOGIN: string = "SELECT `user_id` from teamplanner_login WHERE `email`=? and `password_hash` = ?";

    public static SELECT_TEAMPLANNER_USER_BY_ID: string = "SELECT * from teamplanner_users WHERE `user_id`=?";

    public static SELECT_TEAMPLANNER_USER_BY_TEAM: string = "SELECT * from teamplanner_users WHERE `team`=?";

    public static UPDATE_TEAMPLANNER_USER_PW: string = "UPDATE teamplanner_login SET `password_hash` = ? WHERE `user_id` = ?";

    public static DELETE_TEAMPLANNER_USER: string = "DELETE FROM teamplanner_users WHERE `user_id` = ?; DELETE FROM teamplanner_login WHERE `user_id`= ?";

    public static SELECT_TEAMPLANNER_TEAM_BY_ID: string = "SELECT * FROM teamplanner_teams JOIN teamplanner_users ON `user_id` = `leader` WHERE `team_id` = ?";

    public static INSERT_TEAMPLANNER_TEAM: string = "INSERT INTO teamplanner_teams(`name`, `description`, `leader`) VALUES (?, ?, ?);" +
        "SELECT LAST_INSERT_ID() as id";

}

