import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  required,
  TopToolbar,
  ListButton,
  useRecordContext,
  usePermissions,
  Button,
  useNotify,
  useDataProvider,
  useRefresh,
} from 'react-admin';
import CalculateIcon from '@mui/icons-material/Calculate';

const SeasonRecalculateButton = () => {
  const record = useRecordContext<any>();
  const { permissions } = usePermissions();
  const isSuperAdmin = permissions === 'super_admin';
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();

  if (!record || !isSuperAdmin) return null;

  const handleClick = async () => {
    try {
      notify('Recalculating season averages...', { type: 'info' });
      const response = await dataProvider.custom(
        `/admin/seasons/${record.id}/recalculate-averages`,
        {
          method: 'POST',
        },
      );
      notify(
        `Averages recalculated successfully. ${response.data?.data?.matchesCount || 0} matches processed.`,
        { type: 'success' },
      );
      refresh();
    } catch (error: any) {
      notify(
        error.message || 'Failed to recalculate season averages',
        { type: 'warning' },
      );
    }
  };

  return (
    <Button
      label="Recalculate Averages"
      startIcon={<CalculateIcon />}
      onClick={handleClick}
      color="secondary"
    />
  );
};

const SeasonEditActions = () => (
  <TopToolbar>
    <ListButton />
    <SeasonRecalculateButton />
  </TopToolbar>
);

export const SeasonEdit = () => {
  return (
    <Edit actions={<SeasonEditActions />}>
      <SimpleForm>
        <TextInput source="name" label="Season Name" validate={required()} fullWidth />
        <DateInput source="startDate" label="Start Date" disabled fullWidth />
        <DateInput
          source="endDate"
          label="End Date"
          validate={required()}
          fullWidth
        />
      </SimpleForm>
    </Edit>
  );
};

