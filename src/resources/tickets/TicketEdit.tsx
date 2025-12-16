import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
} from 'react-admin';

const statusChoices = [
  { id: 'open', name: 'Open' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'resolved', name: 'Resolved' },
];

const priorityChoices = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
];

export const TicketEdit = () => (
  <Edit>
    <SimpleForm>
      {/* Read-only context fields */}
      <NumberInput source="id" label="ID" disabled />
      <NumberInput source="matchId" label="Match ID" disabled />
      <TextInput source="title" label="Title" disabled fullWidth />
      <TextInput source="description" label="Description" disabled fullWidth multiline minRows={3} />

      {/* Editable workflow fields */}
      <SelectInput source="status" label="Status" choices={statusChoices} />
      <SelectInput source="priority" label="Priority" choices={priorityChoices} />
      <NumberInput source="assignedToAdminId" label="Assigned To (admin id)" />
      <TextInput
        source="resolutionNotes"
        label="Resolution Notes"
        fullWidth
        multiline
        minRows={3}
      />
    </SimpleForm>
  </Edit>
);


