import React from 'react';
import {
  Create,
  SimpleForm,
  DateTimeInput,
  ReferenceInput,
  SelectInput,
  NumberInput,
  BooleanInput,
  required,
  TopToolbar,
  CreateButton,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

const MatchCreateToolbar = () => (
  <TopToolbar>
    <CreateButton
      resource="venues"
      label="Add New Venue"
    />
  </TopToolbar>
);

export const MatchCreate = () => {
  return (
    <Create actions={<MatchCreateToolbar />}>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Match Details
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <SelectInput
              source="matchType"
              label="Recording Type"
              choices={[
                { id: 'recorded', name: 'Recorded' },
                { id: 'non_recorded', name: 'Non-Recorded' },
              ]}
              validate={required()}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <ReferenceInput source="matchTypeId" reference="match_types" label="Match Type">
              <SelectInput
                optionText="matchName"
                optionValue="id"
                validate={required()}
                fullWidth
                defaultValue={1} // Default to HOF Play
              />
            </ReferenceInput>
          </Box>
          <Box flex="1 1 300px">
            <DateTimeInput
              source="startTime"
              label="Start Time"
              validate={required()}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <DateTimeInput
              source="endTime"
              label="End Time"
              validate={required()}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <ReferenceInput source="venue" reference="venues">
              <SelectInput optionText="name" validate={required()} fullWidth />
            </ReferenceInput>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
          Match Settings
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <BooleanInput
              source="statsReceived"
              label="Stats Received"
              defaultValue={false}
            />
          </Box>
          <Box flex="1 1 300px">
            <NumberInput
              source="playerCapacity"
              label="Player Capacity"
              min={0}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <NumberInput
              source="bufferCapacity"
              label="Buffer Capacity"
              min={0}
              defaultValue={0}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <NumberInput
              source="teamAScore"
              label="Team A Score"
              defaultValue={0}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <NumberInput
              source="teamBScore"
              label="Team B Score"
              defaultValue={0}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <ReferenceInput
              source="footballChief"
              reference="users"
              filter={{ role: 'football_chief,academy_admin,admin,super_admin' }}
            >
              <SelectInput
                optionText={(record) => `${record.firstName} ${record.lastName}`}
                validate={required()}
                fullWidth
              />
            </ReferenceInput>
          </Box>
        </Box>
      </SimpleForm>
    </Create>
  );
};