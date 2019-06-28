
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

    public static CREATE_TEAMPLANNER_JOBS: string = "CREATE TABLE IF NOT EXISTS `teamplanner_jobs` (\n" +
        "  `job_id` int(11) unsigned NOT NULL AUTO_INCREMENT,\n" +
        "  `team_id` int(11) unsigned NOT NULL,\n" +
        "  `name` varchar(50) DEFAULT NULL,\n" +
        "  `description` tinytext,\n" +
        "  `planned_duration` int(11) unsigned DEFAULT NULL,\n" +
        "  PRIMARY KEY (`job_id`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static CREATE_TEAMPLANNER_JOB_PARTICIPANTS: string = "CREATE TABLE IF NOT EXISTS `teamplanner_job_participants` (\n" +
        "  `job_id` int(11) unsigned NOT NULL,\n" +
        "  `user_id` int(11) unsigned NOT NULL,\n" +
        "  `duration` int(11) unsigned DEFAULT NULL,\n" +
        "  PRIMARY KEY (`job_id`,`user_id`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static CREATE_TEAMPLANNER_JOB_DEPENDENCIES: string = "CREATE TABLE IF NOT EXISTS `teamplanner_job_dependencies` (\n" +
        "  `job_parent` int(11) unsigned NOT NULL,\n" +
        "  `job_child` int(11) unsigned NOT NULL,\n" +
        "  PRIMARY KEY (`job_parent`,`job_child`)\n" +
        ") ENGINE=InnoDB DEFAULT CHARSET=utf8;";

    public static INSERT_USER: string = "INSERT INTO teamplanner_users (`email`, `first_name`, `last_name`, `team`, `start_time`, `end_time`) VALUES (?, ?, ?, ?, ?, ?);" +
        "SELECT LAST_INSERT_ID() as id";

    public static INSERT_USER_LOGIN: string = "INSERT INTO teamplanner_login (`email`, `password_hash`, `user_id`) VALUES (?, ?, ?)";

    public static SELECT_USERID_BY_LOGIN: string = "SELECT `user_id` from teamplanner_login WHERE `email`=? and `password_hash` = ?";

    public static SELECT_USER_BY_ID: string = "SELECT * from teamplanner_users WHERE `user_id`=?";

    public static SELECT_USER_BY_TEAM: string = "SELECT * from teamplanner_users WHERE `team`=?";

    public static UPDATE_USER_PW: string = "UPDATE teamplanner_login SET `password_hash` = ? WHERE `user_id` = ?";

    public static DELETE_USER: string = "DELETE FROM teamplanner_users WHERE `user_id` = ?; DELETE FROM teamplanner_login WHERE `user_id`= ?";

    public static SELECT_TEAM_BY_ID: string = "SELECT * FROM teamplanner_teams JOIN teamplanner_users ON `user_id` = `leader` WHERE `team_id` = ?";

    public static INSERT_TEAM: string = "INSERT INTO teamplanner_teams (`name`, `description`, `leader`) VALUES (?, ?, ?);" +
        "SELECT LAST_INSERT_ID() as id";

    public static SELECT_JOB_BY_ID: string = "SELECT * FROM teamplanner_jobs WHERE `job_id` = ?";

    public static INSERT_JOB: string = "INSERT INTO teamplanner_jobs (`team_id`, `name`, `description`, `planned_duration`) VALUES (?, ?, ?, ?);" +
        "SELECT LAST_INSERT_ID() as id";

    public static SELECT_JOB_PARTICIPANTS_BY_JOB: string = "SELECT * FROM teamplanner_job_participants JOIN teamplanner_users ON " +
        "teamplanner_job_participants .`user_id` = teamplanner_users.`user_id` WHERE `job_id` = ?";

    public static SELECT_JOB_PARTICIPANTS_BY_USER: string = "SELECT * FROM teamplanner_job_participants JOIN teamplanner_jobs ON " +
        "teamplanner_job_participants .`job_id` = teamplanner_jobs.`job_id` WHERE `user_id` = ?";

    public static INSERT_JOB_PARTICIPANT: string = "INSERT INTO teamplanner_job_participants (`job_id`, `user_id`) VALUES (?, ?);";

    public static UPDATE_JOB_PARTICIPANT: string = "UPDATE teamplanner_job_participants SET `duration`=? WHERE `job_id`=? and `user_id` = ?;";

    public static DELETE_JOB_PARTICIPANT: string = "DELETE FROM teamplanner_job_participants WHERE `job_id`=? and `user_id` = ?;";

    public static INSERT_JOB_DEPENDENCY: string = "INSERT INTO teamplanner_job_dependencies (`job_parent`, `job_child`) VALUES (?, ?);"

    public static DELETE_JOB_DEPENDENCY: string = "DELETE FROM teamplanner_job_dependencies WHERE `job_parent`=? and `job_child` = ?;";

    public static SELECT_JOB_PARENTS: string = "SELECT job_parent FROM teamplanner_job_dependencies WHERE `job_child` = ?;";

    public static SELECT_JOB_CHILDREN: string = "SELECT job_child FROM teamplanner_job_dependencies WHERE `job_parent` = ?;";

}

