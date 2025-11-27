import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { FootballChiefLeaderboardEntry } from './api';

interface LeaderboardListProps {
  entries: FootballChiefLeaderboardEntry[];
  startRank?: number;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  entries,
  startRank = 1,
}) => {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#00A859'; // Dark Green
      case 2:
        return '#22D060'; // Light Green
      case 3:
        return '#66E699'; // Lighter Green
      default:
        return 'primary.main';
    }
  };

  const isTopThree = (rank: number) => rank <= 3;

  if (entries.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No entries to display
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'primary.main' }}>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Rank</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }}>Football Chief</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">
              Matches
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((entry, index) => {
            const rank = startRank + index;
            const rankColor = getRankColor(rank);
            const isHighlighted = isTopThree(rank);

            return (
              <TableRow
                key={entry.footballChiefId}
                sx={{
                  backgroundColor: isHighlighted ? `${rankColor}15` : 'transparent',
                  borderLeft: isHighlighted ? `4px solid ${rankColor}` : '4px solid transparent',
                  '&:nth-of-type(even)': {
                    backgroundColor: isHighlighted ? `${rankColor}15` : 'action.hover',
                  },
                  '&:hover': {
                    backgroundColor: isHighlighted ? `${rankColor}25` : 'action.selected',
                  },
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isHighlighted && (
                      <EmojiEventsIcon
                        sx={{
                          fontSize: 24,
                          color: rankColor,
                        }}
                      />
                    )}
                    <Chip
                      label={`#${rank}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        minWidth: 50,
                        backgroundColor: isHighlighted ? rankColor : undefined,
                        color: isHighlighted ? 'white' : undefined,
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={entry.profilePicture || undefined}
                      sx={{
                        width: 40,
                        height: 40,
                        border: isHighlighted ? `2px solid ${rankColor}` : 'none',
                      }}
                    >
                      {entry.footballChiefName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: isHighlighted ? 700 : 600,
                          color: isHighlighted ? rankColor : 'text.primary',
                        }}
                      >
                        {entry.footballChiefName}
                      </Typography>
                      {entry.footballChiefEmail && (
                        <Typography variant="caption" color="text.secondary">
                          {entry.footballChiefEmail}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: isHighlighted ? rankColor : 'primary.main',
                    }}
                  >
                    {entry.matchCount}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

