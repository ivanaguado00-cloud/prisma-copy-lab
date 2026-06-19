-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Brief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "briefNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "programOrTitulation" TEXT,
    "objective" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "mode" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "constraints" TEXT,
    "emailTemplate" TEXT,
    "generationMode" TEXT NOT NULL DEFAULT 'standard',
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNote" TEXT,
    "crmStatus" TEXT,
    "crmSentAt" DATETIME,
    "crmSentBy" TEXT,
    "crmEmailHtml" TEXT,
    "crmEmailPlainText" TEXT,
    "crmInternalSubject" TEXT,
    "crmNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Brief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Brief" ("audience", "briefNumber", "channel", "constraints", "createdAt", "crmEmailHtml", "crmEmailPlainText", "crmInternalSubject", "crmNotes", "crmSentAt", "crmSentBy", "crmStatus", "cta", "emailTemplate", "id", "mode", "objective", "programOrTitulation", "reviewNote", "reviewStatus", "reviewedAt", "reviewedBy", "title", "updatedAt", "userId", "valueProposition") SELECT "audience", "briefNumber", "channel", "constraints", "createdAt", "crmEmailHtml", "crmEmailPlainText", "crmInternalSubject", "crmNotes", "crmSentAt", "crmSentBy", "crmStatus", "cta", "emailTemplate", "id", "mode", "objective", "programOrTitulation", "reviewNote", "reviewStatus", "reviewedAt", "reviewedBy", "title", "updatedAt", "userId", "valueProposition" FROM "Brief";
DROP TABLE "Brief";
ALTER TABLE "new_Brief" RENAME TO "Brief";
CREATE UNIQUE INDEX "Brief_userId_briefNumber_key" ON "Brief"("userId", "briefNumber");
CREATE TABLE "new_SendMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "briefId" TEXT NOT NULL,
    "utmCampaign" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmContent" TEXT,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "bouncedCount" INTEGER NOT NULL DEFAULT 0,
    "opensCount" INTEGER NOT NULL DEFAULT 0,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "leadsReactivated" INTEGER NOT NULL DEFAULT 0,
    "enrollments" INTEGER NOT NULL DEFAULT 0,
    "programPrice" REAL,
    "programDiscount" REAL,
    "isSuccessCase" BOOLEAN NOT NULL DEFAULT false,
    "successNote" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SendMetrics_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SendMetrics" ("bouncedCount", "briefId", "clicksCount", "createdAt", "deliveredCount", "enrollments", "id", "isSuccessCase", "leadsReactivated", "opensCount", "programDiscount", "programPrice", "sentAt", "sentCount", "successNote", "updatedAt", "utmCampaign", "utmContent", "utmMedium", "utmSource") SELECT "bouncedCount", "briefId", "clicksCount", "createdAt", "deliveredCount", "enrollments", "id", "isSuccessCase", "leadsReactivated", "opensCount", "programDiscount", "programPrice", "sentAt", "sentCount", "successNote", "updatedAt", "utmCampaign", "utmContent", "utmMedium", "utmSource" FROM "SendMetrics";
DROP TABLE "SendMetrics";
ALTER TABLE "new_SendMetrics" RENAME TO "SendMetrics";
CREATE UNIQUE INDEX "SendMetrics_briefId_key" ON "SendMetrics"("briefId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
