export interface checkInValues {
  userCode: string;
  checkInTime: Date;
}

export interface checkOutValues {
  checkOutTime: Date;
  status: "END";
}
