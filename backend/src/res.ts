
export class DbRes {
    public static CREATE_TEAMPLANNER_USERS: string = "CREATE TABLE IF NOT EXISTS `teamplanner_users` (" +
        "  `id` int(11) unsigned NOT NULL AUTO_INCREMENT," +
        "  `email` varchar(50) DEFAULT ''," +
        "  `first_name` tinytext," +
        "  `last_lame` tinytext," +
        "  `team` int(11) DEFAULT NULL," +
        "  PRIMARY KEY (`id`)," +
        "  KEY `email` (`email`)," +
        "  KEY `team` (`team`)" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;"
}

