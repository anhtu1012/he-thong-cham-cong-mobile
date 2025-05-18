// Định nghĩa type cho tất cả các route trong ứng dụng
export type RootStackParamList = {
  home: undefined; // undefined nghĩa là màn hình không có parameter
  AppNavigation: undefined;
  program: undefined;
  Psy: undefined;
  PsyDetail: { doctor: any };
  ChatApp: undefined;
  ProgramDetail: { program: any };
  SurveyDetail: { surveyId: string };
  Login: undefined;
  Profile: undefined;
  AppointmentReport: { appointmentId: string };
  TimesheetNav: undefined; // Thêm route cho màn hình Bảng công riêng biệt
  FormDetail: { formId: string; formTitle: string }; // Thêm route cho màn hình chi tiết form
};

// Type cho Bottom Tab Navigator
export type TabParamList = {
  Home: undefined;
  CreateForm: undefined;
  Timesheet: undefined;
  Salary: undefined;
  Menu: undefined;
};

// Type cho Drawer Navigator
export type DrawerParamList = {
  HomeTabs: undefined;
  Program: undefined;
  Profile: undefined;
  ChatApp: undefined;
};

// Type cho Timesheet Tab Navigator
export type TimesheetTabParamList = {
  MonthlyTimesheet: undefined;
  WeeklyTimesheet: undefined;
  StatsTimesheet: undefined;
};

// Type cho Timesheet Bottom Tab
export type TimesheetBottomTabParamList = {
  Attendance: undefined;
  Details: undefined;
  UserProfile: undefined;
};
