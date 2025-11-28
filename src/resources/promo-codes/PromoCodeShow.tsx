import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    BooleanField,
    DateField,
    NumberField,
    TopToolbar,
    EditButton,
    ListButton,
    useRecordContext,
} from 'react-admin';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';

const PromoCodeShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
    </TopToolbar>
);

const DiscountDisplay = () => {
    const record = useRecordContext();
    if (!record) return null;

    const type = record.discountType;
    const value = record.discountValue;
    const display = type === 'PERCENTAGE' ? `${value}%` : `₹${value}`;

    return (
        <Box>
            <Chip
                label={type === 'PERCENTAGE' ? 'Percentage' : 'Flat Amount'}
                size="small"
                style={{
                    backgroundColor: type === 'PERCENTAGE' ? '#2196f3' : '#4caf50',
                    color: 'white',
                    marginRight: 8
                }}
            />
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{display}</span>
        </Box>
    );
};

const UsageStats = () => {
    const record = useRecordContext();

    // Fetch usage stats from the API
    const [usageStats, setUsageStats] = React.useState<any>(null);
    React.useEffect(() => {
        if (record?.id) {
            import('../../utils/apiClient').then(({ apiClient }) => {
                apiClient.get(`/admin/promo-codes/${record.id}/usage`)
                    .then((response: any) => {
                        if (response.data?.success) {
                            setUsageStats(response.data.data);
                        }
                    })
                    .catch(console.error);
            });
        }
    }, [record?.id]);

    if (!usageStats) return null;

    return (
        <Card sx={{ mt: 2 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Usage Statistics
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Total Uses
                        </Typography>
                        <Typography variant="h6">{usageStats.totalUses}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Unique Users
                        </Typography>
                        <Typography variant="h6">{usageStats.uniqueUsers}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Total Discount Given
                        </Typography>
                        <Typography variant="h6">₹{usageStats.totalDiscountGiven?.toLocaleString() || 0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Total Revenue
                        </Typography>
                        <Typography variant="h6">₹{usageStats.totalRevenue?.toLocaleString() || 0}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export const PromoCodeShow = () => {
    return (
        <Show actions={<PromoCodeShowActions />}>
            <SimpleShowLayout>
                <TextField source="code" label="Promo Code" />
                <TextField source="description" label="Description" />
                <DiscountDisplay />
                <NumberField source="minOrderValue" label="Minimum Order Value (₹)" />
                <NumberField source="maxDiscountAmount" label="Max Discount Cap (₹)" />
                <BooleanField source="isActive" label="Active" />
                <DateField source="validFrom" label="Valid From" showTime />
                <DateField source="validUntil" label="Valid Until" showTime />
                <NumberField source="maxUses" label="Max Global Uses" />
                <NumberField source="maxUsesPerUser" label="Max Uses Per User" />
                <NumberField source="usageCount" label="Current Usage Count" />
                <BooleanField source="firstTimeUsersOnly" label="First-Time Users Only" />
                <UsageStats />
            </SimpleShowLayout>
        </Show>
    );
};

