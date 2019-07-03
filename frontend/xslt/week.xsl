<?xml version="1.0"?>

<xsl:stylesheet version="1.0" xmlns:n="https://planner.schimweg.net/dtd/teamplanner.dtd" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="html" encoding="UTF-8" indent="yes" />

<xsl:template match="n:week">
    <html>
        <body>

            <h1><xsl:value-of select="//n:team/@name"/></h1>
            <ul>
                <xsl:for-each select="//n:day">
                    <li><xsl:value-of select="@date"/>
                        <ul>
                            <xsl:for-each select=".//n:job">
                                <li><xsl:value-of select="@name"/></li>
                            </xsl:for-each>
                        </ul>
                    </li>
                </xsl:for-each>
            </ul>
            <!--
				<xsl:for-each select="movie">
					<xsl:value-of select="title"/><br />
					<xsl:value-of select="genre"/><br />
					<xsl:value-of select="year"/><br />
				</xsl:for-each>
            !-->
        </body>
    </html>
</xsl:template>

</xsl:stylesheet>