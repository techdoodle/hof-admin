import React from 'react';
import {
  Show,
  SimpleShowLayout,
  FunctionField,
  useRecordContext,
  TopToolbar,
  EditButton,
  DeleteButton,
  ListButton,
} from 'react-admin';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const VenueShowActions = () => {
  return (
    <TopToolbar>
      <ListButton />
      <EditButton />
      <DeleteButton />
    </TopToolbar>
  );
};

const LabeledField = ({ source, label }: { source: string; label: string }) => {
  const record = useRecordContext();

  // Handle nested object access (e.g., "city.cityName")
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const value = getNestedValue(record, source);

  // Format latitude and longitude with 6 decimal places
  let displayValue: string;
  if (value !== null && value !== undefined) {
    if ((source === 'latitude' || source === 'longitude') && typeof value === 'number') {
      displayValue = value.toFixed(6);
    } else {
      displayValue = String(value);
    }
  } else {
    displayValue = '-';
  }

  return (
    <Box>
      <Typography variant="caption" color="textSecondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">
        {displayValue}
      </Typography>
    </Box>
  );
};

const CoordinatesField = () => {
  const record = useRecordContext();
  const latitude = record?.latitude;
  const longitude = record?.longitude;

  if (latitude == null || longitude == null) {
    return (
      <Box>
        <Typography variant="caption" color="textSecondary" display="block">
          Coordinates
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Not available
        </Typography>
      </Box>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <Box>
      <Typography variant="caption" color="textSecondary" display="block">
        Coordinates
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body1">
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Typography>
        <Chip
          icon={<LocationOnIcon />}
          label="View on Google Maps"
          component="a"
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          clickable
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>
    </Box>
  );
};

export const VenueShow = () => {
  return (
    <Show actions={<VenueShowActions />} title="Venue Details">
      <SimpleShowLayout>
        <Box display="flex" gap={3} sx={{ flexWrap: 'wrap' }}>
          {/* Main Details Card */}
          <Box flex="2 1 400px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Venue Information
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                  <Box flex="1 1 200px">
                    <LabeledField source="name" label="Venue Name" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="phoneNumber" label="Phone Number" />
                  </Box>
                  <Box flex="1 1 100%">
                    <LabeledField source="address" label="Address" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="city.cityName" label="City" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="city.stateName" label="State" />
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                  Location Coordinates
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
                  <Box flex="1 1 200px">
                    <LabeledField source="latitude" label="Latitude" />
                  </Box>
                  <Box flex="1 1 200px">
                    <LabeledField source="longitude" label="Longitude" />
                  </Box>
                  <Box flex="1 1 100%">
                    <CoordinatesField />
                  </Box>
                </Box>

                <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
                  Format Costs (per match)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <FunctionField
                    label="Available Formats"
                    render={(record: any) => {
                      if (!record?.venueFormats || record.venueFormats.length === 0) {
                        return (
                          <Typography variant="body2" color="textSecondary">
                            No format costs configured
                          </Typography>
                        );
                      }
                      const formatMap: Record<string, string> = {
                        'FIVE_VS_FIVE': '5v5',
                        'SIX_VS_SIX': '6v6',
                        'SEVEN_VS_SEVEN': '7v7',
                        'EIGHT_VS_EIGHT': '8v8',
                        'NINE_VS_NINE': '9v9',
                        'TEN_VS_TEN': '10v10',
                        'ELEVEN_VS_ELEVEN': '11v11',
                      };
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {record.venueFormats.map((vf: any, index: number) => (
                            <Chip
                              key={index}
                              label={`${formatMap[vf.format] || vf.format}: ₹${vf.cost}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      );
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Additional Info Card */}
          <Box flex="1 1 300px">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Information
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <FunctionField
                    label="Display Banner"
                    render={(record: any) => {
                      if (record?.displayBanner) {
                        return (
                          <Box>
                            <img
                              src={record.displayBanner}
                              alt="Venue banner"
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '4px',
                                marginTop: '8px',
                              }}
                            />
                          </Box>
                        );
                      }
                      return (
                        <Typography variant="body2" color="textSecondary">
                          No banner image
                        </Typography>
                      );
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </SimpleShowLayout>
    </Show>
  );
};

