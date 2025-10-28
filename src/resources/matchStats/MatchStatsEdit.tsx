import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiClient } from '../../utils/apiClient';

interface MatchStat {
    matchStatsId: number;
    player: {
        id: number;
        firstName: string;
        lastName: string;
        phoneNumber: string;
        email?: string;
    };
    matchParticipant: {
        matchParticipantId: number;
        teamName: string;
    };
    // Add all the stats fields here
    [key: string]: any;
}

export const MatchStatsEdit = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();

    const [stats, setStats] = useState<MatchStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Define which fields are editable (excluding readonly fields)
    const editableFields = [
        'teamName',
        'totalGoal',
        'totalAssist',
        'totalShot',
        'totalOnTargetShot',
        'totalOffTargetShot',
        'totalPass',
        'totalCompletePass',
        'totalIncompletePass',
        'totalThroughBall',
        'totalCompleteThroughBall',
        'totalIncompleteThroughBall',
        'totalLongPass',
        'totalCompleteLongPass',
        'totalIncompleteLongPass',
        'totalCross',
        'totalCompleteCross',
        'totalIncompleteCross',
        'totalKeyPass',
        'totalDribbleAttempt',
        'totalSuccessfulDribble',
        'totalUnsuccessfulDribble',
        'totalDefensiveActions',
        'totalTackles',
        'totalInterceptions',
        'totalClearance',
        'totalSave',
        'totalCatch',
        'totalPunch',
        'recovery',
        'steal',
        'totalMiscontrol',
        'totalWoodwork',
        'totalOwnGoals',
        'teamBlackGoals',
        'teamWhiteGoals',
        'teamAGoals',
        'teamBGoals',
    ];

    // Define field labels for better display
    const fieldLabels: { [key: string]: string } = {
        teamName: 'Team Name',
        totalGoal: 'Goals',
        totalAssist: 'Assists',
        totalShot: 'Total Shots',
        totalOnTargetShot: 'Shots On Target',
        totalOffTargetShot: 'Shots Off Target',
        totalPass: 'Total Passes',
        totalCompletePass: 'Complete Passes',
        totalIncompletePass: 'Incomplete Passes',
        totalThroughBall: 'Through Balls',
        totalCompleteThroughBall: 'Complete Through Balls',
        totalIncompleteThroughBall: 'Incomplete Through Balls',
        totalLongPass: 'Long Passes',
        totalCompleteLongPass: 'Complete Long Passes',
        totalIncompleteLongPass: 'Incomplete Long Passes',
        totalCross: 'Crosses',
        totalCompleteCross: 'Complete Crosses',
        totalIncompleteCross: 'Incomplete Crosses',
        totalKeyPass: 'Key Passes',
        totalDribbleAttempt: 'Dribble Attempts',
        totalSuccessfulDribble: 'Successful Dribbles',
        totalUnsuccessfulDribble: 'Unsuccessful Dribbles',
        totalDefensiveActions: 'Defensive Actions',
        totalTackles: 'Tackles',
        totalInterceptions: 'Interceptions',
        totalClearance: 'Clearances',
        totalSave: 'Saves',
        totalCatch: 'Catches',
        totalPunch: 'Punches',
        recovery: 'Recoveries',
        steal: 'Steals',
        totalMiscontrol: 'Miscontrols',
        totalWoodwork: 'Woodwork',
        totalOwnGoals: 'Own Goals',
        teamBlackGoals: 'Team Black Goals',
        teamWhiteGoals: 'Team White Goals',
        teamAGoals: 'Team A Goals',
        teamBGoals: 'Team B Goals',
    };

    useEffect(() => {
        if (matchId) {
            fetchMatchStats();
        }
    }, [matchId]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchMatchStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiClient.get(`/match-participant-stats/match/${matchId}`);
            setStats(response.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch match statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldChange = (statsId: number, field: string, value: any) => {
        setStats(prevStats =>
            prevStats.map(stat =>
                stat.matchStatsId === statsId
                    ? { ...stat, [field]: value }
                    : stat
            )
        );
    };

    const handleSaveStats = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            // Update each stat individually
            const updatePromises = stats.map(stat =>
                apiClient.put(`/match-participant-stats/${stat.matchStatsId}`, stat)
            );

            await Promise.all(updatePromises);

            setSuccess('Statistics updated successfully!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update statistics');
        } finally {
            setSaving(false);
        }
    };

    const handleBack = () => {
        navigate(`/matches/${matchId}/show`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (stats.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Match Statistics - Match #{matchId}
                    </Typography>

                    <Alert severity="info" sx={{ mt: 2 }}>
                        No statistics found for this match. Use PlayerNation integration to upload match statistics.
                    </Alert>

                    <Box sx={{ mt: 3 }}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            onClick={handleBack}
                        >
                            Back to Match
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Edit Match Statistics - Match #{matchId}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6">
                            Statistics for {stats.length} player(s)
                        </Typography>
                        <Box>
                            <Button
                                variant="outlined"
                                startIcon={<ArrowBackIcon />}
                                onClick={handleBack}
                                sx={{ mr: 2 }}
                            >
                                Back to Match
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                onClick={handleSaveStats}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 150 }}>Player</TableCell>
                                    <TableCell sx={{ minWidth: 100 }}>Team</TableCell>
                                    {editableFields.slice(1).map(field => (
                                        <TableCell key={field} sx={{ minWidth: 120 }}>
                                            {fieldLabels[field] || field}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {stats.map((stat) => (
                                    <TableRow key={stat.matchStatsId}>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {`${stat.player.firstName} ${stat.player.lastName}`}
                                                <br />
                                                <Typography variant="caption" color="textSecondary">
                                                    {stat.player.phoneNumber}
                                                </Typography>
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={stat.matchParticipant?.teamName || ''}
                                                onChange={(e) => handleFieldChange(stat.matchStatsId, 'teamName', e.target.value)}
                                                size="small"
                                                fullWidth
                                            />
                                        </TableCell>
                                        {editableFields.slice(1).map(field => (
                                            <TableCell key={field}>
                                                <TextField
                                                    value={stat[field] || ''}
                                                    onChange={(e) => handleFieldChange(stat.matchStatsId, field, e.target.value)}
                                                    size="small"
                                                    fullWidth
                                                    type="number"
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};
