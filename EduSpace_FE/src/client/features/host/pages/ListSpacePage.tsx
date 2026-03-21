import { useNavigate, useParams } from 'react-router-dom';
import { RentalLayout } from '../../../layouts/RentalLayout';
import { SpacePublishFlow } from './SpacePublishFlow';

/** Chỉnh sửa phòng — cùng layout partner portal với /rental/spaces */
export function ListSpacePage() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <RentalLayout title="Chỉnh sửa phòng">
            <div className="h-full overflow-y-auto">
                <SpacePublishFlow
                    isEdit={Boolean(id)}
                    editId={id}
                    onCancel={() => navigate('/rental/spaces')}
                    onSuccess={() => navigate('/rental/spaces')}
                />
            </div>
        </RentalLayout>
    );
}
