<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:n="https://planner.schimweg.net/dtd/teamplanner.dtd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml">
    <xsl:output method="xml" encoding="UTF-8" indent="yes" />
    <xsl:template match="n:teamOverview">
        <html lang="en">
            <head>
                <link rel="stylesheet" type="text/css" href="/css/team.css" />
                <link rel="stylesheet" type="text/css" href="/css/header.css" />
                <link rel="icon" href="/img/favicon.png" type="image/png" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Muli:300&amp;display=swap" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans&amp;display=swap" />
                <title><xsl:value-of select="//n:team/@name"/> - week overview</title>
            </head>
            <body>
                <div id="title">
                    <img src="/img/logo_white.png" id="logo" />
                    <div id="teamName"><xsl:value-of select="//n:team/@name"/></div>
                    <div id="navigator">
                        <a class="navigatorButton">
                            <xsl:attribute name="href">/week?offset=<xsl:value-of select="//n:week/@offset - 1" /></xsl:attribute>
                            <img src="/img/previous.svg" />
                        </a>
                        <a class="navigatorButton">
                            <xsl:attribute name="href">/week?offset=0</xsl:attribute>
                            <img src="/img/current.svg" />
                        </a>
                        <a class="navigatorButton">
                            <xsl:attribute name="href">/week?offset=<xsl:value-of select="//n:week/@offset + 1" /></xsl:attribute>
                            <img src="/img/next.svg" />
                        </a>
                    </div>

                    <div id="userArea">
                        Logged in as
                        <b><xsl:value-of select="//n:team/n:memberDefinition[@you='true']/@name" /></b>
                        (<a href="/api/doLogout">Logout</a>)
                    </div>
                </div>
                <div id="content">
                    <div id="teamMembers">
                        <xsl:for-each select="n:team/n:memberDefinition">
                            <div class="teamMemberElement teamMember">
                                <xsl:value-of select="current()/@name" />
                                <xsl:if test="not(current()/@leader = 'true')">
                                    <form method="post" action="/api/deleteTeamUser">
                                        <input type="hidden" name="user">
                                            <xsl:attribute name="value"><xsl:value-of select="@id" /></xsl:attribute>
                                        </input>
                                        <input type="submit" value=""/>
                                    </form>
                                </xsl:if>
                            </div>
                        </xsl:for-each>
                        <div class="teamMemberElement" id="addTeamMember">
                            Add Member...
                        </div>
                        <div class="arrow_box" id="addTeamMemberPane">
                            <form action="/api/teamUser" method="post">
                                <input type="text" name="firstname" class="inputName" placeholder="First Name"/>
                                <input type="text" name="lastname" class="inputName" placeholder="Last Name"/>
                                <br />
                                <label for="inputMail" >E-Mail: </label>
                                <input type="text" name="mail" id="inputMail" placeholder="E-Mail"/>
                                <br />
                                <label for="inputPassword" >Initial Password: </label>
                                <input type="password" name="password" id="inputPassword"/>
                                <br />
                                <input type="submit" value="Add" />
                            </form>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>

    <!-- Darstellung eines Termins -->

    <xsl:template name="jobObject">
        <xsl:param name="id" />
        <xsl:param name="name" />
        <xsl:param name="description" />
        <xsl:param name="duration" />
        <xsl:param name="timeFrom" />
        <xsl:param name="timeTo" />
        <xsl:param name="dayPos" />
        <xsl:param name="members" />

        <xsl:variable name="working_minutes" select="1440"/>
        <xsl:variable name="start_hours" select="number(substring-before($timeFrom,':'))"/>
        <xsl:variable name="start_minutes" select="number(substring-after($timeFrom,':'))"/>
        <xsl:variable name="time_start_minutes" select="$start_hours * 60 + $start_minutes"/>

        <xsl:variable name="end_hours" select="number(substring-before($timeTo,':'))"/>
        <xsl:variable name="end_minutes" select="number(substring-after($timeTo,':'))"/>
        <xsl:variable name="time_end_minutes" select="$end_hours * 60 + $end_minutes"/>

        <xsl:variable name="time_taken" select="$time_end_minutes - $time_start_minutes"/>

        <!-- Darstellung der Jobs im Kalender -->

        <div class="job">
            <xsl:attribute name="style">
                top:calc(<xsl:value-of select="($time_start_minutes div $working_minutes) * 100"/>% + 1px);
                height:calc(<xsl:value-of select="($time_taken div $working_minutes) * 100"/>% - 2px);
            </xsl:attribute>
            <p class="jobName">
                <xsl:value-of select="$name"/>
            </p>

        </div>

        <!-- Darstellung der Popup boxen -->

        <div>
            <xsl:attribute name="style">
                top:calc(<xsl:value-of select="($time_start_minutes div $working_minutes + ($time_taken div $working_minutes) div 2) * 100"/>%);
            </xsl:attribute>
            <xsl:choose>
                <xsl:when test="$dayPos > 4">
                    <xsl:attribute name="class">jobDescr description_left arrow_box_left</xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="class">jobDescr description_right arrow_box</xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>

            <p class="jobDescrTitle"><xsl:value-of select="$name" /></p>
            <p class="jobDescrTime">
                <xsl:value-of select="../@date" />,
                <xsl:value-of select="$timeFrom" /> -
                <xsl:value-of select="$timeTo" />
            </p>

            <form action="/api/jobDuration" method="post">
                <input type="number" class="durationInput" name="duration">
                    <xsl:attribute name="value">
                        <xsl:value-of select="$duration" />
                    </xsl:attribute>
                </input>
                <input type="hidden" name="id">
                    <xsl:attribute name="value"><xsl:value-of select="$id" /></xsl:attribute>
                </input>
                <input type="hidden" name="offset">
                    <xsl:attribute name="value"><xsl:value-of select="//n:week/@offset" /></xsl:attribute>
                </input>
                <label for="duration" class="durationMinLabel"> min</label>
                <input type="submit" class="durationSaveButton" value=""/>
            </form>
            <p class="jobDescrDescription"><xsl:value-of select="$description" /></p>
            <ul class="memberList">
                <xsl:for-each select="$members">
                    <li><xsl:value-of select="//n:week/n:team/n:memberDefinition[@id=current()/@id]/@name" /></li>
                </xsl:for-each>
            </ul>
        </div>

    </xsl:template>

    <xsl:template name="timeStripRecursive">
        <xsl:param name="currentHour" />

        <xsl:choose>
            <xsl:when test="$currentHour mod 2 = 0">
                <p class="timeValue">
                    <xsl:attribute name="style">
                        top:calc(<xsl:value-of select="($currentHour div 24) * 100"/>%);
                    </xsl:attribute>
                    <xsl:value-of select="$currentHour"/>
                </p>
                <div class="timeStrip">
                    <xsl:attribute name="style">
                        top:calc(<xsl:value-of select="($currentHour div 24) * 100"/>%);
                    </xsl:attribute>
                </div>
            </xsl:when>
            <xsl:otherwise>
                <div class="timeStripSmall">
                    <xsl:attribute name="style">
                        top:calc(<xsl:value-of select="($currentHour div 24) * 100"/>%);
                    </xsl:attribute>
                </div>
            </xsl:otherwise>
        </xsl:choose>


        <xsl:if test="$currentHour != 23">
            <xsl:call-template name="timeStripRecursive">
                <xsl:with-param name="currentHour" select="$currentHour + 1" />
            </xsl:call-template>
        </xsl:if>

    </xsl:template>

    <xsl:template name="numberToMonth">
        <xsl:param name="number" />
        <xsl:choose>
            <xsl:when test="$number=1">Jan</xsl:when>
            <xsl:when test="$number=2">Feb</xsl:when>
            <xsl:when test="$number=3">Mar</xsl:when>
            <xsl:when test="$number=4">Apr</xsl:when>
            <xsl:when test="$number=5">May</xsl:when>
            <xsl:when test="$number=6">Jun</xsl:when>
            <xsl:when test="$number=7">Jul</xsl:when>
            <xsl:when test="$number=8">Aug</xsl:when>
            <xsl:when test="$number=9">Sep</xsl:when>
            <xsl:when test="$number=10">Oct</xsl:when>
            <xsl:when test="$number=11">Nov</xsl:when>
            <xsl:when test="$number=12">Dec</xsl:when>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>