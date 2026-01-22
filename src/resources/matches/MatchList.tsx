import React, { useMemo, useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    EditButton,
    ShowButton,
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
import { Button, Chip, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupIcon from '@mui/icons-material/Group';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import RefreshIcon from '@mui/icons-material/Refresh';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ShareIcon from '@mui/icons-material/Share';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ScienceIcon from '@mui/icons-material/Science';
import CalculateIcon from '@mui/icons-material/Calculate';
import { useDataProvider, useNotify } from 'react-admin';
import { MatchCancelDialog } from './MatchCancelDialog';

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
    const navigate = useNavigate();
    const { permissions } = usePermissions();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [backfilling, setBackfilling] = useState(false);
    const canCreateMatches = ['football_chief', 'academy_admin', 'admin', 'super_admin', 'vendor'].includes(permissions);
    const canBackfillHighlights = ['admin', 'super_admin'].includes(permissions);

    const handleBulkBackfillHighlights = async () => {
        if (!window.confirm('This will backfill highlights for all matches with processed stats. This may take a while. Continue?')) {
            return;
        }

        try {
            setBackfilling(true);
            const response = await dataProvider.custom(`admin/playernation/backfill-highlights-all`, {
                method: 'POST',
            });
            const message = `Bulk backfill completed: ${response.data.processed} matches processed, ${response.data.errors} errors out of ${response.data.totalMatches} total matches`;
            notify(message, { type: 'success', autoHideDuration: 10000 });
        } catch (error: any) {
            notify(error?.message || 'Failed to backfill highlights', { type: 'error' });
        } finally {
            setBackfilling(false);
        }
    };

    return (
        <TopToolbar>
            {canCreateMatches && <CreateButton />}
            {canCreateMatches && (
                <Button
                    color="primary"
                    startIcon={<UploadFileIcon />}
                    onClick={() => navigate('/matches/upload-excel')}
                    sx={{ ml: 1 }}
                >
                    Upload Excel
                </Button>
            )}
            {canBackfillHighlights && (
                <Button
                    variant="outlined"
                    color="info"
                    startIcon={backfilling ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
                    onClick={handleBulkBackfillHighlights}
                    disabled={backfilling}
                    sx={{ ml: 1 }}
                >
                    {backfilling ? 'Backfilling...' : 'Backfill All Highlights'}
                </Button>
            )}
            <FilterButton />
            <ExportButton />
        </TopToolbar>
    );
};

const MatchActions = ({ record }: any) => {
    const navigate = useNavigate();
    const { permissions } = usePermissions();
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

    const canEditMatches = ['football_chief', 'academy_admin', 'admin', 'super_admin', 'vendor'].includes(permissions);
    const canCancelMatches = ['super_admin', 'admin', 'vendor'].includes(permissions);
    const canManageParticipants = ['football_chief', 'academy_admin', 'admin', 'super_admin', 'vendor'].includes(permissions);

    const handleParticipants = () => {
        navigate(`/match-participants?filter=${JSON.stringify({ matchId: record.matchId })}`);
    };

    const handlePlayerNationUpload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/playernation/upload?matchId=${record.matchId}`);
    };

    const handlePollNow = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await dataProvider.custom(`admin/playernation/poll-now/${record.matchId}`, {});
            notify('Poll initiated', { type: 'success' });
        } catch (err) {
            notify('Failed to initiate poll', { type: 'error' });
        }
    };

    const handlePushDummyStats = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('This will generate and push dummy stats for all participants. This is for testing only. Continue?')) {
            return;
        }
        try {
            notify('Generating dummy stats...', { type: 'info' });
            const response = await dataProvider.custom(`admin/matches/${record.matchId}/push-dummy-stats`, {
                method: 'POST',
            });
            notify(
                `Dummy stats generated: ${response.data.data.processed}/${response.data.data.expected} players processed`,
                { type: 'success' },
            );
            // Refresh the page to show updated stats
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            notify(err?.message || 'Failed to generate dummy stats', { type: 'error' });
        }
    };

    const handleRecalculateXp = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('This will recalculate XP for all players in this match. Continue?')) {
            return;
        }
        try {
            notify('Recalculating XP...', { type: 'info' });
            const response = await dataProvider.custom(`admin/matches/${record.matchId}/recalculate-xp`, {
                method: 'POST',
            });
            notify(
                `XP recalculated: ${response.data.data.processed} players processed, ${response.data.data.errors} errors`,
                { type: 'success' },
            );
            // Refresh the page to show updated XP
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            notify(err?.message || 'Failed to recalculate XP', { type: 'error' });
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Get frontend URL - use app subdomain
        const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'https://app.humansoffootball.in';
        const shareUrl = `${frontendUrl}/match-details/${record.matchId}`;
        
        // Use the same invite text as frontend
        const shareText = `Boots laced and ready to go! 💪⚽

Think you can take us on? Join the match — let's settle it on the pitch 

Check all match details👇

${shareUrl}

Every player matters. Every moment counts.`;
        
        // Copy to clipboard
        try {
            await navigator.clipboard.writeText(shareText);
            notify('Match invite copied to clipboard!', { type: 'success' });
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareText;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                notify('Match invite copied to clipboard!', { type: 'success' });
            } catch (err) {
                notify('Failed to copy invite', { type: 'error' });
            }
            document.body.removeChild(textArea);
        }
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
                    Stats
                </Button>
            )}
            {canManageParticipants && record.matchStatsId && (
                <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handlePollNow}
                    variant="outlined"
                >
                    Re-poll
                </Button>
            )}
            {canManageParticipants && record.matchType === 'recorded' && (
                <Button
                    size="small"
                    startIcon={<ScienceIcon />}
                    onClick={handlePushDummyStats}
                    variant="outlined"
                    color="secondary"
                    title="Generate dummy stats for testing (non-prod only - backend will reject in production)"
                >
                    Test Stats
                </Button>
            )}
            {canManageParticipants && record.matchType === 'recorded' && (
                <Button
                    size="small"
                    startIcon={<CalculateIcon />}
                    onClick={handleRecalculateXp}
                    variant="outlined"
                    color="primary"
                    title="Recalculate XP for all players in this match (only works if stats exist)"
                >
                    Recalc XP
                </Button>
            )}
            <Button
                size="small"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                variant="outlined"
                color="primary"
            >
                Share
            </Button>
            <ShowButton record={record} />
            {canEditMatches && <EditButton record={record} />}
            {canCancelMatches && record.status !== 'CANCELLED' && (
                <Button
                    size="small"
                    startIcon={<CancelIcon />}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCancelDialogOpen(true);
                    }}
                    variant="outlined"
                    color="error"
                >
                    Cancel Match
                </Button>
            )}
            {canCancelMatches && record.status === 'CANCELLED' && (
                <Chip label="Cancelled" color="error" size="small" />
            )}
            <MatchCancelDialog
                open={cancelDialogOpen}
                matchId={record.matchId}
                onClose={() => setCancelDialogOpen(false)}
                onConfirm={() => {
                    setCancelDialogOpen(false);
                    window.location.reload(); // Refresh the page to show updated match status
                }}
            />
        </div>
    );
};


export const MatchList = () => {
    const [tab, setTab] = useState(1); // 0: Past, 1: Current, 2: Upcoming, 3: Cancelled

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

        if (tab === 3) {
            // Cancelled: last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return { dateFrom: iso(sevenDaysAgo), dateTo: iso(now) };
        }

        // Upcoming: startTime > now → dateFrom = now
        return { dateFrom: iso(now), dateTo: undefined as any };
    }, [tab]);

    const listFilter = useMemo(() => {
        const f: any = {};
        
        if (tab === 3) {
            // Cancelled tab: show only CANCELLED matches from last 7 days
            f.status = 'CANCELLED';
            if (dateFrom) f.dateFrom = dateFrom;
            if (dateTo) f.dateTo = dateTo;
            return f;
        }

        // For Past, Current, and Upcoming tabs: exclude CANCELLED matches
        f.statusNot = 'CANCELLED';
        
        // For Past tab: filter out matches older than 15 days
        if (tab === 0) {
            const fifteenDaysAgo = new Date();
            fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
            f.dateFrom = dateFrom 
                ? (new Date(dateFrom) > fifteenDaysAgo ? dateFrom : fifteenDaysAgo.toISOString())
                : fifteenDaysAgo.toISOString();
        } else if (dateFrom) {
            f.dateFrom = dateFrom;
        }
        
        if (dateTo) f.dateTo = dateTo;
        return f;
    }, [dateFrom, dateTo, tab]);

    return (
        <>
        <Box sx={{ px: 2, pt: 2 }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="match buckets">
                <Tab label="Past" />
                <Tab label="Current" />
                <Tab label="Upcoming" />
                <Tab label="Cancelled" />
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
            <Datagrid rowClick={false} bulkActionButtons={false}>
                <TextField source="matchId" label="ID" />
                <FunctionField
                    label="Actions"
                    render={(record: any) => <MatchActions record={record} />}
                />
                <FunctionField
                    label="Status"
                    render={(record: any) => {
                        const status = record.status;
                        // CANCELLED always takes highest priority
                        if (status === 'CANCELLED') {
                            return <Chip label="Cancelled" color="error" size="small" />;
                        }
                        // Stats workflow statuses for recorded matches
                        if (status === 'STATS_SUBMISSION_PENDING') {
                            return <Chip label="Stats Submission Pending" color="warning" size="small" />;
                        }
                        if (status === 'POLLING_STATS') {
                            return <Chip label="Polling Stats" color="info" size="small" />;
                        }
                        if (status === 'SS_MAPPING_PENDING') {
                            return <Chip label="SS Mapping Pending" color="info" size="small" />;
                        }
                        if (status === 'STATS_UPDATED') {
                            return <Chip label="Stats Updated" color="success" size="small" />;
                        }
                        // Default to Active for non-recorded matches or when no stats workflow applies
                        return <Chip label="Active" color="success" size="small" />;
                    }}
                />
                <TextField source="matchType" label="Match Type" />
                <NumberField source="playerCapacity" label="Player Capacity" />
                <FunctionField
                    label="Enrolled Participants"
                    render={(record: any) => record.participantCount ?? 0}
                />
                <DateField source="startTime" label="Start Time" showTime />
                <DateField source="endTime" label="End Time" showTime />
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
                <DateField source="createdAt" label="Created At" showTime />
                <DateField source="updatedAt" label="Updated At" showTime />
            </Datagrid>
        </List>
        </>
    );
};
