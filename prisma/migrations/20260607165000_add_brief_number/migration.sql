PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Brief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "briefNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "programOrTitulation" TEXT,
    "objective" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "valueProposition" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "constraints" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Brief_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Brief" (
    "id",
    "userId",
    "briefNumber",
    "title",
    "programOrTitulation",
    "objective",
    "audience",
    "channel",
    "mode",
    "valueProposition",
    "cta",
    "constraints",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "userId",
    ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt", "id") AS "briefNumber",
    "title",
    "programOrTitulation",
    "objective",
    "audience",
    "channel",
    "mode",
    "valueProposition",
    "cta",
    "constraints",
    "createdAt",
    "updatedAt"
FROM "Brief";

DROP TABLE "Brief";
ALTER TABLE "new_Brief" RENAME TO "Brief";
CREATE UNIQUE INDEX "Brief_userId_briefNumber_key" ON "Brief"("userId", "briefNumber");

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
