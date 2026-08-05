export type IMealFilterRequest = {
  periodId?: string | undefined;
  memberId?: string | undefined;
  date?: string | undefined;
};

export type IMealUpsert = {
  mealCount: number;
  periodId: string;
};

export type IMealEntry = {
  id: string;
  memberId: string;
  date: Date;
  mealCount: number;
  periodId: string;
  member?: {
    id: string;
    name: string;
  };
};
