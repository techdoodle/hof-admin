import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    NumberInput,
    DateInput,
    required,
    minValue,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const PromoCodeCreate = () => {
    return (
        <Create>
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
                            helperText="Code will be automatically converted to uppercase"
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
                            helperText="Percentage (0-100) or Amount in ₹"
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="minOrderValue"
                            label="Minimum Order Value (₹)"
                            fullWidth
                            helperText="Optional: Minimum booking amount required"
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="maxDiscountAmount"
                            label="Max Discount Cap (₹)"
                            fullWidth
                            helperText="Optional: Maximum discount for percentage codes"
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
                            helperText="Optional: Leave empty for no expiry"
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="maxUses"
                            label="Max Global Uses"
                            fullWidth
                            helperText="Optional: Total times code can be used"
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="maxUsesPerUser"
                            label="Max Uses Per User"
                            fullWidth
                            helperText="Optional: Times each user can use"
                        />
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                    Eligibility Rules
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                    <Box flex="1 1 300px">
                        <BooleanInput
                            source="firstTimeUsersOnly"
                            label="First-Time Users Only"
                            defaultValue={false}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <BooleanInput
                            source="isActive"
                            label="Active"
                            defaultValue={true}
                            fullWidth
                        />
                    </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Note: City eligibility can be set after creation in the edit view.
                </Typography>
            </SimpleForm>
        </Create>
    );
};

