import { AdminLayout } from '../layouts/AdminLayout';
import { RoomManagementView } from '../features/room-management';

export default function RoomsPage() {
    return (
        <AdminLayout title="Room Management">
            <RoomManagementView />
        </AdminLayout>
    );
}
