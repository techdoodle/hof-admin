import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  DeleteButton,
  usePermissions,
  TopToolbar,
  CreateButton,
  SelectInput,
  Title,
  useGetList,
  Form,
  RaRecord,
} from 'react-admin';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, Typography, Box, Button, Divider } from '@mui/material';

type AdminRole = 'football_chief' | 'academy_admin' | 'admin' | 'super_admin';
const ADMIN_ROLES: AdminRole[] = ['football_chief', 'academy_admin', 'admin', 'super_admin'];

interface MatchSelectorProps {
  onMatchSelect: (matchId: string | null) => void;
}

interface Match extends RaRecord {
  matchId: string;
  venue?: { name: string };
  startTime: string;
}

interface MatchParticipant extends RaRecord {
  teamName: string;
  user: string;
  paidStatsOptIn: boolean;
  matchId: string;
}

const MatchSelector = ({ onMatchSelect }: MatchSelectorProps) => {
  const { data, isLoading } = useGetList<Match>('matches', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'startTime', order: 'DESC' }
  });

  const handleSubmit = (values: any) => {
    if (values.matchId) {
      onMatchSelect(values.matchId);
    }
  };

  return (
    <Card>
      <Title title="Match Participants" />
      <CardContent>
        <Typography variant="h6" gutterBottom>Select a Match</Typography>
        <Box sx={{ maxWidth: 600, mb: 2 }}>
          <Form onSubmit={handleSubmit}>
            <Box display="flex" gap={2}>
              <Box flex={1}>
                <SelectInput
                  source="matchId"
                  choices={data || []}
                  optionText={record =>
                    `Match ${record.matchId} | ${record.venue?.name || 'No venue'} | ${new Date(record.startTime).toLocaleString()}`
                  }
                  optionValue="matchId"
                  fullWidth
                  disabled={isLoading}
                  helperText={isLoading ? 'Loading matches...' : ''}
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isLoading}
              >
                View Participants
              </Button>
            </Box>
          </Form>
        </Box>
      </CardContent>
    </Card>
  );
};

const ParticipantsList = ({ matchId, onMatchChange }: { matchId: string; onMatchChange: (id: string | null) => void }) => {
  const { permissions } = usePermissions<AdminRole>();
  const canManageParticipants = permissions ? ADMIN_ROLES.includes(permissions) : false;
  const { data: matches, isLoading } = useGetList<Match>('matches', {
    pagination: { page: 1, perPage: 100 },
    sort: { field: 'startTime', order: 'DESC' }
  });

  const handleMatchChange = React.useCallback((event: any) => {
    const value = event?.target?.value;
    if (value !== undefined && value !== matchId) {
      onMatchChange(value);
    }
  }, [matchId, onMatchChange]);

  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <Box flex={1}>
              <Form>
                <SelectInput
                  source="matchId"
                  choices={matches || []}
                  optionText={record =>
                    `Match ${record.matchId} | ${record.venue?.name || 'No venue'} | ${new Date(record.startTime).toLocaleString()}`
                  }
                  optionValue="matchId"
                  onChange={handleMatchChange}
                  defaultValue={matchId}
                  disabled={isLoading}
                  helperText={isLoading ? 'Loading matches...' : ''}
                  fullWidth
                />
              </Form>
            </Box>
          </Box>
        </CardContent>
      </Card>
      <List<MatchParticipant>
        resource="match-participants"
        filter={{ matchId }}
        pagination={false}
        sort={{ field: 'id', order: 'DESC' }}
        actions={false}
        storeKey={`match-participants-${matchId}`}
        queryOptions={{
          enabled: !!matchId,
          refetchOnWindowFocus: false,
          staleTime: 30000, // 30 seconds
          gcTime: 300000, // 5 minutes
          retry: 1,
          retryDelay: 1000,
        }}
        empty={false}
      >
        <div>
          <TopToolbar>
            {canManageParticipants && (
              <CreateButton
                resource="match-participants"
                state={{ record: { matchId } }}
              />
            )}
          </TopToolbar>
          <Datagrid
            bulkActionButtons={false}
            optimized
          >
            <TextField source="id" label="User ID" />
            <TextField source="teamName" label="Team" />
            <ReferenceField
              source="user"
              reference="users"
              label="Player"
              emptyText="-"
              link={false}
            >
              <TextField source="firstName" />
            </ReferenceField>


            {canManageParticipants && (
              <DeleteButton
                mutationMode="pessimistic"
                confirmTitle="Delete participant?"
                confirmContent="Are you sure you want to delete this participant?"
              />
            )}
          </Datagrid>
        </div>
      </List>
    </>
  );
};

export const MatchParticipantList = () => {
  const location = useLocation();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Clear all queries when component unmounts
    return () => {
      queryClient.removeQueries({ queryKey: ['match-participants'] });
    };
  }, [queryClient]);

  // Read matchId from URL filter param on first load
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const filterStr = params.get('filter');
      if (filterStr) {
        const parsed = JSON.parse(filterStr);
        if (parsed && parsed.matchId) {
          setSelectedMatch(String(parsed.matchId));
        }
      }
    } catch (_) {
      // ignore parse errors
    }
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMatchSelect = (matchId: string | null) => {
    queryClient.removeQueries({ queryKey: ['match-participants'] });
    setSelectedMatch(matchId);
  };

  return (
    <>
      {!selectedMatch && <MatchSelector onMatchSelect={handleMatchSelect} />}
      <Divider />
      {selectedMatch && <ParticipantsList matchId={selectedMatch} onMatchChange={handleMatchSelect} />}
    </>
  );
};