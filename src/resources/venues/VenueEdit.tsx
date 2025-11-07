import React, { useState } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    required,
    useInput,
    useGetList,
    useRecordContext,
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';
import { ImagePreviewInput } from '../../components/ImagePreviewInput';

const CityInput = ({ onChange: parentOnChange, source, ...props }: { onChange: (coords: { latitude: number; longitude: number }) => void; source: string; }) => {
    const {
        field
    } = useInput({ source, ...props });

    const { data: cities } = useGetList('cities');

    const handleChange = (choice: any) => {
        // Call the original onChange
        field.onChange(choice);

        // Get selected city ID from event
        const cityId = choice?.target?.value;
        if (!cityId) return;

        // Get city data from the choice object
        const selectedOption = cities?.find((c: any) => c.id === Number(cityId));
        if (selectedOption?.latitude && selectedOption?.longitude) {
            parentOnChange({
                latitude: Number(selectedOption.latitude),
                longitude: Number(selectedOption.longitude)
            });
        }
    };

    return (
        <SelectInput
            {...props}
            {...field}
            onChange={handleChange}
            optionText={(record) => `${record.cityName}, ${record.stateName}`}
            validate={required()}
            fullWidth
        />
    );
};

export const VenueEdit = () => {
    const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({ latitude: null, longitude: null });
    const record = useRecordContext();

    const handleCityChange = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
        setCoordinates({ latitude, longitude });
    };

    // Transform data: convert venueFormats array to individual cost fields
    const transform = (data: any) => {
        const venueFormats: any[] = [];
        const formats = [
            { key: '5v5', enum: 'FIVE_VS_FIVE' },
            { key: '6v6', enum: 'SIX_VS_SIX' },
            { key: '7v7', enum: 'SEVEN_VS_SEVEN' },
            { key: '8v8', enum: 'EIGHT_VS_EIGHT' },
            { key: '9v9', enum: 'NINE_VS_NINE' },
            { key: '10v10', enum: 'TEN_VS_TEN' },
            { key: '11v11', enum: 'ELEVEN_VS_ELEVEN' },
        ];

        formats.forEach(({ key, enum: enumValue }) => {
            const costKey = `${key}_Cost`;
            if (data[costKey] !== undefined && data[costKey] !== null && data[costKey] !== '') {
                venueFormats.push({
                    format: enumValue,
                    cost: Number(data[costKey]),
                });
            }
        });

        return {
            ...data,
            cityId: data.cityId?.id || data.cityId,
            venueFormats: venueFormats.length > 0 ? venueFormats : [],
        };
    };

    return (
        <Edit transform={transform}>
            <SimpleForm>
                <Typography variant="h6" gutterBottom>
                    Venue Details
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box flex="1 1 300px">
                        <TextInput
                            source="name"
                            label="Venue Name"
                            validate={required()}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <TextInput
                            source="phoneNumber"
                            label="Phone Number"
                            validate={required()}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <ReferenceInput source="city" reference="cities">
                            <CityInput source="city" onChange={handleCityChange} />
                        </ReferenceInput>
                    </Box>
                    <Box flex="1 1 100%">
                        <TextInput
                            source="address"
                            label="Address"
                            multiline
                            rows={3}
                            validate={required()}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <TextInput
                            source="latitude"
                            label="Latitude"
                            type="number"
                            fullWidth
                            defaultValue={coordinates.latitude}
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <TextInput
                            source="longitude"
                            label="Longitude"
                            type="number"
                            fullWidth
                            defaultValue={coordinates.longitude}
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Format Costs (per match)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Optional: Enter cost for each format. Leave empty if not applicable.
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box flex="1 1 200px">
                        <NumberInput
                            source="5v5_Cost"
                            label="5v5 Cost (₹)"
                            min={0}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 200px">
                        <NumberInput
                            source="6v6_Cost"
                            label="6v6 Cost (₹)"
                            min={0}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 200px">
                        <NumberInput
                            source="7v7_Cost"
                            label="7v7 Cost (₹)"
                            min={0}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 200px">
                        <NumberInput
                            source="8v8_Cost"
                            label="8v8 Cost (₹)"
                            min={0}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 200px">
                        <NumberInput
                            source="9v9_Cost"
                            label="9v9 Cost (₹)"
                            min={0}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 200px">
                        <NumberInput
                            source="10v10_Cost"
                            label="10v10 Cost (₹)"
                            min={0}
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 200px">
                        <NumberInput
                            source="11v11_Cost"
                            label="11v11 Cost (₹)"
                            min={0}
                            fullWidth
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Venue Banner
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                    <Box flex="1 1 300px">
                        <ImagePreviewInput
                            source="displayBanner"
                            label="Display Banner"
                        />
                    </Box>
                </Box>
            </SimpleForm>
        </Edit>
    );
};