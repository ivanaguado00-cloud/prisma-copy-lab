-- Add CRM fields to Brief (all nullable — no data migration needed)
ALTER TABLE "Brief" ADD COLUMN "crmStatus" TEXT;
ALTER TABLE "Brief" ADD COLUMN "selectedTemplateId" TEXT;
ALTER TABLE "Brief" ADD COLUMN "crmSentAt" DATETIME;
ALTER TABLE "Brief" ADD COLUMN "crmSentBy" TEXT;
ALTER TABLE "Brief" ADD COLUMN "crmEmailHtml" TEXT;
ALTER TABLE "Brief" ADD COLUMN "crmEmailPlainText" TEXT;
ALTER TABLE "Brief" ADD COLUMN "crmInternalSubject" TEXT;
ALTER TABLE "Brief" ADD COLUMN "crmNotes" TEXT;
