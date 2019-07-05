<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:n="https://planner.schimweg.net/dtd/teamplanner.dtd" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="xml" encoding="UTF-8" indent="yes" />
    <xsl:template match="n:week">
		<html>
            <link rel="stylesheet" type="text/css" href="/css/week.css" />
			<body>
                <div class="title">
                    <h1><xsl:value-of select="//n:team/@name"/></h1>
                </div>
                <div class="content">
                    <xsl:variable name="working_minutes" select="1440"/> 

                    <xsl:for-each select="//n:day">
                        <div class="day">
                        <xsl:variable name="p" select="position()"/>
                        <xsl:attribute name="style">left:<xsl:value-of select="(position() - 1) * (100 div 7)"/>%;</xsl:attribute>
                        
                        <div class="date"> <xsl:value-of select="@date"/></div>
                            <xsl:for-each select=".//n:job|.//n:jobContinuation">
                                <xsl:variable name="start_hours" select="number(substring-before(@timeFrom,':'))"/>
                                <xsl:variable name="start_minutes" select="number(substring-after(@timeFrom,':'))"/>
                                <xsl:variable name="time_start_minutes" select="$start_hours * 60 + $start_minutes"/>
                                
                                <xsl:variable name="end_hours" select="number(substring-before(@timeTo,':'))"/>
                                <xsl:variable name="end_minutes" select="number(substring-after(@timeTo,':'))"/>
                                <xsl:variable name="time_end_minutes" select="$end_hours * 60 + $end_minutes"/>

                                <xsl:variable name="time_taken" select="$time_end_minutes - $time_start_minutes"/>

                                <!-- Darstellung der Jobs im Kalender -->

                                <div class="job">
                                    <xsl:attribute name="style">
                                        top:calc(<xsl:value-of select="($time_start_minutes div $working_minutes) * 100"/>% + 1px);
                                        height:calc(<xsl:value-of select="($time_taken div $working_minutes) * 100"/>% - 2px);
                                    </xsl:attribute>

                                    <xsl:if test="name() = 'job'">
                                        <xsl:value-of select="@name"/><br/>
                                    </xsl:if>

                                    <xsl:if test="name() = 'jobContinuation'">
                                        <xsl:value-of select="//n:job[@id=current()/@job]/@name"/><br/>
                                    </xsl:if>
                                </div>

                                <!-- Darstellung der Popup boxen -->

                                <div>
                                    <xsl:attribute name="style">
                                        top:calc(<xsl:value-of select="($time_start_minutes div $working_minutes) * 100"/>% + 1px + calc(-15ex + <xsl:value-of select="($time_taken div $working_minutes) * 100 div 2"/>%) - 2px);
                                    </xsl:attribute>
                                    <xsl:choose>
                                        <xsl:when test="$p > 4">
                                            <xsl:attribute name="class">description_left arrow_box_left</xsl:attribute>
                                        </xsl:when>
                                        <xsl:otherwise>
                                            <xsl:attribute name="class">description_right arrow_box</xsl:attribute>
                                        </xsl:otherwise>
                                    </xsl:choose>

                                    <form>
                                        <label for="duration">Dauer </label>
                                        <input type="number" id="duration">
                                            <xsl:attribute name="value">
                                            <xsl:choose>
                                            <xsl:when test="name() = 'job'">
                                                <xsl:value-of select="@duration"/><br/>
                                            </xsl:when>
                                            <xsl:when test="name() = 'jobContinuation'">
                                                <xsl:value-of select="//n:job[@id=current()/@job]/@duration"/><br/>
                                            </xsl:when>
                                            </xsl:choose>
                                            </xsl:attribute>
                                        </input>
                                        <label for="duration"> min</label>
                                    </form>
                                </div>
                            </xsl:for-each>
                        </div>
                    </xsl:for-each>
                </div>
			</body>
		</html>
	</xsl:template>

</xsl:stylesheet>