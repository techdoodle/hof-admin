import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    SearchInput,
    FunctionField,
} from 'react-admin';

const venueFilters = [
    <SearchInput source="search" placeholder="Search venues..." alwaysOn />,
];

export const VenueList = () => {
    return (
        <List
            filters={venueFilters}
            sort={{ field: 'name', order: 'ASC' }}
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
                <EditButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};
