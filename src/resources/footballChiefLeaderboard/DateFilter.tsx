import React, { useState } from 'react';
import { Box, Tabs, Tab, Button, TextField } from '@mui/material';

interface DateFilterProps {
  onFilterChange: (dateFrom: Date | null, dateTo: Date | null) => void;
  loading?: boolean;
  currentFilter?: { from: Date | null; to: Date | null } | null;
}

type FilterType = 'day' | 'week' | 'month' | 'custom';

export const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, loading = false, currentFilter }) => {
  const [filterType, setFilterType] = useState<FilterType>('day');
  const [customDateFrom, setCustomDateFrom] = useState<string>('');
  const [customDateTo, setCustomDateTo] = useState<string>('');

  // Determine current filter type based on dates
  React.useEffect(() => {
    if (currentFilter?.from && currentFilter?.to) {
      const normalizeDate = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const filterFrom = normalizeDate(currentFilter.from);
      const filterTo = normalizeDate(currentFilter.to);
      
      // Check if it's today (daily)
      if (
        filterFrom.getTime() === today.getTime() &&
        filterTo.getTime() === today.getTime()
      ) {
        setFilterType('day');
        return;
      }

      // Check if it's current month
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const normalizedFirstDay = normalizeDate(firstDayOfMonth);
      const normalizedLastDay = normalizeDate(lastDayOfMonth);
      
      if (
        filterFrom.getTime() === normalizedFirstDay.getTime() &&
        filterTo.getTime() === normalizedLastDay.getTime()
      ) {
        setFilterType('month');
        return;
      }

      // Check if it's current week
      const dayOfWeek = today.getDay();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - dayOfWeek);
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      const normalizedFirstDayWeek = normalizeDate(firstDayOfWeek);
      const normalizedLastDayWeek = normalizeDate(lastDayOfWeek);
      
      if (
        filterFrom.getTime() === normalizedFirstDayWeek.getTime() &&
        filterTo.getTime() === normalizedLastDayWeek.getTime()
      ) {
        setFilterType('week');
        return;
      }

      // Otherwise it's custom
      setFilterType('custom');
      setCustomDateFrom(currentFilter.from.toISOString().split('T')[0]);
      setCustomDateTo(currentFilter.to.toISOString().split('T')[0]);
    }
  }, [currentFilter]);

  const getDateRange = (type: FilterType): { from: Date; to: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (type) {
      case 'day': {
        return { from: today, to: today };
      }
      case 'month': {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from: firstDay, to: lastDay };
      }
      case 'week': {
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        return { from: firstDayOfWeek, to: lastDayOfWeek };
      }
      default: {
        const from = customDateFrom ? new Date(customDateFrom) : today;
        const to = customDateTo ? new Date(customDateTo) : today;
        return { from, to };
      }
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: FilterType) => {
    setFilterType(newValue);
    if (newValue !== 'custom') {
      const { from, to } = getDateRange(newValue);
      onFilterChange(from, to);
    }
  };

  const handleApplyCustom = () => {
    if (customDateFrom && customDateTo) {
      const from = new Date(customDateFrom);
      const to = new Date(customDateTo);
      onFilterChange(from, to);
    }
  };

  // Don't call onFilterChange on mount - parent component handles initial load

  return (
    <Box sx={{ mb: 4 }}>
      <Tabs
        value={filterType}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            fontWeight: 600,
            textTransform: 'none',
          },
        }}
      >
        <Tab label="Daily" value="day" />
        <Tab label="This Week" value="week" />
        <Tab label="This Month" value="month" />
        <Tab label="Custom Range" value="custom" />
      </Tabs>

      {filterType === 'custom' && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            label="From Date"
            type="date"
            value={customDateFrom}
            onChange={(e) => setCustomDateFrom(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="To Date"
            type="date"
            value={customDateTo}
            onChange={(e) => setCustomDateTo(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            onClick={handleApplyCustom}
            disabled={!customDateFrom || !customDateTo || loading}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Apply Filter
          </Button>
        </Box>
      )}
    </Box>
  );
};

