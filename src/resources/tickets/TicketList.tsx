import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  TextInput,
  SelectInput,
} from 'react-admin';

const ticketStatusChoices = [
  { id: 'open', name: 'Open' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'resolved', name: 'Resolved' },
];

const ticketPriorityChoices = [
  { id: 'low', name: 'Low' },
  { id: 'medium', name: 'Medium' },
  { id: 'high', name: 'High' },
];

export const TicketList = () => (
  <List
    perPage={25}
    sort={{ field: 'createdAt', order: 'DESC' }}
    filters={[
      <TextInput source="matchId" label="Match ID" alwaysOn />,
      <SelectInput source="status" label="Status" choices={ticketStatusChoices} alwaysOn />,
      <SelectInput source="priority" label="Priority" choices={ticketPriorityChoices} alwaysOn />,
      <TextInput source="createdBy" label="Created By (admin id)" />,
    ]}
  >
    <Datagrid rowClick="edit">
      <NumberField source="id" label="ID" />
      <NumberField source="matchId" label="Match ID" />
      <TextField source="title" label="Title" />
      <TextField source="status" label="Status" />
      <TextField source="priority" label="Priority" />
      <NumberField source="createdByAdminId" label="Created By" />
      <NumberField source="assignedToAdminId" label="Assigned To" />
      <DateField source="createdAt" label="Created At" showTime />
      <DateField source="updatedAt" label="Updated At" showTime />
    </Datagrid>
  </List>
);


