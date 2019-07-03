<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:template match="/">
        <html>
            <body>
                <h2>Week Overview</h2>
                <table border="1">
                    <tr bgcolor="green">
                        <th>Name</th>
                        <th>ID</th>
                    </tr>
                </table>
                <xsl:for-each select="week/day">
                    <xsl:value-of select="date" />
                </xsl:for-each>
            </body>
        </html>
    </xsl:template>

</xsl:stylesheet>