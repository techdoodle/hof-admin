import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    BooleanField,
    EditButton,
    ShowButton,
    DeleteButton,
    SearchInput,
    DateInput,
    usePermissions,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton,
    FunctionField,
    SelectInput,
} from 'react-admin';
import { Button, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GroupIcon from '@mui/icons-material/Group';

const matchFilters = [
    <SearchInput source="search" placeholder="Search matches..." alwaysOn />,
    <DateInput source="startTime" label="Start Time" />,
    <DateInput source="endTime" label="End Time" />,
    <SelectInput source="matchType" label="Match Type" choices={[
        { id: 'recorded', name: 'Recorded' },
        { id: 'non_recorded', name: 'Non-Recorded' },
    ]} />,
    <SelectInput source="statsReceived" label="Stats Status" choices={[
        { id: true, name: 'Received' },
        { id: false, name: 'Pending' },
    ]} />,
    <SelectInput source="venue.id" label="Venue" />,
];

const MatchListActions = () => {
    const { permissions } = usePermissions();
    const canCreateMatches = ['football_chief', 'academy_admin', 'admin', 'super_admin'].includes(permissions);

    return (
        <TopToolbar>
            {canCreateMatches && <CreateButton />}
            <FilterButton />
            <ExportButton />
        </TopToolbar>
    );
};

const MatchActions = ({ record }: any) => {
    const navigate = useNavigate();
    const { permissions } = usePermissions();

    const canEditMatches = ['football_chief', 'academy_admin', 'admin', 'super_admin'].includes(permissions);
    const canDeleteMatches = permissions === 'super_admin';
    const canManageParticipants = ['football_chief', 'academy_admin', 'admin', 'super_admin'].includes(permissions);

    const handleParticipants = () => {
        navigate(`/match-participants?filter=${JSON.stringify({ matchId: record.matchId })}`);
    };

    const handleUploadStats = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/stats-upload?matchId=${record.matchId}`);
    };

    return (
        <div style={{ display: 'flex', gap: 8 }}>
            {canManageParticipants && (
                <Button
                    size="small"
                    startIcon={<GroupIcon />}
                    onClick={handleParticipants}
                    variant="outlined"
                >
                    Participants
                </Button>
            )}
            {canManageParticipants && (
                <Button
                    size="small"
                    startIcon={<UploadFileIcon />}
                    onClick={handleUploadStats}
                    variant="outlined"
                    color="secondary"
                >
                    Upload Stats
                </Button>
            )}
            <ShowButton record={record} />
            {canEditMatches && <EditButton record={record} />}
            {canDeleteMatches && <DeleteButton record={record} />}
        </div>
    );
};

const StatusField = ({ record }: any) => {
    console.log('recorddd', record);

    if (!record?.startTime) {
        return null;
    }
    const now = new Date();
    const matchDate = new Date(record.startTime);

    let status = 'upcoming';
    let color = 'primary';

    if (matchDate < now) {
        status = 'completed';
        color = 'success';
    } else if (matchDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
        status = 'today';
        color = 'warning';
    }

    return (
        <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            color={color as any}
            size="small"
        />
    );
};

export const MatchList = () => {
    return (
        <List
            filters={matchFilters}
            actions={<MatchListActions />}
            perPage={25}
            sort={{ field: 'startTime', order: 'DESC' }}
        >
            <Datagrid rowClick={false}>
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
                        record.footballChief ? `${record.footballChief.firstName} ${record.footballChief.lastName}` : '-'
                    }
                />
                <FunctionField
                    label="Venue"
                    render={(record: any) =>
                        record.venue ? record.venue.name : '-'
                    }
                />
                <FunctionField
                    label="City"
                    render={(record: any) =>
                        record.venue?.city ? `${record.venue.city.cityName}, ${record.venue.city.stateName}` : '-'
                    }
                />
                <StatusField source="status" label="Status" />
                <FunctionField
                    label="Pricing"
                    render={(record: any) => {
                        if (record.slotPrice === 0 && record.offerPrice === 0) {
                            return <Chip label="Free" color="success" size="small" />;
                        }
                        if (record.offerPrice < record.slotPrice) {
                            return (
                                <div>
                                    <Chip label={`₹${record.offerPrice}`} color="error" size="small" />
                                    <Chip label={`₹${record.slotPrice}`} color="default" size="small" style={{ textDecoration: 'line-through', marginLeft: 4 }} />
                                </div>
                            );
                        }
                        return <Chip label={`₹${record.slotPrice}`} color="primary" size="small" />;
                    }}
                />
                <TextField source="matchHighlights" label="Highlights" />
                <TextField source="matchRecap" label="Recap" />
                <DateField source="createdAt" label="Created At" showTime />
                <DateField source="updatedAt" label="Updated At" showTime />
                <FunctionField
                    label="Actions"
                    render={(record: any) => <MatchActions record={record} />}
                />
            </Datagrid>
        </List>
    );
};
