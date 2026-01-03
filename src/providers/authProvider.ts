import { AuthProvider } from 'react-admin';
import { apiClient } from '../utils/apiClient';

export const authProvider: AuthProvider = {
    login: async ({ mobile, otp }) => {
        try {
            // Get stored OTP data from localStorage
            const storedOtpData = localStorage.getItem('otpData');
            if (!storedOtpData) {
                throw new Error('OTP session expired. Please request a new OTP.');
            }

            const { encryptedOtp, iv, mobile: storedMobile } = JSON.parse(storedOtpData);

            // Verify mobile number matches
            if (mobile !== storedMobile) {
                throw new Error('Mobile number mismatch. Please try again.');
            }

            // Verify OTP
            const verifyResponse = await apiClient.post('/auth/verify-otp', {
                encryptedOtp,
                iv,
                otp,
                mobile
            });

            if (!verifyResponse.data.valid) {
                throw new Error('Invalid OTP');
            }

            const { accessToken, role, id, firstName, lastName } = verifyResponse.data;

            // Check if user has admin privileges
            const adminRoles = ['admin', 'super_admin', 'football_chief', 'academy_admin', 'vendor'];
            if (!adminRoles.includes(role)) {
                throw new Error('Access denied. Admin privileges required.');
            }

            // Store auth data
            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify({
                id,
                role,
                firstName,
                lastName,
                mobile
            }));

            return Promise.resolve();
        } catch (error: any) {
            return Promise.reject(error.response?.data?.message || error.message);
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('otpData');
        return Promise.resolve();
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            const userData = JSON.parse(user);
            const adminRoles = ['admin', 'super_admin', 'football_chief', 'academy_admin', 'vendor'];

            if (adminRoles.includes(userData.role)) {
                return Promise.resolve();
            }
        }

        return Promise.reject();
    },

    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return Promise.reject();
        }
        return Promise.resolve();
    },

    getIdentity: () => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                return Promise.resolve({
                    id: userData.id,
                    fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.mobile,
                    avatar: undefined,
                });
            }
        } catch (error) {
            // Handle JSON parse error
        }
        return Promise.reject();
    },

    getPermissions: () => {
        try {
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                return Promise.resolve(userData.role);
            }
        } catch (error) {
            // Handle JSON parse error
        }
        return Promise.reject();
    },
};
