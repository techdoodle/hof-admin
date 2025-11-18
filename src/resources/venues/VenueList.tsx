import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EditButton,
    ShowButton,
    DeleteButton,
    SearchInput,
    FunctionField,
    TopToolbar,
    CreateButton,
    ExportButton,
} from 'react-admin';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const venueFilters = [
    <SearchInput source="search" placeholder="Search venues..." alwaysOn />,
];

const VenueListActions = () => {
    const navigate = useNavigate();

    return (
        <TopToolbar>
            <CreateButton />
            <Button
                color="primary"
                startIcon={<UploadFileIcon />}
                onClick={() => navigate('/venues/upload-csv')}
            >
                Upload CSV
            </Button>
            <ExportButton />
        </TopToolbar>
    );
};

export const VenueList = () => {
    return (
        <List
            filters={venueFilters}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<VenueListActions />}
        >
            <Datagrid>
                <TextField source="name" label="Name" />
                <TextField source="phoneNumber" label="Phone Number" />
                <TextField source="address" label="Address" />
                <FunctionField
                    label="City"
                    render={(record: any) =>
                        record?.city ? `${record.city.cityName}, ${record.city.stateName}` : '-'
                    }
                />
                <FunctionField
                    label="Format Costs"
                    render={(record: any) => {
                        if (!record?.venueFormats || record.venueFormats.length === 0) {
                            return '-';
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
                        const costs = record.venueFormats
                            .map((vf: any) => `${formatMap[vf.format] || vf.format}: ₹${vf.cost}`)
                            .join(', ');
                        return costs || '-';
                    }}
                />
                <FunctionField
                    label="Maps URL"
                    render={(record: any) => {
                        if (!record?.mapsUrl) {
                            return '-';
                        }
                        return (
                            <a
                                href={record.mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#1976d2', textDecoration: 'underline' }}
                            >
                                View Map
                            </a>
                        );
                    }}
                />
                <ShowButton />
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};
