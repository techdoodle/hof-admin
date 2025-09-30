import React from 'react';
import {
  Create,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput,
  BooleanInput,
  required,
  useGetList,
} from 'react-admin';
import { useLocation, useSearchParams } from 'react-router-dom';

export const MatchParticipantCreate = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Try to get matchId from multiple sources
  const matchId =
    location.state?.record?.matchId ||
    searchParams.get('matchId') ||
    new URLSearchParams(location.search).get('matchId');

  const { data: users } = useGetList('users', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'firstName', order: 'ASC' }
  });

  const transform = (data: any) => ({
    ...data,
    matchId: matchId || data.matchId, // Ensure matchId is always included
    userId: data.user, // Backend expects userId, not user
  });

  return (
    <Create redirect="list" transform={transform}>
      <SimpleForm>
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

        <TextInput
          source="teamName"
          label="Team Name"
          validate={required()}
          helperText="Enter the team name for this participant"
        />

        <BooleanInput
          source="paidStatsOptIn"
          label="Paid Stats Opt-in"
          defaultValue={false}
        />
      </SimpleForm>
    </Create>
  );
};
