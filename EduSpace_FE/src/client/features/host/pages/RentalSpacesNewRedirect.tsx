import { Navigate } from 'react-router-dom';

/** URL cũ /rental/spaces/new → đăng phòng nằm trong /rental/spaces */
export function RentalSpacesNewRedirect() {
    return <Navigate to="/rental/spaces?create" replace />;
}
