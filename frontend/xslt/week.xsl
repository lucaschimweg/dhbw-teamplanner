<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:n="https://planner.schimweg.net/dtd/teamplanner.dtd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml">
	<xsl:output method="xml" encoding="UTF-8" indent="yes" />
    <xsl:template match="n:week">
		<html lang="en">
            <head>
                <link rel="stylesheet" type="text/css" href="/css/week.css" />
                <link rel="stylesheet" type="text/css" href="/css/header.css" />
                <link rel="icon" href="/img/favicon.png" type="image/png" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Muli:300&amp;display=swap" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans&amp;display=swap" />
                <script src="/js/week.js" type="text/javascript" />
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

                    <xsl:if test="//n:week/n:team/n:memberDefinition[@you='true'][@leader='true']">
                        <div id="changeViewButton">
                            <a class="navigatorButton" href="/team">
                                <img src="/img/edit.svg" />
                            </a>
                        </div>

                    </xsl:if>

                    <div id="userArea">
                        Logged in as
                        <b><xsl:value-of select="//n:week/n:team/n:memberDefinition[@you='true']/@name" /></b>
                        (<a href="/api/doLogout">Logout</a>)
                    </div>
                </div>
                <div id="content">
                    <div id="scrollPane">
                        <div id="contentHeader">
                            <div id="contentHeaderSpacer" />
                            <xsl:for-each select="//n:day">
                                <xsl:variable name="monthday" select="substring-after(@date,'-')"/>
                                <xsl:variable name="month" select="number(substring-before($monthday,'-'))"/>
                                <xsl:variable name="day" select="number(substring-after($monthday,'-'))"/>
                                <div class="date">
                                    <xsl:if test="@today='true'">
                                        <xsl:attribute name="class">date today</xsl:attribute>
                                    </xsl:if>
                                    <p class="dateDay">
                                        <xsl:value-of select="$day"/>
                                    </p>
                                    <p class="dateMonth">
                                        <xsl:call-template name="numberToMonth">
                                            <xsl:with-param name="number" select="$month" />
                                        </xsl:call-template>
                                    </p>
                                </div>

                            </xsl:for-each>
                        </div>
                        <div id="scrollingContent">
                            <div id="timeline">
                                <xsl:call-template name="timeStripRecursive">
                                    <xsl:with-param name="currentHour" select="1" />
                                </xsl:call-template>
                            </div>

                            <xsl:for-each select="//n:day">
                                <div class="day">
                                    <xsl:variable name="dayPos" select="position()"/>
                                    <xsl:if test="@today='true'">
                                        <xsl:attribute name="class">day today</xsl:attribute>
                                    </xsl:if>
                                    <div class="jobContainer">
                                        <xsl:if test="@today='true'">
                                            <div id="currentTimeIndicator">
                                                <div id="currentTimeBall" />
                                            </div>
                                        </xsl:if>
                                        <xsl:for-each select=".//n:job|.//n:jobContinuation">
                                            <xsl:choose>
                                                <xsl:when test="name() = 'job'">
                                                    <xsl:call-template name="jobObject">
                                                        <xsl:with-param name="id" select="@id" />
                                                        <xsl:with-param name="name" select="@name" />
                                                        <xsl:with-param name="description" select="n:description" />
                                                        <xsl:with-param name="timeFrom" select="@timeFrom" />
                                                        <xsl:with-param name="timeTo" select="@timeTo" />
                                                        <xsl:with-param name="duration" select="@duration" />
                                                        <xsl:with-param name="dayPos" select="$dayPos" />
                                                        <xsl:with-param name="members" select="n:member" />
                                                    </xsl:call-template>
                                                </xsl:when>
                                                <xsl:otherwise>
                                                    <xsl:call-template name="jobObject">
                                                        <xsl:with-param name="id" select="@job" />
                                                        <xsl:with-param name="name" select="//n:job[@id=current()/@job]/@name" />
                                                        <xsl:with-param name="description" select="//n:job[@id=current()/@job]/n:description" />
                                                        <xsl:with-param name="timeFrom" select="@timeFrom" />
                                                        <xsl:with-param name="timeTo" select="@timeTo" />
                                                        <xsl:with-param name="duration" select="//n:job[@id=current()/@job]/@duration" />
                                                        <xsl:with-param name="dayPos" select="$dayPos" />
                                                        <xsl:with-param name="members" select="//n:job[@id=current()/@job]/n:member" />
                                                    </xsl:call-template>
                                                </xsl:otherwise>
                                            </xsl:choose>
                                        </xsl:for-each>
                                    </div>
                                </div>
                            </xsl:for-each>
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
            <xsl:if test="$description != ''">
                <pre class="jobDescrDescription"><xsl:value-of select="$description" /></pre>
            </xsl:if>
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