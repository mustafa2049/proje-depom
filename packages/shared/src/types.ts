/** CEFR dil seviyeleri; Prisma `CEFRLevel` enum'uyla birebir aynıdır. */
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Seviyelerin kolaydan zora sırası. */
export const CEFR_ORDER: readonly CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
