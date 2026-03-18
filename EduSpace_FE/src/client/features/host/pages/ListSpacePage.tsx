import { useNavigate, useParams } from 'react-router-dom';
import { CustomerLayout } from '../../../layouts/CustomerLayout';
import { SpacePublishFlow } from './SpacePublishFlow';

/** Chỉnh sửa phòng (mock) — layout khách; luồng đăng phòng mới nằm tại /rental/spaces */
export function ListSpacePage() {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <CustomerLayout>
            <SpacePublishFlow
                isEdit={Boolean(id)}
                editId={id}
                onCancel={() => navigate('/rental/spaces')}
                onSuccess={() => navigate('/rental/spaces')}
            />
        </CustomerLayout>
    );
}
