import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    DateField,
    NumberField,
    EditButton,
    ShowButton,
    DeleteButton,
    SearchInput,
    SelectInput,
    TopToolbar,
    CreateButton,
    FilterButton,
    useRecordContext,
} from 'react-admin';
import { Chip } from '@mui/material';

const promoCodeFilters = [
    <SearchInput source="code" placeholder="Search promo codes..." alwaysOn />,
    <SelectInput
        source="isActive"
        choices={[
            { id: 'true', name: 'Active' },
            { id: 'false', name: 'Inactive' },
        ]}
        emptyText="All Status"
    />,
    <SelectInput
        source="discountType"
        choices={[
            { id: 'PERCENTAGE', name: 'Percentage' },
            { id: 'FLAT_AMOUNT', name: 'Flat Amount' },
        ]}
        emptyText="All Types"
    />,
];

const PromoCodeListActions = () => {
    return (
        <TopToolbar>
            <CreateButton />
            <FilterButton />
        </TopToolbar>
    );
};

const DiscountTypeField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const type = record.discountType;
    const color = type === 'PERCENTAGE' ? '#2196f3' : '#4caf50';
    const label = type === 'PERCENTAGE' ? 'Percentage' : 'Flat Amount';

    return <Chip label={label} size="small" style={{ backgroundColor: color, color: 'white' }} />;
};

const DiscountValueField = () => {
    const record = useRecordContext();
    if (!record) return null;

    const type = record.discountType;
    const value = record.discountValue;

    return (
        <span>
            {type === 'PERCENTAGE' ? `${value}%` : `₹${value}`}
        </span>
    );
};

export const PromoCodeList = (props: any) => {
    return (
        <List {...props} filters={promoCodeFilters} actions={<PromoCodeListActions />}>
            <Datagrid rowClick="show">
                <TextField source="code" label="Code" />
                <DiscountTypeField />
                <DiscountValueField />
                <NumberField source="usageCount" label="Uses" />
                <BooleanField source="isActive" label="Active" />
                <DateField source="validFrom" label="Valid From" showTime />
                <DateField source="validUntil" label="Valid Until" showTime />
                <EditButton />
                <ShowButton />
                <DeleteButton />
            </Datagrid>
        </List>
    );
};

