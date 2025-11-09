import React, { useMemo } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    required,
    useInput,
    useRecordContext,
} from 'react-admin';
import { Box, Typography, Divider } from '@mui/material';
import { ImagePreviewInput } from '../../components/ImagePreviewInput';

// Client-side Google Maps URL parser for preview
const parseGoogleMapsUrl = (input: string): { latitude: number; longitude: number } | null => {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const trimmed = input.trim();
    if (!trimmed) {
        return null;
    }

    // Try to parse direct lat,lng format first (e.g., "28.6139,77.2090")
    const directMatch = trimmed.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
    if (directMatch) {
        const lat = parseFloat(directMatch[1]);
        const lng = parseFloat(directMatch[2]);
        if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            return { latitude: lat, longitude: lng };
        }
    }

    // Check if it's a URL
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return null;
    }

    try {
        const url = new URL(trimmed);

        // Format 1: https://www.google.com/maps?q=lat,lng
        const qParam = url.searchParams.get('q');
        if (qParam) {
            const match = qParam.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    return { latitude: lat, longitude: lng };
                }
            }
        }

        // Format 2 & 3: https://www.google.com/maps/@lat,lng,zoom or /place/.../@lat,lng,zoom
        const pathMatch = url.pathname.match(/\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (pathMatch) {
            const lat = parseFloat(pathMatch[1]);
            const lng = parseFloat(pathMatch[2]);
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return { latitude: lat, longitude: lng };
            }
        }

        // Format 4: https://www.google.com/maps/search/?api=1&query=lat,lng
        const queryParam = url.searchParams.get('query');
        if (queryParam) {
            const match = queryParam.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
            if (match) {
                const lat = parseFloat(match[1]);
                const lng = parseFloat(match[2]);
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    return { latitude: lat, longitude: lng };
                }
            }
        }

        // Format 5: Check for coordinates in the hash fragment
        if (url.hash) {
            const hashMatch = url.hash.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
            if (hashMatch) {
                const lat = parseFloat(hashMatch[1]);
                const lng = parseFloat(hashMatch[2]);
                if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    return { latitude: lat, longitude: lng };
                }
            }
        }
    } catch (error) {
        // Invalid URL format
        return null;
    }

    return null;
};

const GoogleMapsUrlInput = ({ source, ...props }: { source: string; [key: string]: any }) => {
    const {
        field,
    } = useInput({ source, ...props });
    const record = useRecordContext();

    const extractedCoords = useMemo(() => {
        if (field.value) {
            return parseGoogleMapsUrl(field.value);
        }
        return null;
    }, [field.value]);

    // Show existing coordinates if venue has them but no URL
    const existingCoords = record?.latitude != null && record?.longitude != null && !field.value;

    return (
        <Box>
            <TextInput
                {...props}
                source={source}
                fullWidth
                helperText={
                    extractedCoords
                        ? `Coordinates will be auto-extracted: ${extractedCoords.latitude.toFixed(6)}, ${extractedCoords.longitude.toFixed(6)}`
                        : existingCoords
                        ? `Current coordinates: ${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)} (read-only)`
                        : props.helperText || 'Enter a Google Maps URL. Coordinates will be automatically extracted.'
                }
            />
        </Box>
    );
};

export const VenueEdit = () => {
    const record = useRecordContext();

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

        // Keep latitude and longitude in data
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
                            <SelectInput
                                source="city"
                                optionText={(record) => `${record.cityName}, ${record.stateName}`}
                                validate={required()}
                                fullWidth
                            />
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
                    {/* Google Maps URL input commented out - using latitude/longitude instead */}
                    {/* <Box flex="1 1 100%">
                        <GoogleMapsUrlInput
                            source="googleMapsUrl"
                            label="Google Maps URL"
                            placeholder="https://www.google.com/maps/place/..."
                            fullWidth
                        />
                    </Box> */}
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="latitude"
                            label="Latitude"
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="longitude"
                            label="Longitude"
                            fullWidth
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