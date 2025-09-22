import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const VenueEdit = () => {
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
                            <SelectInput 
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
                </Box>
            </SimpleForm>
        </Edit>
    );
};
