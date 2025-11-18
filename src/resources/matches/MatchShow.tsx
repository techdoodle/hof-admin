import React, { useState } from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  BooleanField,
  NumberField,
  FunctionField,
  useRecordContext,
  Button,
  TopToolbar,
  ListButton,
  EditButton,
} from 'react-admin';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
// import PersonIcon from '@mui/icons-material/Person';
import { PlayerNationStatus, PlayerMatching } from '../playernation';

const MatchTitle = () => {
  const record = useRecordContext();
  return <span>Match {record ? `#${record.matchId}` : ''}</span>;
};

const MatchShowActions = () => (
  <TopToolbar>
    <ListButton />
    <EditButton />
  </TopToolbar>
);

const StatsActions = () => {
  const record = useRecordContext();
  const navigate = useNavigate();

  if (!record) return null;

  const handleViewEditStats = () => {
    navigate(`/match-stats/${record.matchId}/edit`);
  };


  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Match Statistics
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleViewEditStats}
        >
          View/Edit Stats
        </Button>
      </Box>
    </Box>
  );
};

const PlayerMatchingWrapper = ({ showPlayerMatching, setShowPlayerMatching }: { 
  showPlayerMatching: boolean; 
  setShowPlayerMatching: (show: boolean) => void;
}) => {
  const record = useRecordContext();
  
  if (!showPlayerMatching || !record) return null;
  
  return (
    <PlayerMatching 
      matchId={record.matchId} 
      onClose={() => setShowPlayerMatching(false)}
    />
  );
};

export const MatchShow = () => {
  const [showPlayerMatching, setShowPlayerMatching] = useState(false);
  const navigate = useNavigate();

  return (
    <Show title={<MatchTitle />} actions={<MatchShowActions />}>
      <SimpleShowLayout>
        <TextField source="matchId" label="ID" />
        <TextField source="matchType" label="Match Type" />
        <DateField source="startTime" label="Start Time" showTime />
        <DateField source="endTime" label="End Time" showTime />
        <BooleanField source="statsReceived" label="Stats Received" />
        <NumberField source="teamAScore" label="Team A Score" />
        <NumberField source="teamBScore" label="Team B Score" />
        <FunctionField
          label="Football Chief"
          render={(record: any) =>
            record?.footballChief ?
              <Typography>
                {`${record.footballChief.firstName} ${record.footballChief.lastName}`}
                <br />
                {record.footballChief.email}
                <br />
                {record.footballChief.phoneNumber}
              </Typography>
              : '-'
          }
        />
        <FunctionField
          label="Venue"
          render={(record: any) =>
            record?.venue ?
              <Typography>
                {record.venue.name}
                <br />
                {record.venue.address}
                <br />
                {record.venue.phoneNumber}
              </Typography>
              : '-'
          }
        />
        <FunctionField
          label="City"
          render={(record: any) =>
            record?.venue?.city ?
              <Typography>
                {record.venue.city.cityName}, {record.venue.city.stateName}
                <br />
                {record.venue.city.country}
              </Typography>
              : '-'
          }
        />
        <TextField source="matchHighlights" label="Highlights" />
        <TextField source="matchRecap" label="Recap" />
        <DateField source="createdAt" label="Created At" showTime />
        <DateField source="updatedAt" label="Updated At" showTime />

        <StatsActions />

        {/* Stats Status Section */}
        <FunctionField
          label="Stats"
          render={(record: any) => {
            if (record?.matchType === 'recorded' && record?.matchStatsId) {
              return (
                <Box sx={{ mt: 2 }}>
                  <PlayerNationStatus 
                    matchId={record.matchId} 
                    onShowMatching={() => setShowPlayerMatching(true)}
                    onShowStats={() => navigate(`/match-stats/${record.matchId}/edit`)}
                  />
                </Box>
              );
            }
            return null;
          }}
        />
      </SimpleShowLayout>

      {/* Player Matching Dialog */}
      <PlayerMatchingWrapper 
        showPlayerMatching={showPlayerMatching}
        setShowPlayerMatching={setShowPlayerMatching}
      />
    </Show>
  );
};