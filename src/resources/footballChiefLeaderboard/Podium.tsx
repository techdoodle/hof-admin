import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { FootballChiefLeaderboardEntry } from './api';

interface PodiumProps {
  topThree: FootballChiefLeaderboardEntry[];
}

export const Podium: React.FC<PodiumProps> = ({ topThree }) => {
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return '#00A859'; // Dark Green (1st place)
      case 2:
        return '#22D060'; // Light Green (2nd place)
      case 3:
        return '#66E699'; // Lighter Green (3rd place)
      default:
        return '#666';
    }
  };

  const getMedalLabel = (position: number) => {
    switch (position) {
      case 1:
        return '1st';
      case 2:
        return '2nd';
      case 3:
        return '3rd';
      default:
        return `${position}th`;
    }
  };

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 1:
        return 200;
      case 2:
        return 150;
      case 3:
        return 120;
      default:
        return 100;
    }
  };

  if (topThree.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No data available
        </Typography>
      </Box>
    );
  }

  // Ensure we have exactly 3 positions (fill with empty if needed)
  const displayItems = [
    topThree[1] || null, // 2nd place on left
    topThree[0] || null, // 1st place in center
    topThree[2] || null, // 3rd place on right
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 2,
        mb: 4,
        minHeight: 300,
      }}
    >
      {displayItems.map((item, index) => {
        const position = index === 0 ? 2 : index === 1 ? 1 : 3;
        const height = getPodiumHeight(position);
        const medalColor = getMedalColor(position);

        return (
          <Box
            key={position}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: index === 1 ? 1.2 : 1, // Center podium is slightly wider
            }}
          >
            {/* Medal/Trophy Icon */}
            {item && (
              <Box
                sx={{
                  mb: 2,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                  }}
                >
                  <EmojiEventsIcon
                    sx={{
                      fontSize: 60,
                      color: medalColor,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    }}
                  />
                </Box>
                <Avatar
                  src={item.profilePicture || undefined}
                  sx={{
                    width: 80,
                    height: 80,
                    border: `4px solid ${medalColor}`,
                    bgcolor: 'primary.main',
                    mt: 4,
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  {item.footballChiefName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    color: medalColor,
                    textAlign: 'center',
                    maxWidth: 150,
                  }}
                >
                  {item.footballChiefName}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: medalColor,
                    mt: 0.5,
                  }}
                >
                  {item.matchCount}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    mt: 0.5,
                  }}
                >
                  {item.matchCount === 1 ? 'match' : 'matches'}
                </Typography>
              </Box>
            )}

            {/* Podium Base */}
            <Paper
              elevation={8}
              sx={{
                width: '100%',
                height: height,
                backgroundColor: medalColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '8px 8px 0 0',
                position: 'relative',
                boxShadow: `0 4px 12px ${medalColor}40`,
              }}
            >
              {!item && (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    color: 'white',
                    opacity: 0.3,
                  }}
                >
                  {getMedalLabel(position)}
                </Typography>
              )}
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
};

