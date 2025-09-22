import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    NumberInput,
    required,
    email,
    usePermissions,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const UserCreate = () => {
    const { permissions } = usePermissions();
    const canSetRole = ['admin', 'super_admin'].includes(permissions);

    return (
        <Create>
            <SimpleForm>
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
                            helperText="10-digit mobile number"
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
                    Football Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    <Box flex="1 1 300px">
                        <SelectInput
                            source="playerCategory"
                            label="Player Category"
                            choices={[
                                { id: 'STRIKER', name: 'Striker/Midfielder' },
                                { id: 'DEFENDER', name: 'Defender' },
                                { id: 'GOALKEEPER', name: 'Goalkeeper' },
                            ]}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="invitesLeft"
                            label="Invites Left"
                            defaultValue={3}
                            fullWidth
                        />
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                    Role & Permissions
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    {canSetRole && (
                        <Box flex="1 1 300px">
                            <SelectInput
                                source="role"
                                label="Role"
                                choices={[
                                    { id: 'player', name: 'Player' },
                                    { id: 'academy_admin', name: 'Academy Admin' },
                                    { id: 'football_chief', name: 'Football Chief' },
                                    { id: 'admin', name: 'Admin' },
                                    { id: 'super_admin', name: 'Super Admin' },
                                ]}
                                defaultValue="player"
                                validate={required()}
                                fullWidth
                            />
                        </Box>
                    )}
                    <Box flex="1 1 300px">
                        <BooleanInput
                            source="onboardingComplete"
                            label="Onboarding Complete"
                            defaultValue={false}
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <BooleanInput
                            source="whatsappInviteOpt"
                            label="WhatsApp Invites Enabled"
                            defaultValue={false}
                        />
                    </Box>
                </Box>
            </SimpleForm>
        </Create>
    );
};
