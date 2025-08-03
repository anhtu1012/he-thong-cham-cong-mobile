import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../config/axios';

const { width } = Dimensions.get('window');

interface ContractHistory {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: string;
  contractPdf?: string;
  status: 'ACTIVE' | 'INACTIVE';
  managedBy: string;
  positionCode: string;
  positionName: string;
  branchNames: string;
  branchCodes: string[];
  fullName: string;
  fullNameManager: string;
  baseSalary: number;
}

interface ContractHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  userCode: string;
}

const ContractHistoryModal: React.FC<ContractHistoryModalProps> = ({
  visible,
  onClose,
  userCode,
}) => {
  const [contracts, setContracts] = useState<ContractHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userCode) {
      fetchContractHistory();
    }
  }, [visible, userCode]);

  const fetchContractHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/business/by-user-code-array/${userCode}`, {
        params: {
          offset: 0,
          limit: 500000,
        },
      });
      setContracts(response.data || []);
    } catch (error) {
      console.error('Error fetching contract history:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch sử hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#4CAF50';
      case 'INACTIVE':
        return '#FF5722';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hiệu lực';
      case 'INACTIVE':
        return 'Chấm dứt';
      default:
        return 'Không xác định';
    }
  };

  const renderContractItem = (contract: ContractHistory) => (
    <View key={contract.id} style={styles.contractItem}>
      <LinearGradient
        colors={
          contract.status === 'ACTIVE'
            ? ['#4CAF50', '#45A049']
            : ['#757575', '#616161']
        }
        style={styles.contractHeader}
      >
        <View style={styles.contractHeaderContent}>
          <View style={styles.contractIconContainer}>
            <Feather name="file-text" size={24} color="#fff" />
          </View>
          <View style={styles.contractHeaderInfo}>
            <Text style={styles.contractTitle}>{contract.title}</Text>
            <Text style={styles.contractCode}>Mã: {contract.code}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {getStatusText(contract.status)}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.contractDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Chức vụ:</Text>
            <Text style={styles.detailValue}>{contract.positionName}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Thời hạn:</Text>
            <Text style={styles.detailValue}>{contract.duration}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ngày bắt đầu:</Text>
            <Text style={styles.detailValue}>{formatDate(contract.startTime)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ngày kết thúc:</Text>
            <Text style={styles.detailValue}>{formatDate(contract.endTime)}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Quản lý bởi:</Text>
            <Text style={styles.detailValue}>{contract.fullNameManager}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Lương cơ bản:</Text>
            <Text style={[styles.detailValue, styles.salaryValue]}>
              {contract.baseSalary.toLocaleString('vi-VN')} VND
            </Text>
          </View>
        </View>

        <View style={styles.branchContainer}>
          <Text style={styles.detailLabel}>Chi nhánh:</Text>
          <Text style={styles.detailValue}>{contract.branchNames}</Text>
        </View>

        {contract.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.detailLabel}>Mô tả:</Text>
            <Text style={styles.descriptionText}>{contract.description}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử hợp đồng</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3674B5" />
            <Text style={styles.loadingText}>Đang tải lịch sử hợp đồng...</Text>
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {contracts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="file-text" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Không có lịch sử hợp đồng</Text>
              </View>
            ) : (
              <>
                <Text style={styles.totalContracts}>
                  Tổng cộng: {contracts.length} hợp đồng
                </Text>
                {contracts.map(renderContractItem)}
              </>
            )}
            <View style={styles.bottomSpace} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  totalContracts: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  contractItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  contractHeader: {
    padding: 16,
  },
  contractHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contractIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contractHeaderInfo: {
    flex: 1,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  contractCode: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  contractDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  salaryValue: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  branchContainer: {
    marginBottom: 12,
  },
  descriptionContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  bottomSpace: {
    height: 20,
  },
});

export default ContractHistoryModal;
