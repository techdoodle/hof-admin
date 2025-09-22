import { DataProvider } from 'react-admin';
import { apiClient } from '../utils/apiClient';


export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    try {
      const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
      const { field, order } = params.sort || { field: 'id', order: 'ASC' };
      const query = {
        ...params.filter,
        limit: perPage,
        offset: (page - 1) * perPage,
        sort: field,
        order: order.toLowerCase(),
      };

      const url = `/admin/${resource}?${new URLSearchParams(query)}`;
      const response = await apiClient.get(url);

      console.log('DataProvider getList response:', response.data);

      // Backend now returns { data: users[], total: number }
      const responseData = response.data;
      const users = responseData.data || responseData;
      const total = responseData.total || (Array.isArray(users) ? users.length : 0);

      console.log('Processed users:', users);
      console.log('Total count:', total);

      return {
        data: users,
        total: total,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  getOne: async (resource, params) => {
    try {
      const url = `/admin/${resource}/${params.id}`;
      const response = await apiClient.get(url);
      return { data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  getMany: async (resource, params) => {
    try {
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      const url = `/admin/${resource}?${new URLSearchParams(query)}`;
      const response = await apiClient.get(url);

      // Backend returns { data: [...], total: ... }, but getMany expects { data: [...] }
      const responseData = response.data;
      const items = responseData.data || responseData;

      return { data: items };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  getManyReference: async (resource, params) => {
    try {
      const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
      const { field, order } = params.sort || { field: 'id', order: 'ASC' };
      const query = {
        ...params.filter,
        [params.target]: params.id,
        limit: perPage,
        offset: (page - 1) * perPage,
        sort: field,
        order: order.toLowerCase(),
      };

      const url = `/admin/${resource}?${new URLSearchParams(query)}`;
      const response = await apiClient.get(url);

      return {
        data: response.data.data || response.data,
        total: response.data.total || response.data.length,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  create: async (resource, params) => {
    try {
      const url = `/admin/${resource}`;
      const response = await apiClient.post(url, params.data);
      return { data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  update: async (resource, params) => {
    try {
      const url = `/admin/${resource}/${params.id}`;
      const response = await apiClient.patch(url, params.data);
      return { data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  updateMany: async (resource, params) => {
    try {
      const responses = await Promise.all(
        params.ids.map(id =>
          apiClient.patch(`/admin/${resource}/${id}`, params.data)
        )
      );
      return { data: responses.map((response) => response.data.id) };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  delete: async (resource, params) => {
    try {
      const url = `/admin/${resource}/${params.id}`;
      const response = await apiClient.delete(url);
      return { data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  deleteMany: async (resource, params) => {
    try {
      const responses = await Promise.all(
        params.ids.map(id =>
          apiClient.delete(`/admin/${resource}/${id}`)
        )
      );
      return { data: responses.map((response) => response.data.id) };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },
};
