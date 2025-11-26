import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';

interface CancelledMatchCostsProps {
  dateFrom?: string;
  dateTo?: string;
}

export const CancelledMatchCosts: React.FC<CancelledMatchCostsProps> = ({ dateFrom, dateTo }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        
        const groupBy = activeTab === 1 ? 'city' : activeTab === 2 ? 'football-chief' : undefined;
        if (groupBy) params.append('groupBy', groupBy);
        
        const url = `/admin/accounting/cancelled-matches${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get(url);
        setData(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo, activeTab]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Cancelled Match Costs
              </Typography>
              <Typography variant="h5" color="error.main">
                {formatCurrency(data.summary?.total || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Venue Costs
              </Typography>
              <Typography variant="h5">
                {formatCurrency(data.summary?.venueCosts || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Refund Amount
              </Typography>
              <Typography variant="h5">
                {formatCurrency(data.summary?.refundAmount || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Refund Fees
              </Typography>
              <Typography variant="h5" color="warning.main">
                {formatCurrency(data.summary?.refundFees || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Match List" />
          <Tab label="By City" />
          <Tab label="By Football Chief" />
        </Tabs>
      </Paper>

      {/* Content based on active tab */}
      {activeTab === 0 && data.matches && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cancelled Matches
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Match ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Venue</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Football Chief</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.matches.map((match: any) => (
                    <TableRow key={match.matchId}>
                      <TableCell>{match.matchId}</TableCell>
                      <TableCell>{new Date(match.date).toLocaleDateString()}</TableCell>
                      <TableCell>{match.venue}</TableCell>
                      <TableCell>{match.city}</TableCell>
                      <TableCell>{match.footballChief}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && data.grouped && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cancelled Match Costs by City
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>City</TableCell>
                    <TableCell align="right">Venue Costs</TableCell>
                    <TableCell align="right">Refund Amount</TableCell>
                    <TableCell align="right">Refund Fees</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.grouped.map((item: any) => (
                    <TableRow key={item.cityId}>
                      <TableCell>{item.cityName}</TableCell>
                      <TableCell align="right">{formatCurrency(item.venueCosts || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.refundAmount || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.refundFees || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && data.grouped && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Cancelled Match Costs by Football Chief
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Football Chief</TableCell>
                    <TableCell align="right">Venue Costs</TableCell>
                    <TableCell align="right">Refund Amount</TableCell>
                    <TableCell align="right">Refund Fees</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.grouped.map((item: any) => (
                    <TableRow key={item.footballChiefId}>
                      <TableCell>{item.footballChiefName}</TableCell>
                      <TableCell align="right">{formatCurrency(item.venueCosts || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.refundAmount || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.refundFees || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

