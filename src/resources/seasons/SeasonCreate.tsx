import React from 'react';
import { Create, SimpleForm, TextInput, DateInput, required } from 'react-admin';

export const SeasonCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <TextInput source="name" label="Season Name" validate={required()} fullWidth />
        <DateInput
          source="startDate"
          label="Start Date"
          helperText="Required only for the very first season. For later seasons it will be auto-set."
          fullWidth
        />
        <DateInput
          source="endDate"
          label="End Date"
          validate={required()}
          fullWidth
        />
      </SimpleForm>
    </Create>
  );
};

