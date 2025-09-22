import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
    required,
} from 'react-admin';
import { Box, Typography } from '@mui/material';

export const VenueCreate = () => {
    return (
        <Create>
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
                                optionText={(record) => `${record.cityName}, ${record.stateName}`}
                                validate={required()}
                                fullWidth
                                format={value => value?.id || value}
                                parse={value => ({ id: value })}
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
        </Create>
    );
};
