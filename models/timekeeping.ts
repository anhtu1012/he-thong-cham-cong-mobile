export interface checkInValues {
  userCode: string;
  checkInTime: string;
}

export interface checkOutValues {
  checkOutTime: string;
  status: "END";
}
