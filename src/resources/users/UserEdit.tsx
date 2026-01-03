import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  NumberInput,
  required,
  email,
  usePermissions,
  TopToolbar,
  ListButton,
  ShowButton,
  useRecordContext,
  useGetList,
} from 'react-admin';
import { Box, Typography } from '@mui/material';
// Player category choices to match backend enum

const playerCategoryChoices = [
  { id: 'STRIKER', name: 'Striker/Midfielder' },
  { id: 'DEFENDER', name: 'Defender' },
  { id: 'GOALKEEPER', name: 'Goalkeeper' },
];

const UserEditActions = () => (
  <TopToolbar>
    <ListButton />
    <ShowButton />
  </TopToolbar>
);

const DebugUserData = () => {
  const record = useRecordContext();
  console.log('UserEdit record data:', record);
  return null;
};

// Custom components to handle pre-selected values
const CitySelect = () => {
  const { data: cities } = useGetList('cities', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'cityName', order: 'ASC' }
  });

  return (
    <SelectInput
      source="cityId"
      label="City"
      choices={cities?.map(city => ({ id: city.id, name: city.cityName })) || []}
      fullWidth

    />
  );
};

const PreferredTeamSelect = () => {
  const { data: teams } = useGetList('football-teams', {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: 'teamName', order: 'ASC' }
  });

  return (
    <SelectInput
      source="preferredTeamId"
      label="Preferred Team"
      choices={teams?.map(team => ({ id: team.id, name: team.teamName })) || []}
      fullWidth
    />
  );
};

export const UserEdit = () => {
  const { permissions } = usePermissions();
  const canEditRole = ['admin', 'super_admin'].includes(permissions);

  // Debug logging
  console.log('UserEdit permissions:', permissions);

  const transform = (data: any) => {
    // Transform initial data for form
    const transformedData = { ...data };

    // Set cityId from city object
    if (data.city?.id) {
      transformedData.cityId = data.city.id;
    }

    // Set preferredTeamId from preferredTeam object
    if (data.preferredTeam?.id) {
      transformedData.preferredTeamId = data.preferredTeam.id;
    }

    return transformedData;
  };

  return (
    <Edit actions={<UserEditActions />} title="Edit User" transform={transform}>
      <SimpleForm>
        <DebugUserData />
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <TextInput source="firstName" label="First Name" fullWidth />
          </Box>
          <Box flex="1 1 300px">
            <TextInput source="lastName" label="Last Name" fullWidth />
          </Box>
          <Box flex="1 1 300px">
            <TextInput
              source="phoneNumber"
              label="Phone Number"
              validate={required()}
              fullWidth
              disabled // Don't allow phone number changes
            />
          </Box>
          <Box flex="1 1 300px">
            <TextInput
              source="email"
              label="Email"
              validate={email()}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <TextInput source="username" label="Username" fullWidth />
          </Box>
          <Box flex="1 1 300px">
            <SelectInput
              source="gender"
              label="Gender"
              choices={[
                { id: 'MALE', name: 'Male' },
                { id: 'FEMALE', name: 'Female' },
                { id: 'OTHER', name: 'Other' },
              ]}
              fullWidth
            />
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
          Location & Football Information
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <CitySelect />
          </Box>
          <Box flex="1 1 300px">
            <PreferredTeamSelect />
          </Box>
          <Box flex="1 1 300px">
            <SelectInput
              source="playerCategory"
              label="Player Category"
              choices={playerCategoryChoices}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <NumberInput source="invitesLeft" label="Invites Left" fullWidth />
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
          Settings & Permissions
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          {canEditRole && (
            <Box flex="1 1 300px">
              <SelectInput
                source="role"
                label="Role"
                choices={[
                  { id: 'player', name: 'Player' },
                  { id: 'academy_admin', name: 'Academy Admin' },
                  { id: 'football_chief', name: 'Football Chief' },
                  { id: 'vendor', name: 'Vendor' },
                  { id: 'admin', name: 'Admin' },
                  { id: 'super_admin', name: 'Super Admin' },
                ]}
                validate={required()}
                fullWidth
              />
            </Box>
          )}
          <Box flex="1 1 300px">
            <BooleanInput source="onboardingComplete" label="Onboarding Complete" />
          </Box>
          <Box flex="1 1 300px">
            <BooleanInput source="whatsappInviteOpt" label="WhatsApp Invites Enabled" />
          </Box>
        </Box>
      </SimpleForm>
    </Edit>
  );
};
