<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:n="https://planner.schimweg.net/dtd/teamplanner.dtd" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<xsl:template match="n:week">
		<html>
            <link rel="stylesheet" type="text/css" href="css/week.css" />
			<body>
            <div class="title">
            <h1><xsl:value-of select="//n:team/@name"/></h1>
            </div>
            <div class="content">
            <xsl:variable name="working_minutes" select="1440"/> 

            <xsl:for-each select="//n:day">
                <div class="day">

                <xsl:attribute name="style">left:<xsl:value-of select="(position() - 1) * (100 div 7)"/>%;</xsl:attribute>
                
                <div class="date"> <xsl:value-of select="@date"/></div>
                    <xsl:for-each select=".//n:job">
                        <xsl:variable name="start_hours" select="number(substring-before(@timeFrom,':'))"/>
                        <xsl:variable name="start_minutes" select="number(substring-after(@timeFrom,':'))"/>
                        <xsl:variable name="time_start_minutes" select="$start_hours * 60 + $start_minutes"/>
                        
                        <xsl:variable name="end_hours" select="number(substring-before(@timeTo,':'))"/>
                        <xsl:variable name="end_minutes" select="number(substring-after(@timeTo,':'))"/>
                        <xsl:variable name="time_end_minutes" select="$end_hours * 60 + $end_minutes"/>

                        <xsl:variable name="time_taken" select="$time_end_minutes - $time_start_minutes"/>
                        
                        <div class="job">
                            <xsl:attribute name="style">
                            top:calc(<xsl:value-of select="($time_start_minutes div $working_minutes) * 100"/>% + 1px);
                            height:calc(<xsl:value-of select="($time_taken div $working_minutes) * 100"/>% - 2px);
                            </xsl:attribute>
                            <xsl:value-of select="@name"/><br/>
                        </div>
                        <!--<li><xsl:value-of select="@name"/></li>!-->
                    </xsl:for-each>
                </div>
            </xsl:for-each>
            </div>
			</body>
		</html>
	</xsl:template>

</xsl:stylesheet>