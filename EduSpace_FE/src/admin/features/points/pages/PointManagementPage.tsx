import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../../layouts/AdminLayout';
import { usePointRules } from '../hooks/usePointRules';
import { useRewardCatalog } from '../hooks/useRewardCatalog';
import { usePointTransactions } from '../hooks/usePointTransactions';
import { useLoyaltyConfig } from '../hooks/useLoyaltyConfig';
import type { PointEarningRule, PointEarningRuleRequest, RewardCatalog, RewardCatalogRequest } from '../types';
import { formatCurrency } from '@/utils/format';
import { RefreshCcw, Plus, Pencil, Trash2, Gift, Coins, History, ChevronLeft, ChevronRight, ClipboardList, Inbox, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

type TabId = 'rules' | 'rewards' | 'transactions';

export function PointManagementPage() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('rules');

  const { config: loyaltyConfig } = useLoyaltyConfig();
  const { rules, loading: rulesLoading, createRule, updateRule, deleteRule, refresh: refreshRules } = usePointRules();
  const { rewards, loading: rewardsLoading, createReward, updateReward, deleteReward, refresh: refreshRewards } = useRewardCatalog();

  const [transactionUserId, setTransactionUserId] = useState('');
  const [transactionPage, setTransactionPage] = useState(0);
  const TRANSACTION_PAGE_SIZE = 10;
  const { transactions, loading: transactionsLoading, pagination: transactionsPagination, refresh: refreshTransactions } = usePointTransactions(
    transactionUserId.trim() || null,
    transactionPage,
    TRANSACTION_PAGE_SIZE
  );

  const [ruleModal, setRuleModal] = useState<{ open: boolean; rule?: PointEarningRule }>({ open: false });
  const [rewardModal, setRewardModal] = useState<{ open: boolean; reward?: RewardCatalog }>({ open: false });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'rule' | 'reward'; id: number; name: string } | null>(null);

  const tabs = [
    { id: 'rules' as TabId, label: t('points.tabs.rules'), icon: Coins },
    { id: 'rewards' as TabId, label: t('points.tabs.rewards'), icon: Gift },
    { id: 'transactions' as TabId, label: t('points.tabs.transactions'), icon: History },
  ];

  const handleRuleSubmit = async (values: PointEarningRuleRequest) => {
    if (ruleModal.rule) await updateRule(ruleModal.rule.id, values);
    else await createRule(values);
    setRuleModal({ open: false });
  };

  const handleRewardSubmit = async (values: RewardCatalogRequest) => {
    if (rewardModal.reward) await updateReward(rewardModal.reward.id, values);
    else await createReward(values);
    setRewardModal({ open: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'rule') await deleteRule(deleteConfirm.id);
    else await deleteReward(deleteConfirm.id);
    setDeleteConfirm(null);
  };

  return (
    <AdminLayout>
      <div key={i18n.language} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('points.title')}</h1>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">{t('points.subtitle')}</p>
          <Link
            to="/admin/settings#loyalty"
            className="inline-flex items-center gap-2 mt-3 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <Settings className="w-4 h-4" />
            {t('points.conversionRateLink')}
          </Link>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex gap-2 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors -mb-px ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'rules' && (
            <RulesTab
              rules={rules}
              loading={rulesLoading}
              onRefresh={refreshRules}
              onAdd={() => setRuleModal({ open: true })}
              onEdit={(rule) => setRuleModal({ open: true, rule })}
              onDelete={(id, name) => setDeleteConfirm({ type: 'rule', id, name })}
              onToggleActive={(rule) => updateRule(rule.id, { actionName: rule.actionName, pointsEarned: rule.pointsEarned, description: rule.description ?? '', isActive: !rule.isActive })}
              onSubmit={handleRuleSubmit}
              modalOpen={ruleModal.open}
              modalRule={ruleModal.rule}
              onCloseModal={() => setRuleModal({ open: false })}
            />
          )}
          {activeTab === 'rewards' && (
            <RewardsTab
              rewards={rewards}
              loading={rewardsLoading}
              vndPerPoint={loyaltyConfig?.vndPerPoint ?? 100}
              onRefresh={refreshRewards}
              onAdd={() => setRewardModal({ open: true })}
              onEdit={(reward) => setRewardModal({ open: true, reward })}
              onDelete={(id, name) => setDeleteConfirm({ type: 'reward', id, name })}
              onToggleActive={(r) => updateReward(r.id, { name: r.name, description: r.description ?? '', pointsRequired: r.pointsRequired, stock: r.stock, isActive: !r.isActive, imageUrl: r.imageUrl })}
              onSubmit={handleRewardSubmit}
              modalOpen={rewardModal.open}
              modalReward={rewardModal.reward}
              onCloseModal={() => setRewardModal({ open: false })}
            />
          )}
          {activeTab === 'transactions' && (
            <TransactionsTab
              userId={transactionUserId}
              onUserIdChange={setTransactionUserId}
              onLoad={refreshTransactions}
              transactions={transactions}
              loading={transactionsLoading}
              pagination={transactionsPagination}
              page={transactionPage}
              pageSize={TRANSACTION_PAGE_SIZE}
              onPageChange={setTransactionPage}
            />
          )}
        </div>
      </div>

      {deleteConfirm && (
        <ConfirmDeleteModal
          name={deleteConfirm.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </AdminLayout>
  );
}

/** Badge color by action type: spend/pay -> orange, book/rent -> blue, review -> green */
function getActionBadgeClass(actionName: string): string {
  const a = actionName.toUpperCase();
  if (/SPEND|PAY|VND|PURCHASE/.test(a)) return 'bg-amber-50 text-amber-700 border border-amber-200';
  if (/BOOK|RENT|ROOM|COMPLETE/.test(a)) return 'bg-blue-50 text-blue-700 border border-blue-200';
  if (/REVIEW|RATE/.test(a)) return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  if (/REGISTER|SIGNUP|JOIN/.test(a)) return 'bg-violet-50 text-violet-700 border border-violet-200';
  return 'bg-slate-100 text-slate-700 border border-slate-200';
}

function RulesTab({
  rules,
  loading,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onSubmit,
  modalOpen,
  modalRule,
  onCloseModal,
}: {
  rules: PointEarningRule[];
  loading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (r: PointEarningRule) => void;
  onDelete: (id: number, name: string) => void;
  onToggleActive: (r: PointEarningRule) => void;
  onSubmit: (v: PointEarningRuleRequest) => Promise<void>;
  modalOpen: boolean;
  modalRule?: PointEarningRule;
  onCloseModal: () => void;
}) {
  const { t } = useTranslation();
  const isEmpty = !loading && rules.length === 0;

  return (
    <div>
      <div className="flex justify-end items-center gap-2 mb-4">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('points.rules.refresh')}
        </button>
        {!isEmpty && (
          <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md">
            <Plus className="w-4 h-4" />
            {t('points.rules.addRule')}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-bold mb-2">{t('points.rules.emptyRuleCta')}</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md mt-2"
          >
            <Plus className="w-5 h-5" />
            {t('points.rules.addRule')}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rules.actionName')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rules.pointsEarned')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rules.description')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rules.isActive')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-400 font-bold">
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                      <span>{t('common.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rules.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${getActionBadgeClass(r.actionName)}`}>
                        {r.actionName}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">+{r.pointsEarned}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{r.description ?? '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={r.isActive}
                        onClick={() => onToggleActive(r)}
                        className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                          r.isActive ? 'border-green-500 bg-green-500' : 'border-gray-200 bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                            r.isActive ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onEdit(r)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg mr-2" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(r.id, r.actionName)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <RuleFormModal initial={modalRule} onSubmit={onSubmit} onClose={onCloseModal} />
      )}
    </div>
  );
}

function RuleFormModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: PointEarningRule;
  onSubmit: (v: PointEarningRuleRequest) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [actionName, setActionName] = useState(initial?.actionName ?? '');
  const [pointsEarned, setPointsEarned] = useState(initial?.pointsEarned ?? 0);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionName.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ actionName: actionName.trim(), pointsEarned, description: description.trim() || undefined, isActive });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6">
        <h3 className="text-lg font-black text-gray-900 mb-4">{initial ? t('points.rules.editRule') : t('points.rules.addRule')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rules.actionName')}</label>
            <input value={actionName} onChange={(e) => setActionName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rules.pointsEarned')}</label>
            <input type="number" min={0} value={pointsEarned} onChange={(e) => setPointsEarned(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rules.description')}</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="rule-active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            <label htmlFor="rule-active" className="text-sm font-bold text-gray-700">{t('points.rules.isActive')}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RewardsTab({
  rewards,
  loading,
  vndPerPoint,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onSubmit,
  modalOpen,
  modalReward,
  onCloseModal,
}: {
  rewards: RewardCatalog[];
  loading: boolean;
  vndPerPoint: number;
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (r: RewardCatalog) => void;
  onDelete: (id: number, name: string) => void;
  onToggleActive: (r: RewardCatalog) => void;
  onSubmit: (v: RewardCatalogRequest) => Promise<void>;
  modalOpen: boolean;
  modalReward?: RewardCatalog;
  onCloseModal: () => void;
}) {
  const { t } = useTranslation();
  const isEmpty = !loading && rewards.length === 0;

  return (
    <div>
      <div className="flex justify-end items-center gap-2 mb-4">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('points.rules.refresh')}
        </button>
        {!isEmpty && (
          <button onClick={onAdd} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md">
            <Plus className="w-4 h-4" />
            {t('points.rewards.addReward')}
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-bold mb-2">{t('points.rewards.emptyRewardCta')}</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md mt-2"
          >
            <Plus className="w-5 h-5" />
            {t('points.rewards.addReward')}
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rewards.name')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rewards.pointsRequired')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rewards.stock')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.rules.isActive')}</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-gray-400 font-bold">
                      <RefreshCcw className="w-5 h-5 animate-spin" />
                      <span>{t('common.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{r.name}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-blue-600">{r.pointsRequired} pt</span>
                      <span className="text-xs text-gray-400 ml-1">≈ {formatCurrency(r.pointsRequired * vndPerPoint)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.stock < 0 ? t('points.rewards.unlimited') : r.stock}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={r.isActive}
                        onClick={() => onToggleActive(r)}
                        className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                          r.isActive ? 'border-green-500 bg-green-500' : 'border-gray-200 bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                            r.isActive ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => onEdit(r)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg mr-2" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDelete(r.id, r.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && (
        <RewardFormModal initial={modalReward} onSubmit={onSubmit} onClose={onCloseModal} />
      )}
    </div>
  );
}

function RewardFormModal({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: RewardCatalog;
  onSubmit: (v: RewardCatalogRequest) => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [pointsRequired, setPointsRequired] = useState(initial?.pointsRequired ?? 0);
  const [stock, setStock] = useState(initial?.stock ?? -1);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        pointsRequired,
        stock,
        isActive,
        imageUrl: imageUrl.trim() || undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-black text-gray-900 mb-4">{initial ? t('points.rewards.editReward') : t('points.rewards.addReward')}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rewards.name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rules.description')}</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rewards.pointsRequired')}</label>
            <input type="number" min={0} value={pointsRequired} onChange={(e) => setPointsRequired(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rewards.stock')} (-1 = {t('points.rewards.unlimited')})</label>
            <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('points.rewards.imageUrl')}</label>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" placeholder="https://..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="reward-active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
            <label htmlFor="reward-active" className="text-sm font-bold text-gray-700">{t('points.rules.isActive')}</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
              {t('common.cancel')}
            </button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransactionsTab({
  userId,
  onUserIdChange,
  onLoad,
  transactions,
  loading,
  pagination,
  page,
  pageSize,
  onPageChange,
}: {
  userId: string;
  onUserIdChange: (v: string) => void;
  onLoad: () => void;
  transactions: { id: number; userId: string; userFullName?: string; points: number; transactionType: string; reason?: string; createdAt: string; bookingId?: string }[];
  loading: boolean;
  pagination: { total: number; page: number; limit: number; totalPages: number } | null;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={userId}
          onChange={(e) => onUserIdChange(e.target.value)}
          placeholder={t('points.transactions.userId')}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm w-64"
        />
        <button onClick={onLoad} disabled={!userId.trim() || loading} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50">
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('points.transactions.load')}
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.transactions.userFullName')}</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.transactions.points')}</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.transactions.type')}</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.transactions.reason')}</th>
              <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">{t('points.transactions.date')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!userId.trim() ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">{t('points.transactions.noTransactions')} — {t('points.transactions.userId')}</td>
              </tr>
            ) : loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">
                  <div className="flex items-center justify-center gap-3 text-gray-400 font-bold">
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                    <span>{t('common.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500 font-bold">{t('points.transactions.noTransactions')}</td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold text-gray-900">{tx.userFullName ?? tx.userId}</td>
                  <td className={`px-6 py-4 font-bold ${tx.transactionType === 'EARN' ? 'text-green-600' : 'text-orange-600'}`}>
                    {tx.transactionType === 'EARN' ? '+' : '-'}{tx.points}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${tx.transactionType === 'EARN' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      {tx.transactionType === 'EARN' ? t('points.transactions.typeEarn') : t('points.transactions.typeRedeem')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{tx.reason ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Total: <span className="text-gray-900">{pagination.total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="p-2 rounded-xl border-2 border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-gray-600">
              {page + 1} / {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="p-2 rounded-xl border-2 border-gray-100 text-gray-400 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ConfirmDeleteModal({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm p-6">
        <p className="text-gray-700 font-bold mb-2">{t('points.confirmDelete')}</p>
        <p className="text-sm text-gray-500 mb-4">&quot;{name}&quot;</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
