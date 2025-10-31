import React from 'react';
import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput,
  required,
} from 'react-admin';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { Toolbar, SaveButton } from 'react-admin';
import { Button } from '@mui/material';
import { useGetOne } from 'react-admin';

export const MatchParticipantCreate = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Try to get matchId from multiple sources
  const matchId =
    location.state?.record?.matchId ||
    searchParams.get('matchId') ||
    new URLSearchParams(location.search).get('matchId');


  const transform = (data: any) => ({
    ...data,
    matchId: matchId || data.matchId, // Ensure matchId is always included
    userId: data.user, // Backend expects userId, not user
  });

  // Load match to derive team names
  const numericMatchId = matchId ? parseInt(String(matchId), 10) : undefined;
  const { data: matchDetails } = useGetOne('matches', {
    id: numericMatchId as any,
  }, { enabled: !!numericMatchId });

  const teamChoices = React.useMemo(() => {
    const a = matchDetails?.teamAName?.trim();
    const b = matchDetails?.teamBName?.trim();
    const unique = Array.from(new Set([a, b].filter(Boolean)));
    return unique.map(name => ({ id: name!, name: name! }));
  }, [matchDetails]);

  const BackToolbar = () => (
    <Toolbar>
      <SaveButton alwaysEnable />
      <Button
        variant="outlined"
        sx={{ ml: 1 }}
        onClick={() => {
          const f = encodeURIComponent(JSON.stringify({ matchId }));
          navigate(`/match-participants?filter=${f}`);
        }}
      >
        Back to Participants
      </Button>
    </Toolbar>
  );

  return (
    <Create redirect={false} transform={transform}>
      <SimpleForm toolbar={<BackToolbar />}>
        <TextInput
          source="matchId"
          label="Match ID"
          defaultValue={matchId}
          validate={required()}
          disabled={!!matchId}
        />

        <ReferenceInput
          source="user"
          reference="users"
          label="Player"
        >
          <SelectInput
            optionText={record => `${record.firstName} ${record.lastName}`}
            optionValue="id"
            validate={required()}
          />
        </ReferenceInput>

        <SelectInput
          source="teamName"
          label="Team Name"
          choices={teamChoices}
          optionText="name"
          optionValue="id"
          validate={required()}
          helperText={teamChoices.length ? 'Select a team' : 'Teams load from the match details'}
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
};
