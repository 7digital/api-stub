<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
	<xsl:output indent="yes" encoding="utf-8"/>
	<xsl:template match="@*|node()">
		<xsl:copy>
			<xsl:apply-templates select="@*|node()"/>
			<xsl:if test="name() = 'price' and not(../../package)">
				<xsl:if test="not(rrp)">
					<rrp><xsl:value-of select="value"/></rrp>
				</xsl:if>
				<xsl:if test="not(formattedRrp)">
					<formattedRrp><xsl:value-of select="formattedPrice"/></formattedRrp>
				</xsl:if>
			</xsl:if>
		</xsl:copy>
		<xsl:if test="name() = 'price' and ../../package">
			<xsl:for-each select="../../../../formats/format">
				<format>
					<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
					<description>
						<xsl:value-of select="fileFormat"/>
						<xsl:if test="bitRate">
							<xsl:text> </xsl:text>
							<xsl:value-of select="bitRate"/>
						</xsl:if>
					</description>
				</format>
			</xsl:for-each>
		</xsl:if>
		<xsl:if test="name() = 'price' and not(../download) and not(../../package)">
			<download>
				<packages>
					<package id="2">
						<description>standard</description>
						<price>
							<currencyCode><xsl:value-of select="currency/@code"/></currencyCode>
							<sevendigitalPrice>
								<xsl:choose>
									<xsl:when test="value != ''">
										<xsl:value-of select="value"/>
									</xsl:when>
									<xsl:otherwise>
										<xsl:attribute name="xsi:nil">true</xsl:attribute>
									</xsl:otherwise>
								</xsl:choose>
							</sevendigitalPrice>
							<recommendedRetailPrice>
								<xsl:choose>
									<xsl:when test="rrp">
										<xsl:choose>
											<xsl:when test="rrp != ''">
												<xsl:value-of select="rrp"/>
											</xsl:when>
											<xsl:otherwise>
												<xsl:attribute name="xsi:nil">true</xsl:attribute>
											</xsl:otherwise>
										</xsl:choose>
									</xsl:when>
									<xsl:otherwise>
										<xsl:choose>
											<xsl:when test="value != ''">
												<xsl:value-of select="value"/>
											</xsl:when>
											<xsl:otherwise>
												<xsl:attribute name="xsi:nil">true</xsl:attribute>
											</xsl:otherwise>
										</xsl:choose>
									</xsl:otherwise>
								</xsl:choose>
							</recommendedRetailPrice>
						</price>
						<formats>
							<xsl:choose>
								<xsl:when test="../formats/format">
									<xsl:for-each select="../formats/format">
										<format>
											<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
											<description>
												<xsl:value-of select="fileFormat"/>
												<xsl:if test="bitRate">
													<xsl:text> </xsl:text>
													<xsl:value-of select="bitRate"/>
												</xsl:if>
											</description>
										</format>
									</xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<format id="17">
										<description>MP3 320</description>
									</format>
								</xsl:otherwise>
							</xsl:choose>
						</formats>
					</package>
				</packages>
			</download>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>
