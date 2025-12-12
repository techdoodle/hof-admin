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

export const PromoCodeEdit = () => {
    return (
        <Edit actions={<PromoCodeEditActions />}>
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

