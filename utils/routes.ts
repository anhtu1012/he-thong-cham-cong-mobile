// Định nghĩa type cho tất cả các route trong ứng dụng
export type RootStackParamList = {
  // Main app screens (root level)
  Login: undefined;
  MainAppScreen: undefined; // Renamed from AppNavigationRoot for the root level
  DrawerHomeScreen: undefined; // Added for drawer home screen

  // Root level screens (second level)
  HomePage: undefined;
  ChatAppScreen: undefined;
  ProfileScreen: undefined;
  TimesheetNav: undefined;
  FormDetail: { formId: string; formTitle: string };

  // BottomTab screens with unique names
  HomeTab: undefined;
  CreateFormTab: undefined;
  TimesheetTab: undefined;
  SalaryTab: undefined;
  MenuTab: undefined;

  // Drawer screens with unique names
  HomeDrawer: undefined;
  ChatAppDrawer: undefined;
  ProfileDrawer: undefined;

  // Timesheet bottom tab screens
  TimesheetBottomTabs: undefined;
  AttendanceTab: undefined;
  DetailsTab: undefined;
  UserProfileTab: undefined;
};

// Type cho Bottom Tab Navigator
export type TabParamList = {
  HomeTab: undefined;
  CreateFormTab: undefined;
  TimesheetTab: undefined;
  SalaryTab: undefined;
  MenuTab: undefined;
};

// Type cho Drawer Navigator
export type DrawerParamList = {
  HomeDrawer: undefined;
  ChatAppDrawer: undefined;
  ProfileDrawer: undefined;
};

// Type cho Timesheet Tab Navigator
export type TimesheetTabParamList = {
  MonthlyTimesheet: undefined;
  WeeklyTimesheet: undefined;
  StatsTimesheet: undefined;
};

// Type cho Timesheet Bottom Tab
export type TimesheetBottomTabParamList = {
  AttendanceTab: undefined;
  DetailsTab: undefined;
  UserProfileTab: undefined;
  CameraPage: undefined;
};
