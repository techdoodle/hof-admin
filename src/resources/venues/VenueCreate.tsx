import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';
import { Box, Divider, Typography } from '@mui/material';
import { ImagePreviewInput } from '../../components/ImagePreviewInput';

// Google Maps URL parser and input component commented out - using latitude/longitude inputs instead
// Client-side Google Maps URL parser for preview
// const parseGoogleMapsUrl = (input: string): { latitude: number; longitude: number } | null => {
//     if (!input || typeof input !== 'string') {
//         return null;
//     }

//     const trimmed = input.trim();
//     if (!trimmed) {
//         return null;
//     }

//     // Try to parse direct lat,lng format first (e.g., "28.6139,77.2090")
//     const directMatch = trimmed.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
//     if (directMatch) {
//         const lat = parseFloat(directMatch[1]);
//         const lng = parseFloat(directMatch[2]);
//         if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
//             return { latitude: lat, longitude: lng };
//         }
//     }

//     // Check if it's a URL
//     if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
//         return null;
//     }

//     try {
//         const url = new URL(trimmed);

//         // Format 1: https://www.google.com/maps?q=lat,lng
//         const qParam = url.searchParams.get('q');
//         if (qParam) {
//             const match = qParam.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
//             if (match) {
//                 const lat = parseFloat(match[1]);
//                 const lng = parseFloat(match[2]);
//                 if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
//                     return { latitude: lat, longitude: lng };
//                 }
//             }
//         }

//         // Format 2 & 3: https://www.google.com/maps/@lat,lng,zoom or /place/.../@lat,lng,zoom
//         const pathMatch = url.pathname.match(/\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
//         if (pathMatch) {
//             const lat = parseFloat(pathMatch[1]);
//             const lng = parseFloat(pathMatch[2]);
//             if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
//                 return { latitude: lat, longitude: lng };
//             }
//         }

//         // Format 4: https://www.google.com/maps/search/?api=1&query=lat,lng
//         const queryParam = url.searchParams.get('query');
//         if (queryParam) {
//             const match = queryParam.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
//             if (match) {
//                 const lat = parseFloat(match[1]);
//                 const lng = parseFloat(match[2]);
//                 if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
//                     return { latitude: lat, longitude: lng };
//                 }
//             }
//         }

//         // Format 5: Check for coordinates in the hash fragment
//         if (url.hash) {
//             const hashMatch = url.hash.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
//             if (hashMatch) {
//                 const lat = parseFloat(hashMatch[1]);
//                 const lng = parseFloat(hashMatch[2]);
//                 if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
//                     return { latitude: lat, longitude: lng };
//                 }
//             }
//         }
//     } catch (error) {
//         // Invalid URL format
//         return null;
//     }

//     return null;
// };

// const GoogleMapsUrlInput = ({ source, ...props }: { source: string; [key: string]: any }) => {
//     const {
//         field,
//     } = useInput({ source, ...props });

//     const extractedCoords = useMemo(() => {
//         if (field.value) {
//             return parseGoogleMapsUrl(field.value);
//         }
//         return null;
//     }, [field.value]);

//     return (
//         <Box>
//             <TextInput
//                 {...props}
//                 source={source}
//                 fullWidth
//                 helperText={
//                     extractedCoords
//                         ? `Coordinates will be auto-extracted: ${extractedCoords.latitude.toFixed(6)}, ${extractedCoords.longitude.toFixed(6)}`
//                         : props.helperText || 'Enter a Google Maps URL. Coordinates will be automatically extracted.'
//                 }
//             />
//         </Box>
//     );
// };

export const VenueCreate = () => {
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
            const baseKey = `${key}_Cost`;
            const morningKey = `${key}_MorningCost`;
            const weekendKey = `${key}_WeekendCost`;
            const weekendMorningKey = `${key}_WeekendMorningCost`;

            if (data[baseKey] !== undefined && data[baseKey] !== null && data[baseKey] !== '') {
                const formatEntry: any = {
                    format: enumValue,
                    cost: Number(data[baseKey]),
                };

                if (data[morningKey] !== undefined && data[morningKey] !== null && data[morningKey] !== '') {
                    formatEntry.morningCost = Number(data[morningKey]);
                }
                if (data[weekendKey] !== undefined && data[weekendKey] !== null && data[weekendKey] !== '') {
                    formatEntry.weekendCost = Number(data[weekendKey]);
                }
                if (data[weekendMorningKey] !== undefined && data[weekendMorningKey] !== null && data[weekendMorningKey] !== '') {
                    formatEntry.weekendMorningCost = Number(data[weekendMorningKey]);
                }

                venueFormats.push(formatEntry);
            }
        });

        // Keep latitude and longitude in data
        return {
            ...data,
            cityId: data.cityId?.id || data.cityId,
            venueFormats: venueFormats.length > 0 ? venueFormats : undefined,
        };
    };

    return (
        <Create transform={transform}>
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
                        <ReferenceInput source="cityId" reference="cities">
                            <SelectInput
                                source="cityId"
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
                    <Box flex="1 1 100%">
                        <TextInput
                            source="googleMapsUrl"
                            label="Google Maps URL"
                            placeholder="https://www.google.com/maps/place/..."
                            fullWidth
                            helperText="On submit, coordinates will be extracted from this URL if provided."
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="latitude"
                            label="Latitude (optional)"
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 300px">
                        <NumberInput
                            source="longitude"
                            label="Longitude (optional)"
                            fullWidth
                        />
                    </Box>
                    <Box flex="1 1 100%">
                        <TextInput
                            source="mapsUrl"
                            label="Maps URL"
                            placeholder="https://maps.google.com/?q=..."
                            fullWidth
                        />
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Time-based Pricing Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Morning prices apply to matches starting before this hour. Default is 12 (noon), so matches
                    starting before 12:00 use morning pricing and others use base/evening pricing.
                </Typography>
                <Box sx={{ mb: 3, maxWidth: 260 }}>
                    <NumberInput
                        source="morningEndHour"
                        label="Morning ends at hour (0–23, default 12)"
                        min={0}
                        max={23}
                        defaultValue={12}
                        helperText="Example: 12 means matches before 12:00 use morning prices; 18 means before 18:00 (6 PM)."
                        fullWidth
                    />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                    Format Costs (per match)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    For each format, set a base cost (typically evening/regular) and optionally override for
                    weekday mornings, weekends, or weekend mornings. Leave overrides empty to use the base cost.
                </Typography>

                {/* 5v5 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">5v5</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="5v5_Cost"
                                label="Base Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="5v5_MorningCost"
                                label="Weekday Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="5v5_WeekendCost"
                                label="Weekend Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="5v5_WeekendMorningCost"
                                label="Weekend Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 6v6 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">6v6</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="6v6_Cost"
                                label="Base Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="6v6_MorningCost"
                                label="Weekday Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="6v6_WeekendCost"
                                label="Weekend Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="6v6_WeekendMorningCost"
                                label="Weekend Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 7v7 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">7v7</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="7v7_Cost"
                                label="Base Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="7v7_MorningCost"
                                label="Weekday Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="7v7_WeekendCost"
                                label="Weekend Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="7v7_WeekendMorningCost"
                                label="Weekend Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 8v8 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">8v8</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="8v8_Cost"
                                label="Base Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="8v8_MorningCost"
                                label="Weekday Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="8v8_WeekendCost"
                                label="Weekend Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="8v8_WeekendMorningCost"
                                label="Weekend Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 9v9 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">9v9</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="9v9_Cost"
                                label="Base Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="9v9_MorningCost"
                                label="Weekday Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="9v9_WeekendCost"
                                label="Weekend Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="9v9_WeekendMorningCost"
                                label="Weekend Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 10v10 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">10v10</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="10v10_Cost"
                                label="Base Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="10v10_MorningCost"
                                label="Weekday Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="10v10_WeekendCost"
                                label="Weekend Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="10v10_WeekendMorningCost"
                                label="Weekend Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                    </Box>
                </Box>

                {/* 11v11 */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">11v11</Typography>
                    <Box display="flex" flexWrap="wrap" gap={2}>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="11v11_Cost"
                                label="Base Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="11v11_MorningCost"
                                label="Weekday Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="11v11_WeekendCost"
                                label="Weekend Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
                        <Box flex="1 1 200px">
                            <NumberInput
                                source="11v11_WeekendMorningCost"
                                label="Weekend Morning Cost (₹)"
                                min={0}
                                fullWidth
                            />
                        </Box>
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
        </Create>
    );
};