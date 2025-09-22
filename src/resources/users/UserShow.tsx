import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  ReferenceField,
  usePermissions,
  TopToolbar,
  EditButton,
  DeleteButton,
  useRecordContext,
  ListButton,
} from 'react-admin';
import { Box, Typography, Card, CardContent, Chip, Avatar } from '@mui/material';

const UserShowActions = () => {
  const { permissions } = usePermissions();
  const canEditUsers = ['admin', 'super_admin'].includes(permissions);
  const canDeleteUsers = permissions === 'super_admin';

  return (
    <TopToolbar>
      <ListButton />
      {canEditUsers && <EditButton />}
      {canDeleteUsers && <DeleteButton />}
    </TopToolbar>
  );
};

const LabeledField = ({ source, label }: { source: string; label: string }) => {
  const record = useRecordContext();

  // Handle nested object access (e.g., "city.cityName")
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const value = getNestedValue(record, source);

  // Debug logging
  console.log(`LabeledField ${label}:`, { source, value, record });

  return (
    <Box>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">
        {value || '-'}
      </Typography>
    </Box>
  );
};

const LabeledEmailField = ({ source, label }: { source: string; label: string }) => {
  const record = useRecordContext();
  const value = record?.[source];

  return (
    <Box>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">
        {value ? (
          <a href={`mailto:${value}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {value}
          </a>
        ) : '-'}
      </Typography>
    </Box>
  );
};

const LabeledBooleanField = ({ source, label }: { source: string; label: string }) => {
  const record = useRecordContext();
  const value = record?.[source];

  return (
    <Box>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Chip
        label={value ? 'Yes' : 'No'}
        color={value ? 'success' : 'default'}
        size="small"
      />
    </Box>
  );
};

const LabeledDateField = ({ source, label, showTime = false }: { source: string; label: string; showTime?: boolean }) => {
  const record = useRecordContext();
  const value = record?.[source];

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (showTime) {
      return date.toLocaleString();
    }
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">
        {formatDate(value)}
      </Typography>
    </Box>
  );
};

const RoleDisplay = () => {
  const record = useRecordContext();

  const roleColors: { [key: string]: string } = {
    super_admin: '#f44336',
    admin: '#ff9800',
    football_chief: '#2196f3',
    academy_admin: '#4caf50',
    player: '#9e9e9e',
  };

  const roleLabels: { [key: string]: string } = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    football_chief: 'Football Chief',
    academy_admin: 'Academy Admin',
    player: 'Player',
  };

  if (!record) {
    return <Chip label="Loading..." size="small" />;
  }

  const role = record?.role || 'player';

  return (
    <Chip
      label={roleLabels[role] || role}
      style={{
        backgroundColor: roleColors[role] || '#9e9e9e',
        color: 'white',
      }}
    />
  );
};

export const UserShow = () => {
  return (
    <Show actions={<UserShowActions />} title="User Details">
      <SimpleShowLayout>
        <Box display="flex" gap={3} sx={{ flexWrap: 'wrap' }}>
          {/* Profile Card */}
          <Box flex="1 1 300px">
            <Card>
              <CardContent style={{ textAlign: 'center' }}>
                <Avatar
                  sx={{ width: 80, height: 80, margin: '0 auto 16px' }}
                  src="" // Will add profile picture later
                />
                <Typography variant="h6">
                  <TextField source="firstName" record={undefined} />
                  {' '}
                  <TextField source="lastName" record={undefined} />
                </Typography>
                <RoleDisplay />
                <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                  <TextField source="phoneNumber" record={undefined} />
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Details */}
          <Box flex="2 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                  <Box flex="1 1 200px">
                    <LabeledField source="firstName" label="First Name" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="lastName" label="Last Name" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="phoneNumber" label="Phone Number" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledEmailField source="email" label="Email" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="username" label="Username" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="gender" label="Gender" />
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                  Football Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                  <Box flex="1 1 200px">
                    <LabeledField source="playerCategory" label="Player Category" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="invitesLeft" label="Invites Left" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="preferredTeam.teamName" label="Preferred Team" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="city.cityName" label="City" />
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                  Account Status
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                  <Box flex="1 1 200px">
                    <LabeledBooleanField source="onboardingComplete" label="Onboarding Complete" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledBooleanField source="whatsappInviteOpt" label="WhatsApp Invites" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledBooleanField source="inviteSent" label="Invite Sent" />
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                  Timestamps
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box flex="1 1 200px">
                    <LabeledDateField source="createdAt" label="Created" showTime />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledDateField source="updatedAt" label="Updated" showTime />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledDateField source="lastLoginAt" label="Last Login" showTime />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </SimpleShowLayout>
    </Show>
  );
};
