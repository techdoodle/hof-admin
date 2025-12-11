import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';

interface AnalyticsFilterProps {
  groupBy: 'daily' | 'weekly' | 'monthly';
  onGroupByChange: (groupBy: 'daily' | 'weekly' | 'monthly') => void;
}

export const AnalyticsFilter: React.FC<AnalyticsFilterProps> = ({
  groupBy,
  onGroupByChange,
}) => {
  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'daily' | 'weekly' | 'monthly') => {
    onGroupByChange(newValue);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Tabs
        value={groupBy}
        onChange={handleTabChange}
        sx={{
          mb: 2,
          '& .MuiTab-root': {
            fontWeight: 600,
            textTransform: 'none',
          },
        }}
      >
        <Tab label="Daily" value="daily" />
        <Tab label="Weekly" value="weekly" />
        <Tab label="Monthly" value="monthly" />
      </Tabs>
    </Box>
  );
};

