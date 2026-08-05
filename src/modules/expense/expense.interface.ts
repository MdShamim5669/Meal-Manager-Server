import { ExpenseCategory } from "@prisma/client";

export type IExpenseFilterRequest = {
  periodId?: string | undefined;
  category?: ExpenseCategory | undefined;
  paidBy?: string | undefined;
  searchTerm?: string | undefined;
};

export type IExpenseCreate = {
  date: string | Date;
  category: ExpenseCategory;
  amount: number;
  paidBy: string;
  description?: string | undefined;
  receiptPhoto?: string | undefined;
  periodId: string;
};

export type IExpenseUpdate = {
  date?: string | Date | undefined;
  category?: ExpenseCategory | undefined;
  amount?: number | undefined;
  paidBy?: string | undefined;
  description?: string | undefined;
  receiptPhoto?: string | undefined;
  periodId?: string | undefined;
};

export type IExpense = {
  id: string;
  date: Date;
  category: ExpenseCategory;
  amount: number;
  paidBy: string;
  description: string | null;
  receiptPhoto: string | null;
  periodId: string;
  member?: {
    id: string;
    name: string;
  };
};
