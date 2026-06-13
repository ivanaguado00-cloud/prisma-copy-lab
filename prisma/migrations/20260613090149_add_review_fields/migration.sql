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
INSERT INTO "new_Brief" ("audience", "briefNumber", "channel", "constraints", "createdAt", "crmEmailHtml", "crmEmailPlainText", "crmInternalSubject", "crmNotes", "crmSentAt", "crmSentBy", "crmStatus", "cta", "id", "mode", "objective", "programOrTitulation", "selectedTemplateId", "title", "updatedAt", "userId", "valueProposition") SELECT "audience", "briefNumber", "channel", "constraints", "createdAt", "crmEmailHtml", "crmEmailPlainText", "crmInternalSubject", "crmNotes", "crmSentAt", "crmSentBy", "crmStatus", "cta", "id", "mode", "objective", "programOrTitulation", "selectedTemplateId", "title", "updatedAt", "userId", "valueProposition" FROM "Brief";
DROP TABLE "Brief";
ALTER TABLE "new_Brief" RENAME TO "Brief";
CREATE UNIQUE INDEX "Brief_userId_briefNumber_key" ON "Brief"("userId", "briefNumber");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'author',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "passwordHash", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
