<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:n="/dtd/teamplanner.dtd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml">
    <xsl:output method="xml" encoding="UTF-8" indent="yes" />

    <!-- Graph Config -->
    <xsl:variable name="graph_y_space">100</xsl:variable>
    <xsl:variable name="graph_margin">5</xsl:variable>
    <xsl:variable name="item_connect_margin">5</xsl:variable>
    <xsl:variable name="graph_item_height">50</xsl:variable>
    <xsl:variable name="graph_item_width">200</xsl:variable>
    <xsl:variable name="graph_item_border_width">5</xsl:variable>
    <xsl:variable name="graph_x_space">50</xsl:variable>
    <xsl:variable name="item_x_step">30</xsl:variable>
    <xsl:variable name="item_y_step">15</xsl:variable>
    <xsl:variable name="item_dead_space">20</xsl:variable>
    <xsl:variable name="connector_micro_x_step">10</xsl:variable>
    <xsl:variable name="connector_micro_y_step">7</xsl:variable>
    <xsl:variable name="initial_y_step">20</xsl:variable>
    <!-- Graph Config End -->

    <xsl:template match="n:teamOverview">
        <html>
            <head>
                <title>Management</title>
                <link type="text/css" rel="stylesheet" href="/css/management.css"/>
                <style>
                    .jobElement {
                        width: <xsl:value-of select="$graph_item_width"/>px;
                        height: <xsl:value-of select="$graph_item_height"/>px;
                        border-left: <xsl:value-of select="$graph_item_border_width"/>px solid rgba(0, 150, 105, .9);
                    }
                </style>

            </head>
            <body>
                <div class="users">
                    <div class="overlay"/>
                    <h3 id="user_title">Team Mitglieder</h3>
                    <ul class="user_list">
                        <xsl:apply-templates select="//n:team/n:memberDefinition"/>
                    </ul>
                </div>
                <div class="graph">
                    <div class="overlay">
                        <div class="content">
                            <a class="close" href="/back/to/manage">
                                <img src="/img/deleteWhite.svg"/>
                            </a>
                            <h2>Job erstellen</h2>
                            <div class="changeTime">
                                <form method="post" action="/diesdas/" class="duration">

                                    <input type="text" id="name" name="name" placeholder="Name"></input><br/>
                                    <input type="number" id="minutes" name="minutes" placeholder="Dauer"></input>
                                    <label for="minutes">Minuten</label>
                                    <input type="submit" value="Speichern"></input>
                                </form>
                            </div>
                        </div>
                    </div>
                        <xsl:apply-templates select="//n:jobDefinition[@planned='true']"/>
                        <xsl:call-template name="drawRelations"/>
                </div>
                <div class="not_assigned">
                    <div class="overlay"/>
                    <xsl:apply-templates select="//n:jobDefinition[@planned='false']"/>
                </div>
            </body>

        </html>
    </xsl:template>

    <xsl:template match="//n:jobDefinition[@planned='false']">
        <div class="jobElement unplanned_job">
            <xsl:value-of select="@name"/>
            <a class="editUser">
                <xsl:attribute name="href">
                    /test/manageEditUsers.xml?jid=<xsl:value-of select="@id"/>
                </xsl:attribute>
            </a>
        </div>
    </xsl:template>


    <xsl:template match="n:memberDefinition">
        <xsl:choose>
            <xsl:when test="@leader='true' and @you='false'">
                <li class="leader"><xsl:value-of select="@name"/> (Leader)</li>
            </xsl:when>
            <xsl:when test="@you='true' and @leader='false'">
                <li class="you"><xsl:value-of select="@name"/> (You)</li>
            </xsl:when>
            <xsl:when test="@you='true' and @leader='true'">
                <li class="you">
                    <xsl:value-of select="@name"/> (You, Leader)
                </li>
            </xsl:when>
            <xsl:otherwise>
                <li><xsl:value-of select="@name"/></li>
            </xsl:otherwise>
        </xsl:choose>

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
                left: calc((<xsl:value-of select="$graph_item_width"/>px + <xsl:value-of select="$graph_x_space"/>px) * <xsl:value-of select="$x_val"/>);
                top: calc((<xsl:value-of select="$graph_item_height"/>px + <xsl:value-of select="$graph_y_space"/>px) * <xsl:value-of select="$depth"/> + <xsl:value-of select="$graph_margin"/>px);
            </xsl:attribute>
            <xsl:value-of select="//n:jobDefinition[@id=$jobId]/@name"/>
            <a class="editUser">
                <xsl:attribute name="href">
                    /test/manageEditUsers.xml?jid=<xsl:value-of select="$jobId"/>
                </xsl:attribute>
            </a>
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

                    <xsl:variable name="p1">
                        <xsl:value-of select="$e_x_val * ($graph_item_width + $graph_x_space) + ($graph_item_width + $graph_item_border_width) div 2 - ($item_dead_space div 2) - ($s_depth - $e_depth - 1) * $item_x_step + ($graph_margin)"/>,
                        <xsl:value-of select="$e_depth * ($graph_y_space + $graph_item_height) + $graph_margin + $graph_item_height"/>
                    </xsl:variable>
                    <xsl:variable name="p2">
                        <xsl:value-of select="$e_x_val * ($graph_item_width + $graph_x_space) + ($graph_item_width + $graph_item_border_width) div 2 - ($item_dead_space div 2) - ($s_depth - $e_depth - 1) * $item_x_step + ($graph_margin)"/>,
                        <xsl:value-of select="$e_depth * ($graph_y_space + $graph_item_height) + $graph_item_height + $initial_y_step + (($s_depth - $e_depth - 1) * $item_y_step) mod ($graph_y_space div 2 - 3) + ($e_x_val * $connector_micro_y_step) mod ($item_y_step - 3)"/>
                    </xsl:variable>
                    <xsl:variable name="p3">
                        <xsl:value-of select="$s_x_val * ($graph_item_width + $graph_x_space) + ($graph_item_width + $graph_item_border_width) div 2 + ($item_dead_space div 2) + (($s_depth - $e_depth - 1) * $item_x_step) mod (($graph_item_width + $graph_item_border_width) div 2) + ($graph_margin) + ($e_depth * $connector_micro_x_step) mod $item_x_step"/>,
                        <xsl:value-of select="$e_depth * ($graph_y_space + $graph_item_height) + $graph_item_height + $initial_y_step + (($s_depth - $e_depth - 1) * $item_y_step) mod ($graph_y_space div 2 - 3) + ($e_x_val * $connector_micro_y_step) mod ($item_y_step - 3)"/>
                    </xsl:variable>
                    <xsl:variable name="p4">
                        <xsl:value-of select="$s_x_val * ($graph_item_width + $graph_x_space) + ($graph_item_width + $graph_item_border_width) div 2 + ($item_dead_space div 2) + (($s_depth - $e_depth - 1) * $item_x_step) mod (($graph_item_width + $graph_item_border_width) div 2) + ($graph_margin) + ($e_depth * $connector_micro_x_step) mod $item_x_step"/>,
                        <xsl:value-of select="$s_depth * ($graph_y_space + $graph_item_height) + $graph_margin"/>
                    </xsl:variable>

                    <polyline stroke="rgba(0,128,128, 255)" fill="none" style="stroke-width:1">
                        <xsl:attribute name="points">
                            <xsl:value-of select="$p1"/>,
                            <xsl:value-of select="$p2"/>,
                            <xsl:value-of select="$p3"/>,
                            <xsl:value-of select="$p4"/>
                        </xsl:attribute>
                    </polyline>

                    <circle r="1.5" stroke="rgba(0,128,128, 255)" fill="rgba(0,128,128, 255)">
                        <xsl:attribute name="cx">
                            <xsl:value-of select="substring-before($p2, ',')"/>
                        </xsl:attribute>
                        <xsl:attribute name="cy">
                            <xsl:value-of select="substring-after($p2, ',')"/>
                        </xsl:attribute>
                    </circle>

                    <circle r="1.5" stroke="rgba(0,128,128, 255)" fill="rgba(0,128,128, 255)">
                        <xsl:attribute name="cx">
                            <xsl:value-of select="substring-before($p3, ',')"/>
                        </xsl:attribute>
                        <xsl:attribute name="cy">
                            <xsl:value-of select="substring-after($p3, ',')"/>
                        </xsl:attribute>
                    </circle>

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
