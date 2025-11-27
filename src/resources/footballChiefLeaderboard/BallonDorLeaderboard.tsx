import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { DateFilter } from './DateFilter';
import { LeaderboardList } from './LeaderboardList';
import { getFootballChiefLeaderboard, FootballChiefLeaderboardEntry } from './api';

// Simple cache for leaderboard data
const leaderboardCache = new Map<string, { data: FootballChiefLeaderboardEntry[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (from: Date | null, to: Date | null): string => {
  const fromStr = from ? from.toISOString().split('T')[0] : 'null';
  const toStr = to ? to.toISOString().split('T')[0] : 'null';
  return `${fromStr}_${toStr}`;
};

const getCachedData = (key: string): FootballChiefLeaderboardEntry[] | null => {
  const cached = leaderboardCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: FootballChiefLeaderboardEntry[]): void => {
  leaderboardCache.set(key, { data, timestamp: Date.now() });
};

export const BallonDorLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<FootballChiefLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<{ from: Date | null; to: Date | null } | null>(null);

  const fetchLeaderboard = React.useCallback(async (from: Date | null, to: Date | null) => {
    const cacheKey = getCacheKey(from, to);
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      setLeaderboard(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fromStr = from ? from.toISOString().split('T')[0] : undefined;
      const toStr = to ? to.toISOString().split('T')[0] : undefined;
      const data = await getFootballChiefLeaderboard(fromStr, toStr);
      setLeaderboard(data);
      setCachedData(cacheKey, data);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFilterChange = React.useCallback((from: Date | null, to: Date | null) => {
    setCurrentFilter({ from, to });
    fetchLeaderboard(from, to);
  }, [fetchLeaderboard]);

  useEffect(() => {
    // Initial load with current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    fetchLeaderboard(firstDay, lastDay);
  }, [fetchLeaderboard]);


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 4,
          background: 'linear-gradient(135deg, #00A859 0%, #003B1F 100%)',
          borderRadius: 3,
          p: 4,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            HoF Ballon d'Or
          </Typography>
          <EmojiEventsIcon sx={{ fontSize: 60, color: 'white' }} />
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            opacity: 0.95,
            fontWeight: 500,
          }}
        >
          Football Chief Leaderboard
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Leaderboard Content */}
      {!loading && !error && (
        <>
          {/* Combined Date Filter and Leaderboard */}
          <Paper
            elevation={4}
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(to bottom, #f5f5f5 0%, #ffffff 100%)',
              borderRadius: 3,
            }}
          >
            <DateFilter onFilterChange={handleFilterChange} loading={loading} currentFilter={currentFilter} />
            {leaderboard.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <LeaderboardList entries={leaderboard} startRank={1} />
              </Box>
            )}
          </Paper>

          {/* Empty State */}
          {leaderboard.length === 0 && (
            <Paper
              elevation={2}
              sx={{
                p: 6,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No matches found for the selected period
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Container>
  );
};

