<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:n="https://planner.schimweg.net/dtd/teamplanner.dtd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml">
	<xsl:output method="xml" encoding="UTF-8" indent="yes" />
    <xsl:template match="n:week">
		<html>
            <head>
                <link rel="stylesheet" type="text/css" href="/css/week.css" />
                <link href="https://fonts.googleapis.com/css?family=Muli:300&amp;display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css?family=Open+Sans&amp;display=swap" rel="stylesheet" />
            </head>
			<body>
                <div class="title">
                    <img src="/img/logo_white.png" id="logo" />
                    <div id="teamName"><xsl:value-of select="//n:team/@name"/></div>
                </div>
                <div class="content">
                    <div id="timeline">
                        <xsl:call-template name="timeStripRecursive">
                            <xsl:with-param name="currentHour" select="1" />
                        </xsl:call-template>
                    </div>
                    <xsl:for-each select="//n:day">
                        <div class="day">
                        <xsl:variable name="dayPos" select="position()"/>

                        <div class="date"> <xsl:value-of select="@date"/> </div>
                            <div class="jobContainer">
                                <xsl:for-each select=".//n:job|.//n:jobContinuation">
                                    <xsl:choose>
                                        <xsl:when test="name() = 'job'">
                                            <xsl:call-template name="jobObject">
                                                <xsl:with-param name="id" select="@id" />
                                                <xsl:with-param name="name" select="@name" />
                                                <xsl:with-param name="timeFrom" select="@timeFrom" />
                                                <xsl:with-param name="timeTo" select="@timeTo" />
                                                <xsl:with-param name="duration" select="@duration" />
                                                <xsl:with-param name="dayPos" select="$dayPos" />
                                            </xsl:call-template>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:call-template name="jobObject">
                                                <xsl:with-param name="id" select="@job" />
                                                <xsl:with-param name="name" select="//n:job[@id=current()/@job]/@name" />
                                                <xsl:with-param name="timeFrom" select="@timeFrom" />
                                                <xsl:with-param name="timeTo" select="@timeTo" />
                                                <xsl:with-param name="duration" select="//n:job[@id=current()/@job]/@duration" />
                                                <xsl:with-param name="dayPos" select="$dayPos" />
                                            </xsl:call-template>
                                        </xsl:otherwise>
                                    </xsl:choose>
                                </xsl:for-each>
                            </div>
                        </div>
                    </xsl:for-each>
                </div>
			</body>
		</html>
	</xsl:template>

    <!-- Darstellung eines Termins -->

    <xsl:template name="jobObject">
        <xsl:param name="id" />
        <xsl:param name="name" />
        <xsl:param name="duration" />
        <xsl:param name="timeFrom" />
        <xsl:param name="timeTo" />
        <xsl:param name="dayPos" />

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
                <label for="duration">Dauer </label>
                <input type="number" id="duration" name="duration">
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
                <label for="duration"> min</label>
                <input type="submit" value="save" />
            </form>
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

</xsl:stylesheet>