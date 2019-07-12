<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:n="/dtd/management.dtd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml">
    <xsl:output method="xml" encoding="UTF-8" indent="yes" />
    <xsl:template match="n:overview">
        <html>
            <head>
                <title>Management</title>
                <link type="text/css" rel="stylesheet" href="/css/management.css"/>
            </head>
            <body>
                <div class="users">
                    <h3>Team Mitglieder</h3>
                    <ul>
                        <xsl:apply-templates select="//n:team/n:memberDefinition"/>
                    </ul>
                </div>
                <div class="graph">
                        <xsl:apply-templates select="//n:jobDefinition[@planned='true']"/>
                        <xsl:call-template name="drawRelations"/>
                </div>
                <div class="not_assigned">
                    <xsl:apply-templates select="//n:jobDefinition[@planned='false']"/>
                </div>
            </body>

        </html>
    </xsl:template>

    <xsl:template match="//n:jobDefinition[@planned='false']">
        <div class="jobElement unplanned_job">
            <xsl:value-of select="@name"/>
        </div>
    </xsl:template>


    <xsl:template match="n:memberDefinition">
        <li><xsl:value-of select="@name"/></li>
    </xsl:template>

    <xsl:template match="n:jobDefinition[@planned='true']">
        <xsl:call-template name="drawJob">
            <xsl:with-param name="jobId" select="@id"/>
        </xsl:call-template>
    </xsl:template>


    <xsl:template name="drawJob">
        <xsl:param name="jobId"/>
        <xsl:variable name="depth">
            <xsl:call-template name="JobRecursion">
                <xsl:with-param name="jobId" select="@id"/>
            </xsl:call-template>
        </xsl:variable>

        <xsl:variable name="x_val">
            <xsl:call-template name="getXPosFor">
                <xsl:with-param name="jobId" select="@id"/>
            </xsl:call-template>
        </xsl:variable>

        <div class="jobElement planned_job">
            <xsl:attribute name="style">
                left: calc((200px + 50px) * <xsl:value-of select="$x_val"/>);
                top: calc((50px + 50px) * <xsl:value-of select="$depth"/> + 5px);
            </xsl:attribute>

            <xsl:value-of select="//n:jobDefinition[@id=$jobId]/@name"/>
        </div>

    </xsl:template>
    
    <xsl:template name="drawRelations">
        <svg class="bg_im" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <xsl:for-each select="//n:jobDefinition[@planned='true']">

                <xsl:variable name="s_depth">
                    <xsl:call-template name="JobRecursion">
                        <xsl:with-param name="jobId" select="@id"/>
                    </xsl:call-template>
                </xsl:variable>

                <xsl:variable name="s_x_val">
                    <xsl:call-template name="getXPosFor">
                        <xsl:with-param name="jobId" select="@id"/>
                    </xsl:call-template>
                </xsl:variable>


                <xsl:for-each select="current()/n:dependsOn">
                    <xsl:variable name="e_depth">
                        <xsl:call-template name="JobRecursion">
                            <xsl:with-param name="jobId" select="@id"/>
                        </xsl:call-template>
                    </xsl:variable>

                    <xsl:variable name="e_x_val">
                        <xsl:call-template name="getXPosFor">
                            <xsl:with-param name="jobId" select="@id"/>
                        </xsl:call-template>
                    </xsl:variable>

                    <line style="stroke:rgb(0,128,128);stroke-width:2">
                        <xsl:attribute name="x1">
                            <xsl:value-of select="$s_x_val * (200 + 50) + 125 + ($s_depth - $e_depth - 1) * 10"/>
                        </xsl:attribute>
                        <xsl:attribute name="x2">
                            <xsl:value-of select="$e_x_val * (200 + 50) + 125 + ($s_depth - $e_depth - 1) * 10"/>
                        </xsl:attribute>
                        <xsl:attribute name="y1">
                            <xsl:value-of select="$s_depth * (50 + 50) + 5"/>
                        </xsl:attribute>
                        <xsl:attribute name="y2">
                            <xsl:value-of select="$e_depth * (50 + 50) + 55"/>
                        </xsl:attribute>
                    </line>

                </xsl:for-each>

            </xsl:for-each>
        </svg>
    </xsl:template>

    <!--
    ###################################
    # Pleeeeeaaaaase don't touch this #
    ###################################
    -->

    <xsl:template name="getXPosFor">
        <xsl:param name="jobId" select="u0"/>

        <xsl:variable name="depth">
            <xsl:call-template name="JobRecursion">
                <xsl:with-param name="jobId" select="$jobId"/>
            </xsl:call-template>
        </xsl:variable>

        <xsl:call-template name="FindInDepth">
            <xsl:with-param name="depth" select="$depth"/>
            <xsl:with-param name="jobId" select="$jobId"/>
        </xsl:call-template>

    </xsl:template>


    <xsl:template name="FindInDepth">
        <xsl:param name="jobId" select="u0"/>
        <xsl:param name="depth" select="0"/>
        <xsl:param name="currPos" select="1"/>
        <xsl:param name="elementsFound" select="0"/>
        <xsl:param name="elementCount" select="count(//n:jobDefinition)"/>

        <xsl:variable name="loc_depth">
            <xsl:call-template name="JobRecursion">
                <xsl:with-param name="jobId" select="//n:jobDefinition[$currPos]/@id"/>
            </xsl:call-template>
        </xsl:variable>

        <xsl:choose>
            <xsl:when test="//n:jobDefinition[$currPos]/@id != $jobId">
                <xsl:choose>
                    <xsl:when test="$loc_depth = $depth">
                        <xsl:call-template name="FindInDepth">
                            <xsl:with-param name="jobId" select="$jobId"/>
                            <xsl:with-param name="elementsFound" select="$elementsFound + 1"/>
                            <xsl:with-param name="currPos" select="$currPos + 1"/>
                            <xsl:with-param name="elementCount" select="$elementCount"/>
                            <xsl:with-param name="depth" select="$depth"/>
                        </xsl:call-template>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:call-template name="FindInDepth">
                            <xsl:with-param name="jobId" select="$jobId"/>
                            <xsl:with-param name="elementsFound" select="$elementsFound"/>
                            <xsl:with-param name="currPos" select="$currPos + 1"/>
                            <xsl:with-param name="elementCount" select="$elementCount"/>
                            <xsl:with-param name="depth" select="$depth"/>
                        </xsl:call-template>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$elementsFound"/>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>

    <!-- Berechnung der kritischen Pfad tiefe -->

    <!-- Rekursives 'Reduce' um maximum zu Ermitteln -->

    <xsl:template name="JobReduce">
        <xsl:param name="jobId" select="u0"/>
        <xsl:param name="choiceCnt" select="1"/>
        <xsl:param name="currentChoice" select="1"/>
        <xsl:param name="recursionDepth" select="0"/>

        <xsl:choose>
            <xsl:when test="$choiceCnt = $currentChoice">
                <xsl:call-template name="JobRecursion">
                    <xsl:with-param name="jobId" select="//n:jobDefinition[@id=$jobId]/n:dependsOn[$currentChoice]/@id"/>
                    <xsl:with-param name="origId" select="$jobId"/>
                    <xsl:with-param name="recursionDepth" select="$recursionDepth + 1"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:variable name="a">
                    <xsl:call-template name="JobRecursion">
                        <xsl:with-param name="jobId" select="//n:jobDefinition[@id=$jobId]/n:dependsOn[$currentChoice]/@id"/>
                        <xsl:with-param name="origId" select="$jobId"/>
                        <xsl:with-param name="recursionDepth" select="$recursionDepth + 1"/>
                    </xsl:call-template>
                </xsl:variable>

                <xsl:variable name="b">
                    <xsl:call-template name="JobReduce">
                        <xsl:with-param name="jobId" select="$jobId"/>
                        <xsl:with-param name="choiceCnt" select="$choiceCnt"/>
                        <xsl:with-param name="currentChoice" select="$currentChoice + 1"/>
                        <xsl:with-param name="recursionDepth" select="$recursionDepth"/>
                    </xsl:call-template>
                </xsl:variable>

                <xsl:choose>
                    <xsl:when test="number($a) &gt; number($b)">
                        <xsl:value-of select="$a"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="$b"/>
                    </xsl:otherwise>

                </xsl:choose>

            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>

    <!-- 'Mutterfunktion' zur Berechnung der kritischen Pfadtiefe -->

    <xsl:template name="JobRecursion">
        <xsl:param name="jobId" select="u0"/>
        <xsl:param name="recursionDepth" select="0"/>

        <xsl:choose>
            <xsl:when test="count(//n:jobDefinition[@id=$jobId and @planned='true']/n:dependsOn)&gt;0">
                <xsl:call-template name="JobReduce">
                    <xsl:with-param name="jobId" select="$jobId"/>
                    <xsl:with-param name="choiceCnt" select="count(//n:jobDefinition[@id=$jobId and @planned='true']/n:dependsOn)"/>
                    <xsl:with-param name="recursionDepth" select="$recursionDepth"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                    <xsl:value-of select="$recursionDepth"/>
            </xsl:otherwise>
        </xsl:choose>

    </xsl:template>

</xsl:stylesheet>
