import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert } from 'react-native';
import { getUserContract } from '../service/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ContractData {
  contractTitle: string;
  contractCode: string;
  employeeName: string;
  position: string;
  department: string;
  joinDate: string;
  contractEndTime?: string;
  baseSalary?: number;
  managedBy?: string;
  contractDuration?: string;
  contractDescription?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  status?: string;
}

// Get active contract data from API
const getActiveContractData = async (): Promise<any> => {
  try {
    const userProfileData = await AsyncStorage.getItem("userData");
    if (!userProfileData) {
      throw new Error("Không tìm thấy thông tin người dùng");
    }

    const userProfile = JSON.parse(userProfileData);
    const contractResponse = await getUserContract(userProfile.code);

    if (contractResponse.status === 200) {
      const contractData = contractResponse.data;
      
      // Find active contract or get the first one
      const activeContract = Array.isArray(contractData) 
        ? contractData.find(contract => contract.status === "ACTIVE") || contractData[0]
        : contractData;

      return {
        contract: activeContract,
        userProfile: userProfile
      };
    }
    
    throw new Error("Không thể lấy thông tin hợp đồng");
  } catch (error) {
    console.error("Error getting contract data:", error);
    throw error;
  }
};

const generateContractHTML = (data: ContractData): string => {
  const currentDate = new Date().toLocaleDateString('vi-VN');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hợp đồng lao động</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11px;
          line-height: 1.3;
          margin: 15px;
          color: #000;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
        }
        .company-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .company-info {
          font-size: 9px;
          margin-bottom: 2px;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 20px 0 15px 0;
          text-align: center;
          border: 2px solid #000;
          padding: 10px;
          background: #f9f9f9;
        }
        .contract-code {
          font-size: 11px;
          margin-bottom: 20px;
          text-align: center;
          font-weight: bold;
        }
        .section {
          margin: 15px 0;
          padding: 10px;
          background: #fafafa;
          border-radius: 5px;
        }
        .section-title {
          font-weight: bold;
          font-size: 11px;
          margin-bottom: 10px;
          text-transform: uppercase;
          color: #333;
          background: #e8e8e8;
          padding: 5px 8px;
          border-radius: 3px;
        }
        .info-grid {
          display: table;
          width: 100%;
          margin-bottom: 5px;
        }
        .info-row {
          display: table-row;
        }
        .info-label {
          display: table-cell;
          width: 110px;
          font-weight: bold;
          padding: 3px 8px 3px 0;
          vertical-align: top;
          font-size: 10px;
        }
        .info-value {
          display: table-cell;
          padding: 3px 0;
          vertical-align: top;
          font-size: 10px;
        }
        .two-column {
          display: table;
          width: 100%;
          margin-bottom: 10px;
        }
        .column {
          display: table-cell;
          width: 50%;
          padding-right: 15px;
          vertical-align: top;
        }
        .terms-section {
          display: table;
          width: 100%;
          margin: 10px 0;
        }
        .terms-column {
          display: table-cell;
          width: 33.33%;
          padding-right: 10px;
          vertical-align: top;
        }
        .signature-section {
          display: table;
          width: 100%;
          margin-top: 25px;
          page-break-inside: avoid;
        }
        .signature-block {
          display: table-cell;
          text-align: center;
          width: 50%;
          vertical-align: top;
        }
        .signature-title {
          font-weight: bold;
          margin-bottom: 35px;
          font-size: 10px;
          text-transform: uppercase;
        }
        .signature-name {
          padding-top: 5px;
          font-weight: bold;
          margin-top: 35px;
          font-size: 10px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 8px;
          color: #666;
          padding-top: 10px;
        }
        .status-badge {
          font-weight: bold;
          margin-left: 10px;
          padding: 2px 6px;
          background: #f0f0f0;
          border-radius: 3px;
          font-size: 9px;
        }
        .description-box {
          background: white;
          padding: 8px;
          margin-top: 5px;
          font-size: 10px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
        .commitment-box {
          background: white;
          padding: 8px;
          margin: 5px 0;
          font-size: 9px;
          border: 1px solid #ddd;
          border-radius: 3px;
        }
        .compact-section {
          margin: 10px 0;
          padding: 8px;
          background: #fafafa;
          border-radius: 5px;
        }
        .inline-info {
          display: inline-block;
          margin: 0 15px 5px 0;
          font-size: 10px;
        }
        .inline-label {
          font-weight: bold;
          margin-right: 5px;
        }
        .salary-highlight {
          background: #f5f5f5;
          padding: 2px 4px;
          border-radius: 2px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">${data.companyName || 'CÔNG TY TNHH WDP'}</div>
        <div class="company-info">Địa chỉ: ${data.companyAddress || '123 Đường XYZ, Quận 1, TP.HCM'}</div>
        <div class="company-info">Điện thoại: ${data.companyPhone || '(028) 1234 5678'} | Email: ${data.companyEmail || 'info@wdp.com'}</div>
      </div>

      <div class="title">${data.contractTitle}</div>
      <div class="contract-code">
        Số hợp đồng: ${data.contractCode}
        <span class="status-badge">${data.status === 'ACTIVE' ? 'HIỆU LỰC' : 'HẾT HẠN'}</span>
      </div>

      <div class="two-column">
        <div class="column">
          <div class="section-title">Bên A - Bên thuê lao động:</div>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">Công ty:</div>
              <div class="info-value">${data.companyName || 'Công ty TNHH WDP'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Đại diện:</div>
              <div class="info-value">${data.managedBy || 'Giám đốc'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Điện thoại:</div>
              <div class="info-value">${data.companyPhone || '(028) 1234 5678'}</div>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="section-title">Bên B - Bên lao động:</div>
          <div class="info-grid">
            <div class="info-row">
              <div class="info-label">Họ tên:</div>
              <div class="info-value">${data.employeeName}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Chức vụ:</div>
              <div class="info-value">${data.position}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Nơi làm việc:</div>
              <div class="info-value">${data.department}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="compact-section">
        <div class="section-title">Điều khoản hợp đồng:</div>
        <div class="terms-section">
          <div class="terms-column">
            <div class="inline-info">
              <span class="inline-label">Ngày bắt đầu:</span>${data.joinDate}
            </div>
            <div class="inline-info">
              <span class="inline-label">Thời hạn:</span>${data.contractDuration || 'Không xác định'}
            </div>
          </div>
          <div class="terms-column">
            ${data.contractEndTime ? `
            <div class="inline-info">
              <span class="inline-label">Ngày kết thúc:</span>${data.contractEndTime}
            </div>
            ` : ''}
            <div class="inline-info">
              <span class="inline-label">Trạng thái:</span>${data.status === 'ACTIVE' ? 'Hiệu lực' : 'Hết hạn'}
            </div>
          </div>
          <div class="terms-column">
            ${data.baseSalary ? `
            <div class="inline-info">
              <span class="inline-label">Lương CB:</span>
              <span class="salary-highlight">${data.baseSalary.toLocaleString('vi-VN')} VND</span>
            </div>
            ` : ''}
          </div>
        </div>
      </div>

      ${data.contractDescription ? `
      <div class="compact-section">
        <div class="section-title">Mô tả công việc:</div>
        <div class="description-box">${data.contractDescription}</div>
      </div>
      ` : ''}

      <div class="compact-section">
        <div class="section-title">Cam kết thực hiện:</div>
        <div class="commitment-box">
          <strong>Bên A cam kết:</strong> Tạo điều kiện làm việc tốt nhất, trả lương đúng hạn và đảm bảo quyền lợi cho người lao động.
          <br><strong>Bên B cam kết:</strong> Thực hiện đúng nhiệm vụ được giao, tuân thủ nội quy và quy định của công ty.
          <br><strong>Hai bên cam kết:</strong> Thực hiện đúng các điều khoản đã ký kết trong hợp đồng này.
        </div>
      </div>

      <div class="signature-section">
        <div class="signature-block">
          <div class="signature-title">Đại diện Bên A</div>
          <div class="signature-name">${data.managedBy || 'Giám đốc'}</div>
        </div>
        <div class="signature-block">
          <div class="signature-title">Bên B</div>
          <div class="signature-name">${data.employeeName}</div>
        </div>
      </div>

      <div class="footer">
        <strong>Hợp đồng lập thành 02 bản, mỗi bên giữ 01 bản.</strong><br>
        Ngày xuất: ${currentDate} | Hệ thống WDP
      </div>
    </body>
    </html>
  `;
};

export const downloadContract = async (contractData?: ContractData): Promise<void> => {
  try {
    console.log('Starting contract download...');
    
    let finalContractData: ContractData;
    
    // If no contract data provided, fetch from API
    if (!contractData) {
      console.log('Fetching contract data from API...');
      const { contract, userProfile } = await getActiveContractData();
      
      // Format dates
      const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        let year = date.getFullYear();
        
        // Nếu năm là 2025 (từ API test), đổi thành năm hiện tại
        if (year === 2025) {
          year = new Date().getFullYear();
        }
        
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${year}`;
      };
      
      finalContractData = {
        contractTitle: contract.title || "HỢP ĐỒNG LAO ĐỘNG",
        contractCode: contract.code || "N/A",
        employeeName: contract.fullName || userProfile.fullName,
        position: contract.positionName || "N/A",
        department: contract.branchNames || "N/A",
        joinDate: formatDate(contract.startTime),
        contractEndTime: contract.endTime ? formatDate(contract.endTime) : undefined,
        baseSalary: contract.baseSalary,
        managedBy: contract.fullNameManager || "N/A",
        contractDuration: contract.duration || "N/A",
        contractDescription: contract.description || "Thực hiện các nhiệm vụ được giao theo đúng chức vụ và quy định của công ty.",
        companyName: "CÔNG TY TNHH WDP",
        companyAddress: "123 Đường XYZ, Quận 1, TP.HCM",
        companyPhone: "(028) 1234 5678",
        companyEmail: "info@wdp.com",
        status: contract.status
      };
    } else {
      finalContractData = contractData;
    }
    
    console.log('Contract data:', finalContractData);
    
    // Generate HTML content
    const htmlContent = generateContractHTML(finalContractData);
    
    // Generate PDF with optimized settings for single page
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: 595,
      height: 842,
      margins: {
        left: 40,
        top: 40,
        right: 40,
        bottom: 40,
      },
    });

    console.log('PDF generated at:', uri);

    // Create filename with contract code and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const fileName = `HopDong_${finalContractData.contractCode}_${timestamp}.pdf`;
    
    // For both iOS and Android, use sharing which is more reliable
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Lưu hợp đồng lao động',
        UTI: 'com.adobe.pdf',
      });
      
      console.log('File shared successfully');
    } else {
      // Fallback: try to copy to a more accessible location
      const documentsDir = FileSystem.documentDirectory;
      const newFileUri = documentsDir + fileName;
      
      await FileSystem.copyAsync({
        from: uri,
        to: newFileUri,
      });
      
      Alert.alert(
        'Tải thành công! 📄',
        `Hợp đồng ${finalContractData.contractCode} đã được lưu với tên:\n${fileName}\n\nFile được lưu trong thư mục Documents của ứng dụng.`,
        [
          {
            text: 'Xem file',
            onPress: () => {
              // Try to open with system file viewer
              Sharing.shareAsync(newFileUri).catch(() => {
                Alert.alert('Thông báo', 'Không thể mở file. Vui lòng kiểm tra trong thư mục Documents.');
              });
            }
          },
          { text: 'OK' }
        ]
      );
    }
  } catch (error) {
    console.error('Error downloading contract:', error);
    
    // More detailed error handling
    let errorMessage = 'Không thể tải hợp đồng. ';
    
    if (error.message?.includes('permission')) {
      errorMessage += 'Vui lòng cấp quyền truy cập bộ nhớ cho ứng dụng.';
    } else if (error.message?.includes('space')) {
      errorMessage += 'Không đủ dung lượng lưu trữ.';
    } else if (error.message?.includes('thông tin người dùng')) {
      errorMessage += 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.';
    } else if (error.message?.includes('thông tin hợp đồng')) {
      errorMessage += 'Không tìm thấy hợp đồng hiệu lực. Vui lòng liên hệ HR.';
    } else {
      errorMessage += `Chi tiết: ${error.message || 'Lỗi không xác định'}`;
    }
    
    Alert.alert(
      'Lỗi khi tải file',
      errorMessage,
      [
        {
          text: 'Thử lại',
          onPress: () => downloadContract(contractData)
        },
        { text: 'Đóng' }
      ]
    );
  }
};
