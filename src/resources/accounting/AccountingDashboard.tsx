import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';
import { AccountingByCity } from './AccountingByCity';
import { AccountingByFootballChief } from './AccountingByFootballChief';
import { CancelledMatchCosts } from './CancelledMatchCosts';

interface AccountingSummary {
  totalIncome: number;
  totalVenueCosts: number;
  totalFootballChiefCosts: number;
  totalPlayerNationCosts: number;
  totalRazorpayPaymentFees: number;
  totalRefundAmount: number;
  totalRazorpayRefundFees: number;
  totalRazorpayFees: number;
  cancelledMatchCosts: {
    venueCosts: number;
    footballChiefCosts: number;
    playerNationCosts: number;
    refundAmount: number;
    refundFees: number;
    total: number;
  };
  totalCosts: number;
  netProfit: number;
  matchCount: number;
  bookingCount: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export const AccountingDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  // Default date range: current calendar month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const defaultFrom = firstDayOfMonth.toISOString().slice(0, 10); // YYYY-MM-DD
  const defaultTo = lastDayOfMonth.toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState<string>(defaultFrom);
  const [dateTo, setDateTo] = useState<string>(defaultTo);
  const [activeTab, setActiveTab] = useState(0);
  const [appliedDateFrom, setAppliedDateFrom] = useState<string>(defaultFrom);
  const [appliedDateTo, setAppliedDateTo] = useState<string>(defaultTo);

  // Check if user is super_admin
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = user.role === 'super_admin';

  const fetchSummary = useCallback(
    async (from?: string, to?: string) => {
      if (!isSuperAdmin) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (from) params.append('dateFrom', from);
        if (to) params.append('dateTo', to);

        const url = `/admin/accounting/summary${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get(url);
        setSummary(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch accounting data');
      } finally {
        setLoading(false);
      }
    },
    [isSuperAdmin],
  );

  // Initial load: current month by default
  useEffect(() => {
    fetchSummary(defaultFrom, defaultTo);
  }, [fetchSummary, defaultFrom, defaultTo]);

  const handleApplyFilter = () => {
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    fetchSummary(dateFrom || undefined, dateTo || undefined);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (!isSuperAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Access denied. Super admin privileges required.</Alert>
      </Box>
    );
  }

  if (loading && !summary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Accounting Dashboard
      </Typography>

      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" onClick={handleApplyFilter} fullWidth>
                Apply Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {summary && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Income
                  </Typography>
                  <Typography variant="h5" color="success.main">
                    {formatCurrency(summary.totalIncome)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Costs
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {formatCurrency(summary.totalCosts)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Fees
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {formatCurrency(summary.totalRazorpayFees)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Net Profit/Loss
                  </Typography>
                  <Typography
                    variant="h5"
                    color={summary.netProfit >= 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(summary.netProfit)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Breakdown */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detailed Breakdown
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Venue Costs: {formatCurrency(summary.totalVenueCosts)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Football Chief Costs: {formatCurrency(summary.totalFootballChiefCosts)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    PlayerNation Costs: {formatCurrency(summary.totalPlayerNationCosts)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="textSecondary">
                    Payment Fees: {formatCurrency(summary.totalRazorpayPaymentFees)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Refund Amount: {formatCurrency(summary.totalRefundAmount)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Refund Fees: {formatCurrency(summary.totalRazorpayRefundFees)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tabs for different views */}
          <Paper sx={{ mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Overview" />
              <Tab label="By City" />
              <Tab label="By Football Chief" />
              <Tab label="Cancelled Matches" />
            </Tabs>
          </Paper>

          {activeTab === 0 && summary && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Overview
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Total Income</TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalIncome)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Venue Costs</TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalVenueCosts)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Football Chief Costs</TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalFootballChiefCosts)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>PlayerNation Costs</TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalPlayerNationCosts)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Razorpay Payment Fees</TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalRazorpayPaymentFees)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Refund Amount</TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalRefundAmount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Razorpay Refund Fees</TableCell>
                        <TableCell align="right">{formatCurrency(summary.totalRazorpayRefundFees)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <strong>Net Profit/Loss</strong>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={formatCurrency(summary.netProfit)}
                            color={summary.netProfit >= 0 ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {activeTab === 1 && (
            <AccountingByCity dateFrom={appliedDateFrom} dateTo={appliedDateTo} />
          )}

          {activeTab === 2 && (
            <AccountingByFootballChief dateFrom={appliedDateFrom} dateTo={appliedDateTo} />
          )}

          {activeTab === 3 && (
            <CancelledMatchCosts dateFrom={appliedDateFrom} dateTo={appliedDateTo} />
          )}
        </>
      )}
    </Box>
  );
};

