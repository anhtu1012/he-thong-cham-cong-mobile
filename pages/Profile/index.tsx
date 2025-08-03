import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  AntDesign,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  Feather,
  Entypo,
} from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import FaceRegisterPage from "../../components/FaceRegisterPage";
import ContractHistoryModal from "../../components/ContractHistoryModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserContract, getFormDescriptions } from "../../service/api";
import { getBangLuong, getBangLuongCriteria } from "../../service/salaryPage";
import { Salary } from "../../models/salary";
import { formatCurrency } from "../../utils/string";
import FormItemCard from "../../components/FormItemCard";
import Toast from "react-native-toast-message";
import { downloadContract } from "../../services/contractService";

const { width } = Dimensions.get("window");

interface UserData {
  name: string;
  position: string;
  department: string;
  status: string;
  employeeId: string;
  email: string;
  phone: string;
  joinDate: string;
  address: string;
  faceImg?: string;
  baseSalary?: number;
  contractTitle?: string;
  contractDescription?: string;
  contractEndTime?: string;
  managedBy?: string;
  contractCode?: string;
  contractId?: string;
  contractDuration?: string;
  positionCode?: string;
  branchCodes?: string[];
}

type FormStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";

interface FormDescription {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  reason: string;
  status: FormStatus;
  file: string;
  startTime: string;
  endTime: string;
  approvedTime?: string;
  formTitle: string;
  submittedBy: string;
  approvedBy?: string;
  response?: string;
}

const ProfilePage = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("thongTinChung");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FormDescription[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formStats, setFormStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    canceled: 0,
    pending: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedFormTitle, setSelectedFormTitle] = useState<string>("ALL");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFormTitleDropdown, setShowFormTitleDropdown] = useState(false);
  const [filteredForms, setFilteredForms] = useState<FormDescription[]>([]);
  const [formTitleOptions, setFormTitleOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const [apiSalaryData, setApiSalaryData] = useState<Salary | null>(null);
  const [apiSalaryHistory, setApiSalaryHistory] = useState<Salary[]>([]);
  const [salaryCriteriaData, setSalaryCriteriaData] = useState<any>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [contractHistoryVisible, setContractHistoryVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData && activeTab === "lichSuDon") {
      fetchForms();
    }
    if (userData && activeTab === "congViec") {
      fetchSalaryData();
    }
  }, [userData, activeTab]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Lấy dữ liệu user từ AsyncStorage
      const userProfileData = await AsyncStorage.getItem("userData");

      if (userProfileData) {
        const userProfile = JSON.parse(userProfileData);

        // Gọi API để lấy thông tin hợp đồng/công việc
        const contractResponse = await getUserContract(userProfile.code);

        if (contractResponse.status === 200) {
          const contractData = contractResponse.data;
          console.log(contractData);

          // Mapping dữ liệu
          const mappedUserData = {
            name: userProfile.fullName,
            position: contractData.positionName,
            department: contractData.branchNames,
            status:
              contractData.status === "ACTIVE"
                ? "Đang làm việc"
                : "Không hoạt động",
            employeeId: userProfile.code,
            email: userProfile.email,
            phone: userProfile.phone,
            joinDate: formatDate(contractData.startTime),
            address: userProfile.addressCode,
            faceImg: userProfile.faceImg,
            baseSalary: contractData.baseSalary,
            contractTitle: contractData.title,
            contractDescription: contractData.description,
            contractEndTime: contractData.endTime,
            managedBy: contractData.fullNameManager,
            contractCode: contractData.code,
            contractId: contractData.id,
            contractDuration: contractData.duration,
            positionCode: contractData.positionCode,
            branchCodes: contractData.branchCodes,
          };

          setUserData(mappedUserData);
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryData = async () => {
    try {
      setSalaryLoading(true);
      const userProfileData = await AsyncStorage.getItem("userData");

      if (userProfileData) {
        const userProfile = JSON.parse(userProfileData);

        // Lấy dữ liệu lương hiện tại
        const currentMonth = new Date()
          .toLocaleDateString("en-GB", {
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "/");

        const salaryResponse = await getBangLuong(
          userProfile.code,
          currentMonth
        );
        const salaryHistoryResponse = await getBangLuong(userProfile.code);
        const criteriaResponse = await getBangLuongCriteria(userProfile.code);

        if (salaryResponse.data && salaryResponse.data.data.length > 0) {
          setApiSalaryData(salaryResponse.data.data[0]);
        }

        if (salaryHistoryResponse.data && salaryHistoryResponse.data.data) {
          setApiSalaryHistory(salaryHistoryResponse.data.data);
        }

        if (criteriaResponse.data && criteriaResponse.data.data.length > 0) {
          setSalaryCriteriaData(criteriaResponse.data.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching salary data:", error);
    } finally {
      setSalaryLoading(false);
    }
  };

  const calculateFormStats = (formList: FormDescription[]) => {
    const stats = {
      total: formList.length,
      approved: formList.filter((form) => form.status === "APPROVED").length,
      rejected: formList.filter((form) => form.status === "REJECTED").length,
      canceled: formList.filter((form) => form.status === "CANCELED").length,
      pending: formList.filter((form) => form.status === "PENDING").length,
    };
    setFormStats(stats);
  };

  const fetchForms = async () => {
    try {
      setFormsLoading(true);
      const response = await getFormDescriptions({});
      if (response.data && response.data.data) {
        // Lọc đơn từ của người dùng hiện tại
        const userForms = response.data.data.filter(
          (form: FormDescription) => form.submittedBy === userData?.name
        );

        // Sắp xếp theo thời gian tạo mới nhất
        const sortedForms = userForms.sort(
          (a: FormDescription, b: FormDescription) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setForms(sortedForms);
        calculateFormStats(sortedForms);

        // Tạo danh sách formTitle options từ dữ liệu
        const uniqueFormTitles: string[] = Array.from(
          new Set(sortedForms.map((form: FormDescription) => form.formTitle))
        );

        if (uniqueFormTitles.length > 0) {
          const formTitleOpts = [
            { value: "ALL", label: "Tất cả loại đơn" },
            ...uniqueFormTitles
              .sort()
              .map((title: string) => ({ value: title, label: title })),
          ];
          setFormTitleOptions(formTitleOpts);
        } else {
          // Khi chưa có đơn từ nào
          setFormTitleOptions([{ value: "ALL", label: "Chưa có đơn từ nào" }]);
        }
      }
    } catch (error) {
      console.error("Error fetching forms:", error);
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không thể lấy danh sách đơn từ",
      });
    } finally {
      setFormsLoading(false);
    }
  };

  const statusOptions = [
    { value: "ALL", label: "Tất cả" },
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
    { value: "CANCELED", label: "Đã hủy" },
  ];

  const filterAndSortForms = (formList: FormDescription[]) => {
    let filtered = [...formList];

    // Filter by status
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter((form) => form.status === selectedStatus);
    }

    // Filter by formTitle
    if (selectedFormTitle !== "ALL") {
      filtered = filtered.filter(
        (form) => form.formTitle === selectedFormTitle
      );
    }

    // Sort forms by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredForms(filtered);
  };

  useEffect(() => {
    filterAndSortForms(forms);
  }, [forms, selectedStatus, selectedFormTitle]);

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setShowStatusDropdown(false);
  };

  const handleFormTitleSelect = (formTitle: string) => {
    setSelectedFormTitle(formTitle);
    setShowFormTitleDropdown(false);
  };

  const handleStatusDropdownToggle = () => {
    setShowStatusDropdown(!showStatusDropdown);
    setShowFormTitleDropdown(false);
  };

  const handleFormTitleDropdownToggle = () => {
    setShowFormTitleDropdown(!showFormTitleDropdown);
    setShowStatusDropdown(false);
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const promises = [loadUserData()];
      if (activeTab === "lichSuDon") promises.push(fetchForms());
      if (activeTab === "congViec") promises.push(fetchSalaryData());
      await Promise.all(promises);
    } catch (error) {
      console.error("Error refreshing profile data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [activeTab]);

  // Format date to DD/MM/YYYY with current year correction
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    let year = date.getFullYear();

    // Nếu năm là 2025 (từ API test), đổi thành năm hiện tại
    if (year === 2025) {
      year = new Date().getFullYear();
    }

    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${year}`;
  };

  // Get display year from API data
  const getDisplayYear = () => {
    let year = new Date().getFullYear(); // fallback to current year

    // Lấy năm từ API data nếu có
    if (apiSalaryData?.createdAt) {
      year = new Date(apiSalaryData.createdAt).getFullYear();
    } else if (apiSalaryHistory.length > 0 && apiSalaryHistory[0].createdAt) {
      year = new Date(apiSalaryHistory[0].createdAt).getFullYear();
    }

    // Nếu năm là 2025 (từ API test), đổi thành năm hiện tại
    if (year === 2025) {
      year = new Date().getFullYear();
    }

    return year;
  };

  // Mock attendance data
  const attendanceData = {
    workDays: {
      chiSo: 22,
      tongSo: 24,
      tbCaNhan: 22,
    },
    diMuon: 1,
    veSom: 0,
    nghiPhep: 0,
    tangCa: 2,
  };

  // Mock salary data
  const salaryData = {
    totalMonthly: "24,093,000đ",
    dailyRate: "1,145,400đ",
    monthlyRate: "23,052,900đ",
    totalRevenue: "0đ",
    roi: "0đ",
  };

  // Mock salary history
  const salaryHistory = [
    { month: "Tháng 12", amount: "24,093", trend: "down" },
    { month: "Tháng 11", amount: "26,117", trend: "up" },
    { month: "Tháng 10", amount: "22,151", trend: "down" },
    { month: "Tháng 9", amount: "23,301", trend: "up" },
    { month: "Tháng 8", amount: "25,802", trend: "up" },
  ];

  // Mock form history data
  const formHistory = [
    {
      id: 1,
      type: "Đơn nghỉ phép",
      status: "Đã duyệt",
      createdDate: "15/12/2024",
      approvedDate: "16/12/2024",
      leaveDate: "20/12/2024",
      duration: "1 ngày",
      reason: "Việc gia đình",
      approver: "Trần Văn B (Trưởng phòng)",
    },
    {
      id: 2,
      type: "Đơn tăng ca",
      status: "Đã duyệt",
      createdDate: "10/12/2024",
      approvedDate: "11/12/2024",
      workDate: "12/12/2024",
      duration: "3 giờ",
      reason: "Hoàn thiện dự án ABC",
      approver: "Trần Văn B (Trưởng phòng)",
    },
    {
      id: 3,
      type: "Đơn xin nghỉ",
      status: "Từ chối",
      createdDate: "05/12/2024",
      rejectDate: "06/12/2024",
      leaveDate: "08/12/2024",
      duration: "1 ngày",
      reason: "Có việc cá nhân",
      rejectReason: "Đã hết ngày phép trong tháng",
      approver: "Trần Văn B (Trưởng phòng)",
    },
    {
      id: 4,
      type: "Đơn đi muộn",
      status: "Chờ duyệt",
      createdDate: "18/12/2024",
      delayDate: "20/12/2024",
      delayTime: "1 giờ",
      reason: "Kẹt xe",
      approver: "Trần Văn B (Trưởng phòng)",
    },
  ];

  // Get status color
  const getStatusColor = (status: any) => {
    switch (status) {
      case "Đã duyệt":
        return "#4CAF50";
      case "Từ chối":
        return "#F44336";
      case "Chờ duyệt":
        return "#FFC107";
      default:
        return "#999";
    }
  };

  // Improved navigation function
  const handleGoBack = () => {
    // Use CommonActions for more reliable navigation
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "DrawerHomeScreen" }],
      })
    );
  };

  const handleDownloadContract = async () => {
    try {
      setIsDownloading(true);
      
      // Show loading toast
      Toast.show({
        type: "info",
        text1: "Đang tạo file PDF...",
        text2: "Đang lấy thông tin hợp đồng hiệu lực...",
        autoHide: false,
      });

      console.log('Starting download...');
      
      // Call downloadContract without parameters - it will fetch active contract data
      await downloadContract();
      
      // Hide loading toast
      Toast.hide();
      
      // Show success message
      Toast.show({
        type: "success",
        text1: "Thành công!",
        text2: "Hợp đồng hiện tại đã được tạo. Chọn nơi lưu file.",
        visibilityTime: 3000,
      });
      
    } catch (error) {
      console.error("Error downloading contract:", error);
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Lỗi khi tải file",
        text2: "Không thể tải hợp đồng. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }

    if (!userData) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Không thể tải dữ liệu người dùng
          </Text>
        </View>
      );
    }

    switch (activeTab) {
      case "thongTinChung":
        return (
          <View style={styles.tabContent}>
            {/* Profile card */}
            <View style={styles.profileCard}>
              <Image
                source={{
                  uri:
                    userData?.faceImg ||
                    "https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg",
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userData?.name}</Text>
                <Text style={styles.profilePosition}>{userData?.position}</Text>
                <Text style={styles.profileDepartment}>
                  {userData?.department}
                </Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{userData?.status}</Text>
                </View>
              </View>
            </View>

            {/* Contact info */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Thông tin nhân sự</Text>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#ffebee" }]}>
                  <Feather name="mail" size={18} color="#F44336" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{userData?.email}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e8f5e9" }]}>
                  <Feather name="phone" size={18} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Điện thoại</Text>
                  <Text style={styles.infoValue}>{userData?.phone}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e3f2fd" }]}>
                  <Feather name="calendar" size={18} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày vào làm</Text>
                  <Text style={styles.infoValue}>{userData?.joinDate}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff8e1" }]}>
                  <Feather name="map-pin" size={18} color="#FFC107" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Địa chỉ</Text>
                  <Text style={styles.infoValue}>{userData?.address}</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case "hopDong":
        return (
          <View style={styles.tabContent}>
            {/* Contract Header Card */}
            <LinearGradient
              colors={["#3674B5", "#2196F3"]}
              style={styles.contractHeaderCard}
            >
              <View style={styles.contractHeaderContent}>
                <View style={styles.contractIconContainer}>
                  <Feather name="file-text" size={32} color="#fff" />
                </View>
                <View style={styles.contractHeaderInfo}>
                  <Text style={styles.contractTitle}>
                    {userData?.contractTitle || "HỢP ĐỒNG LAO ĐỘNG"}
                  </Text>
                  <Text style={styles.contractCode}>
                    Mã hợp đồng: {userData?.contractCode || "N/A"}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Employee Information */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Thông tin nhân viên</Text>

              <View style={styles.contractInfoGrid}>
                <View style={styles.contractInfoItem}>
                  <Text style={styles.contractInfoLabel}>Nhân viên:</Text>
                  <Text style={styles.contractInfoValue}>{userData?.name}</Text>
                </View>

                <View style={styles.contractInfoItem}>
                  <Text style={styles.contractInfoLabel}>Chức vụ:</Text>
                  <Text style={styles.contractInfoValue}>
                    {userData?.position}
                  </Text>
                </View>
              </View>

              <View style={styles.contractInfoGrid}>
                <View style={styles.contractInfoItem}>
                  <Text style={styles.contractInfoLabel}>Ngày bắt đầu:</Text>
                  <Text style={styles.contractInfoValue}>
                    {userData?.joinDate}
                  </Text>
                </View>

                <View style={styles.contractInfoItem}>
                  <Text style={styles.contractInfoLabel}>Ngày kết thúc:</Text>
                  <Text style={styles.contractInfoValue}>
                    {userData?.contractEndTime
                      ? formatDate(userData.contractEndTime)
                      : "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.contractInfoGrid}>
                <View style={styles.contractInfoItem}>
                  <Text style={styles.contractInfoLabel}>Thời hạn:</Text>
                  <Text style={styles.contractInfoValue}>
                    {userData?.contractDuration || "N/A"}
                  </Text>
                </View>

                <View style={styles.contractInfoItem}>
                  <Text style={styles.contractInfoLabel}>Quản lý bởi:</Text>
                  <Text style={styles.contractInfoValue}>
                    {userData?.managedBy || "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Work Details */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Chi tiết hợp đồng</Text>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e8f5e9" }]}>
                  <Feather name="dollar-sign" size={18} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Lương cơ bản</Text>
                  <Text style={styles.contractSalaryValue}>
                    {userData?.baseSalary
                      ? `${userData.baseSalary.toLocaleString("vi-VN")} VND`
                      : "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e3f2fd" }]}>
                  <Feather name="map-pin" size={18} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Chi nhánh làm việc</Text>
                  <Text style={styles.infoValue}>
                    {userData?.department || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff8e1" }]}>
                  <Feather name="calendar" size={18} color="#FFC107" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Trạng thái</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      {
                        color:
                          userData?.status === "Đang làm việc"
                            ? "#4CAF50"
                            : "#F44336",
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {userData?.status || "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Contract Description */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <View style={styles.contractDescriptionContainer}>
                <Text style={styles.contractDescriptionText}>
                  {userData?.contractDescription ||
                    "Hợp đồng lao động được lập thành 02 bản, người lao động giữ 01 bản, đơn vị sử dụng lao động giữ 01 bản."}
                </Text>
              </View>
            </View>

            {/* Contract Actions */}
            <View style={styles.contractActionsContainer}>
              <TouchableOpacity
                style={[
                  styles.contractActionButton,
                  isDownloading && styles.contractActionDisabled,
                ]}
                onPress={handleDownloadContract}
                disabled={isDownloading}
              >
                <Feather
                  name={isDownloading ? "loader" : "download"}
                  size={16}
                  color={isDownloading ? "#999" : "#3674B5"}
                />
                <Text
                  style={[
                    styles.contractActionText,
                    isDownloading && styles.contractActionTextDisabled,
                  ]}
                >
                  {isDownloading ? "Đang tải..." : "Tải hợp đồng"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contractActionButton, styles.contractActionSecondary]}
                onPress={() => setContractHistoryVisible(true)}
              >
                <Feather name="clock" size={16} color="#666" />
                <Text style={[styles.contractActionText, { color: "#666" }]}>
                  Lịch sử HĐ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "soYeuLyLich":
        return (
          <View style={styles.tabContent}>
            <View style={styles.statsContainer}>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Chỉ số</Text>
                <Text style={styles.statsValue}>
                  {attendanceData.workDays.chiSo}
                </Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>Tổng số</Text>
                <Text style={styles.statsValue}>
                  {attendanceData.workDays.tongSo}
                </Text>
              </View>
              <View style={styles.statsItem}>
                <Text style={styles.statsLabel}>TB Cá nhân / Nhóm</Text>
                <Text style={styles.statsValue}>
                  {attendanceData.workDays.tbCaNhan}
                </Text>
              </View>
            </View>

            <View style={styles.attendanceList}>
              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Ngày công</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={styles.attendanceValue}>
                    {attendanceData.workDays.chiSo} công
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Đi muộn</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={[styles.attendanceValue, { color: "#FF5252" }]}>
                    {attendanceData.diMuon} lần
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Về sớm</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={styles.attendanceValue}>
                    {attendanceData.veSom} lần
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Xin nghỉ</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={styles.attendanceValue}>
                    {attendanceData.nghiPhep} lần
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceItem}>
                <Text style={styles.attendanceLabel}>Tăng ca</Text>
                <View style={styles.attendanceValueContainer}>
                  <Text style={[styles.attendanceValue, { color: "#4CAF50" }]}>
                    {attendanceData.tangCa} giờ
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case "congViec":
        if (salaryLoading) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải dữ liệu lương...</Text>
            </View>
          );
        }

        return (
          <View style={styles.tabContent}>
            {/* Salary Overview Card with Gradient */}
            <LinearGradient
              colors={["#3674B5", "#2196F3"]}
              style={styles.salaryGradientCard}
            >
              <View style={styles.salaryOverviewHeader}>
                <Text style={styles.salaryOverviewTitle}>
                  Tổng lương đã nhận của bạn
                </Text>
                <Feather
                  name="info"
                  size={18}
                  color="#fff"
                  style={{ opacity: 0.8 }}
                />
              </View>

              <Text style={styles.salaryTotalAmount}>
                {apiSalaryData
                  ? formatCurrency(apiSalaryData.totalSalary)
                  : "0"}{" "}
                đ
              </Text>

              <View style={styles.salaryStatusContainer}>
                <View
                  style={[
                    styles.salaryStatusDot,
                    {
                      backgroundColor:
                        apiSalaryData?.status === "PAID"
                          ? "#4CAF50"
                          : "#FFC107",
                    },
                  ]}
                />
                <Text style={styles.salaryStatusText}>
                  {apiSalaryData?.status === "PAID"
                    ? "Đã thanh toán"
                    : "Chưa thanh toán"}
                  {apiSalaryData?.paidDate &&
                    ` (${formatDate(apiSalaryData.paidDate)})`}
                </Text>
              </View>

              <View style={styles.salaryQuickInfo}>
                <View style={styles.salaryQuickInfoItem}>
                  <Text style={styles.salaryQuickInfoValue}>
                    {apiSalaryData &&
                    apiSalaryData.actualSalary &&
                    apiSalaryData.workDay
                      ? formatCurrency(
                          Math.round(
                            apiSalaryData.actualSalary / apiSalaryData.workDay
                          )
                        )
                      : "0"}{" "}
                    đ
                  </Text>
                  <Text style={styles.salaryQuickInfoLabel}>Lương / ngày</Text>
                </View>
                <View style={styles.salaryDivider} />
                <View style={styles.salaryQuickInfoItem}>
                  <Text style={styles.salaryQuickInfoValue}>
                    {apiSalaryData
                      ? formatCurrency(apiSalaryData.actualSalary || 0)
                      : "0"}{" "}
                    đ
                  </Text>
                  <Text style={styles.salaryQuickInfoLabel}>Lương / tháng</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Work Performance */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>
                Thông tin công việc tháng này
              </Text>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e8f5e9" }]}>
                  <Feather name="calendar" size={18} color="#4CAF50" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số ngày công</Text>
                  <Text style={styles.infoValue}>
                    {apiSalaryData?.workDay || 0} ngày
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#e3f2fd" }]}>
                  <Feather name="clock" size={18} color="#2196F3" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tổng giờ làm việc</Text>
                  <Text style={styles.infoValue}>
                    {apiSalaryData?.totalWorkHour || 0} giờ
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.infoIcon, { backgroundColor: "#fff3e0" }]}>
                  <Feather name="alert-circle" size={18} color="#FF9800" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số lần đi muộn</Text>
                  <Text style={styles.infoValue}>
                    {apiSalaryData?.lateTimeCount || 0} lần
                  </Text>
                </View>
              </View>

              {userData?.contractTitle && (
                <View style={styles.infoItem}>
                  <View
                    style={[styles.infoIcon, { backgroundColor: "#f3e5f5" }]}
                  >
                    <Feather name="file-text" size={18} color="#9C27B0" />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Hợp đồng</Text>
                    <Text style={styles.infoValue}>
                      {userData.contractTitle}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Salary Details Cards */}
            <View style={styles.salaryDetailsGrid}>
              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#C8E6C9" },
                  ]}
                >
                  <FontAwesome name="dollar" size={22} color="#4CAF50" />
                </View>
                <Text style={styles.salaryDetailLabel}>Lương cơ bản</Text>
                <Text style={styles.salaryDetailValue}>
                  {salaryCriteriaData
                    ? formatCurrency(salaryCriteriaData.baseSalary)
                    : formatCurrency(apiSalaryData?.baseSalary || 0)}
                </Text>
              </View>

              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#E3F2FD" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#BBDEFB" },
                  ]}
                >
                  <MaterialIcons name="timer" size={22} color="#2196F3" />
                </View>
                <Text style={styles.salaryDetailLabel}>Lương tăng ca</Text>
                <Text style={styles.salaryDetailValue}>
                  {formatCurrency(apiSalaryData?.overtimeSalary || 0)}
                </Text>
              </View>

              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#FFF8E1" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#FFECB3" },
                  ]}
                >
                  <MaterialIcons
                    name="card-giftcard"
                    size={22}
                    color="#FFC107"
                  />
                </View>
                <Text style={styles.salaryDetailLabel}>Phụ cấp</Text>
                <Text style={styles.salaryDetailValue}>
                  {formatCurrency(apiSalaryData?.allowance || 0)}
                </Text>
              </View>

              <View
                style={[
                  styles.salaryDetailCard,
                  { backgroundColor: "#FFEBEE" },
                ]}
              >
                <View
                  style={[
                    styles.salaryDetailIconContainer,
                    { backgroundColor: "#FFCDD2" },
                  ]}
                >
                  <MaterialIcons
                    name="remove-circle-outline"
                    size={22}
                    color="#F44336"
                  />
                </View>
                <Text style={styles.salaryDetailLabel}>Khấu trừ</Text>
                <Text style={[styles.salaryDetailValue, { color: "#F44336" }]}>
                  -{formatCurrency(apiSalaryData?.deductionFee || 0)}
                </Text>
              </View>
            </View>

            {/* Salary History */}
            <View style={styles.salaryHistoryContainer}>
              <View style={styles.salaryHistoryHeader}>
                <View style={styles.salaryHistoryTitleContainer}>
                  <MaterialIcons name="history" size={20} color="#3674B5" />
                  <Text style={styles.salaryHistoryTitle}>Lịch sử lương</Text>
                </View>
                <View style={styles.yearSelector}>
                  <Text style={styles.yearText}>Năm {getDisplayYear()}</Text>
                  <AntDesign name="down" size={12} color="#666" />
                </View>
              </View>

              {/* Salary History Chart Placeholder */}
              <View style={styles.salaryChartContainer}>
                <View style={styles.salaryChartYAxis}>
                  {(() => {
                    if (apiSalaryHistory.length === 0) return null;
                    const maxSalary = Math.max(
                      ...apiSalaryHistory.map((s) => s.totalSalary)
                    );
                    const step = Math.ceil(maxSalary / 4 / 1000000) * 1000000;
                    return [4, 3, 2, 1].map((i) => (
                      <Text key={i} style={styles.salaryChartLabel}>
                        {((step * i) / 1000000).toFixed(0)}M
                      </Text>
                    ));
                  })()}
                </View>
                <View style={styles.salaryChartBars}>
                  {apiSalaryHistory.slice(0, 5).map((item, index) => {
                    const maxSalary =
                      apiSalaryHistory.length > 0
                        ? Math.max(
                            ...apiSalaryHistory.map((s) => s.totalSalary)
                          )
                        : 1;
                    const heightPercentage =
                      (item.totalSalary / maxSalary) * 120;
                    const previousSalary =
                      index < apiSalaryHistory.length - 1
                        ? apiSalaryHistory[index + 1]?.totalSalary
                        : item.totalSalary;
                    const isIncrease = item.totalSalary >= previousSalary;

                    return (
                      <View
                        key={item.id}
                        style={styles.salaryChartBarContainer}
                      >
                        <View
                          style={[
                            styles.salaryChartBar,
                            {
                              height: Math.max(heightPercentage, 10),
                              backgroundColor: isIncrease
                                ? "#4CAF50"
                                : "#F44336",
                            },
                          ]}
                        />
                        <Text style={styles.salaryChartBarLabel}>
                          Tháng {item.month.split("/")[0]}
                        </Text>
                      </View>
                    );
                  })}
                  {apiSalaryHistory.length === 0 && (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        Chưa có dữ liệu biểu đồ
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Salary History List */}
              <View style={styles.salaryHistoryList}>
                {apiSalaryHistory.slice(0, 5).map((item, index) => {
                  // Tính toán xu hướng so với tháng trước
                  const currentSalary = item.totalSalary;
                  const previousSalary =
                    index < apiSalaryHistory.length - 1
                      ? apiSalaryHistory[index + 1]?.totalSalary
                      : currentSalary;
                  const trendPercentage = previousSalary
                    ? ((currentSalary - previousSalary) / previousSalary) * 100
                    : 0;
                  const trend = trendPercentage > 0 ? "up" : "down";

                  // Format tháng từ "MM/YYYY" thành "Tháng MM"
                  const monthDisplay = `Tháng ${item.month.split("/")[0]}`;

                  return (
                    <View key={item.id} style={styles.salaryHistoryItem}>
                      <View style={styles.salaryHistoryMonthContainer}>
                        <Text style={styles.salaryMonth}>{monthDisplay}</Text>
                      </View>
                      <View style={styles.salaryAmountContainer}>
                        {Math.abs(trendPercentage) > 0.1 && (
                          <View style={styles.salaryTrendContainer}>
                            <Entypo
                              name={
                                trend === "up" ? "triangle-up" : "triangle-down"
                              }
                              size={14}
                              color={trend === "up" ? "#4CAF50" : "#F44336"}
                            />
                            <Text
                              style={[
                                styles.salaryTrendValue,
                                {
                                  color: trend === "up" ? "#4CAF50" : "#F44336",
                                },
                              ]}
                            >
                              {trend === "up" ? "+" : ""}
                              {trendPercentage.toFixed(1)}%
                            </Text>
                          </View>
                        )}
                        <Text style={styles.salaryAmount}>
                          {formatCurrency(currentSalary)}đ
                        </Text>
                      </View>
                    </View>
                  );
                })}
                {apiSalaryHistory.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có lịch sử lương</Text>
                  </View>
                )}
              </View>

              {/* Download Salary Slip Button */}
              <TouchableOpacity style={styles.downloadSalaryButton}>
                <AntDesign name="download" size={18} color="#fff" />
                <Text style={styles.downloadSalaryText}>Tải phiếu lương</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "lichSuDon":
        return (
          <View style={styles.tabContent}>
            <View style={styles.formStatsContainer}>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>{formStats.total}</Text>
                <Text style={styles.formStatsLabel}>Tất cả</Text>
              </View>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>{formStats.approved}</Text>
                <Text style={styles.formStatsLabel}>Duyệt</Text>
              </View>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>{formStats.rejected}</Text>
                <Text style={styles.formStatsLabel}>Từ chối</Text>
              </View>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>{formStats.canceled}</Text>
                <Text style={styles.formStatsLabel}>Hủy</Text>
              </View>
              <View style={styles.formStatsItem}>
                <Text style={styles.formStatsValue}>{formStats.pending}</Text>
                <Text style={styles.formStatsLabel}>Chờ duyệt</Text>
              </View>
            </View>

            <View style={styles.formFilterContainer}>
              <View style={styles.filterDropdown}>
                <TouchableOpacity
                  style={[
                    styles.filterDropdownButton,
                    forms.length === 0 && styles.filterDropdownDisabled,
                  ]}
                  onPress={
                    forms.length > 0 ? handleStatusDropdownToggle : undefined
                  }
                  disabled={forms.length === 0}
                >
                  <Text
                    style={[
                      styles.filterDropdownText,
                      forms.length === 0 && styles.filterDropdownTextDisabled,
                    ]}
                  >
                    {statusOptions.find((opt) => opt.value === selectedStatus)
                      ?.label || "Tất cả"}
                  </Text>
                  <AntDesign
                    name="down"
                    size={12}
                    color={forms.length === 0 ? "#ccc" : "#666"}
                  />
                </TouchableOpacity>
                {showStatusDropdown && forms.length > 0 && (
                  <View style={styles.dropdownOptions}>
                    {statusOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={styles.dropdownOption}
                        onPress={() => handleStatusSelect(opt.value)}
                      >
                        <Text style={styles.dropdownOptionText}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.filterDropdown}>
                <TouchableOpacity
                  style={[
                    styles.filterDropdownButton,
                    forms.length === 0 && styles.filterDropdownDisabled,
                  ]}
                  onPress={
                    forms.length > 0 ? handleFormTitleDropdownToggle : undefined
                  }
                  disabled={forms.length === 0}
                >
                  <Text
                    style={[
                      styles.filterDropdownText,
                      forms.length === 0 && styles.filterDropdownTextDisabled,
                    ]}
                  >
                    {formTitleOptions.find(
                      (opt) => opt.value === selectedFormTitle
                    )?.label ||
                      (forms.length === 0
                        ? "Chưa có đơn từ nào"
                        : "Tất cả loại đơn")}
                  </Text>
                  <AntDesign
                    name="down"
                    size={12}
                    color={forms.length === 0 ? "#ccc" : "#666"}
                  />
                </TouchableOpacity>
                {showFormTitleDropdown && forms.length > 0 && (
                  <View style={styles.dropdownOptions}>
                    {formTitleOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={styles.dropdownOption}
                        onPress={() => handleFormTitleSelect(opt.value)}
                      >
                        <Text style={styles.dropdownOptionText}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formList}>
              {formsLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>
                    Đang tải danh sách đơn từ...
                  </Text>
                </View>
              ) : filteredForms.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không có đơn từ nào</Text>
                </View>
              ) : (
                filteredForms.map((form) => (
                  <FormItemCard
                    key={form.id}
                    form={form}
                    formatDate={formatDate}
                    onFormUpdate={fetchForms}
                  />
                ))
              )}
            </View>
          </View>
        );

      case "dangkykhuonmat":
        return (
          <View style={styles.tabContent}>
            <View style={{ height: 700 }}>
              <FaceRegisterPage />
            </View>
          </View>
        );

      default:
        return (
          <View style={styles.tabContent}>
            <Text>Không có dữ liệu</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ nhân viên</Text>
        <TouchableOpacity style={styles.moreButton}>
          <AntDesign name="ellipsis1" size={24} color="#3674B5" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsOuterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "thongTinChung" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("thongTinChung")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "thongTinChung" && styles.activeTabText,
              ]}
            >
              Thông tin chung
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "hopDong" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("hopDong")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "hopDong" && styles.activeTabText,
              ]}
            >
              Hợp đồng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "soYeuLyLich" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("soYeuLyLich")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "soYeuLyLich" && styles.activeTabText,
              ]}
            >
              Sơ yếu lý lịch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "congViec" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("congViec")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "congViec" && styles.activeTabText,
              ]}
            >
              Công việc & lương
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "lichSuDon" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("lichSuDon")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "lichSuDon" && styles.activeTabText,
              ]}
            >
              Lịch sử đơn
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderTabContent()}
        {/* Bottom space */}
        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Contract History Modal */}
      <ContractHistoryModal
        visible={contractHistoryVisible}
        onClose={() => setContractHistoryVisible(false)}
        userCode={userData?.employeeId || ""}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  moreButton: {
    padding: 8,
  },
  tabsOuterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabsScrollContainer: {
    flexDirection: "row",
    minWidth: "100%",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: width / 4, // Ensure each tab has at least 1/4 of screen width
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3674B5",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#3674B5",
    fontWeight: "600",
  },
  tabContent: {
    padding: 16,
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profilePosition: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  profileDepartment: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
  },
  statusBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsItem: {
    flex: 1,
    alignItems: "center",
  },
  statsLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  statsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
  },
  attendanceList: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attendanceLabel: {
    fontSize: 15,
    color: "#333",
  },
  attendanceValueContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  attendanceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  salaryGradientCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  salaryOverviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  salaryOverviewTitle: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  salaryTotalAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  salaryStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  salaryStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  salaryStatusText: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  salaryQuickInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  salaryQuickInfoItem: {
    flex: 1,
    alignItems: "center",
  },
  salaryQuickInfoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  salaryQuickInfoLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
  },
  salaryDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 10,
  },
  salaryDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  salaryDetailCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  salaryDetailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  salaryDetailLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  },
  salaryDetailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  salaryHistoryContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  salaryHistoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  salaryHistoryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  salaryHistoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  yearSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  yearText: {
    fontSize: 14,
    color: "#333",
    marginRight: 8,
  },
  salaryChartContainer: {
    flexDirection: "row",
    height: 180,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  salaryChartYAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  salaryChartLabel: {
    fontSize: 10,
    color: "#999",
    textAlign: "right",
    paddingRight: 6,
  },
  salaryChartBars: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  salaryChartBarContainer: {
    alignItems: "center",
    width: 40,
  },
  salaryChartBar: {
    width: 12,
    borderRadius: 6,
  },
  salaryChartBarLabel: {
    fontSize: 10,
    color: "#666",
    marginTop: 6,
  },
  salaryHistoryList: {
    marginBottom: 20,
  },
  salaryHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  salaryHistoryMonthContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  salaryMonth: {
    fontSize: 15,
    color: "#333",
  },
  salaryAmountContainer: {
    alignItems: "flex-end",
  },
  salaryTrendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  salaryTrendValue: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  salaryAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  downloadSalaryButton: {
    backgroundColor: "#3674B5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadSalaryText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  formStatsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  formStatsItem: {
    alignItems: "center",
    flex: 1,
  },
  formStatsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3674B5",
    marginBottom: 4,
  },
  formStatsLabel: {
    fontSize: 12,
    color: "#666",
  },
  formFilterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  filterDropdown: {
    position: "relative",
    minWidth: "30%",
    flex: 1,
  },
  filterDropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  filterDropdownText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  filterDropdownDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
    opacity: 0.6,
  },
  filterDropdownTextDisabled: {
    color: "#999",
  },
  dropdownOptions: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dropdownOptionText: {
    fontSize: 14,
    color: "#333",
  },
  formList: {
    marginBottom: 16,
  },
  bottomSpace: {
    height: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  contractHeaderCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  contractHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contractIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contractHeaderInfo: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  contractCode: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  contractStatusContainer: {
    alignSelf: "flex-start",
  },
  contractStatusBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  contractStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  contractInfoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  contractInfoItem: {
    flex: 1,
    marginRight: 10,
  },
  contractInfoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  contractInfoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  contractSalaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  contractDescriptionContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  contractDescriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  contractActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  contractActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#E3F2FD",
    flex: 1,
    justifyContent: "center",
  },
  contractActionDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.6,
  },
  contractActionText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  contractActionTextDisabled: {
    color: "#999",
  },
});

export default ProfilePage;
