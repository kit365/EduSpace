import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '../../../layouts/AdminLayout';
import {
    depositPolicyService,
    type DepositRefundPolicy,
    type UpsertDepositRefundPolicy,
} from '../services/depositPolicyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

const defaultForm = (): UpsertDepositRefundPolicy => ({
    policyName: '',
    description: '',
    depositPercentage: 25,
    fullRefundHours: 48,
    fullRefundPercentage: 100,
    partialRefundHours: 24,
    partialRefundPercentage: 50,
    noRefundHours: 12,
    noRefundPercentage: 0,
    noShowRefundPercentage: 0,
    noShowPenalty: 0,
    allowForceMajeure: true,
    forceMajeureRefundPercentage: 100,
    forceMajeureRequiresEvidence: true,
    isDefault: false,
    displayOrder: 0,
    highlightText: '',
    isActive: true,
});

export function DepositRefundPoliciesPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<DepositRefundPolicy[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<DepositRefundPolicy | null>(null);
    const [form, setForm] = useState<UpsertDepositRefundPolicy>(defaultForm());
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const list = await depositPolicyService.list();
            setItems(list);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm(defaultForm());
        setModalOpen(true);
    };

    const openEdit = (p: DepositRefundPolicy) => {
        setEditing(p);
        setForm({
            policyName: p.policyName,
            description: p.description ?? '',
            depositPercentage: Number(p.depositPercentage),
            fullRefundHours: p.fullRefundHours,
            fullRefundPercentage: Number(p.fullRefundPercentage),
            partialRefundHours: p.partialRefundHours,
            partialRefundPercentage: Number(p.partialRefundPercentage),
            noRefundHours: p.noRefundHours,
            noRefundPercentage: Number(p.noRefundPercentage),
            noShowRefundPercentage: Number(p.noShowRefundPercentage),
            noShowPenalty: Number(p.noShowPenalty),
            allowForceMajeure: p.allowForceMajeure,
            forceMajeureRefundPercentage: Number(p.forceMajeureRefundPercentage),
            forceMajeureRequiresEvidence: p.forceMajeureRequiresEvidence,
            isDefault: p.isDefault,
            displayOrder: p.displayOrder ?? 0,
            highlightText: p.highlightText ?? '',
            isActive: p.isActive,
        });
        setModalOpen(true);
    };

    const save = async () => {
        setSaving(true);
        try {
            if (editing) await depositPolicyService.update(editing.id, form);
            else await depositPolicyService.create(form);
            toast.success(t('depositPolicies.saved'));
            setModalOpen(false);
            await load();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Error');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (p: DepositRefundPolicy) => {
        if (!confirm(t('depositPolicies.confirmDelete'))) return;
        try {
            await depositPolicyService.delete(p.id);
            toast.success(t('depositPolicies.deleted'));
            await load();
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : 'Error');
        }
    };

    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('depositPolicies.title')}</h1>
                        <p className="text-sm text-gray-500">{t('depositPolicies.subtitle')}</p>
                    </div>
                    <Button onClick={openCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        {t('depositPolicies.add')}
                    </Button>
                </div>

                <div className="p-6 overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center py-12 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('depositPolicies.name')}</TableHead>
                                    <TableHead>{t('depositPolicies.depositPct')}</TableHead>
                                    <TableHead>{t('depositPolicies.default')}</TableHead>
                                    <TableHead>{t('depositPolicies.active')}</TableHead>
                                    <TableHead className="text-right">{t('depositPolicies.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">{p.policyName}</TableCell>
                                        <TableCell>{p.depositPercentage}%</TableCell>
                                        <TableCell>{p.isDefault ? '✓' : '—'}</TableCell>
                                        <TableCell>{p.isActive ? '✓' : '—'}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => remove(p)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? t('depositPolicies.edit') : t('depositPolicies.create')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                        <div>
                            <Label>{t('depositPolicies.name')}</Label>
                            <Input
                                value={form.policyName}
                                onChange={(e) => setForm({ ...form, policyName: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>{t('depositPolicies.description')}</Label>
                            <Input
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>{t('depositPolicies.depositPct')}</Label>
                                <Input
                                    type="number"
                                    value={form.depositPercentage}
                                    onChange={(e) =>
                                        setForm({ ...form, depositPercentage: Number(e.target.value) })
                                    }
                                />
                            </div>
                            <div>
                                <Label>{t('depositPolicies.displayOrder')}</Label>
                                <Input
                                    type="number"
                                    value={form.displayOrder ?? 0}
                                    onChange={(e) =>
                                        setForm({ ...form, displayOrder: Number(e.target.value) })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={form.isDefault}
                                onCheckedChange={(v) => setForm({ ...form, isDefault: v })}
                            />
                            <span className="text-sm">{t('depositPolicies.defaultPolicy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={form.isActive}
                                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                            />
                            <span className="text-sm">{t('depositPolicies.active')}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={() => void save()} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
