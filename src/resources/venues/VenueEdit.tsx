import React, { useState } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    required,
    useInput,
    useGetList,
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

    const handleCityChange = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
        setCoordinates({ latitude, longitude });
    };

    return (
        <Edit>
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