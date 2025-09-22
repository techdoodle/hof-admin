import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  BooleanField,
  NumberField,
  FunctionField,
  useRecordContext,
} from 'react-admin';
import { Typography } from '@mui/material';

const MatchTitle = () => {
  const record = useRecordContext();
  return <span>Match {record ? `#${record.matchId}` : ''}</span>;
};

export const MatchShow = () => {
  return (
    <Show title={<MatchTitle />}>
      <SimpleShowLayout>
        <TextField source="matchId" label="ID" />
        <TextField source="matchType" label="Match Type" />
        <DateField source="startTime" label="Start Time" showTime />
        <DateField source="endTime" label="End Time" showTime />
        <BooleanField source="statsReceived" label="Stats Received" />
        <NumberField source="teamAScore" label="Team A Score" />
        <NumberField source="teamBScore" label="Team B Score" />
        <FunctionField
          label="Football Chief"
          render={(record: any) =>
            record?.footballChief ?
              <Typography>
                {`${record.footballChief.firstName} ${record.footballChief.lastName}`}
                <br />
                {record.footballChief.email}
                <br />
                {record.footballChief.phoneNumber}
              </Typography>
              : '-'
          }
        />
        <FunctionField
          label="Venue"
          render={(record: any) =>
            record?.venue ?
              <Typography>
                {record.venue.name}
                <br />
                {record.venue.address}
                <br />
                {record.venue.phoneNumber}
              </Typography>
              : '-'
          }
        />
        <FunctionField
          label="City"
          render={(record: any) =>
            record?.venue?.city ?
              <Typography>
                {record.venue.city.cityName}, {record.venue.city.stateName}
                <br />
                {record.venue.city.country}
              </Typography>
              : '-'
          }
        />
        <TextField source="matchHighlights" label="Highlights" />
        <TextField source="matchRecap" label="Recap" />
        <DateField source="createdAt" label="Created At" showTime />
        <DateField source="updatedAt" label="Updated At" showTime />
      </SimpleShowLayout>
    </Show>
  );
};