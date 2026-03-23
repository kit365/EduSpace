import apiClient from '../axios';
import { Space } from '../../types/space';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const publicApi = {
  getRoomCategories: () => 
    apiClient.get<ApiResponse<string[]>>('/api/v1/public/rooms/categories'),
  
  getRooms: (params?: { propertyId?: number }) => 
    apiClient.get<ApiResponse<Space[]>>('/api/v1/public/rooms', { params }),
    
  getRoomByRef: (ref: string) => 
    apiClient.get<ApiResponse<Space>>(`/api/v1/public/rooms/${ref}`),
    
  getProperties: () => 
    apiClient.get<ApiResponse<any[]>>('/api/v1/public/properties'),
};
