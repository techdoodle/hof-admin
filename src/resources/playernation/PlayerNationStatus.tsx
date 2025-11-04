import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';

interface PlayerNationStatusProps {
  matchId: number;
  onShowMatching?: () => void;
}

interface StatusInfo {
  matchStatsId?: string;
  status?: string;
  lastPollTime?: any;
  pollAttempts?: number;
  nextPollAt?: string;
}

const PlayerNationStatus: React.FC<PlayerNationStatusProps> = ({ 
  matchId, 
  onShowMatching 
}) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [statusInfo, setStatusInfo] = useState<StatusInfo>({});
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const response = await dataProvider.custom(`admin/playernation/status/${matchId}`, {});
      setStatusInfo(response.data);
    } catch (error) {
      notify('Failed to load stats status', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePollNow = async () => {
    try {
      setPolling(true);
      await dataProvider.custom(`admin/playernation/poll-now/${matchId}`, {});
      notify('Poll initiated successfully', { type: 'success' });
      // Reload status after a short delay
      setTimeout(loadStatus, 2000);
    } catch (error) {
      notify('Failed to initiate poll', { type: 'error' });
    } finally {
      setPolling(false);
    }
  };

  const getStatusChip = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return <Chip icon={<ScheduleIcon />} label="Pending" color="default" />;
      case 'PROCESSING':
        return <Chip icon={<CircularProgress size={16} />} label="Processing" color="primary" />;
      case 'PARTIAL':
        return <Chip icon={<WarningIcon />} label="Partial" color="warning" />;
      case 'SUCCESS':
        return <Chip icon={<CheckCircleIcon />} label="Processed" color="success" />;
      case 'SUCCESS_WITH_UNMATCHED':
        return <Chip icon={<WarningIcon />} label="Processed (Unmatched)" color="warning" />;
      case 'POLL_SUCCESS_MAPPING_FAILED':
        return <Chip icon={<WarningIcon />} label="Processed (Mapping Failed)" color="warning" />;
      case 'IMPORTED':
        return <Chip icon={<CheckCircleIcon />} label="Imported" color="success" />;
      case 'ERROR':
        return <Chip icon={<ErrorIcon />} label="Error" color="error" />;
      case 'TIMEOUT':
        return <Chip icon={<ErrorIcon />} label="Timeout" color="error" />;
      default:
        return <Chip label="Unknown" color="default" />;
    }
  };

  const getStatusMessage = (status?: string) => {
    switch (status) {
      case 'PENDING':
        return 'Match submitted for stats. Waiting for processing to begin.';
      case 'PROCESSING':
        return 'Stats system is analyzing the match. This may take several hours.';
      case 'PARTIAL':
        return 'Some players have been processed. Manual mapping may be required.';
      case 'SUCCESS':
        return 'Processing completed. Review and import stats.';
      case 'SUCCESS_WITH_UNMATCHED':
        return 'Processing succeeded, but some players need manual matching.';
      case 'POLL_SUCCESS_MAPPING_FAILED':
        return 'Processing succeeded, but stats ingestion failed for some mappings.';
      case 'IMPORTED':
        return 'All player statistics have been successfully imported.';
      case 'ERROR':
        return 'An error occurred during processing. Please check the logs.';
      case 'TIMEOUT':
        return 'Processing timed out after 24 hours. Please contact support.';
      default:
        return 'Status unknown.';
    }
  };

  const getProgressValue = () => {
    if (!statusInfo.pollAttempts) return 0;
    return Math.min((statusInfo.pollAttempts / 12) * 100, 100);
  };

  const canPoll = statusInfo.status === 'PENDING' || statusInfo.status === 'PROCESSING';
  const showMatchingButton = ['PARTIAL', 'SUCCESS_WITH_UNMATCHED', 'POLL_SUCCESS_MAPPING_FAILED', 'IMPORTED']
    .includes(statusInfo.status || '');

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stats Status
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>
            {getStatusChip(statusInfo.status)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Match ID
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {statusInfo.matchStatsId || 'Not assigned'}
            </Typography>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 2 }}>
          {getStatusMessage(statusInfo.status)}
        </Alert>

        {statusInfo.status === 'PROCESSING' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Polling Progress ({statusInfo.pollAttempts || 0}/12 attempts)
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={getProgressValue()} 
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              Next poll: {statusInfo.nextPollAt ? 
                new Date(statusInfo.nextPollAt).toLocaleString() : 'Not scheduled'}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadStatus}
            disabled={loading}
          >
            Refresh Status
          </Button>

          {canPoll && (
            <Button
              variant="contained"
              startIcon={polling ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handlePollNow}
              disabled={polling}
            >
              Poll Now
            </Button>
          )}

          {showMatchingButton && onShowMatching && (
            <Button
              variant="contained"
              color="secondary"
              onClick={onShowMatching}
            >
              Manage Player Mappings
            </Button>
          )}
        </Box>

        {statusInfo.lastPollTime && (typeof statusInfo.lastPollTime === 'string' || typeof statusInfo.lastPollTime === 'number') && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Last poll: {new Date(statusInfo.lastPollTime).toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerNationStatus;
