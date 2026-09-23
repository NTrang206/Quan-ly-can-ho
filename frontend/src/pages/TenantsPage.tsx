import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  UserPlus,
  ShieldCheck,
  Phone,
  Mail,
  Home,
  FileText,
  AlertCircle,
  CreditCard,
  Building,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import {
  useGetTenantsQuery,
  useCreateTenantMutation,
  useAddRoommateMutation,
  useAddEmergencyContactMutation,
} from '../modules/tenants/services/tenantApi';
import { ITenant } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../hooks/useToast';

export const TenantsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<ITenant | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddRoommateModalOpen, setIsAddRoommateModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  // Create Form
  const [fullName, setFullName] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hometown, setHometown] = useState('');

  // Roommate Form
  const [rmName, setRmName] = useState('');
  const [rmCitizenId, setRmCitizenId] = useState('');
  const [rmPhone, setRmPhone] = useState('');
  const [rmRelation, setRmRelation] = useState('Bạn cùng phòng');

  // Contact Form
  const [ctName, setCtName] = useState('');
  const [ctPhone, setCtPhone] = useState('');
  const [ctRelation, setCtRelation] = useState('Người thân');

  const { data: tenants = [], isLoading } = useGetTenantsQuery({ search: searchQuery });
  const [createTenant, { isLoading: isCreating }] = useCreateTenantMutation();
  const [addRoommate, { isLoading: isAddingRm }] = useAddRoommateMutation();
  const [addContact, { isLoading: isAddingCt }] = useAddEmergencyContactMutation();
  const toast = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTenant({
        fullName,
        citizenId,
        phone,
        email,
        hometown,
      }).unwrap();

      toast.success('Thành công', 'Đã khởi tạo hồ sơ cư dân mới!');
      setIsCreateModalOpen(false);
      setFullName('');
      setCitizenId('');
    } catch {
      toast.error('Lỗi', 'Không thể tạo hồ sơ');
    }
  };

  const handleAddRoommate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      await addRoommate({
        tenantId: selectedTenant.id,
        roommate: {
          apartmentId: selectedTenant.currentApartmentId || 1,
          fullName: rmName,
          citizenId: rmCitizenId,
          phone: rmPhone,
          relationship: rmRelation,
          isRegisteredTemp: true,
          registeredDate: new Date().toISOString().split('T')[0],
        },
      }).unwrap();

      toast.success('Đã thêm người ở cùng', `Đã liên kết ${rmName} và gửi đăng ký tạm trú DVC!`);
      setIsAddRoommateModalOpen(false);
      setRmName('');
      setRmCitizenId('');
    } catch {
      toast.error('Lỗi', 'Không thể thêm người ở cùng');
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      await addContact({
        tenantId: selectedTenant.id,
        contact: {
          fullName: ctName,
          phone: ctPhone,
          relationship: ctRelation,
        },
      }).unwrap();

      toast.success('Đã thêm liên hệ khẩn cấp', `Đã lưu thông tin người liên hệ: ${ctName}!`);
      setIsAddContactModalOpen(false);
      setCtName('');
    } catch {
      toast.error('Lỗi', 'Không thể thêm liên hệ');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="text-xs font-semibold text-brand-600 mb-0.5">
            Cư dân & khách thuê
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Quản Lý Khách Thuê & Cư Dân
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lý lịch khách đại diện, CCCD/VNeID và danh sách người ở cùng.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Thêm Khách Mới
        </Button>
      </div>

      {/* Search toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo CCCD, Họ tên, SĐT, số phòng..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Tổng cộng: <strong className="text-slate-900">{tenants.length}</strong> khách thuê
        </div>
      </div>

      {/* Tenants Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenants.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all duration-200 space-y-3"
          >
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-sm shadow-soft">
                  {t.fullName.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">{t.fullName}</h3>
                    <span className="px-2 py-0.2 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> VNeID
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">CCCD: {t.citizenId} • Quê: {t.hometown}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                  {t.currentRoomNumber || 'P.302'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{t.buildingName}</div>
              </div>
            </div>

            {/* Roommates sub-panel */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Người Ở Cùng ({t.roommates?.length || 0})</span>
                <button
                  onClick={() => {
                    setSelectedTenant(t);
                    setIsAddRoommateModalOpen(true);
                  }}
                  className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" /> Thêm người
                </button>
              </div>

              {t.roommates && t.roommates.length > 0 ? (
                <div className="space-y-1.5">
                  {t.roommates.map((rm) => (
                    <div
                      key={rm.id}
                      className="bg-white p-2 rounded-lg border border-slate-200/70 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <strong className="text-slate-900">{rm.fullName}</strong>
                        <span className="text-slate-400"> ({rm.relationship})</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600">
                        {rm.isRegisteredTemp ? '✓ Đã duyệt tạm trú' : 'Chưa duyệt'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-[11px] italic">Chưa đăng ký người ở cùng</div>
              )}
            </div>

            {/* Emergency contacts sub-panel */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <span>Liên Hệ Khẩn Cấp ({t.emergencyContacts?.length || 0})</span>
                <button
                  onClick={() => {
                    setSelectedTenant(t);
                    setIsAddContactModalOpen(true);
                  }}
                  className="text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Thêm liên hệ
                </button>
              </div>

              {t.emergencyContacts && t.emergencyContacts.length > 0 ? (
                <div className="space-y-1">
                  {t.emergencyContacts.map((ct) => (
                    <div key={ct.id} className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800">
                        {ct.fullName} ({ct.relationship}):
                      </span>
                      <strong className="text-brand-700">{ct.phone}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-[11px] italic">Chưa cấu hình liên hệ khẩn</div>
              )}
            </div>

            {/* Bottom stats */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>SĐT: <strong className="text-slate-800">{t.phone}</strong></div>
              <div>Điểm uy tín: <strong className="text-emerald-600 font-bold">{t.creditScore}/100</strong></div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Tenant */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Mới Hồ Sơ Khách Thuê Đại Diện"
        subtitle="Hệ thống tự động liên kết tài khoản Cổng cư dân Resident Hub"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isCreating}
              onClick={handleCreate}
            >
              Lưu Hồ Sơ Khách
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Họ và tên đầy đủ theo CCCD"
            required
            placeholder="VD: Nguyễn Văn An"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Số CCCD 12 chữ số"
              required
              placeholder="001201008899"
              value={citizenId}
              onChange={(e) => setCitizenId(e.target.value)}
            />
            <Input
              label="Số điện thoại di động"
              required
              placeholder="0912.***.***"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email liên hệ"
              type="email"
              placeholder="customer@sunshine.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Quê quán / Thường trú"
              placeholder="VD: Thái Bình"
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
            />
          </div>
        </form>
      </Modal>

      {/* Modal Add Roommate */}
      {selectedTenant && (
        <Modal
          isOpen={isAddRoommateModalOpen}
          onClose={() => setIsAddRoommateModalOpen(false)}
          title={`Đăng Ký Người Ở Cùng • Khách ${selectedTenant.fullName}`}
          subtitle={`Căn ${selectedTenant.currentRoomNumber || 'P.302'} • Kết nối Cổng Dịch vụ công Quốc gia`}
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAddRoommateModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isAddingRm}
                onClick={handleAddRoommate}
              >
                Lưu & Đăng Ký Tạm Trú
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAddRoommate} className="space-y-4">
            <Input
              label="Họ và tên người ở cùng"
              required
              placeholder="VD: Trần Thị Mai"
              value={rmName}
              onChange={(e) => setRmName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Số CCCD người ở cùng"
                required
                placeholder="001201008888"
                value={rmCitizenId}
                onChange={(e) => setRmCitizenId(e.target.value)}
              />
              <Input
                label="Số điện thoại"
                placeholder="0913.***.***"
                value={rmPhone}
                onChange={(e) => setRmPhone(e.target.value)}
              />
            </div>

            <Input
              label="Mối quan hệ với khách đại diện"
              placeholder="VD: Vợ / Chồng / Con / Bạn bè"
              value={rmRelation}
              onChange={(e) => setRmRelation(e.target.value)}
            />
          </form>
        </Modal>
      )}

      {/* Modal Add Emergency Contact */}
      {selectedTenant && (
        <Modal
          isOpen={isAddContactModalOpen}
          onClose={() => setIsAddContactModalOpen(false)}
          title={`Thêm Người Liên Hệ Khẩn Cấp • ${selectedTenant.fullName}`}
          footer={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAddContactModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isAddingCt}
                onClick={handleAddContact}
              >
                Lưu Liên Hệ Khẩn Cấp
              </Button>
            </div>
          }
        >
          <form onSubmit={handleAddContact} className="space-y-4">
            <Input
              label="Họ tên người liên hệ khẩn cấp"
              required
              placeholder="VD: Nguyễn Văn Bình"
              value={ctName}
              onChange={(e) => setCtName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Số điện thoại khẩn cấp"
                required
                placeholder="0903.***.***"
                value={ctPhone}
                onChange={(e) => setCtPhone(e.target.value)}
              />
              <Input
                label="Mối quan hệ"
                required
                placeholder="VD: Bố đẻ / Mẹ đẻ / Anh trai"
                value={ctRelation}
                onChange={(e) => setCtRelation(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
