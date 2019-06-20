
export class DbRes {

    public static CREATE_TEAMPLANNER_LOGIN: string = "CREATE TABLE IF NOT EXISTS `teamplanner_login` (\n" +
        "  `email` varchar(64) NOT NULL DEFAULT '',\n" +
        "  `password_hash` varchar(64) NOT NULL,\n" +
        "  `id` int(11) unsigned NOT NULL,\n" +
        "  PRIMARY KEY (`email`,`password_hash`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static CREATE_TEAMPLANNER_USERS: string = "CREATE TABLE IF NOT EXISTS `teamplanner_users` (\n" +
        "  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n" +
        "  `email` varchar(50) DEFAULT '',\n" +
        "  `first_name` tinytext,\n" +
        "  `last_name` tinytext,\n" +
        "  `team` int(11) DEFAULT NULL,\n" +
        "  PRIMARY KEY (`id`),\n" +
        "  KEY `team` (`team`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static INSERT_TEAMPLANNER_USER: string = "INSERT INTO teamplanner_users (`email`, `first_name`, `last_name`, `team`) VALUES (?, ?, ?, ?);" +
        "SELECT LAST_INSERT_ID() as id";

    public static INSERT_TEAMPLANNER_USER_LOGIN: string = "INSERT INTO teamplanner_login (`email`, `password_hash`, `id`) VALUES (?, ?, ?)";

    public static SELECT_TEAMPLANNER_USERID_BY_LOGIN: string = "SELECT `id` from teamplanner_login WHERE `email`=? and `password_hash` = ?";

    public static SELECT_TEAMPLANNER_USER_BY_ID: string = "SELECT `id`, `email`, `first_name`, `last_name`, `team` from teamplanner_users WHERE `id`=?";

    public static SELECT_TEAMPLANNER_USER_BY_TEAM: string = "SELECT `id`, `email`, `first_name`, `last_name`, `team` from teamplanner_users WHERE `team`=?";

    public static UPDATE_TEAMPLANNER_USER_PW: string = "UPDATE teamplanner_login SET `password_hash` = ? WHERE `id` = ?";

    public static DELETE_TEAMPLANNER_USER: string = "DELETE FROM teamplanner_users WHERE `id` = ?; DELETE FROM teamplanner_login WHERE `id`= ?";


}

