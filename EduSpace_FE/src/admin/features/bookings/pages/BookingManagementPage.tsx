import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../../layouts/AdminLayout';
import {
    bookingRefundAdminService,
    type BookingRefundRow,
} from '../services/bookingRefundAdminService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Search } from 'lucide-react';

export function BookingManagementPage() {
    const { t } = useTranslation();
    const [bookingId, setBookingId] = useState('');
    const [refunds, setRefunds] = useState<BookingRefundRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [dialogRefund, setDialogRefund] = useState<BookingRefundRow | null>(null);
    const [approved, setApproved] = useState(true);
    const [adminNote, setAdminNote] = useState('');
    const [txId, setTxId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadRefunds = async () => {
        const id = parseInt(bookingId.trim(), 10);
        if (Number.isNaN(id)) {
            toast.error('Invalid booking ID');
            return;
        }
        setLoading(true);
        try {
            const list = await bookingRefundAdminService.listByBooking(id);
            setRefunds(list);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error');
        } finally {
            setLoading(false);
        }
    };

    const submitHandle = async () => {
        if (!dialogRefund) return;
        setSubmitting(true);
        try {
            await bookingRefundAdminService.handle(dialogRefund.id, {
                approved,
                adminNote: adminNote || undefined,
                refundTransactionId: approved ? txId || undefined : undefined,
            });
            toast.success(t('bookingAdmin.refundHandled'));
            setDialogRefund(null);
            setAdminNote('');
            setTxId('');
            await loadRefunds();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : 'Error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
                        <p className="text-sm text-gray-500">Monitor bookings and refund requests</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link to="/admin/deposit-policies">{t('admin_sidebar.depositPolicies')}</Link>
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 mb-3">{t('bookingAdmin.refundsTitle')}</h2>
                        <div className="flex flex-wrap gap-2 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <Label>{t('bookingAdmin.bookingIdPlaceholder')}</Label>
                                <Input
                                    value={bookingId}
                                    onChange={(e) => setBookingId(e.target.value)}
                                    placeholder="e.g. 1"
                                />
                            </div>
                            <Button onClick={() => void loadRefunds()} disabled={loading} className="gap-2">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                {t('bookingAdmin.loadRefunds')}
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border rounded-xl">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>{t('bookingAdmin.refundStatus')}</TableHead>
                                    <TableHead>{t('bookingAdmin.refundAmount')}</TableHead>
                                    <TableHead>{t('bookingAdmin.refundReason')}</TableHead>
                                    <TableHead className="text-right">{t('depositPolicies.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {refunds.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                            —
                                        </TableCell>
                                    </TableRow>
                                )}
                                {refunds.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell>{r.id}</TableCell>
                                        <TableCell>{r.status}</TableCell>
                                        <TableCell>
                                            {r.requestedAmount} {r.currency}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{r.customerReason}</TableCell>
                                        <TableCell className="text-right">
                                            {r.status === 'PENDING' && (
                                                <Button size="sm" onClick={() => setDialogRefund(r)}>
                                                    {t('bookingAdmin.handleRefund')}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Dialog open={!!dialogRefund} onOpenChange={(o) => !o && setDialogRefund(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('bookingAdmin.handleRefund')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="flex items-center gap-2">
                            <Switch checked={approved} onCheckedChange={setApproved} />
                            <span className="text-sm">{approved ? t('bookingAdmin.approve') : t('bookingAdmin.reject')}</span>
                        </div>
                        {approved && (
                            <div>
                                <Label>{t('bookingAdmin.transactionId')}</Label>
                                <Input value={txId} onChange={(e) => setTxId(e.target.value)} />
                            </div>
                        )}
                        <div>
                            <Label>{t('bookingAdmin.adminNote')}</Label>
                            <Input value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogRefund(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={() => void submitHandle()} disabled={submitting}>
                            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {t('common.save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
