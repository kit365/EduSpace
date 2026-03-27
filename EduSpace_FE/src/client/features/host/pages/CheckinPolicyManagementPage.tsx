import { useEffect, useMemo, useState } from 'react';
import { Building2, Clock3, Loader2, Save, ShieldAlert } from 'lucide-react';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { useBranch } from '../context/BranchContext';
import {
  checkinPolicyService,
  type BookingCheckinPolicyDto,
  type CheckinRefundMode,
  type LateWithinGraceUsageMode,
} from '../services/checkinPolicyService';
import { showToast } from '../../../../utils/toast';
import { getApiErrorMessage } from '../../../../utils/apiError';

type PolicyForm = {
  graceMinutes: number;
  autoCancelMinutes: number;
  allowEarlyWaiting: boolean;
  allowLateWithinGraceCheckin: boolean;
  lateWithinGraceUsageMode: LateWithinGraceUsageMode;
  lateOverGraceRefundMode: CheckinRefundMode;
  noShowRefundMode: CheckinRefundMode;
  isActive: boolean;
};

function toForm(policy: BookingCheckinPolicyDto): PolicyForm {
  return {
    graceMinutes: policy.graceMinutes,
    autoCancelMinutes: policy.autoCancelMinutes,
    allowEarlyWaiting: policy.allowEarlyWaiting,
    allowLateWithinGraceCheckin: policy.allowLateWithinGraceCheckin,
    lateWithinGraceUsageMode: policy.lateWithinGraceUsageMode,
    lateOverGraceRefundMode: policy.lateOverGraceRefundMode,
    noShowRefundMode: policy.noShowRefundMode,
    isActive: policy.isActive,
  };
}

function createDefaultForm(): PolicyForm {
  return {
    graceMinutes: 15,
    autoCancelMinutes: 30,
    allowEarlyWaiting: true,
    allowLateWithinGraceCheckin: true,
    lateWithinGraceUsageMode: 'DEDUCT_LATE_TIME',
    lateOverGraceRefundMode: 'FOLLOW_DEPOSIT_REFUND_POLICY',
    noShowRefundMode: 'ZERO_DEPOSIT_REFUND',
    isActive: true,
  };
}

export function CheckinPolicyManagementPage() {
  return (
    <RentalLayout title="Nguyên tắc checkin">
      <CheckinPolicyManagementContent />
    </RentalLayout>
  );
}

function CheckinPolicyManagementContent() {
  const { selectedBranch, setSelectedBranch, branches, loadingBranches } = useBranch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [policyList, setPolicyList] = useState<BookingCheckinPolicyDto[]>([]);
  const [policy, setPolicy] = useState<BookingCheckinPolicyDto | null>(null);
  const [form, setForm] = useState<PolicyForm | null>(null);

  const propertyId = selectedBranch?.id ?? null;

  useEffect(() => {
    if (selectedBranch || loadingBranches) return;
    if (branches.length === 0) return;
    setSelectedBranch(branches[0]);
  }, [selectedBranch, loadingBranches, branches, setSelectedBranch]);

  const loadPolicyList = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const list = await checkinPolicyService.listByPropertyId(propertyId);
      setPolicyList(list);
      const current = list[0] ?? null;
      setPolicy(current);
      setForm(current ? toForm(current) : createDefaultForm());
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        showToast.error(getApiErrorMessage(error, 'Không tải được nguyên tắc checkin.'));
      }
      setPolicyList([]);
      setPolicy(null);
      setForm(createDefaultForm());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPolicyList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const canSave = useMemo(() => {
    if (!form || !propertyId) return false;
    const grace = Number(form.graceMinutes);
    const autoCancel = Number(form.autoCancelMinutes);
    if (isNaN(grace) || grace < 0) return false;
    if (isNaN(autoCancel) || autoCancel <= grace) return false;
    return true;
  }, [form, propertyId]);

  const save = async () => {
    if (!propertyId || !form) return;
    if (!canSave) {
      showToast.error('Cấu hình chưa hợp lệ: auto-cancel phải lớn hơn grace.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        propertyId,
        graceMinutes: form.graceMinutes,
        autoCancelMinutes: form.autoCancelMinutes,
        allowEarlyWaiting: form.allowEarlyWaiting,
        allowLateWithinGraceCheckin: form.allowLateWithinGraceCheckin,
        lateWithinGraceUsageMode: form.lateWithinGraceUsageMode,
        lateOverGraceRefundMode: form.lateOverGraceRefundMode,
        noShowRefundMode: form.noShowRefundMode,
        isActive: form.isActive,
      };
      const updated = await checkinPolicyService.upsertByPropertyId(propertyId, payload);
      setPolicy(updated);
      setForm(toForm(updated));
      await loadPolicyList();
      showToast.success('Đã lưu nguyên tắc checkin.');
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Lưu nguyên tắc checkin thất bại.'));
    } finally {
      setSaving(false);
    }
  };

  const startCreate = () => {
    if (!propertyId) return;
    setPolicy(null);
    setForm(createDefaultForm());
  };

  const selectPolicy = (nextId: number) => {
    const selected = policyList.find((item) => item.id === nextId) ?? null;
    setPolicy(selected);
    setForm(selected ? toForm(selected) : createDefaultForm());
  };

  const removePolicy = async () => {
    if (!policy?.id) return;
    const ok = window.confirm('Bạn có chắc muốn xóa bản ghi nguyên tắc checkin này?');
    if (!ok) return;
    setDeleting(true);
    try {
      await checkinPolicyService.deleteById(policy.id);
      showToast.success('Đã xóa bản ghi nguyên tắc checkin.');
      await loadPolicyList();
    } catch (error) {
      showToast.error(getApiErrorMessage(error, 'Xóa nguyên tắc checkin thất bại.'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý nguyên tắc checkin</h1>
          <p className="text-sm font-medium text-gray-500">Cấu hình theo từng chi nhánh.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startCreate}
            disabled={!propertyId || saving || deleting}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:border-red-300 hover:text-red-500 disabled:opacity-50"
          >
            Thêm mới
          </button>
          <button
            type="button"
            onClick={() => void removePolicy()}
            disabled={!policy?.id || saving || deleting}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !form || !canSave || !propertyId}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Chọn chi nhánh</h2>
        </div>
        <p className="mb-3 text-xs font-medium text-gray-500">Nguyên tắc checkin được cấu hình theo từng chi nhánh.</p>
        {loadingBranches ? (
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải danh sách chi nhánh...
          </div>
        ) : (
          <select
            value={selectedBranch?.id ?? ''}
            onChange={(e) => {
              const nextId = Number(e.target.value);
              if (!Number.isFinite(nextId) || nextId <= 0) {
                setSelectedBranch(null);
                return;
              }
              const branch = branches.find((b) => b.id === nextId) ?? null;
              setSelectedBranch(branch);
            }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold text-gray-900 focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="">-- Chọn chi nhánh --</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!propertyId ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-700">
          Vui lòng chọn chi nhánh trước khi cấu hình nguyên tắc checkin.
        </div>
      ) : null}

      {propertyId ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <label className="space-y-1 text-sm">
            <span className="font-bold text-gray-600">Danh sách bản ghi checkin policy</span>
            <select
              value={policy?.id ?? ''}
              onChange={(e) => selectPolicy(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold"
            >
              <option value="">-- Bản ghi mới (chưa lưu) --</option>
              {policyList.map((item, idx) => (
                <option key={item.id ?? idx} value={item.id}>
                  #{item.id} - grace {item.graceMinutes}p / auto-cancel {item.autoCancelMinutes}p
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

        {loading ? <div className="rounded-xl bg-white p-4 text-sm">Đang tải dữ liệu...</div> : null}

        {form && propertyId ? (
          <>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-black uppercase tracking-wider text-gray-900">Thiết lập ngưỡng checkin</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-bold text-gray-600">Grace (phút)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.graceMinutes}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, graceMinutes: Number(e.target.value) } : prev))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold"
                  />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-bold text-gray-600">Auto-cancel (phút)</span>
                  <input
                    type="number"
                    min={1}
                    value={form.autoCancelMinutes}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, autoCancelMinutes: Number(e.target.value) } : prev))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold"
                  />
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.allowEarlyWaiting}
                    onChange={(e) => setForm((prev) => (prev ? { ...prev, allowEarlyWaiting: e.target.checked } : prev))}
                  />
                  Cho phép đến sớm chờ + thông báo host
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.allowLateWithinGraceCheckin}
                    onChange={(e) =>
                      setForm((prev) => (prev ? { ...prev, allowLateWithinGraceCheckin: e.target.checked } : prev))
                    }
                  />
                  Cho phép checkin khi trễ trong grace
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <label className="space-y-1 text-sm">
                  <span className="font-bold text-gray-600">Sử dụng slot khi trễ trong grace</span>
                  <select
                    value={form.lateWithinGraceUsageMode}
                    onChange={(e) =>
                      setForm((prev) =>
                        prev ? { ...prev, lateWithinGraceUsageMode: e.target.value as LateWithinGraceUsageMode } : prev,
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold"
                  >
                    <option value="DEDUCT_LATE_TIME">Trừ thời gian trễ</option>
                    <option value="KEEP_ORIGINAL_SLOT">Giữ nguyên giờ đặt</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-bold text-gray-600">Hoàn tiền khi trễ quá grace</span>
                  <select
                    value={form.lateOverGraceRefundMode}
                    onChange={(e) =>
                      setForm((prev) =>
                        prev ? { ...prev, lateOverGraceRefundMode: e.target.value as CheckinRefundMode } : prev,
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold"
                  >
                    <option value="FOLLOW_DEPOSIT_REFUND_POLICY">Theo chính sách</option>
                    <option value="ZERO_DEPOSIT_REFUND">0% cọc</option>
                  </select>
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-bold text-gray-600">Hoàn tiền khi no-show</span>
                  <select
                    value={form.noShowRefundMode}
                    onChange={(e) =>
                      setForm((prev) => (prev ? { ...prev, noShowRefundMode: e.target.value as CheckinRefundMode } : prev))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 font-bold"
                  >
                    <option value="ZERO_DEPOSIT_REFUND">0% cọc</option>
                    <option value="FOLLOW_DEPOSIT_REFUND_POLICY">Theo chính sách</option>
                  </select>
                </label>
              </div>

              <label className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => (prev ? { ...prev, isActive: e.target.checked } : prev))}
                />
                Kích hoạt chính sách checkin
              </label>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-gray-500" />
                <h2 className="text-sm font-black uppercase tracking-wider text-gray-900">Chính sách xử lý theo luồng</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-400">
                      <th className="px-3 py-2">Tình huống</th>
                      <th className="px-3 py-2">Hành động hệ thống</th>
                      <th className="px-3 py-2">Hoàn tiền</th>
                      <th className="px-3 py-2">Thời gian sử dụng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(policy?.scenarios ?? []).map((row) => (
                      <tr key={row.situation} className="border-b border-gray-50">
                        <td className="px-3 py-2 font-bold text-gray-900">{row.situation}</td>
                        <td className="px-3 py-2 font-semibold text-gray-700">{row.systemAction}</td>
                        <td className="px-3 py-2 font-semibold text-gray-700">{row.refund}</td>
                        <td className="px-3 py-2 font-semibold text-gray-700">{row.slotUsage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </>
        ) : null}
    </div>
  );
}

