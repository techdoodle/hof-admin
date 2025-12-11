import React, { useState } from 'react';
import { Box, Tabs, Tab, Button, TextField } from '@mui/material';

interface DateFilterProps {
  onFilterChange: (dateFrom: Date | null, dateTo: Date | null) => void;
  loading?: boolean;
  currentFilter?: { from: Date | null; to: Date | null } | null;
}

type FilterType = 'week' | 'month' | 'custom';

export const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, loading = false, currentFilter }) => {
  const [filterType, setFilterType] = useState<FilterType>('month');
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

      // Compare dates (ignore time for comparison)
      const compareDateOnly = (d1: Date, d2: Date) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
      };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const filterFrom = normalizeDate(currentFilter.from);
      const filterTo = normalizeDate(currentFilter.to);
      
      // Check if it's current month
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      if (
        compareDateOnly(filterFrom, firstDayOfMonth) &&
        compareDateOnly(filterTo, lastDayOfMonth)
      ) {
        setFilterType('month');
        return;
      }

      // Check if it's current week (Monday to Sunday)
      const dayOfWeek = today.getDay();
      // Convert Sunday (0) to 7 for easier calculation
      const dayOffset = dayOfWeek === 0 ? 7 : dayOfWeek;
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - (dayOffset - 1)); // Monday
      firstDayOfWeek.setHours(0, 0, 0, 0);
      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Sunday
      lastDayOfWeek.setHours(23, 59, 59, 999); // End of Sunday
      
      if (
        compareDateOnly(filterFrom, firstDayOfWeek) &&
        compareDateOnly(filterTo, lastDayOfWeek)
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
      case 'month': {
        // Current month: first day to last day
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        lastDay.setHours(23, 59, 59, 999);
        return { from: firstDay, to: lastDay };
      }
      case 'week': {
        // Current week: Monday to Sunday (end of Sunday)
        const dayOfWeek = today.getDay();
        // Convert Sunday (0) to 7 for easier calculation
        const dayOffset = dayOfWeek === 0 ? 7 : dayOfWeek;
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - (dayOffset - 1)); // Monday
        firstDayOfWeek.setHours(0, 0, 0, 0);
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Sunday
        lastDayOfWeek.setHours(23, 59, 59, 999); // End of Sunday
        return { from: firstDayOfWeek, to: lastDayOfWeek };
      }
      default: {
        const from = customDateFrom ? new Date(customDateFrom) : today;
        from.setHours(0, 0, 0, 0);
        const to = customDateTo ? new Date(customDateTo) : today;
        to.setHours(23, 59, 59, 999);
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

