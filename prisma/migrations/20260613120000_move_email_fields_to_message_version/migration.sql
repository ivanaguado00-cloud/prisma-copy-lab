-- AlterTable: add emailSubject/emailPreheader to MessageVersion (generated output)
ALTER TABLE "MessageVersion" ADD COLUMN "emailPreheader" TEXT;
ALTER TABLE "MessageVersion" ADD COLUMN "emailSubject" TEXT;

-- RedefineTables: drop emailSubject/emailPreheader from Brief
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
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNote" TEXT,
    "crmStatus" TEXT,
    "selectedTemplateId" TEXT,
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
INSERT INTO "new_Brief" ("audience", "briefNumber", "channel", "constraints", "createdAt", "crmEmailHtml", "crmEmailPlainText", "crmInternalSubject", "crmNotes", "crmSentAt", "crmSentBy", "crmStatus", "cta", "emailTemplate", "id", "mode", "objective", "programOrTitulation", "reviewNote", "reviewStatus", "reviewedAt", "reviewedBy", "selectedTemplateId", "title", "updatedAt", "userId", "valueProposition") SELECT "audience", "briefNumber", "channel", "constraints", "createdAt", "crmEmailHtml", "crmEmailPlainText", "crmInternalSubject", "crmNotes", "crmSentAt", "crmSentBy", "crmStatus", "cta", "emailTemplate", "id", "mode", "objective", "programOrTitulation", "reviewNote", "reviewStatus", "reviewedAt", "reviewedBy", "selectedTemplateId", "title", "updatedAt", "userId", "valueProposition" FROM "Brief";
DROP TABLE "Brief";
ALTER TABLE "new_Brief" RENAME TO "Brief";
CREATE UNIQUE INDEX "Brief_userId_briefNumber_key" ON "Brief"("userId", "briefNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
