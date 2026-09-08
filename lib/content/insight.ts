/** 인사이트 묶음 — 증상 12 + 가이드 7(허브 포함). 세 파일을 여기서 모은다. */
import type { Doc } from '../docs';
import { INSIGHT_SYMPTOM_A } from './insight-symptoms-a';
import { INSIGHT_SYMPTOM_B } from './insight-symptoms-b';

export const INSIGHT_DOCS: Doc[] = [...INSIGHT_SYMPTOM_A, ...INSIGHT_SYMPTOM_B];
