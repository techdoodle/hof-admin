import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/apiClient';

interface PeriodStats {
  usersAdded: number;
  matchesCompleted: number;
  matchesCancelled: number;
}

interface ApiResponse {
  success?: boolean;
  data?: any[];
  total: number;
}

export const PeriodStatCards: React.FC = () => {
  // Calculate This Week (Monday to Sunday)
  const getThisWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOffset = dayOfWeek === 0 ? 7 : dayOfWeek; // Sunday = 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOffset - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { from: monday, to: sunday };
  };

  // Calculate This Month (1st to last day)
  const getThisMonthRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);
    return { from: firstDay, to: lastDay };
  };

  const thisWeek = useMemo(() => getThisWeekRange(), []);
  const thisMonth = useMemo(() => getThisMonthRange(), []);

  // Fetch This Week stats with caching
  const { data: thisWeekStats, isLoading: thisWeekLoading } = useQuery<PeriodStats>({
    queryKey: ['periodStats', 'week', thisWeek.from.toISOString().split('T')[0], thisWeek.to.toISOString().split('T')[0]],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('dateFrom', thisWeek.from.toISOString().split('T')[0]);
      params.append('dateTo', thisWeek.to.toISOString().split('T')[0]);

      const [usersResponse, completedResponse, cancelledResponse] = await Promise.all([
        apiClient.get<ApiResponse>(`/admin/analytics/users-added?${params.toString()}&groupBy=monthly`),
        apiClient.get<ApiResponse>(`/admin/analytics/matches-completed?${params.toString()}&groupBy=monthly`),
        apiClient.get<ApiResponse>(`/admin/analytics/matches-cancelled?${params.toString()}&groupBy=monthly`),
      ]);

      return {
        usersAdded: usersResponse.data.total || 0,
        matchesCompleted: completedResponse.data.total || 0,
        matchesCancelled: cancelledResponse.data.total || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 1,
  });

  // Fetch This Month stats with caching
  const { data: thisMonthStats, isLoading: thisMonthLoading } = useQuery<PeriodStats>({
    queryKey: ['periodStats', 'month', thisMonth.from.toISOString().split('T')[0], thisMonth.to.toISOString().split('T')[0]],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('dateFrom', thisMonth.from.toISOString().split('T')[0]);
      params.append('dateTo', thisMonth.to.toISOString().split('T')[0]);

      const [usersResponse, completedResponse, cancelledResponse] = await Promise.all([
        apiClient.get<ApiResponse>(`/admin/analytics/users-added?${params.toString()}&groupBy=monthly`),
        apiClient.get<ApiResponse>(`/admin/analytics/matches-completed?${params.toString()}&groupBy=monthly`),
        apiClient.get<ApiResponse>(`/admin/analytics/matches-cancelled?${params.toString()}&groupBy=monthly`),
      ]);

      return {
        usersAdded: usersResponse.data.total || 0,
        matchesCompleted: completedResponse.data.total || 0,
        matchesCancelled: cancelledResponse.data.total || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: 1,
  });

  const StatCard = ({ title, stats, loading }: { title: string; stats?: PeriodStats; loading: boolean }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom color="textSecondary">
          {title}
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : stats ? (
          <Box>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Users Added
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stats.usersAdded.toLocaleString()}
              </Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary">
                Matches Completed
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stats.matchesCompleted.toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary">
                Matches Cancelled
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {stats.matchesCancelled.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ) : null}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <StatCard title="This Week" stats={thisWeekStats} loading={thisWeekLoading} />
      </Grid>
      <Grid item xs={12} md={6}>
        <StatCard title="This Month" stats={thisMonthStats} loading={thisMonthLoading} />
      </Grid>
    </Grid>
  );
};

