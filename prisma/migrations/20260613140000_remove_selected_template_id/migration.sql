-- Remove selectedTemplateId from Brief.
-- Template is now derived from emailTemplate (chosen at briefing creation).
ALTER TABLE "Brief" DROP COLUMN "selectedTemplateId";
