import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  TopToolbar,
  CreateButton,
  usePermissions,
  Button,
  useNotify,
  useDataProvider,
  useRefresh,
  useRecordContext,
} from 'react-admin';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalculateIcon from '@mui/icons-material/Calculate';

const SeasonListActions = () => {
  const { permissions } = usePermissions();
  const isSuperAdmin = permissions === 'super_admin';

  return (
    <TopToolbar>
      {isSuperAdmin && <CreateButton />}
      {/* No FilterButton here to avoid requiring List filters prop */}
    </TopToolbar>
  );
};

export const SeasonActivateButton = () => {
  const record = useRecordContext<any>();
  const { permissions } = usePermissions();
  const isSuperAdmin = permissions === 'super_admin';
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();

  if (!record || !isSuperAdmin) return null;
  if (record.isActive) return null;

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await dataProvider.custom(`/admin/seasons/${record.id}/activate`, {
        method: 'PATCH',
      });
      notify('Season activated', { type: 'info' });
      refresh();
    } catch (error: any) {
      notify(error.message || 'Failed to activate season', { type: 'warning' });
    }
  };

  return (
    <Button
      label="Activate"
      size="small"
      startIcon={<PlayArrowIcon />}
      onClick={handleClick}
    />
  );
};

export const SeasonRecalculateAveragesButton = () => {
  const record = useRecordContext<any>();
  const { permissions } = usePermissions();
  const isSuperAdmin = permissions === 'super_admin';
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const refresh = useRefresh();

  if (!record || !isSuperAdmin) return null;

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
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
      label="Recalc Averages"
      size="small"
      startIcon={<CalculateIcon />}
      onClick={handleClick}
      color="secondary"
    />
  );
};

export const SeasonList = () => {
  const { permissions } = usePermissions();
  const isSuperAdmin = permissions === 'super_admin';

  return (
    <List
      perPage={25}
      sort={{ field: 'startDate', order: 'ASC' }}
      actions={<SeasonListActions />}
      title="Seasons"
    >
      <Datagrid rowClick={isSuperAdmin ? 'edit' : undefined}>
        <TextField source="id" label="ID" />
        <TextField source="name" label="Name" />
        <DateField source="startDate" label="Start Date" />
        <DateField source="endDate" label="End Date" />
        <BooleanField source="isActive" label="Active" />
        <SeasonActivateButton />
        <SeasonRecalculateAveragesButton />
      </Datagrid>
    </List>
  );
};

