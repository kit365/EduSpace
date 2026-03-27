import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { showToast } from '@/utils/toast';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  depositRefundPolicyService,
  type DepositRefundPolicyDto,
  type UpsertDepositRefundPolicyPayload,
} from '../services/depositRefundPolicyService';
import { useAuthStore } from '@/stores/authStore';
import { hasHostPermission } from '@/utils/keycloakTokenRoles';
import { hostPermissions } from '../permissions/hostPermissions';
import { refreshHostPermissionsFromAccount } from '@/utils/refreshHostPermissionsFromAccount';

type PolicyType = 'DEPOSIT' | 'REFUND';

type PolicyForm = {
  policyName: string;
  description: string;
  policyType: PolicyType;
  depositPercentage: number;
  startHour: number | '';
  endHour: number | '';
  fullRefundHours: number | '';
  fullRefundPercentage: number | '';
  partialRefundHours: number | '';
  partialRefundPercentage: number | '';
  noRefundHours: number | '';
  noRefundPercentage: number | '';
  isDefault: boolean;
  highlightText: string;
  isActive: boolean;
};

function toForm(policy?: DepositRefundPolicyDto | null): PolicyForm {
  if (!policy) {
    return {
      policyName: '',
      description: '',
      policyType: 'DEPOSIT',
      depositPercentage: 25,
      startHour: '',
      endHour: '',
      fullRefundHours: 48,
      fullRefundPercentage: 100,
      partialRefundHours: 24,
      partialRefundPercentage: 50,
      noRefundHours: 12,
      noRefundPercentage: 0,
      isDefault: false,
      highlightText: '',
      isActive: true,
    };
  }
  return {
    policyName: policy.policyName ?? '',
    description: policy.description ?? '',
    policyType: policy.policyType,
    depositPercentage: Number(policy.depositPercentage ?? 0),
    startHour: policy.startHour ?? '',
    endHour: policy.endHour ?? '',
    fullRefundHours: policy.fullRefundHours ?? '',
    fullRefundPercentage: policy.fullRefundPercentage ?? '',
    partialRefundHours: policy.partialRefundHours ?? '',
    partialRefundPercentage: policy.partialRefundPercentage ?? '',
    noRefundHours: policy.noRefundHours ?? '',
    noRefundPercentage: policy.noRefundPercentage ?? '',
    isDefault: Boolean(policy.isDefault),
    highlightText: policy.highlightText ?? '',
    isActive: Boolean(policy.isActive),
  };
}

function toPayload(form: PolicyForm): UpsertDepositRefundPolicyPayload {
  const payload: UpsertDepositRefundPolicyPayload = {
    policyName: form.policyName.trim(),
    description: form.description.trim() || null,
    policyType: form.policyType,
    depositPercentage: Number(form.depositPercentage || 0),
    startHour: form.startHour === '' ? null : Number(form.startHour),
    endHour: form.endHour === '' ? null : Number(form.endHour),
    fullRefundHours: form.fullRefundHours === '' ? null : Number(form.fullRefundHours),
    fullRefundPercentage: form.fullRefundPercentage === '' ? null : Number(form.fullRefundPercentage),
    partialRefundHours: form.partialRefundHours === '' ? null : Number(form.partialRefundHours),
    partialRefundPercentage: form.partialRefundPercentage === '' ? null : Number(form.partialRefundPercentage),
    noRefundHours: form.noRefundHours === '' ? null : Number(form.noRefundHours),
    noRefundPercentage: form.noRefundPercentage === '' ? null : Number(form.noRefundPercentage),
    isDefault: form.isDefault,
    highlightText: form.highlightText.trim() || null,
    isActive: form.isActive,
  };
  return payload;
}

export function DepositRefundPolicyManagementPage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hostPermissionsFromAccount = useAuthStore((s) => s.hostPermissionsFromAccount);
  const [policies, setPolicies] = useState<DepositRefundPolicyDto[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | PolicyType>('ALL');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DepositRefundPolicyDto | null>(null);
  const [form, setForm] = useState<PolicyForm>(toForm());
  const [saving, setSaving] = useState(false);

  const depositPolicies = useMemo(() => policies.filter((p) => p.policyType === 'DEPOSIT'), [policies]);
  const refundPolicies = useMemo(() => policies.filter((p) => p.policyType === 'REFUND'), [policies]);
  const visiblePolicies = useMemo(() => {
    if (activeTab === 'ALL') return policies;
    return policies.filter((p) => p.policyType === activeTab);
  }, [activeTab, policies]);
  const canViewPolicy = hasHostPermission(accessToken, hostPermissions.depositPolicy.view, hostPermissionsFromAccount);
  const canCreatePolicy = hasHostPermission(accessToken, hostPermissions.depositPolicy.create, hostPermissionsFromAccount);
  const canEditPolicy = hasHostPermission(accessToken, hostPermissions.depositPolicy.edit, hostPermissionsFromAccount);
  const canDeletePolicy = hasHostPermission(accessToken, hostPermissions.depositPolicy.delete, hostPermissionsFromAccount);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const data = await depositRefundPolicyService.getAll();
      setPolicies(data);
    } catch {
      showToast.error('Không tải được danh sách chính sách.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshHostPermissionsFromAccount();
  }, [accessToken]);

  useEffect(() => {
    if (!canViewPolicy) return;
    void loadPolicies();
  }, [canViewPolicy]);

  const openCreate = () => {
    if (!canCreatePolicy) {
      showToast.error('Bạn không có quyền tạo chính sách.');
      return;
    }
    setEditing(null);
    const next = toForm(null);
    if (activeTab !== 'ALL') {
      next.policyType = activeTab;
    }
    setForm(next);
    setShowModal(true);
  };

  const openEdit = (item: DepositRefundPolicyDto) => {
    if (!canEditPolicy) {
      showToast.error('Bạn không có quyền sửa chính sách.');
      return;
    }
    setEditing(item);
    setForm(toForm(item));
    setShowModal(true);
  };

  const validate = (): string | null => {
    if (!form.policyName.trim()) return 'Vui lòng nhập tên chính sách.';
    if (form.policyType === 'DEPOSIT') {
      if (form.startHour !== '' && Number(form.startHour) < 0) return 'startHour phải >= 0.';
      if (form.endHour !== '' && Number(form.endHour) < 0) return 'endHour phải >= 0.';
      if (form.startHour !== '' && form.endHour !== '' && Number(form.startHour) > Number(form.endHour)) {
        return 'startHour không được lớn hơn endHour.';
      }
    }
    if (form.policyType === 'REFUND') {
      if (form.fullRefundHours === '' || form.partialRefundHours === '' || form.noRefundHours === '') {
        return 'Vui lòng nhập đủ mốc giờ hoàn tiền.';
      }
      if (form.fullRefundPercentage === '' || form.partialRefundPercentage === '' || form.noRefundPercentage === '') {
        return 'Vui lòng nhập đủ tỷ lệ hoàn tiền.';
      }
    }
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) {
      showToast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editing) {
        if (!canEditPolicy) {
          showToast.error('Bạn không có quyền sửa chính sách.');
          return;
        }
        await depositRefundPolicyService.update(editing.id, payload);
        showToast.success('Cập nhật chính sách thành công.');
      } else {
        if (!canCreatePolicy) {
          showToast.error('Bạn không có quyền tạo chính sách.');
          return;
        }
        await depositRefundPolicyService.create(payload);
        showToast.success('Tạo chính sách thành công.');
      }
      setShowModal(false);
      await loadPolicies();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Lưu chính sách thất bại.'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!canDeletePolicy) {
      showToast.error('Bạn không có quyền xóa chính sách.');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa chính sách này?')) return;
    try {
      await depositRefundPolicyService.remove(id);
      showToast.success('Đã xóa chính sách.');
      await loadPolicies();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Xóa chính sách thất bại.'));
    }
  };

  if (!canViewPolicy) {
    return (
      <RentalLayout title="Chính sách cọc & hoàn tiền">
        <div className="mx-auto max-w-lg p-8 text-center text-gray-600">Bạn không có quyền xem module chính sách đặt cọc.</div>
      </RentalLayout>
    );
  }

  return (
    <RentalLayout title="Chính sách cọc & hoàn tiền">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Quản lý chính sách đặt cọc / hoàn tiền</h1>
            <p className="text-sm font-medium text-gray-500">Đã tách theo policyType: DEPOSIT và REFUND.</p>
          </div>
          {canCreatePolicy && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
            >
              <Plus className="h-4 w-4" />
              Tạo chính sách
            </button>
          )}
        </div>

        {loading ? <div className="rounded-xl bg-white p-4 text-sm">Đang tải dữ liệu...</div> : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'ALL' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            ALL ({policies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DEPOSIT')}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'DEPOSIT' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            DEPOSIT ({depositPolicies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REFUND')}
            className={`rounded-xl px-4 py-2 text-sm font-bold ${activeTab === 'REFUND' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            REFUND ({refundPolicies.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-gray-900">Chính sách đặt cọc (DEPOSIT)</h2>
            <div className="space-y-3">
              {visiblePolicies.filter((p) => p.policyType === 'DEPOSIT').map((p) => (
                <div key={p.id} className="rounded-xl border border-gray-100 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-bold text-gray-900">{p.policyName}</p>
                    <div className="flex items-center gap-2">
                      {canEditPolicy && (
                        <button type="button" onClick={() => openEdit(p)} className="text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDeletePolicy && (
                        <button type="button" onClick={() => void remove(p.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{p.description || '—'}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-700">
                    Cọc: {p.depositPercentage}% | Khoảng giờ: {p.startHour ?? '—'} - {p.endHour ?? '∞'}
                  </p>
                </div>
              ))}
              {!visiblePolicies.some((p) => p.policyType === 'DEPOSIT') ? <p className="text-sm text-gray-500">Chưa có policy DEPOSIT.</p> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-gray-900">Chính sách hoàn tiền (REFUND)</h2>
            <div className="space-y-3">
              {visiblePolicies.filter((p) => p.policyType === 'REFUND').map((p) => (
                <div key={p.id} className="rounded-xl border border-gray-100 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-bold text-gray-900">{p.policyName}</p>
                    <div className="flex items-center gap-2">
                      {canEditPolicy && (
                        <button type="button" onClick={() => openEdit(p)} className="text-blue-600">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {canDeletePolicy && (
                        <button type="button" onClick={() => void remove(p.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{p.description || '—'}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-700">
                    100%: {p.fullRefundHours}h | 1 phần: {p.partialRefundHours}h | 0%: {p.noRefundHours}h
                  </p>
                </div>
              ))}
              {!visiblePolicies.some((p) => p.policyType === 'REFUND') ? <p className="text-sm text-gray-500">Chưa có policy REFUND.</p> : null}
            </div>
          </div>
        </div>
      </div>

      {showModal ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-black">{editing ? 'Chỉnh sửa chính sách' : 'Tạo chính sách mới'}</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={form.policyName}
                onChange={(e) => setForm((s) => ({ ...s, policyName: e.target.value }))}
                placeholder="Tên chính sách"
                className="rounded-lg border px-3 py-2"
              />
              <select
                value={form.policyType}
                onChange={(e) => setForm((s) => ({ ...s, policyType: e.target.value as PolicyType }))}
                className="rounded-lg border px-3 py-2"
              >
                <option value="DEPOSIT">DEPOSIT (Đặt cọc)</option>
                <option value="REFUND">REFUND (Hoàn tiền)</option>
              </select>
              <input
                type="number"
                value={form.depositPercentage}
                onChange={(e) => setForm((s) => ({ ...s, depositPercentage: Number(e.target.value) }))}
                placeholder="Deposit %"
                className="rounded-lg border px-3 py-2"
              />
              <input
                value={form.highlightText}
                onChange={(e) => setForm((s) => ({ ...s, highlightText: e.target.value }))}
                placeholder="Highlight text"
                className="rounded-lg border px-3 py-2"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                placeholder="Mô tả"
                className="md:col-span-2 rounded-lg border px-3 py-2"
                rows={3}
              />
            </div>

            {form.policyType === 'DEPOSIT' ? (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="number"
                  value={form.startHour}
                  onChange={(e) => setForm((s) => ({ ...s, startHour: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="startHour (vd: 2)"
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  type="number"
                  value={form.endHour}
                  onChange={(e) => setForm((s) => ({ ...s, endHour: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="endHour (bỏ trống = không giới hạn)"
                  className="rounded-lg border px-3 py-2"
                />
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                <input
                  type="number"
                  value={form.fullRefundHours}
                  onChange={(e) => setForm((s) => ({ ...s, fullRefundHours: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="fullRefundHours"
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  type="number"
                  value={form.fullRefundPercentage}
                  onChange={(e) => setForm((s) => ({ ...s, fullRefundPercentage: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="fullRefundPercentage"
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  type="number"
                  value={form.partialRefundHours}
                  onChange={(e) => setForm((s) => ({ ...s, partialRefundHours: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="partialRefundHours"
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  type="number"
                  value={form.partialRefundPercentage}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, partialRefundPercentage: e.target.value === '' ? '' : Number(e.target.value) }))
                  }
                  placeholder="partialRefundPercentage"
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  type="number"
                  value={form.noRefundHours}
                  onChange={(e) => setForm((s) => ({ ...s, noRefundHours: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="noRefundHours"
                  className="rounded-lg border px-3 py-2"
                />
                <input
                  type="number"
                  value={form.noRefundPercentage}
                  onChange={(e) => setForm((s) => ({ ...s, noRefundPercentage: e.target.value === '' ? '' : Number(e.target.value) }))}
                  placeholder="noRefundPercentage"
                  className="rounded-lg border px-3 py-2"
                />
              </div>
            )}

            <div className="mt-4 flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm((s) => ({ ...s, isDefault: e.target.checked }))}
                />
                Default
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                />
                Active
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2 font-bold text-gray-600"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="flex-1 rounded-xl bg-gray-900 py-2 font-bold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </RentalLayout>
  );
}

