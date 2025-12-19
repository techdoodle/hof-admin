import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    NumberInput,
    DateInput,
    required,
    minValue,
    TopToolbar,
    ListButton,
    ShowButton,
    useGetList,
    SelectArrayInput,
    useRecordContext,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

const PromoCodeEditActions = () => (
    <TopToolbar>
        <ListButton />
        <ShowButton />
    </TopToolbar>
);

const CityMultiSelect = () => {
    const { data: cities } = useGetList('cities', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'cityName', order: 'ASC' }
    });

    return (
        <SelectArrayInput
            source="eligibleCities"
            label="Eligible Cities"
            choices={cities || []}
            optionText="cityName"
            optionValue="id"
            fullWidth
            helperText="Select cities where matches must be located. Users from any city can use this code if booking matches in these cities. Leave empty for all cities."
        />
    );
};

const MatchMultiSelect = () => {
    const { data: matches, isLoading } = useGetList('matches', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'startTime', order: 'ASC' }, // Show future matches first
    });

    // Filter to show only future matches
    const now = new Date();
    const futureMatches = (matches || []).filter((match: any) => {
        if (!match.startTime) return false;
        const matchStartTime = new Date(match.startTime);
        return matchStartTime > now;
    });

    const formatMatchLabel = (match: any) => {
        if (!match) return '';
        const date = match.startTime ? new Date(match.startTime).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'No date';
        const venue = match.venue?.name || 'Unknown Venue';
        return `Match #${match.matchId} - ${venue} - ${date}`;
    };

    return (
        <SelectArrayInput
            source="eligibleMatches"
            label="Eligible Matches"
            choices={futureMatches}
            optionText={formatMatchLabel}
            optionValue="matchId"
            fullWidth
            disabled={isLoading}
            helperText="Select specific future matches. Users from any city can use this code for these matches. Works independently from city selection (OR logic). Leave empty for all matches."
        />
    );
};

const UserMultiSelect = () => {
    const record = useRecordContext();

    const { data: users, isLoading } = useGetList('users', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'firstName', order: 'ASC' }
    });

    const formatUserLabel = (user: any) => {
        if (!user) return '';
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User';
        const phone = user.phoneNumber || '';
        const email = user.email || '';
        const parts = [name];
        if (phone) parts.push(`(${phone})`);
        if (email) parts.push(`- ${email}`);
        return parts.join(' ');
    };

    // Pre-populate allowedUserIds from existing allowedUsers relation on first load
    const defaultAllowedUserIds = React.useMemo(
        () =>
            (record?.allowedUsers || [])
                .map((au: any) => au.userId || au.user?.id || au.id)
                .filter((id: any) => id !== undefined),
        [record]
    );

    return (
        <SelectArrayInput
            source="allowedUserIds"
            label="Allowed Users"
            choices={users || []}
            optionText={formatUserLabel}
            optionValue="id"
            fullWidth
            disabled={isLoading}
            defaultValue={defaultAllowedUserIds}
            helperText="Select specific users who can use this promo code. Leave empty to allow all users (subject to other restrictions)."
        />
    );
};

export const PromoCodeEdit = () => {
    // Transform data before sending to backend
    const transform = (data: any) => {
        const transformed = { ...data };

        // If allowedUserIds is present from the form, trust it (including empty array)
        if (Array.isArray(transformed.allowedUserIds)) {
            transformed.allowedUserIds = transformed.allowedUserIds
                .map((id: any) => Number(id))
                .filter((id: any) => !isNaN(id));
        } else if (Array.isArray(transformed.allowedUsers)) {
            // Fallback: when editing an older record that only has allowedUsers relation
            transformed.allowedUserIds = transformed.allowedUsers
                .map((au: any) => au.userId || au.user?.id || au.id)
                .filter((id: any) => id !== undefined);
        }

        // We never need to send the relation object back to the backend
        delete (transformed as any).allowedUsers;

        return transformed;
    };

    return (
        <Edit actions={<PromoCodeEditActions />} transform={transform}>
            <SimpleForm>
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    <Box flex="1 1 300px">
                        <TextInput
                            source="code"
                            label="Promo Code"
                            validate={required()}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <TextInput
                            source="description"
                            label="Description"
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                    Discount Configuration
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    <Box flex="1 1 300px">
                        <SelectInput
                            source="discountType"
                            label="Discount Type"
                            choices={[
                                { id: 'PERCENTAGE', name: 'Percentage' },
                                { id: 'FLAT_AMOUNT', name: 'Flat Amount (₹)' },
                            ]}
                            validate={required()}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="discountValue"
                            label="Discount Value"
                            validate={[required(), minValue(0.01)]}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="minOrderValue"
                            label="Minimum Order Value (₹)"
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="maxDiscountAmount"
                            label="Max Discount Cap (₹)"
                            fullWidth
                        />
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                    Validity & Usage Limits
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    <Box flex="1 1 300px">
                        <DateInput
                            source="validFrom"
                            label="Valid From"
                            validate={required()}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <DateInput
                            source="validUntil"
                            label="Valid Until"
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="maxUses"
                            label="Max Global Uses"
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="maxUsesPerUser"
                            label="Max Uses Per User"
                            fullWidth
                        />
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                    Eligibility Rules
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    <Box flex="1 1 300px">
                        <CityMultiSelect />
                    </Box>
                    <Box flex="1 1 300px">
                        <MatchMultiSelect />
                    </Box>
                    <Box flex="1 1 100%">
                        <UserMultiSelect />
                    </Box>
                    <Box flex="1 1 300px">
                        <BooleanInput
                            source="firstTimeUsersOnly"
                            label="First-Time Users Only"
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <BooleanInput
                            source="isActive"
                            label="Active"
                            fullWidth
                        />
                    </Box>
                </Box>
            </SimpleForm>
        </Edit>
    );
};

