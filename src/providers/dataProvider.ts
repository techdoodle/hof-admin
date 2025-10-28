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
      let url;
      if (resource === 'match-participants') {
        // Special case for match participants
        const { matchId, ...participantData } = params.data;
        url = `/admin/matches/${matchId}/participants`;
        const response = await apiClient.post(url, participantData);
        return { data: { ...response.data, id: response.data.matchParticipantId } };
      } else {
        url = `/admin/${resource}`;
        const response = await apiClient.post(url, params.data);
        return { data: response.data };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },

  update: async (resource, params) => {
    try {
      let transformedData = { ...params.data };

      // Transform venue object to just ID for matches
      if (resource === 'matches' && transformedData.venue && typeof transformedData.venue === 'object') {
        transformedData.venue = transformedData.venue.id;
      }

      // Transform footballChief object to just ID for matches
      if (resource === 'matches' && transformedData.footballChief && typeof transformedData.footballChief === 'object') {
        transformedData.footballChief = transformedData.footballChief.id;
      }

      const url = `/admin/${resource}/${params.id}`;
      const response = await apiClient.patch(url, transformedData);
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
      let url;
      if (resource === 'match-participants') {
        // Special case for match participants
        // We need to extract matchId and userId from the record
        const response = await apiClient.get(`/${resource}/${params.id}`);
        const participant = response.data;
        url = `/admin/matches/${participant.match.matchId}/participants/${participant.user.id}`;
      } else {
        url = `/admin/${resource}/${params.id}`;
      }
      await apiClient.delete(url);
      return { data: params.previousData as any };
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

  custom: async (endpoint: string, options?: any) => {
    try {
      const { method = 'GET', data, timeout } = options || {};
      const response = await apiClient.request({
        method,
        url: endpoint,
        data,
        timeout: timeout || 60000, // Use provided timeout or default to 60 seconds
      });
      return { data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      throw new Error(message);
    }
  },
};
