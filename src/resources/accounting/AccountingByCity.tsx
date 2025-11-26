import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import { apiClient } from '../../utils/apiClient';

interface MatchAccounting {
  matchId: number;
  matchDate: string;
  venue?: string;
  footballChief?: string;
  income: number;
  cashIncome: number;
  onlineIncome: number;
  venueCost: number;
  footballChiefCost: number;
  playerNationCost: number;
  razorpayPaymentFees: number;
  refundAmount: number;
  razorpayRefundFees: number;
  totalCosts: number;
  totalFees: number;
  netProfit: number;
}

interface CityAccounting {
  cityId: number;
  cityName: string;
  matchCount: number;
  income: number;
  venueCosts: number;
  footballChiefCosts: number;
  playerNationCosts: number;
  razorpayPaymentFees: number;
  refundAmount: number;
  razorpayRefundFees: number;
  totalCosts: number;
  totalFees: number;
  netProfit: number;
}

interface AccountingByCityProps {
  dateFrom?: string;
  dateTo?: string;
}

// Simple in-memory cache keyed by date range
const citySummaryCache: {
  [key: string]: CityAccounting[];
} = {};

export const AccountingByCity: React.FC<AccountingByCityProps> = ({ dateFrom, dateTo }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CityAccounting[]>([]);
  const [expandedCityId, setExpandedCityId] = useState<number | null>(null);
  const [matchPage, setMatchPage] = useState(1);
  const [matchData, setMatchData] = useState<{
    [cityId: number]: { page: number; pageSize: number; total: number; data: MatchAccounting[] }
  }>({});
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [drilldownError, setDrilldownError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const fetchData = async () => {
      const key = `${dateFrom || ''}|${dateTo || ''}`;

      // Use cached data if available
      if (citySummaryCache[key]) {
        setData(citySummaryCache[key]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        
        const url = `/admin/accounting/by-city${params.toString() ? '?' + params.toString() : ''}`;
        const response = await apiClient.get(url);
        setData(response.data);
        citySummaryCache[key] = response.data;
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo]);

  const loadCityMatches = async (cityId: number, page: number) => {
    setDrilldownLoading(true);
    setDrilldownError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('pageSize', String(pageSize));
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const url = `/admin/accounting/by-city/${cityId}/matches?${params.toString()}`;
      const response = await apiClient.get(url);
      const { data: rows, total } = response.data;

      setMatchData(prev => ({
        ...prev,
        [cityId]: { page, pageSize, total, data: rows },
      }));
      setMatchPage(page);
    } catch (err: any) {
      setDrilldownError(err.response?.data?.message || err.message || 'Failed to fetch match details');
    } finally {
      setDrilldownLoading(false);
    }
  };

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

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalCosts = data.reduce((sum, item) => sum + item.totalCosts, 0);
  const totalFees = data.reduce((sum, item) => sum + item.totalFees, 0);
  const totalNetProfit = data.reduce((sum, item) => sum + item.netProfit, 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Accounting by City
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>City</TableCell>
                <TableCell align="right">Matches</TableCell>
                <TableCell align="right">Income</TableCell>
                <TableCell align="right">Costs</TableCell>
                <TableCell align="right">Fees</TableCell>
                <TableCell align="right">Net Profit/Loss</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => {
                const state = matchData[item.cityId];
                const hasMatches = !!state && state.total > 0;
                const isExpanded = expandedCityId === item.cityId;

                // For the expanded city, compute paginated slice
                const totalMatches = hasMatches ? state.total : 0;
                const totalPages =
                  totalMatches > 0 ? Math.ceil(totalMatches / pageSize) : 1;
                const currentPage = isExpanded ? state?.page || 1 : 1;
                const safePage =
                  totalMatches > 0
                    ? Math.min(Math.max(currentPage, 1), totalPages)
                    : 1;
                const startIndex = (safePage - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, totalMatches);
                const pageMatches =
                  hasMatches && isExpanded ? state.data : [];

                return (
                  <React.Fragment key={item.cityId}>
                    <TableRow
                      hover
                      sx={{
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedCityId(null);
                        } else {
                          setExpandedCityId(item.cityId);
                          // Load first page on first expand
                          if (!matchData[item.cityId]) {
                            loadCityMatches(item.cityId, 1);
                          }
                        }
                      }}
                    >
                    <TableCell>{item.cityName}</TableCell>
                    <TableCell align="right">{item.matchCount}</TableCell>
                    <TableCell align="right">{formatCurrency(item.income)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.totalCosts)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.totalFees)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatCurrency(item.netProfit)}
                        color={item.netProfit >= 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Box sx={{ mt: 1, mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Matches in {item.cityName}
                            </Typography>
                            {drilldownLoading && !hasMatches ? (
                              <Box sx={{ py: 2, textAlign: 'center' }}>
                                <CircularProgress size={20} />
                              </Box>
                            ) : drilldownError ? (
                              <Alert
                                severity="error"
                                sx={{ mb: 1 }}
                                onClose={() => setDrilldownError(null)}
                              >
                                {drilldownError}
                              </Alert>
                            ) : hasMatches ? (
                              <>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Match ID</TableCell>
                                      <TableCell>Date</TableCell>
                                      <TableCell>Venue</TableCell>
                                      <TableCell>Football Chief</TableCell>
                                      <TableCell align="right">Income (Total)</TableCell>
                                      <TableCell align="right">Income (Cash)</TableCell>
                                      <TableCell align="right">Income (Online)</TableCell>
                                      <TableCell align="right">Venue Cost</TableCell>
                                      <TableCell align="right">FC Cost</TableCell>
                                      <TableCell align="right">PlayerNation Cost</TableCell>
                                      <TableCell align="right">Fees</TableCell>
                                      <TableCell align="right">Net</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {pageMatches.map((m) => (
                                      <TableRow key={m.matchId}>
                                        <TableCell>{m.matchId}</TableCell>
                                        <TableCell>
                                          {new Date(m.matchDate).toLocaleString()}
                                        </TableCell>
                                        <TableCell>{m.venue}</TableCell>
                                        <TableCell>{m.footballChief}</TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(m.income)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(m.cashIncome)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(m.onlineIncome)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(m.venueCost)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(m.footballChiefCost)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(m.playerNationCost)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(m.totalFees)}
                                        </TableCell>
                                        <TableCell align="right">
                                          <Chip
                                            label={formatCurrency(m.netProfit)}
                                            color={m.netProfit >= 0 ? 'success' : 'error'}
                                            size="small"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>

                                {/* Pagination controls for match drill-down */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 1,
                                  }}
                                >
                                  <Typography variant="body2" color="textSecondary">
                                    {totalMatches > 0
                                      ? `Showing ${startIndex + 1}–${endIndex} of ${totalMatches} matches`
                                      : 'No matches'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      disabled={safePage <= 1 || drilldownLoading}
                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        if (safePage <= 1) return;
                                        loadCityMatches(item.cityId, safePage - 1);
                                      }}
                                    >
                                      Previous
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      disabled={
                                        safePage >= totalPages || drilldownLoading
                                      }
                                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.stopPropagation();
                                        if (safePage >= totalPages) return;
                                        loadCityMatches(item.cityId, safePage + 1);
                                      }}
                                    >
                                      Next
                                    </Button>
                                  </Box>
                                </Box>
                              </>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                No matches
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
              <TableRow>
                <TableCell>
                  <strong>Total</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{data.reduce((sum, item) => sum + item.matchCount, 0)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(totalIncome)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(totalCosts)}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{formatCurrency(totalFees)}</strong>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={formatCurrency(totalNetProfit)}
                    color={totalNetProfit >= 0 ? 'success' : 'error'}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

