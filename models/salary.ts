export interface Salary {
  id: string;
  createdAt: string | null;
  updatedAt: string | null;
  code: string | null;
  userCode: string | null;
  month: string; // Format: "MM/YYYY"
  baseSalary: number;
  actualSalary: number | null;
  deductionFee: number | null;
  workDay: number | null;
  allowance: number | null;
  overtimeSalary: number | null;
  lateFine: number | null;
  otherFee: number | null;
  totalWorkHour: number | null;
  status: string | null;
  paidDate: string | null;
  lateTimeCount: number | null;
  totalSalary: number;
  overTimeSalaryPosition: number | null;
}
