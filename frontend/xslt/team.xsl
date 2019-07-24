<?xml version="1.0"?>

<xsl:stylesheet version="1.0"
                xmlns:n="https://planner.schimweg.net/dtd/teamplanner.dtd"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns="http://www.w3.org/1999/xhtml" xmlns:xsL="http://www.w3.org/1999/XSL/Transform">
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
                        <p class="sectionHeading">Members</p>
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
                            <form action="/api/addTeamUser" method="post">
                                <input type="text" name="firstname" class="inputName" autocomplete="off" placeholder="First Name"/>
                                <input type="text" name="lastname" class="inputName" autocomplete="off" placeholder="Last Name"/>
                                <br />
                                <label for="inputMail" >E-Mail: </label>
                                <input type="email" name="mail" id="inputMail" autocomplete="off" placeholder="E-Mail"/>
                                <br />
                                <label for="inputPassword" >Initial Password: </label>
                                <input type="password" name="password" autocomplete="off" id="inputPassword"/>
                                <br />
                                <input type="submit" value="Add" />
                            </form>
                        </div>
                    </div>
                    <div id="teamJobs">
                        <div class="job" id="addJob">
                            <p id="addJobText"> Add Job... </p>
                            <div id="addJobContainer">
                                <div id="addJobSeperator"/>
                                <form action="/api/createJob" method="post">
                                    <input type="text" name="name" id="inputTitle" autocomplete="off" placeholder="Title"/>
                                    <br />
                                    <input type="number" name="duration" id="inputDuration" autocomplete="off" value="60"/> min

                                    <br />
                                    <textarea name="description" id="inputDescription" autocomplete="off" placeholder="Description" rows="2"/>
                                    <br />
                                    <input type="submit" value="Add" />
                                </form>
                            </div>
                        </div>

                        <xsl:for-each select="n:jobDefinition">
                            <div class="job">
                                <xsl:variable name="job" select="." />
                                <xsl:variable name="jobId" select="@id" />
                                <xsl:attribute name="id">j<xsl:value-of select="$jobId" /></xsl:attribute>
                                <p class="jobTitle"><xsl:value-of select="current()/@name"/></p>
                                <p class="jobDuration"><xsl:value-of select="current()/@duration" /> min</p>
                                <p class="jobDescription"><xsl:value-of select="current()/n:description"/></p>
                                <p class="jobSectionHeading">Members</p>
                                <xsl:for-each select="n:member">
                                    <xsl:variable name="user" select="//n:team/n:memberDefinition[@id=current()/@id]" />
                                    <div class="teamMemberElement teamMember">
                                        <xsl:value-of select="$user/@name" />
                                        <form method="post" action="/api/deleteJobUser">
                                            <input type="hidden" name="user">
                                                <xsl:attribute name="value"><xsl:value-of select="@id" /></xsl:attribute>
                                            </input>
                                            <input type="hidden" name="job">
                                                <xsl:attribute name="value"><xsl:value-of select="$jobId" /></xsl:attribute>
                                            </input>
                                            <input type="submit" value=""/>
                                        </form>
                                    </div>
                                </xsl:for-each>
                                <form method="post" action="/api/addJobUser" class="addMemberForm">
                                    <input type="hidden" name="job">
                                        <xsl:attribute name="value"><xsl:value-of select="$jobId" /></xsl:attribute>
                                    </input>
                                    <select name="user">
                                        <option value="none" selected="selected">Add user...</option>
                                        <xsl:for-each select="//n:team/n:memberDefinition">
                                            <xsl:if test="not($job/n:member[@id=current()/@id])">
                                                <option>
                                                    <xsl:attribute name="value">
                                                        <xsL:value-of select="@id" />
                                                    </xsl:attribute>
                                                    <xsl:value-of select="@name" />
                                                </option>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </select>
                                    <input type="submit" value="add" />
                                </form>

                                <p class="jobSectionHeading">Dependencies</p>
                                <xsl:for-each select="n:dependsOn">
                                    <xsl:variable name="dependency" select="//n:jobDefinition[@id=current()/@id]" />
                                    <div class="teamMemberElement teamMember">
                                        <xsl:value-of select="$dependency/@name" />
                                        <form method="post" action="/api/deleteJobDependency">
                                            <input type="hidden" name="parent">
                                                <xsl:attribute name="value"><xsl:value-of select="@id" /></xsl:attribute>
                                            </input>
                                            <input type="hidden" name="job">
                                                <xsl:attribute name="value"><xsl:value-of select="$jobId" /></xsl:attribute>
                                            </input>
                                            <input type="submit" value=""/>
                                        </form>
                                    </div>
                                </xsl:for-each>
                                <form method="post" action="/api/addJobDependency" class="addMemberForm">
                                    <input type="hidden" name="job">
                                        <xsl:attribute name="value"><xsl:value-of select="$jobId" /></xsl:attribute>
                                    </input>
                                    <select name="parent">
                                        <option value="none" selected="selected">Add dependency...</option>
                                        <xsl:for-each select="//n:jobDefinition">
                                            <xsl:if test="not($job/n:dependsOn[@id=current()/@id]) and not($jobId = current()/@id)">
                                                <option>
                                                    <xsl:attribute name="value">
                                                        <xsL:value-of select="@id" />
                                                    </xsl:attribute>
                                                    <xsl:value-of select="@name" />
                                                </option>
                                            </xsl:if>
                                        </xsl:for-each>
                                    </select>
                                    <input type="submit" value="add" />
                                </form>
                            </div>
                        </xsl:for-each>
                    </div>
                </div>
            </body>
        </html>
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