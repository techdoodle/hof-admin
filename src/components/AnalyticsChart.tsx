import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DateFilter } from '../resources/footballChiefLeaderboard/DateFilter';
import { apiClient } from '../utils/apiClient';

interface AnalyticsChartProps {
  title: string;
  endpoint: string;
}

interface DataPoint {
  date: string;
  count: number;
}

interface ApiResponse {
  success?: boolean;
  data: DataPoint[];
  total: number;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  endpoint,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [groupBy, setGroupBy] = useState<'weekly' | 'monthly'>('monthly');

  // Initialize with current month
  useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);
    setDateFrom(firstDayOfMonth);
    setDateTo(lastDayOfMonth);
  }, []);

  const fetchData = useCallback(
    async (from: Date | null, to: Date | null, group: 'weekly' | 'monthly') => {
      if (!from || !to) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append('dateFrom', from.toISOString().split('T')[0]);
        params.append('dateTo', to.toISOString().split('T')[0]);
        params.append('groupBy', group);

        const response = await apiClient.get<ApiResponse>(
          `${endpoint}?${params.toString()}`
        );

        const responseData = response.data;
        setData(responseData.data || []);
        setTotal(responseData.total || 0);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || 'Failed to fetch analytics data'
        );
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  // Fetch data when date range or groupBy changes
  useEffect(() => {
    if (dateFrom && dateTo) {
      fetchData(dateFrom, dateTo, groupBy);
    }
  }, [dateFrom, dateTo, groupBy, fetchData]);

  const handleDateFilterChange = (from: Date | null, to: Date | null) => {
    setDateFrom(from);
    setDateTo(to);
    
    // Determine groupBy based on date range
    if (from && to) {
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      
      // If range is <= 7 days (a week), use weekly grouping
      // Otherwise use monthly grouping
      if (diffDays <= 7) {
        setGroupBy('weekly');
      } else {
        setGroupBy('monthly');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (groupBy === 'weekly') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">
            {title}
          </Typography>
          {total > 0 && (
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              Total: {total.toLocaleString()}
            </Typography>
          )}
        </Box>

        <DateFilter
          onFilterChange={handleDateFilterChange}
          loading={loading}
          currentFilter={{ from: dateFrom, to: dateTo }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : data.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <Typography color="textSecondary">No data available for the selected period</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => formatDate(value)}
                formatter={(value: number) => [value.toLocaleString(), 'Count']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1976d2"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

