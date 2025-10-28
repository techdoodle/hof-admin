import React, { useEffect } from 'react';
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
  useInput,
  TextInput,
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

// Custom component to sync offer price with slot price
const PricingFields = () => {
  const { field: slotPriceField } = useInput({ source: 'slotPrice' });
  const { field: offerPriceField } = useInput({ source: 'offerPrice' });

  useEffect(() => {
    // Only sync offer price to slot price if offer price is empty, null, or equal to slot price
    // This prevents overriding user's manual changes
    if (slotPriceField.value !== undefined &&
      (offerPriceField.value === undefined ||
        offerPriceField.value === null ||
        offerPriceField.value === '' ||
        offerPriceField.value === slotPriceField.value)) {
      offerPriceField.onChange(slotPriceField.value);
    }
  }, [slotPriceField.value, offerPriceField.value, offerPriceField.onChange, offerPriceField]);

  return (
    <>
      <Box flex="1 1 300px">
        <NumberInput
          source="slotPrice"
          label="Slot Price (₹)"
          min={0}
          defaultValue={0}
          fullWidth
          helperText="Base price per slot. Must be ≥ 0."
        />
      </Box>
      <Box flex="1 1 300px">
        <NumberInput
          source="offerPrice"
          label="Offer Price (₹)"
          min={0}
          defaultValue={0}
          fullWidth
          helperText="Discounted price. Must be ≤ slot price. Set equal to slot price for no discount."
        />
      </Box>
    </>
  );
};

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
            <TextInput
              source="teamAName"
              label="Team A Name"
              defaultValue="Home"
              fullWidth
              helperText="Optional. Defaults to 'Home' if not provided."
            />
          </Box>
          <Box flex="1 1 300px">
            <TextInput
              source="teamBName"
              label="Team B Name"
              defaultValue="Away"
              fullWidth
              helperText="Optional. Defaults to 'Away' if not provided."
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
          Pricing
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <PricingFields />
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