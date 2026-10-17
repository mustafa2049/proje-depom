-- AlterTable
ALTER TABLE "AIChatMessage" ADD COLUMN     "extractedVocabulary" JSONB,
ADD COLUMN     "replyTranslationTR" TEXT;
