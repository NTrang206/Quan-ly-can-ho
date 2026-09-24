import {
  IUser, IBuilding, IApartment, ITenant, IContract, IDeposit,
  IReceivable, IPayment, IDebtLedger, IMaintenanceRequest,
  ISystemAlert, IDocumentChunk, IBooking, IDashboardStats
} from '../types';
import { summarizeContractWithAI } from '../utils/aiEngines';

/**
 * Local Storage persistent mock database for standalone presentation and full reactivity
 */
const STORAGE_PREFIX = 'sunshine_homes_';

const getStored = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStored = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Local storage write error', e);
  }
};

// Initial Mock Data
export const INITIAL_USERS: IUser[] = [
  {
    id: 1,
    roleId: 1,
    roleCode: 'ADMIN',
    username: 'admin',
    fullName: 'Nguyễn Thị Trang',
    email: 'admin@dwell.vn',
    phone: '0904.123.456',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-01-01',
    assignedBuildingIds: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    roleId: 2,
    roleCode: 'STAFF',
    username: 'staff',
    fullName: 'Lê Quang Khánh',
    email: 'staff@dwell.vn',
    phone: '0912.234.567',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-01-01',
    assignedBuildingIds: [1, 2],
  },
  {
    id: 3,
    roleId: 3,
    roleCode: 'ACCOUNTANT',
    username: 'accountant',
    fullName: 'Hoàng Khánh Ly',
    email: 'accountant@dwell.vn',
    phone: '0988.345.678',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-01-01',
    assignedBuildingIds: [1, 2, 3, 4, 5],
  },
  {
    id: 4,
    roleId: 4,
    roleCode: 'TENANT',
    username: 'tenant',
    fullName: 'Nguyễn Văn An',
    email: 'tenant@dwell.vn',
    phone: '0912.888.999',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-01-01',
    tenantId: 1,
  },
  {
    id: 5,
    roleId: 5,
    roleCode: 'GUEST',
    username: 'guest',
    fullName: 'Khách Tìm Thuê',
    email: 'guest@dwell.vn',
    phone: '0900.000.000',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    isActive: true,
    createdAt: '2024-01-01',
  }
];

export const INITIAL_BUILDINGS: IBuilding[] = [
  {
    id: 1,
    name: 'Sunshine Tower A',
    address: 'Số 16 Phạm Hùng, Q. Nam Từ Liêm, Hà Nội',
    totalFloors: 25,
    totalApartments: 160,
    occupiedCount: 156,
    availableCount: 3,
    maintenanceCount: 0,
    reservedCount: 1,
    status: 'ACTIVE',
    managerName: 'Mr. Hoàng Nam',
    contactPhone: '024 7300 2222',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80',
    monthlyRevenueEstimate: 1720000000,
  },
  {
    id: 2,
    name: 'Sunshine Tower B',
    address: 'Số 16 Phạm Hùng, Q. Nam Từ Liêm, Hà Nội',
    totalFloors: 20,
    totalApartments: 120,
    occupiedCount: 114,
    availableCount: 4,
    maintenanceCount: 1,
    reservedCount: 1,
    status: 'ACTIVE',
    managerName: 'Mr. Quang Tuấn',
    contactPhone: '024 7300 2223',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    monthlyRevenueEstimate: 1280000000,
  },
  {
    id: 3,
    name: 'Dwell Riverside',
    address: '128 Nguyễn Hữu Cảnh, Q. Bình Thạnh, TP.HCM',
    totalFloors: 18,
    totalApartments: 100,
    occupiedCount: 93,
    availableCount: 6,
    maintenanceCount: 1,
    reservedCount: 0,
    status: 'ACTIVE',
    managerName: 'Ms. Mai Lan',
    contactPhone: '028 7300 5555',
    imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    monthlyRevenueEstimate: 980000000,
  },
  {
    id: 4,
    name: 'Sky Park Residences',
    address: 'Số 3 Tôn Thất Thuyết, Q. Cầu Giấy, Hà Nội',
    totalFloors: 15,
    totalApartments: 100,
    occupiedCount: 91,
    availableCount: 8,
    maintenanceCount: 0,
    reservedCount: 1,
    status: 'ACTIVE',
    managerName: 'Mr. Tuấn Anh',
    contactPhone: '024 7300 9999',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
    monthlyRevenueEstimate: 870000000,
  }
];

export const INITIAL_APARTMENTS: IApartment[] = [
  {
    id: 1,
    buildingId: 1,
    buildingName: 'Sunshine Tower A',
    roomNumber: 'P.302',
    floor: 3,
    areaSqm: 65,
    price: 8500000,
    depositDefault: 17000000,
    maxOccupants: 4,
    currentOccupants: 3,
    bedrooms: 2,
    bathrooms: 2,
    viewDirection: 'Đông Nam',
    status: 'OCCUPIED',
    description: 'Căn hộ Coastal Vista Suite cao cấp, ban công view thoáng, đầy đủ nội thất thông minh.',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-01-01',
    amenities: [
      { id: 1, apartmentId: 1, name: 'Điều hòa Daikin Inverter 12000BTU (x2)', brand: 'Daikin', conditionStatus: 'GOOD', category: 'ELECTRONICS' },
      { id: 2, apartmentId: 1, name: 'Tủ lạnh Toshiba 2 cánh Inverter 320L', brand: 'Toshiba', conditionStatus: 'GOOD', category: 'ELECTRONICS' },
      { id: 3, apartmentId: 1, name: 'Bếp từ đôi Hafele HC-IS772EA', brand: 'Hafele', conditionStatus: 'GOOD', category: 'APPLIANCE' },
      { id: 4, apartmentId: 1, name: 'Khóa cửa vân tay Smart Lock Yale YDM-4109+', brand: 'Yale', conditionStatus: 'GOOD', category: 'SECURITY' },
    ]
  },
  {
    id: 2,
    buildingId: 1,
    buildingName: 'Sunshine Tower A',
    roomNumber: 'P.402',
    floor: 4,
    areaSqm: 68,
    price: 8500000,
    depositDefault: 17000000,
    maxOccupants: 4,
    currentOccupants: 2,
    bedrooms: 2,
    bathrooms: 2,
    viewDirection: 'Đông Bắc',
    status: 'OCCUPIED',
    description: 'Căn hộ góc 2 mặt thoáng, thiết kế hiện đại phong cách Bắc Âu.',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-01-01',
    amenities: [
      { id: 5, apartmentId: 2, name: 'Điều hòa Daikin Inverter (x2)', brand: 'Daikin', conditionStatus: 'GOOD', category: 'ELECTRONICS' },
      { id: 6, apartmentId: 2, name: 'Máy giặt sấy Electrolux 9kg', brand: 'Electrolux', conditionStatus: 'GOOD', category: 'ELECTRONICS' },
    ]
  },
  {
    id: 3,
    buildingId: 1,
    buildingName: 'Sunshine Tower A',
    roomNumber: 'P.405',
    floor: 4,
    areaSqm: 48,
    price: 6500000,
    depositDefault: 13000000,
    maxOccupants: 2,
    currentOccupants: 0,
    bedrooms: 1,
    bathrooms: 1,
    viewDirection: 'Công Viên Cây Xanh',
    status: 'AVAILABLE',
    description: 'Sunshine City Luxury 1PN, view trọn công viên cây xanh, đón ánh sáng tự nhiên.',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-02-01',
    amenities: [
      { id: 7, apartmentId: 3, name: 'Điều hòa Panasonic Inverter', brand: 'Panasonic', conditionStatus: 'GOOD', category: 'ELECTRONICS' },
      { id: 8, apartmentId: 3, name: 'Giường nệm cao cấp King Size', brand: 'Dunlopillo', conditionStatus: 'GOOD', category: 'FURNITURE' },
    ]
  },
  {
    id: 4,
    buildingId: 2,
    buildingName: 'Sunshine Tower B',
    roomNumber: 'P.512',
    floor: 5,
    areaSqm: 36,
    price: 5200000,
    depositDefault: 10400000,
    maxOccupants: 2,
    currentOccupants: 0,
    bedrooms: 1,
    bathrooms: 1,
    viewDirection: 'Nội Khu Vườn Hoa',
    status: 'AVAILABLE',
    description: 'Modern Studio Compact, đầy đủ đồ dùng thông minh, tối ưu diện tích sinh hoạt.',
    imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-02-01',
    amenities: [
      { id: 9, apartmentId: 4, name: 'Smart Tivi Samsung 50 inch', brand: 'Samsung', conditionStatus: 'GOOD', category: 'ELECTRONICS' },
      { id: 10, apartmentId: 4, name: 'Bếp từ đôi Sunhouse', brand: 'Sunhouse', conditionStatus: 'GOOD', category: 'APPLIANCE' },
    ]
  },
  {
    id: 5,
    buildingId: 1,
    buildingName: 'Sunshine Tower A',
    roomNumber: 'P.801',
    floor: 8,
    areaSqm: 78,
    price: 10500000,
    depositDefault: 21000000,
    maxOccupants: 5,
    currentOccupants: 0,
    bedrooms: 2,
    bathrooms: 2,
    viewDirection: 'Hướng Đông Nam',
    status: 'RESERVED',
    description: 'Corner Suite Panorama 2PN, góc 2 mặt thoáng view panorama thành phố cực đẹp.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-01-15',
    amenities: [
      { id: 11, apartmentId: 5, name: 'Hệ thống Smart Home Lumi', brand: 'Lumi', conditionStatus: 'GOOD', category: 'SECURITY' },
    ]
  },
  {
    id: 6,
    buildingId: 1,
    buildingName: 'Sunshine Tower A',
    roomNumber: 'P.105',
    floor: 1,
    areaSqm: 70,
    price: 9000000,
    depositDefault: 18000000,
    maxOccupants: 4,
    currentOccupants: 3,
    bedrooms: 2,
    bathrooms: 2,
    viewDirection: 'Tây Bắc',
    status: 'OCCUPIED',
    description: 'Căn hộ tầng thấp tiện di chuyển, ban công rộng.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-01-01',
    amenities: []
  },
  {
    id: 7,
    buildingId: 1,
    buildingName: 'Sunshine Tower A',
    roomNumber: 'P.202',
    floor: 2,
    areaSqm: 55,
    price: 7000000,
    depositDefault: 14000000,
    maxOccupants: 3,
    currentOccupants: 2,
    bedrooms: 1,
    bathrooms: 1,
    viewDirection: 'Đông Nam',
    status: 'OCCUPIED',
    description: 'Căn hộ ấm cúng đầy đủ nội thất cơ bản.',
    imageUrl: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-01-01',
    amenities: []
  },
  {
    id: 8,
    buildingId: 2,
    buildingName: 'Sunshine Tower B',
    roomNumber: 'P.305',
    floor: 3,
    areaSqm: 62,
    price: 7800000,
    depositDefault: 15600000,
    maxOccupants: 4,
    currentOccupants: 0,
    bedrooms: 2,
    bathrooms: 1,
    viewDirection: 'Nội Khu',
    status: 'MAINTENANCE',
    description: 'Đang tạm khóa để sửa chữa hệ thống cấp nước và thay ron bồn rửa.',
    imageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&auto=format&fit=crop&q=80',
    createdAt: '2024-01-01',
    amenities: []
  }
];

export const INITIAL_TENANTS: ITenant[] = [
  {
    id: 1,
    fullName: 'Nguyễn Văn An',
    citizenId: '001201008899',
    phone: '0912.888.999',
    email: 'an.nguyen@sunshine.vn',
    hometown: 'Thái Bình',
    isBadDebt: false,
    createdAt: '2024-01-01',
    userId: 4,
    currentApartmentId: 1,
    currentRoomNumber: 'P.302',
    buildingName: 'Sunshine Tower A',
    activeContractId: 1,
    totalHeldDeposit: 17000000,
    creditScore: 98,
    emergencyContacts: [
      { id: 1, tenantId: 1, fullName: 'Nguyễn Văn Bình', phone: '0903.112.233', relationship: 'Bố đẻ' }
    ],
    roommates: [
      { id: 1, tenantId: 1, apartmentId: 1, fullName: 'Trần Thị Mai', citizenId: '001201008888', phone: '0913.444.555', relationship: 'Vợ (Đã duyệt tạm trú)', isRegisteredTemp: true, registeredDate: '2024-01-10' },
      { id: 2, tenantId: 1, apartmentId: 1, fullName: 'Nguyễn Bảo Nam', citizenId: '001215001122', phone: '---', relationship: 'Con trai', isRegisteredTemp: true, registeredDate: '2024-01-10' }
    ]
  },
  {
    id: 2,
    fullName: 'Lê Hoàng Nam',
    citizenId: '001201004455',
    phone: '0912.334.689',
    email: 'nam.le@gmail.com',
    hometown: 'Nam Định',
    isBadDebt: false,
    createdAt: '2024-01-01',
    currentApartmentId: 2,
    currentRoomNumber: 'P.402',
    buildingName: 'Sunshine Tower A',
    activeContractId: 2,
    totalHeldDeposit: 17000000,
    creditScore: 92,
    emergencyContacts: [
      { id: 2, tenantId: 2, fullName: 'Lê Văn Tuấn', phone: '0915.223.344', relationship: 'Anh trai' }
    ],
    roommates: []
  },
  {
    id: 3,
    fullName: 'Vũ Minh Đức',
    citizenId: '001201003322',
    phone: '0987.654.321',
    email: 'duc.vu@gmail.com',
    hometown: 'Hải Phòng',
    isBadDebt: false,
    createdAt: '2024-01-01',
    currentApartmentId: 6,
    currentRoomNumber: 'P.105',
    buildingName: 'Sunshine Tower A',
    activeContractId: 3,
    totalHeldDeposit: 18000000,
    creditScore: 95,
    emergencyContacts: [],
    roommates: []
  },
  {
    id: 4,
    fullName: 'Trần Văn Hùng',
    citizenId: '001201002211',
    phone: '0918.223.344',
    email: 'hung.tran@gmail.com',
    hometown: 'Hà Nội',
    isBadDebt: false,
    createdAt: '2024-01-01',
    currentApartmentId: 7,
    currentRoomNumber: 'P.202',
    buildingName: 'Sunshine Tower A',
    activeContractId: 4,
    totalHeldDeposit: 14000000,
    creditScore: 84,
    emergencyContacts: [],
    roommates: []
  }
];

export const INITIAL_CONTRACTS: IContract[] = [
  {
    id: 1,
    contractCode: 'HĐ-2024-089',
    apartmentId: 1,
    roomNumber: 'P.302',
    buildingName: 'Sunshine Tower A',
    tenantId: 1,
    tenantName: 'Nguyễn Văn An',
    tenantCitizenId: '001201008899',
    tenantPhone: '0912.888.999',
    tenantEmail: 'an.nguyen@sunshine.vn',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    rentalPrice: 8500000,
    depositAmount: 17000000,
    paymentCycleMonths: 1,
    paymentDueDay: 5,
    status: 'ACTIVE',
    createdBy: 2,
    createdByName: 'Lê Quang Khánh',
    approvedBy: 1,
    approvedByName: 'Nguyễn Thị Trang',
    createdAt: '2024-01-01',
    aiSummary: summarizeContractWithAI('P.302', 8500000, 17000000, '01/01/2024', '31/12/2026', 'Nguyễn Văn An'),
    pdfUrl: '#',
  },
  {
    id: 2,
    contractCode: 'HĐ-2024-001',
    apartmentId: 2,
    roomNumber: 'P.402',
    buildingName: 'Sunshine Tower A',
    tenantId: 2,
    tenantName: 'Lê Hoàng Nam',
    tenantCitizenId: '001201004455',
    tenantPhone: '0912.334.689',
    tenantEmail: 'nam.le@gmail.com',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    rentalPrice: 8500000,
    depositAmount: 17000000,
    paymentCycleMonths: 1,
    paymentDueDay: 5,
    status: 'ACTIVE',
    createdBy: 2,
    createdByName: 'Lê Quang Khánh',
    approvedBy: 1,
    approvedByName: 'Nguyễn Thị Trang',
    createdAt: '2024-01-01',
    aiSummary: summarizeContractWithAI('P.402', 8500000, 17000000, '01/01/2024', '31/12/2026', 'Lê Hoàng Nam'),
    pdfUrl: '#',
  },
  {
    id: 3,
    contractCode: 'HĐ-2024-003',
    apartmentId: 6,
    roomNumber: 'P.105',
    buildingName: 'Sunshine Tower A',
    tenantId: 3,
    tenantName: 'Vũ Minh Đức',
    tenantCitizenId: '001201003322',
    tenantPhone: '0987.654.321',
    tenantEmail: 'duc.vu@gmail.com',
    startDate: '2024-01-01',
    endDate: '2026-10-05', // Expiring in ~12 days
    rentalPrice: 9000000,
    depositAmount: 18000000,
    paymentCycleMonths: 1,
    paymentDueDay: 5,
    status: 'ACTIVE',
    createdBy: 2,
    createdByName: 'Lê Quang Khánh',
    approvedBy: 1,
    approvedByName: 'Nguyễn Thị Trang',
    createdAt: '2024-01-01',
    aiSummary: summarizeContractWithAI('P.105', 9000000, 18000000, '01/01/2024', '05/10/2026', 'Vũ Minh Đức'),
    pdfUrl: '#',
  },
  {
    id: 4,
    contractCode: 'HĐ-2024-004',
    apartmentId: 7,
    roomNumber: 'P.202',
    buildingName: 'Sunshine Tower A',
    tenantId: 4,
    tenantName: 'Trần Văn Hùng',
    tenantCitizenId: '001201002211',
    tenantPhone: '0918.223.344',
    tenantEmail: 'hung.tran@gmail.com',
    startDate: '2024-03-01',
    endDate: '2027-03-01',
    rentalPrice: 7000000,
    depositAmount: 14000000,
    paymentCycleMonths: 1,
    paymentDueDay: 5,
    status: 'ACTIVE',
    createdBy: 2,
    createdByName: 'Lê Quang Khánh',
    approvedBy: 1,
    approvedByName: 'Nguyễn Thị Trang',
    createdAt: '2024-03-01',
    aiSummary: summarizeContractWithAI('P.202', 7000000, 14000000, '01/03/2024', '01/03/2027', 'Trần Văn Hùng'),
    pdfUrl: '#',
  }
];

export const INITIAL_DEPOSITS: IDeposit[] = [
  {
    id: 1,
    contractId: 1,
    contractCode: 'HĐ-2024-089',
    roomNumber: 'P.302',
    tenantName: 'Nguyễn Văn An',
    amount: 17000000,
    paidDate: '2024-01-01',
    status: 'HELD',
    refundAmount: 0,
    deductionAmount: 0,
    handledBy: 3,
    handledByName: 'Hoàng Khánh Ly',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    contractId: 2,
    contractCode: 'HĐ-2024-001',
    roomNumber: 'P.402',
    tenantName: 'Lê Hoàng Nam',
    amount: 17000000,
    paidDate: '2024-01-01',
    status: 'HELD',
    refundAmount: 0,
    deductionAmount: 0,
    handledBy: 3,
    handledByName: 'Hoàng Khánh Ly',
    createdAt: '2024-01-01',
  },
  {
    id: 3,
    contractId: 3,
    contractCode: 'HĐ-2024-003',
    roomNumber: 'P.105',
    tenantName: 'Vũ Minh Đức',
    amount: 18000000,
    paidDate: '2024-01-01',
    status: 'HELD',
    refundAmount: 0,
    deductionAmount: 0,
    handledBy: 3,
    handledByName: 'Hoàng Khánh Ly',
    createdAt: '2024-01-01',
  }
];

export const INITIAL_RECEIVABLES: IReceivable[] = [
  {
    id: 1,
    contractId: 1,
    apartmentId: 1,
    roomNumber: 'P.302',
    buildingName: 'Sunshine Tower A',
    tenantId: 1,
    tenantName: 'Nguyễn Văn An',
    tenantPhone: '0912.888.999',
    billingMonth: 11,
    billingYear: 2026,
    roomAmount: 8500000,
    serviceAmount: 847500,
    electricityCost: 437500,
    electricityUsageKwh: 125,
    waterCost: 210000,
    waterUsageM3: 14,
    managementCost: 200000,
    parkingCost: 0,
    internetCost: 0,
    totalAmount: 9347500,
    paidAmount: 0,
    remainingDebt: 9347500,
    status: 'UNPAID',
    dueDate: '2026-11-05',
    createdAt: '2026-10-25',
    qrPayload: 'HD2024089 T11',
  },
  {
    id: 2,
    contractId: 2,
    apartmentId: 2,
    roomNumber: 'P.402',
    buildingName: 'Sunshine Tower A',
    tenantId: 2,
    tenantName: 'Lê Hoàng Nam',
    tenantPhone: '0912.334.689',
    billingMonth: 11,
    billingYear: 2026,
    roomAmount: 8500000,
    serviceAmount: 1017000,
    electricityCost: 567000,
    electricityUsageKwh: 162,
    waterCost: 250000,
    waterUsageM3: 16.5,
    managementCost: 200000,
    parkingCost: 0,
    internetCost: 0,
    totalAmount: 9517000,
    paidAmount: 0,
    remainingDebt: 9517000,
    status: 'OVERDUE',
    dueDate: '2026-11-05',
    createdAt: '2026-10-25',
    qrPayload: 'DWELL P402 T11',
  },
  {
    id: 3,
    contractId: 4,
    apartmentId: 7,
    roomNumber: 'P.202',
    buildingName: 'Sunshine Tower A',
    tenantId: 4,
    tenantName: 'Trần Văn Hùng',
    tenantPhone: '0918.223.344',
    billingMonth: 11,
    billingYear: 2026,
    roomAmount: 7000000,
    serviceAmount: 1250000,
    electricityCost: 750000,
    electricityUsageKwh: 214,
    waterCost: 300000,
    waterUsageM3: 20,
    managementCost: 200000,
    parkingCost: 0,
    internetCost: 0,
    totalAmount: 8250000,
    paidAmount: 7000000,
    remainingDebt: 1250000,
    status: 'PARTIAL',
    dueDate: '2026-11-05',
    createdAt: '2026-10-25',
    qrPayload: 'DWELL P202 T11',
  },
  {
    id: 4,
    contractId: 3,
    apartmentId: 6,
    roomNumber: 'P.105',
    buildingName: 'Sunshine Tower A',
    tenantId: 3,
    tenantName: 'Vũ Minh Đức',
    tenantPhone: '0987.654.321',
    billingMonth: 11,
    billingYear: 2026,
    roomAmount: 9000000,
    serviceAmount: 800000,
    electricityCost: 400000,
    electricityUsageKwh: 114,
    waterCost: 200000,
    waterUsageM3: 13,
    managementCost: 200000,
    parkingCost: 0,
    internetCost: 0,
    totalAmount: 9800000,
    paidAmount: 9800000,
    remainingDebt: 0,
    status: 'PAID',
    dueDate: '2026-11-05',
    createdAt: '2026-10-25',
    qrPayload: 'DWELL P105 T11',
  }
];

export const INITIAL_PAYMENTS: IPayment[] = [
  {
    id: 1,
    receivableId: 4,
    contractId: 3,
    receiptNumber: 'PT-2024-1104',
    amount: 9800000,
    paymentMethod: 'BANK_TRANSFER',
    transactionCode: 'FT243209887711',
    paymentDate: '2026-11-03 09:15',
    note: 'Thanh toán tiền phòng & dịch vụ T11 qua VietQR MBBank',
    handledBy: 3,
    handledByName: 'Hoàng Khánh Ly',
    payerName: 'Vũ Minh Đức',
    roomNumber: 'P.105'
  },
  {
    id: 2,
    receivableId: 3,
    contractId: 4,
    receiptNumber: 'PT-2024-1105',
    amount: 7000000,
    paymentMethod: 'BANK_TRANSFER',
    transactionCode: 'MB243200112233',
    paymentDate: '2026-11-04 14:20',
    note: 'Thanh toán đợt 1 tiền thuê phòng P.202',
    handledBy: 3,
    handledByName: 'Hoàng Khánh Ly',
    payerName: 'Trần Văn Hùng',
    roomNumber: 'P.202'
  }
];

export const INITIAL_DEBT_LEDGERS: IDebtLedger[] = [
  {
    id: 1,
    tenantId: 1,
    tenantName: 'Nguyễn Văn An',
    tenantPhone: '0912.888.999',
    roomNumber: 'P.302',
    buildingName: 'Sunshine Tower A',
    totalReceivable: 9347500,
    totalPaid: 0,
    currentDebt: 9347500,
    lastUpdated: '2026-11-01',
    isOverdue: false,
  },
  {
    id: 2,
    tenantId: 2,
    tenantName: 'Lê Hoàng Nam',
    tenantPhone: '0912.334.689',
    roomNumber: 'P.402',
    buildingName: 'Sunshine Tower A',
    totalReceivable: 9517000,
    totalPaid: 0,
    currentDebt: 9517000,
    lastUpdated: '2026-11-10',
    isOverdue: true,
  },
  {
    id: 3,
    tenantId: 4,
    tenantName: 'Trần Văn Hùng',
    tenantPhone: '0918.223.344',
    roomNumber: 'P.202',
    buildingName: 'Sunshine Tower A',
    totalReceivable: 8250000,
    totalPaid: 7000000,
    currentDebt: 1250000,
    lastUpdated: '2026-11-08',
    isOverdue: true,
  },
  {
    id: 4,
    tenantId: 3,
    tenantName: 'Vũ Minh Đức',
    tenantPhone: '0987.654.321',
    roomNumber: 'P.105',
    buildingName: 'Sunshine Tower A',
    totalReceivable: 9800000,
    totalPaid: 9800000,
    currentDebt: 0,
    lastUpdated: '2026-11-03',
    isOverdue: false,
  }
];

export const INITIAL_MAINTENANCE_REQUESTS: IMaintenanceRequest[] = [
  {
    id: 1,
    ticketCode: 'BT-2024-042',
    apartmentId: 1,
    roomNumber: 'P.302',
    buildingName: 'Sunshine Tower A',
    reporterName: 'Nguyễn Văn An',
    phone: '0912.888.999',
    issueDescription: 'Rò rỉ vòi nước bồn rửa bát tại khu bếp, nước rỉ xuống sàn gỗ khi mở vòi áp lực cao.',
    category: 'PLUMBING',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    repairCost: 150000,
    assignedStaffId: 2,
    technicianName: 'KTV. Lê Văn Thắng',
    technicianPhone: '0988.123.456',
    technicianAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    createdAt: '2026-11-12 08:30',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80',
    tenantId: 1,
    slaMinutes: 30,
    rating: 5,
    feedback: 'Kỹ thuật viên đến nhanh, xử lý sạch sẽ và rất lịch sự.'
  },
  {
    id: 2,
    ticketCode: 'BT-2024-039',
    apartmentId: 2,
    roomNumber: 'P.402',
    buildingName: 'Sunshine Tower A',
    reporterName: 'Lê Hoàng Nam',
    phone: '0912.334.689',
    issueDescription: 'Khóa cửa vân tay báo pin yếu và khó nhận diện vân tay ngón cái.',
    category: 'DOOR_LOCK',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    repairCost: 80000,
    assignedStaffId: 2,
    technicianName: 'KTV. Nguyễn Đình Trọng',
    technicianPhone: '0977.888.999',
    createdAt: '2026-11-10 10:15',
    resolvedAt: '2026-11-10 11:20',
    tenantId: 2,
    slaMinutes: 60,
    rating: 5,
    feedback: 'Đã thay 4 quả pin Duracell mới, khóa hoạt động rất nhạy.'
  },
  {
    id: 3,
    ticketCode: 'BT-2024-048',
    apartmentId: 8,
    roomNumber: 'P.305',
    buildingName: 'Sunshine Tower B',
    reporterName: 'Hoàng Thu Thủy',
    phone: '0903.888.122',
    issueDescription: 'Nghi rò rỉ van cấp nước bồn cầu hoặc đường ống ngầm, sàn phòng tắm luôn đọng nước.',
    category: 'PLUMBING',
    priority: 'URGENT',
    status: 'PENDING',
    repairCost: 450000,
    createdAt: '2026-11-13 14:00',
    slaMinutes: 15,
  }
];

export const INITIAL_SYSTEM_ALERTS: ISystemAlert[] = [
  {
    id: 1,
    alertCode: 'ALT-2024-8841',
    alertType: 'OVERDUE_DEBT',
    referenceId: 2,
    referenceCode: 'PT-2024-0042',
    targetName: 'Lê Hoàng Nam',
    targetPhone: '0912.334.689',
    roomNumber: 'P.402',
    buildingName: 'Sunshine Tower A',
    amountDue: 9517000,
    daysOverdue: 5,
    priority: 'HIGH',
    isSent: false,
    sentChannels: [],
    aiDraftContent: {
      scenario: 'OVERDUE_WITH_PENALTY',
      tone: 'EMPATHETIC',
      subject: 'Thông báo cước phí quá hạn & Hướng dẫn thanh toán T11/2026 – Căn P.402',
      body: 'Kính gửi Anh Lê Hoàng Nam (Căn hộ P.402 - Sunshine Tower A),\n\nBan Quản Lý xin thông báo cước phí dịch vụ kỳ này của căn hộ với tổng số tiền 9.517.000 VNĐ hiện đã quá hạn thanh toán 05 ngày (Hạn gốc: 05/11/2026).\n\nHệ thống ghi nhận lịch sử thanh toán trước đây của Anh rất xuất sắc. Để duy trì điểm tín nhiệm cư dân và tránh phát sinh phí chậm trả, Anh vui lòng quét mã VietQR tự động trong Cổng cư dân để hoàn tất nhé.',
      generatedAt: '2026-11-10 09:00',
    },
    createdAt: '2026-11-10 08:00',
  },
  {
    id: 2,
    alertCode: 'ALT-2024-8839',
    alertType: 'EXPIRED_CONTRACT',
    referenceId: 3,
    referenceCode: 'HĐ-2024-003',
    targetName: 'Vũ Minh Đức',
    targetPhone: '0987.654.321',
    roomNumber: 'P.105',
    buildingName: 'Sunshine Tower A',
    daysUntilExpiry: 12,
    priority: 'HIGH',
    isSent: false,
    sentChannels: [],
    aiDraftContent: {
      scenario: 'CONTRACT_RENEWAL',
      tone: 'EMPATHETIC',
      subject: 'Đề xuất gia hạn hợp đồng thuê căn hộ P.105 – Sunshine Homes',
      body: 'Kính gửi Anh Vũ Minh Đức (P.105 - Sunshine Tower A),\n\nHợp đồng thuê căn hộ của Anh sẽ hết hạn vào ngày 05/10/2026 (còn 12 ngày). BQL trân trọng gửi tới Anh chính sách ưu đãi Tái ký Hợp đồng: Giữ nguyên mức giá thuê 9.000.000đ/tháng và tặng gói vệ sinh bảo dưỡng điều hòa miễn phí.',
      generatedAt: '2026-09-23 08:30',
    },
    createdAt: '2026-09-23 08:00',
  },
  {
    id: 3,
    alertCode: 'ALT-2024-8835',
    alertType: 'MAINTENANCE_ANOMALY',
    referenceId: 8,
    referenceCode: 'P.305',
    targetName: 'Hoàng Thu Thủy',
    targetPhone: '0903.888.122',
    roomNumber: 'P.305',
    buildingName: 'Sunshine Tower B',
    priority: 'MEDIUM',
    isSent: true,
    sentChannels: ['APP_PUSH'],
    aiDraftContent: {
      scenario: 'SERVICE_SUSPENSION_WARNING',
      tone: 'STRICT',
      subject: 'Cảnh báo chỉ số nước tăng đột biến tại căn P.305',
      body: 'Hệ thống IoT ghi nhận chỉ số tiêu thụ nước tại căn P.305 tăng +300% (28.4 m³ so với 7.1 m³ kỳ trước). Đề nghị kiểm tra rò rỉ bồn cầu hoặc khóa van tổng để tránh lãng phí.',
      generatedAt: '2026-11-12 10:00',
    },
    createdAt: '2026-11-12 09:30',
  }
];

export const INITIAL_RAG_CHUNKS: IDocumentChunk[] = [
  {
    id: 1,
    docCode: 'Quy_che_van_hanh_thang_may_2024.pdf',
    documentName: 'Quy chế Vận hành & Sử dụng thang máy hàng Sunshine Homes 2024',
    title: 'Quy định vận chuyển hàng hóa cồng kềnh & chuyển nhà',
    chunkIndex: 1,
    category: 'ELEVATOR',
    content: 'Việc vận chuyển hàng hóa cồng kềnh (sofa, tủ lạnh lớn, bàn ghế ăn, vật liệu nội thất) bắt buộc phải đăng ký trước ít nhất 24 giờ với Ban Quản Lý và chỉ được thực hiện bằng thang máy hàng chuyên dụng (Service Lift SL-01). Khung giờ cho phép ngày cuối tuần (Thứ 7 & Chủ Nhật): Buổi sáng 08:30 - 11:30 và Buổi chiều 14:00 - 17:30 (Nghiêm cấm vận chuyển sau 18:00 và giờ nghỉ trưa 11:30 - 14:00). Cư dân đóng tiền ký quỹ bảo vệ thang hàng 1.000.000 VNĐ (hoàn trả ngay sau khi kết thúc nghiệm thu cabin không trầy xước).',
    citation: 'Điều 8.2 Quy chế Vận chuyển & Sử dụng thang máy hàng Sunshine Homes 2024',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    docCode: 'Noi_quy_sinh_hoat_cu_dan_v2.4.pdf',
    documentName: 'Nội quy Sinh hoạt Cư dân & Quy chuẩn Cộng đồng Văn minh 2024',
    title: 'Quy định nuôi và quản lý thú cưng trong căn hộ',
    chunkIndex: 2,
    category: 'LIVING_RULES',
    content: 'Tòa nhà cho phép nuôi thú cưng nhỏ dưới 10kg đã tiêm phòng dại định kỳ và có cam kết vệ sinh chung. Khi đưa thú cưng ra sảnh hoặc khuôn viên chung bắt buộc phải có dây xích, rọ mõm và đi bằng thang máy dịch vụ. Nghiêm cấm để thú cưng phóng uế bừa bãi tại hành lang hoặc sủa gây ồn sau 22:00.',
    citation: 'Điều 8, Khoản 2 - Quy chế Quản lý Vận hành Sunshine Homes',
    createdAt: '2024-01-01',
  },
  {
    id: 3,
    docCode: 'Noi_quy_sinh_hoat_cu_dan_v2.4.pdf',
    documentName: 'Nội quy Sinh hoạt Cư dân & Quy chuẩn Cộng đồng Văn minh 2024',
    title: 'Giờ giấc kiểm soát tiếng ồn & tiệc tùng tại căn hộ',
    chunkIndex: 3,
    category: 'LIVING_RULES',
    content: 'Khung giờ giữ yên tĩnh chung của tòa nhà bắt đầu từ 22:00 đêm hôm trước đến 06:00 sáng hôm sau và giờ nghỉ trưa từ 11:30 đến 13:30 hàng ngày. Cư dân không sử dụng dàn âm thanh công suất lớn, karaoke hoặc gây ồn ào ảnh hưởng các căn hộ liền kề trong khung giờ này.',
    citation: 'Điều 4.1 Quy định Trật tự & Tiếng ồn Nội bộ',
    createdAt: '2024-01-01',
  },
  {
    id: 4,
    docCode: 'Quy_chuan_PCCC_va_Thoat_hiem_2024.pdf',
    documentName: 'Quy chuẩn Phòng Cháy Chữa Cháy & Lối thoát hiểm',
    title: 'Quy định an toàn PCCC, sạc xe điện & ban công',
    chunkIndex: 4,
    category: 'SECURITY_FIRE',
    content: 'Nghiêm cấm sạc pin xe điện hoặc bình ắc quy tự chế qua đêm tại căn hộ. Việc sạc xe điện bắt buộc thực hiện tại Trụ sạc thông minh chuyên dụng dưới tầng hầm B1 có trang bị hệ thống chữa cháy tự động Sprinkler và quả cầu dập lửa. Không để đồ đạc chắn lối thoát hiểm hành lang và cửa thang thoát hiểm phải luôn ở trạng thái đóng kín tự động.',
    citation: 'Điều 12.3 Quy chuẩn An toàn PCCC Sunshine Tower',
    createdAt: '2024-01-01',
  },
  {
    id: 5,
    docCode: 'Quy_dinh_cai_tao_va_thi_cong_noi_that.pdf',
    documentName: 'Quy định Cải tạo & Thi công Nội thất',
    title: 'Thủ tục đăng ký khoan tường, lắp rèm và sửa chữa',
    chunkIndex: 5,
    category: 'RENOVATION',
    content: 'Cư dân muốn khoan tường, lắp rèm cửa, lưới an toàn ban công hoặc sửa chữa nhỏ cần gửi phiếu đăng ký trước 24h qua Cổng Cư Dân. Khung giờ thi công phát sinh tiếng ồn chỉ được phép từ 08:30 - 11:30 và 13:30 - 17:00 các ngày từ Thứ 2 đến Thứ 6. Nghiêm cấm khoan đục vào Thứ 7, Chủ Nhật và ngày lễ.',
    citation: 'Điều 6.1 Quy định Thi công Nội thất Căn hộ',
    createdAt: '2024-01-01',
  },
  {
    id: 6,
    docCode: 'Bieu_phi_dich_vu_va_gui_xe_2024.pdf',
    documentName: 'Biểu phí Dịch vụ & Gửi xe Tầng hầm',
    title: 'Biểu phí gửi xe ô tô, xe máy và tiện ích hồ bơi/gym',
    chunkIndex: 6,
    category: 'PARKING',
    content: 'Biểu phí niêm yết: Xe máy: 120.000đ/xe/tháng (tối đa 2 xe/căn hộ). Ô tô: 1.200.000đ/xe/tháng cho vị trí cố định có camera thông minh. Phí dịch vụ quản lý tòa nhà: 12.000đ/m²/tháng. Cư dân được miễn phí 100% sử dụng phòng Gym và Hồ bơi vô cực tại Tầng 4.',
    citation: 'Điều 9.4 Biểu phí Dịch vụ & Tiện ích Sunshine Homes',
    createdAt: '2024-01-01',
  }
];

export const INITIAL_BOOKINGS: IBooking[] = [
  {
    id: 1,
    bookingCode: 'BK-2024-019',
    customerName: 'Hoàng Thùy Linh',
    customerPhone: '0903.888.122',
    customerEmail: 'thuylinh.hoang@gmail.com',
    customerCitizenId: '001201009988',
    apartmentId: 5,
    roomNumber: 'P.801',
    buildingName: 'Sunshine Tower A',
    monthlyPrice: 10500000,
    checkInDate: '2026-11-20',
    depositAmount: 1000000,
    status: 'CONFIRMED',
    notes: 'Khách muốn thuê lâu dài 2 năm, nhận nhà ngày 20/11.',
    createdAt: '2026-11-10',
  },
  {
    id: 2,
    bookingCode: 'BK-2024-022',
    customerName: 'Trần Hải Đăng',
    customerPhone: '0919.777.666',
    customerEmail: 'dang.tran@outlook.com',
    apartmentId: 3,
    roomNumber: 'P.405',
    buildingName: 'Sunshine Tower A',
    monthlyPrice: 6500000,
    checkInDate: '2026-11-25',
    depositAmount: 1000000,
    status: 'PENDING',
    notes: 'Yêu cầu hỗ trợ chuyển phòng vào cuối tuần.',
    createdAt: '2026-11-12',
  }
];

// Mock Database Class
class MockDatabase {
  getUsers(): IUser[] {
    return getStored('users', INITIAL_USERS);
  }
  setUsers(users: IUser[]) {
    setStored('users', users);
  }

  getBuildings(): IBuilding[] {
    return getStored('buildings', INITIAL_BUILDINGS);
  }
  setBuildings(buildings: IBuilding[]) {
    setStored('buildings', buildings);
  }

  getApartments(): IApartment[] {
    return getStored('apartments', INITIAL_APARTMENTS);
  }
  setApartments(apartments: IApartment[]) {
    setStored('apartments', apartments);
  }

  getTenants(): ITenant[] {
    return getStored('tenants', INITIAL_TENANTS);
  }
  setTenants(tenants: ITenant[]) {
    setStored('tenants', tenants);
  }

  getContracts(): IContract[] {
    return getStored('contracts', INITIAL_CONTRACTS);
  }
  setContracts(contracts: IContract[]) {
    setStored('contracts', contracts);
  }

  getDeposits(): IDeposit[] {
    return getStored('deposits', INITIAL_DEPOSITS);
  }
  setDeposits(deposits: IDeposit[]) {
    setStored('deposits', deposits);
  }

  getReceivables(): IReceivable[] {
    return getStored('receivables', INITIAL_RECEIVABLES);
  }
  setReceivables(receivables: IReceivable[]) {
    setStored('receivables', receivables);
  }

  getPayments(): IPayment[] {
    return getStored('payments', INITIAL_PAYMENTS);
  }
  setPayments(payments: IPayment[]) {
    setStored('payments', payments);
  }

  getDebtLedgers(): IDebtLedger[] {
    return getStored('debt_ledgers', INITIAL_DEBT_LEDGERS);
  }
  setDebtLedgers(ledgers: IDebtLedger[]) {
    setStored('debt_ledgers', ledgers);
  }

  getMaintenanceRequests(): IMaintenanceRequest[] {
    return getStored('maintenance_requests', INITIAL_MAINTENANCE_REQUESTS);
  }
  setMaintenanceRequests(requests: IMaintenanceRequest[]) {
    setStored('maintenance_requests', requests);
  }

  getSystemAlerts(): ISystemAlert[] {
    return getStored('system_alerts', INITIAL_SYSTEM_ALERTS);
  }
  setSystemAlerts(alerts: ISystemAlert[]) {
    setStored('system_alerts', alerts);
  }

  getRAGChunks(): IDocumentChunk[] {
    return getStored('rag_chunks', INITIAL_RAG_CHUNKS);
  }
  setRAGChunks(chunks: IDocumentChunk[]) {
    setStored('rag_chunks', chunks);
  }

  getBookings(): IBooking[] {
    return getStored('bookings', INITIAL_BOOKINGS);
  }
  setBookings(bookings: IBooking[]) {
    setStored('bookings', bookings);
  }

  getDashboardStats(): IDashboardStats {
    const apts = this.getApartments();
    const total = apts.length;
    const occupied = apts.filter(a => a.status === 'OCCUPIED').length;
    const vacant = apts.filter(a => a.status === 'AVAILABLE').length;
    const reserved = apts.filter(a => a.status === 'RESERVED').length;
    const maintenance = apts.filter(a => a.status === 'MAINTENANCE').length;

    const receivables = this.getReceivables();
    const totalRev = receivables.reduce((sum, r) => sum + r.paidAmount, 0) + 4850000000;
    const overdueReceivables = receivables.filter(r => r.status === 'OVERDUE' || (r.status === 'PARTIAL' && r.remainingDebt > 0));
    const totalDebt = overdueReceivables.reduce((sum, r) => sum + r.remainingDebt, 0) + 68500000;

    return {
      occupancyRate: total > 0 ? Number(((occupied / total) * 100).toFixed(1)) : 94.6,
      occupiedRooms: occupied || 454,
      totalRooms: total || 480,
      vacantRooms: vacant || 26,
      reservedRooms: reserved || 5,
      maintenanceRooms: maintenance || 2,
      totalRevenueMonth: totalRev,
      targetRevenueMonth: 4850000000,
      revenueGrowthMoM: 12.4,
      netOperatingIncome: 3620000000,
      noiMarginPercent: 74.6,
      totalDebtOverdue: totalDebt,
      overdueDebtCount: overdueReceivables.length || 6,
      debtChangeMoM: -18.5,
      csatScore: 4.82,
      avgMaintenanceSlaHours: 3.4,
      activeContractsCount: 14,
      expiringContractsCount: 3,
      draftContractsCount: 2,
      totalDepositsHeld: 84500000,
    };
  }

  // Reset database to initial state
  resetAll() {
    localStorage.clear();
  }
}

export const mockDb = new MockDatabase();
