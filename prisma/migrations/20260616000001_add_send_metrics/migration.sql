-- CreateTable
CREATE TABLE "SendMetrics" (
    "id"               TEXT NOT NULL PRIMARY KEY,
    "briefId"          TEXT NOT NULL,
    "utmCampaign"      TEXT,
    "utmSource"        TEXT,
    "utmMedium"        TEXT,
    "utmContent"       TEXT,
    "sentCount"        INTEGER NOT NULL DEFAULT 0,
    "deliveredCount"   INTEGER NOT NULL DEFAULT 0,
    "bouncedCount"     INTEGER NOT NULL DEFAULT 0,
    "opensCount"       INTEGER NOT NULL DEFAULT 0,
    "clicksCount"      INTEGER NOT NULL DEFAULT 0,
    "leadsReactivated" INTEGER NOT NULL DEFAULT 0,
    "enrollments"      INTEGER NOT NULL DEFAULT 0,
    "programPrice"     REAL,
    "programDiscount"  REAL,
    "isSuccessCase"    BOOLEAN NOT NULL DEFAULT false,
    "successNote"      TEXT,
    "sentAt"           DATETIME,
    "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SendMetrics_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SendMetrics_briefId_key" ON "SendMetrics"("briefId");
