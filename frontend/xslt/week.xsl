<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:n="https://teamplanner.schimweg.net/dtd/teamplanner.dtd" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

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
                        <div class="job">
                            <xsl:value-of select="@name"/><br/>
                            <xsl:value-of select="@timeFrom"/><br/> - <br/>
                            <xsl:value-of select="@timeTo"/>
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