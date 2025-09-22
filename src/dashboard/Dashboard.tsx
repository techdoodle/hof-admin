import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { usePermissions, useGetList } from 'react-admin';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatCard = ({ title, value, icon, color }: any) => (
    <Card>
        <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                        {title}
                    </Typography>
                    <Typography variant="h4" component="h2">
                        {value}
                    </Typography>
                </Box>
                <Box sx={{ color, opacity: 0.7 }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

export const Dashboard = () => {
    const { permissions } = usePermissions();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeMatches: 0,
        totalParticipants: 0,
        monthlyMatches: 0,
        loading: true
    });

    const { data: users, total: totalUsers } = useGetList('users', {
        pagination: { page: 1, perPage: 1 },
        sort: { field: 'id', order: 'DESC' }
    });

    const { data: matches } = useGetList('matches', {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: 'startTime', order: 'DESC' }
    });

    const { data: participants, total: totalParticipants } = useGetList('match-participants', {
        pagination: { page: 1, perPage: 1 },
        sort: { field: 'id', order: 'DESC' }
    });

    useEffect(() => {
        if (users && matches && participants) {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            const activeMatches = matches.filter((match: any) => {
                const matchDate = new Date(match.startTime);
                return matchDate >= monthStart;
            });

            setStats({
                totalUsers: totalUsers || 0,
                activeMatches: activeMatches.length,
                totalParticipants: totalParticipants || 0,
                monthlyMatches: activeMatches.length,
                loading: false
            });
        }
    }, [users, matches, participants, totalUsers, totalParticipants]);

    const canViewUsers = ['admin', 'super_admin'].includes(permissions);
    const canViewMatches = ['football_chief', 'academy_admin', 'admin', 'super_admin'].includes(permissions);

    return (
        <Box p={3}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                    cursor: 'pointer',
                    '&:hover': {
                        color: 'primary.main'
                    }
                }}
                onClick={() => navigate('/')}
            >
                Welcome to HOF Admin Panel
            </Typography>

            <Typography variant="body1" color="textSecondary" paragraph>
                Role: <strong>{permissions}</strong>
            </Typography>

            <Box display="flex" gap={3} sx={{ mb: 3, flexWrap: 'wrap' }}>
                {canViewUsers && (
                    <Box flex="1 1 250px">
                        <StatCard
                            title="Total Users"
                            value={stats.loading ? <CircularProgress size={20} /> : stats.totalUsers.toLocaleString()}
                            icon={<PersonIcon sx={{ fontSize: 40 }} />}
                            color="#1976d2"
                        />
                    </Box>
                )}

                {canViewMatches && (
                    <>
                        <Box flex="1 1 250px">
                            <StatCard
                                title="Active Matches"
                                value={stats.loading ? <CircularProgress size={20} /> : stats.activeMatches.toLocaleString()}
                                icon={<SportsFootballIcon sx={{ fontSize: 40 }} />}
                                color="#2e7d32"
                            />
                        </Box>

                        <Box flex="1 1 250px">
                            <StatCard
                                title="Participants"
                                value={stats.loading ? <CircularProgress size={20} /> : stats.totalParticipants.toLocaleString()}
                                icon={<GroupIcon sx={{ fontSize: 40 }} />}
                                color="#ed6c02"
                            />
                        </Box>

                        <Box flex="1 1 250px">
                            <StatCard
                                title="This Month"
                                value={stats.loading ? <CircularProgress size={20} /> : stats.monthlyMatches.toLocaleString()}
                                icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
                                color="#9c27b0"
                            />
                        </Box>
                    </>
                )}
            </Box>

            <Box display="flex" gap={3} sx={{ flexWrap: 'wrap' }}>
                <Box flex="2 1 400px">
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Quick Actions
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Use the navigation menu to access different sections of the admin panel.
                            </Typography>

                            {canViewUsers && (
                                <Box mt={2}>
                                    <Typography variant="body2" color="textSecondary">
                                        • Manage users and assign roles
                                    </Typography>
                                </Box>
                            )}

                            {canViewMatches && (
                                <Box mt={1}>
                                    <Typography variant="body2" color="textSecondary">
                                        • Create and manage matches
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        • Upload match statistics via CSV
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        • Manage match participants
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <Box flex="1 1 300px">
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Role Permissions
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Your current role: <strong>{permissions}</strong>
                            </Typography>

                            {permissions === 'super_admin' && (
                                <Typography variant="body2" color="success.main">
                                    ✓ Full access to all features
                                </Typography>
                            )}

                            {permissions === 'admin' && (
                                <>
                                    <Typography variant="body2" color="success.main">
                                        ✓ User management
                                    </Typography>
                                    <Typography variant="body2" color="success.main">
                                        ✓ Match management
                                    </Typography>
                                </>
                            )}

                            {['football_chief', 'academy_admin'].includes(permissions) && (
                                <Typography variant="body2" color="success.main">
                                    ✓ Match management only
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
};
