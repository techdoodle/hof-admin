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
import { apiClient } from '../utils/apiClient';

interface AnalyticsChartProps {
  title: string;
  endpoint: string;
  groupBy: 'daily' | 'weekly' | 'monthly';
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
  groupBy,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  // Calculate date range based on groupBy
  const calculateDateRange = useCallback((group: 'daily' | 'weekly' | 'monthly') => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    let from: Date;

    switch (group) {
      case 'daily':
        // Last 7 days (including today)
        from = new Date(today);
        from.setDate(today.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        // Last 7 weeks (go back 6 weeks from current week)
        const dayOfWeek = today.getDay();
        const dayOffset = dayOfWeek === 0 ? 7 : dayOfWeek;
        const currentWeekMonday = new Date(today);
        currentWeekMonday.setDate(today.getDate() - (dayOffset - 1));
        currentWeekMonday.setHours(0, 0, 0, 0);
        from = new Date(currentWeekMonday);
        from.setDate(currentWeekMonday.getDate() - (6 * 7)); // 6 weeks back (42 days)
        from.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        // Last 4 months (go back 3 months from current month)
        from = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        from.setHours(0, 0, 0, 0);
        break;
    }

    return { from, to: today };
  }, []);

  // Update date range when groupBy changes
  useEffect(() => {
    const { from, to } = calculateDateRange(groupBy);
    setDateFrom(from);
    setDateTo(to);
  }, [groupBy, calculateDateRange]);

  const fetchData = useCallback(
    async (from: Date | null, to: Date | null, group: 'daily' | 'weekly' | 'monthly') => {
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
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || 'Failed to fetch analytics data'
        );
        setData([]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (groupBy === 'daily') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (groupBy === 'weekly') {
      // DATE_TRUNC('week', ...) returns Monday of the week
      // Show week range: "Nov 25 - Dec 1"
      const weekStart = new Date(date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday of the week
      const startStr = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endStr = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      // If same month, show shorter format
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()} - ${endStr}`;
      }
      return `${startStr} - ${endStr}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>

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

