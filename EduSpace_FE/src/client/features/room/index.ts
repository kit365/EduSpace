/**
 * Room API + types + map Property/Room → Space (UI).
 */
export * from './types';
export { propertyApiService } from './services/propertyApiService';
export { roomApiService } from './services/roomApiService';
export {
  propertyToSpace,
  propertyToSpaceDetails,
  roomToSpaceCard,
  roomAndPropertyToSpaceDetails,
} from './mappers/mapPropertyToSpace';
