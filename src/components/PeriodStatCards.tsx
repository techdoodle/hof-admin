import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Grid } from '@mui/material';
import { apiClient } from '../utils/apiClient';

interface PeriodStats {
  usersAdded: number;
  matchesCompleted: number;
  matchesCancelled: number;
  loading: boolean;
}

interface ApiResponse {
  success?: boolean;
  data?: any[];
  total: number;
}

export const PeriodStatCards: React.FC = () => {
  const [thisWeekStats, setThisWeekStats] = useState<PeriodStats>({
    usersAdded: 0,
    matchesCompleted: 0,
    matchesCancelled: 0,
    loading: true,
  });

  const [thisMonthStats, setThisMonthStats] = useState<PeriodStats>({
    usersAdded: 0,
    matchesCompleted: 0,
    matchesCancelled: 0,
    loading: true,
  });

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

  const fetchPeriodStats = async (dateFrom: Date, dateTo: Date, setStats: React.Dispatch<React.SetStateAction<PeriodStats>>) => {
    setStats(prev => ({ ...prev, loading: true }));

    try {
      const params = new URLSearchParams();
      params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
      params.append('dateTo', dateTo.toISOString().split('T')[0]);

      const [usersResponse, completedResponse, cancelledResponse] = await Promise.all([
        apiClient.get<ApiResponse>(`/admin/analytics/users-added?${params.toString()}&groupBy=monthly`),
        apiClient.get<ApiResponse>(`/admin/analytics/matches-completed?${params.toString()}&groupBy=monthly`),
        apiClient.get<ApiResponse>(`/admin/analytics/matches-cancelled?${params.toString()}&groupBy=monthly`),
      ]);

      setStats({
        usersAdded: usersResponse.data.total || 0,
        matchesCompleted: completedResponse.data.total || 0,
        matchesCancelled: cancelledResponse.data.total || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch period stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    const thisWeek = getThisWeekRange();
    const thisMonth = getThisMonthRange();

    fetchPeriodStats(thisWeek.from, thisWeek.to, setThisWeekStats);
    fetchPeriodStats(thisMonth.from, thisMonth.to, setThisMonthStats);
  }, []);

  const StatCard = ({ title, stats }: { title: string; stats: PeriodStats }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom color="textSecondary">
          {title}
        </Typography>
        {stats.loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} md={6}>
        <StatCard title="This Week" stats={thisWeekStats} />
      </Grid>
      <Grid item xs={12} md={6}>
        <StatCard title="This Month" stats={thisMonthStats} />
      </Grid>
    </Grid>
  );
};

