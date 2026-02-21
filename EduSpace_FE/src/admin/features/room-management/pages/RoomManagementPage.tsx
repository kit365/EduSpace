import { AdminLayout } from '../../../layouts/AdminLayout';
import { RoomManagementView } from '../components/RoomManagementView';

export function RoomManagementPage() {
    return (
        <AdminLayout title="Room Management">
            <RoomManagementView />
        </AdminLayout>
    );
}
