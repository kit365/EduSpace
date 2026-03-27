export const hostPermissions = {
    dashboard: {
        // Keep dashboard separate from booking/calendar permissions.
        // Backend catalog provides `view_dashboard` permission.
        view: 'view_dashboard',
    },
    room: {
        view: 'branch.room.view',
        create: 'branch.room.create',
        edit: 'branch.room.edit',
        delete: 'branch.room.delete',
    },
    branch: {
        view: 'branch.branch.view',
        create: 'branch.branch.create',
        edit: 'branch.branch.edit',
        delete: 'branch.branch.delete',
    },
    // Booking permissions (used in templates/menu and fallback mapping)
    booking: {
        view: 'branch.booking.view',
        manage: 'branch.booking.manage',
    },
    // Profile / KYC permissions
    profile: {
        view: 'branch.profile.view',
        manage: 'branch.profile.manage',
    },
    // Staff management permissions
    staff: {
        view: 'branch.staff.view',
        create: 'branch.staff.create',
        edit: 'branch.staff.edit',
        delete: 'branch.staff.delete',
    },
    // Operations permissions (maintenance / cleaning)
    maintenance: {
        manage: 'branch.maintenance.manage',
    },
    cleaning: {
        manage: 'branch.cleaning.manage',
    },
    finance: {
        view: 'branch.finance.view',
        manage: 'branch.finance.manage',
        export: 'branch.finance.export',
        payoutCreate: 'branch.finance.payout.create',
    },
    utility: {
        view: 'branch.utility.view',
        create: 'branch.utility.create',
        edit: 'branch.utility.edit',
        delete: 'branch.utility.delete',
    },
    depositPolicy: {
        view: 'branch.deposit_policy.view',
        create: 'branch.deposit_policy.create',
        edit: 'branch.deposit_policy.edit',
        delete: 'branch.deposit_policy.delete',
    },
    rbacTemplate: {
        view: 'rbac.template.view',
        manage: 'rbac.template.manage',
    },
    rbac: {
        permission: {
            view: 'rbac.permission.view',
            manage: 'rbac.permission.manage',
        },
        role: {
            // Chỉ cần assign role trong console RBAC
            assign: 'rbac.role.assign',
        },
    },
    operations: {
        checkin: 'branch.checkin.manage',
        checkout: 'branch.checkout.manage',
        roomStatus: 'branch.room_status.manage',
    },
    messages: {
        view: 'view_messages',
        manage: 'manage_messages',
    },
} as const;

export const hostMenuPermissions = {
    dashboard: hostPermissions.dashboard.view,
    spaces: hostPermissions.room.view,
    branches: hostPermissions.branch.view,
    roomStatus: hostPermissions.operations.roomStatus,
    schedule: 'branch.booking.manage',
    calendar: 'branch.booking.view',
    checkout: hostPermissions.operations.checkout,
    staff: hostPermissions.staff.view,
    finance: hostPermissions.finance.view,
    utility: hostPermissions.utility.view,
    depositPolicy: hostPermissions.depositPolicy.view,
    kyc: 'branch.profile.manage',
    messages: hostPermissions.messages.view,
} as const;
