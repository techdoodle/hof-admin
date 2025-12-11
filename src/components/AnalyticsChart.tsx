import React, { useMemo } from 'react';
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
import { useQuery } from '@tanstack/react-query';
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
  // Calculate date range based on groupBy
  const dateRange = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    let from: Date;

    switch (groupBy) {
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
  }, [groupBy]);

  // Fetch data with caching using React Query
  const { data, isLoading: loading, error } = useQuery<DataPoint[]>({
    queryKey: ['analytics', endpoint, groupBy, dateRange.from.toISOString().split('T')[0], dateRange.to.toISOString().split('T')[0]],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('dateFrom', dateRange.from.toISOString().split('T')[0]);
      params.append('dateTo', dateRange.to.toISOString().split('T')[0]);
      params.append('groupBy', groupBy);

      const response = await apiClient.get<ApiResponse>(
        `${endpoint}?${params.toString()}`
      );

      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 1,
  });

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
            {error instanceof Error ? error.message : 'Failed to fetch analytics data'}
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

