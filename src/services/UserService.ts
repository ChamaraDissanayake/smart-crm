import { User, UserApi } from '@/types/User';
import api from './Api';


export const UserService = {
    // Get all users of Company
    getUsers: async (companyId: string): Promise<User[]> => {
        const res = await api.get<{ users: UserApi[] }>('/user/get-users', {
            params: { companyId },
        });

        const users: User[] = res.data.users.map((user) => ({
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
        }));

        return users;
    },
};
