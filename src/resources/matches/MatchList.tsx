import React, { useMemo, useState } from 'react';
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
    ReferenceInput,
} from 'react-admin';
import { Button, Chip, Box, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import VideoCallIcon from '@mui/icons-material/VideoCall';

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
    // Reference filters; backend normalizes venue.id/city.id/footballChief.id
    <ReferenceInput source="venue" reference="venues" label="Venue">
        <SelectInput optionText="name" optionValue="id" fullWidth />
    </ReferenceInput>,
    <ReferenceInput source="city" reference="cities" label="City">
        <SelectInput optionText={(c: any) => (c ? `${c.cityName}, ${c.stateName}` : '')} optionValue="id" fullWidth />
    </ReferenceInput>,
    <ReferenceInput source="footballChief" reference="chiefs" label="Football Chief">
        <SelectInput optionText="fullName" optionValue="id" fullWidth />
    </ReferenceInput>,
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

    const handlePlayerNationUpload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/playernation/upload?matchId=${record.matchId}`);
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
            {canManageParticipants && record.matchType === 'recorded' && !record.matchStatsId && (
                <Button
                    size="small"
                    startIcon={<VideoCallIcon />}
                    onClick={handlePlayerNationUpload}
                    variant="outlined"
                    color="primary"
                >
                    PlayerNation
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
    const [tab, setTab] = useState(1); // 0: Past, 1: Current, 2: Upcoming

    const { dateFrom, dateTo } = useMemo(() => {
        const now = new Date();
        const iso = (d: Date) => d.toISOString();

        if (tab === 0) {
            // Past: startTime < now - 24h → dateTo = now-24h
            const to = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            return { dateFrom: undefined as any, dateTo: iso(to) };
        }

        if (tab === 1) {
            // Current: startOfToday - 24h ≤ startTime ≤ now
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            const from = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
            return { dateFrom: iso(from), dateTo: iso(now) };
        }

        // Upcoming: startTime > now → dateFrom = now
        return { dateFrom: iso(now), dateTo: undefined as any };
    }, [tab]);

    const listFilter = useMemo(() => {
        const f: any = {};
        if (dateFrom) f.dateFrom = dateFrom;
        if (dateTo) f.dateTo = dateTo;
        return f;
    }, [dateFrom, dateTo]);

    return (
        <>
        <Box sx={{ px: 2, pt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="match buckets">
                <Tab label="Past" />
                <Tab label="Current" />
                <Tab label="Upcoming" />
            </Tabs>
        </Box>
        <List
            key={tab}
            filters={matchFilters}
            filter={listFilter}
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
        </>
    );
};
