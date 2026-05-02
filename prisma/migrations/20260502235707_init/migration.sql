-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MessageVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "briefId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "llmProvider" TEXT NOT NULL,
    "llmModel" TEXT NOT NULL,
    "generationPromptVersion" TEXT NOT NULL,
    "userInstruction" TEXT,
    "parentVersionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageVersion_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MessageVersion_parentVersionId_fkey" FOREIGN KEY ("parentVersionId") REFERENCES "MessageVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValidationRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageVersionId" TEXT NOT NULL,
    "overallVerdict" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "suggestedRewrite" TEXT,
    "validatorModel" TEXT NOT NULL,
    "validatorPromptVersion" TEXT NOT NULL,
    "criteriaVersion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ValidationRun_messageVersionId_fkey" FOREIGN KEY ("messageVersionId") REFERENCES "MessageVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ValidationScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "validationRunId" TEXT NOT NULL,
    "criterionKey" TEXT NOT NULL,
    "criterionName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "suggestedFix" TEXT,
    CONSTRAINT "ValidationScore_validationRunId_fkey" FOREIGN KEY ("validationRunId") REFERENCES "ValidationRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageVersion_briefId_versionNumber_key" ON "MessageVersion"("briefId", "versionNumber");

-- CreateIndex
CREATE INDEX "ValidationScore_validationRunId_idx" ON "ValidationScore"("validationRunId");
