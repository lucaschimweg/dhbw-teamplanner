
export class DbRes {
    public static CREATE_TEAMPLANNER_USERS: string = "CREATE TABLE IF NOT EXISTS `teamplanner_users` (\n" +
        "  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n" +
        "  `email` varchar(50) DEFAULT '',\n" +
        "  `password_hash` varchar(64) DEFAULT NULL,\n" +
        "  `first_name` tinytext,\n" +
        "  `last_name` tinytext,\n" +
        "  `team` int(11) DEFAULT NULL,\n" +
        "  PRIMARY KEY (`id`),\n" +
        "  KEY `team` (`team`),\n" +
        "  KEY `loginkey` (`email`,`password_hash`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static INSERT_TEAMPLANNER_USER: string = "INSERT INTO teamplanner_users (`email`, `password_hash`, `first_name`, `last_name`, `team`) VALUES (?, ?, ?, ?, ?);" +
        "SELECT LAST_INSERT_ID()";

    public static SELECT_TEAMPLANNER_USER_BY_LOGIN: string = "SELECT `id`, `email`, `first_name`, `last_name`, `team` from teamplanner_users WHERE `email`=? and `password_hash`=?"
}

