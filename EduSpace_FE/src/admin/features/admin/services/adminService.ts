import { MOCK_USERS, MOCK_ROLES, MOCK_LOGS } from '../data/mockData';

export const adminService = {
    getUsers: async () => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_USERS);
            }, 500);
        });
    },

    getRoles: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_ROLES);
            }, 400);
        });
    },

    getLogs: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_LOGS);
            }, 600);
        });
    }
};
