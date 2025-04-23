import { JobType } from '@/shared/types/game'

export interface SubUser {
  parentDocId: string;
  docId: string;
  id: string;
  job: JobType;
}