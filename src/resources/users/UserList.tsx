import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    SelectField,
    DateField,
    BooleanField,
    EditButton,
    ShowButton,
    DeleteButton,
    SearchInput,
    SelectInput,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

const userFilters = [
    <SearchInput source="search" placeholder="Search users..." alwaysOn />,
    <SelectInput
        source="role"
        choices={[
            { id: 'admin', name: 'Admin' },
            { id: 'super_admin', name: 'Super Admin' },
            { id: 'football_chief', name: 'Football Chief' },
            { id: 'academy_admin', name: 'Academy Admin' },
            { id: 'vendor', name: 'Vendor' },
            { id: 'player', name: 'Player' },
        ]}
        emptyText="All Roles"
    />,
];

const UserListActions = () => {
    const { permissions } = usePermissions();
    const canCreateUsers = ['admin', 'super_admin'].includes(permissions);

    return (
        <TopToolbar>
            {canCreateUsers && <CreateButton />}
            <FilterButton />
            <ExportButton />
        </TopToolbar>
    );
};

const RoleField = ({ label, source }: any) => {
    const record = useRecordContext();

    const roleColors: { [key: string]: string } = {
        super_admin: '#f44336', // Red
        admin: '#ff9800', // Orange
        football_chief: '#2196f3', // Blue
        academy_admin: '#4caf50', // Green
        vendor: '#9c27b0', // Purple
        player: '#9e9e9e', // Grey
    };

    const roleLabels: { [key: string]: string } = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        football_chief: 'Football Chief',
        academy_admin: 'Academy Admin',
        vendor: 'Vendor',
        player: 'Player',
    };

    // Handle undefined record
    if (!record) {
        return <Chip label="Loading..." size="small" />;
    }

    console.log('RoleField record:', record);
    const role = record?.role || 'player';

    return (
        <Chip
            label={roleLabels[role] || role}
            style={{
                backgroundColor: roleColors[role] || '#9e9e9e',
                color: 'white',
                fontSize: '0.75rem',
            }}
            size="small"
        />
    );
};

export const UserList = () => {
    const { permissions } = usePermissions();
    const canEditUsers = ['admin', 'super_admin'].includes(permissions);
    const canDeleteUsers = permissions === 'super_admin';

    return (
        <List
            filters={userFilters}
            actions={<UserListActions />}
            perPage={25}
            sort={{ field: 'createdAt', order: 'DESC' }}
        >
            <Datagrid rowClick="show">
                <TextField source="id" />
                <TextField source="firstName" label="First Name" />
                <TextField source="lastName" label="Last Name" />
                <TextField source="phoneNumber" label="Phone" />
                <EmailField source="email" />
                <RoleField source="role" label={"Role"} />
                <SelectField
                    source="gender"
                    choices={[
                        { id: 'MALE', name: 'Male' },
                        { id: 'FEMALE', name: 'Female' },
                        { id: 'OTHER', name: 'Other' },
                    ]}
                />
                <BooleanField source="onboardingComplete" label="Onboarded" />
                <DateField source="createdAt" label="Created" showTime />
                <DateField source="lastLoginAt" label="Last Login" showTime />

                {canEditUsers && <EditButton />}
                <ShowButton />
                {canDeleteUsers && <DeleteButton />}
            </Datagrid>
        </List>
    );
};
