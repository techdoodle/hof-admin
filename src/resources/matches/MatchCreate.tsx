import React, { useEffect, useState } from 'react';
import {
  Create,
  SimpleForm,
  DateTimeInput,
  ReferenceInput,
  SelectInput,
  NumberInput,
  required,
  TopToolbar,
  CreateButton,
  useInput,
  TextInput,
  useNotify,
} from 'react-admin';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { RecurringMatchCreate } from './RecurringMatchCreate';

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
  const notify = useNotify();
  const [tabValue, setTabValue] = useState(0);

  const onSuccess = (data: any) => {
    notify('Match created successfully! You can create another match.', { type: 'success' });
    // Form will reset automatically with redirect={false}
  };

  return (
    <Create actions={<MatchCreateToolbar />} redirect={false} mutationOptions={{ onSuccess }}>
      <Box sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Single Match" />
          <Tab label="Recurring Matches" />
        </Tabs>
        {tabValue === 0 ? (
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
          {/* Team scores are set post-match; omitted in create form */}
          <Box flex="1 1 300px">
            <ReferenceInput
              source="footballChief"
              reference="chiefs"
            >
              <SelectInput
                optionText="fullName"
                validate={required()}
                fullWidth
              />
            </ReferenceInput>
          </Box>
        </Box>
      </SimpleForm>
        ) : (
          <RecurringMatchCreate />
        )}
      </Box>
    </Create>
  );
};