export type ID = string | number;
export type Timestamp = string; // ISO format

export enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    DELETED = 'deleted'
}
