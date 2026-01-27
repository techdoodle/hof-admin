import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useDataProvider, useNotify } from 'react-admin';
import WarningIcon from '@mui/icons-material/Warning';

interface MatchCancelDialogProps {
    open: boolean;
    matchId: number;
    onClose: () => void;
    onConfirm: () => void;
}

interface CancellationPreview {
    match: {
        matchId: number;
        startTime: string;
        endTime: string;
        venue: string;
        city: string;
    };
    confirmedBookings: Array<{
        id: number;
        bookingReference: string;
        email: string;
        amount: number;
        razorpayOrderId?: string | null;
    }>;
    nonConfirmedBookings: Array<{
        id: number;
        bookingReference: string;
        email: string;
        amount: number;
        razorpayOrderId?: string | null;
    }>;
    totalRefundAmount: number;
}

export const MatchCancelDialog: React.FC<MatchCancelDialogProps> = ({
    open,
    matchId,
    onClose,
    onConfirm,
}) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<CancellationPreview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    const fetchPreview = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await dataProvider.custom(
                `admin/matches/${matchId}/cancel-preview`,
                { method: 'GET' }
            );
            setPreview(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load cancellation preview');
            notify('Failed to load cancellation preview', { type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [matchId, dataProvider, notify]);

    useEffect(() => {
        if (open && matchId) {
            fetchPreview();
        }
    }, [open, matchId, fetchPreview]);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await dataProvider.custom(
                `admin/matches/${matchId}/cancel`,
                { method: 'DELETE' }
            );
            notify('Match cancelled successfully. Refunds have been processed.', { type: 'success' });
            onConfirm();
            onClose();
        } catch (err: any) {
            notify(err.message || 'Failed to cancel match', { type: 'error' });
        } finally {
            setCancelling(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <WarningIcon color="warning" />
                    <Typography variant="h6">Cancel Match</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                {loading && (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {preview && !loading && (
                    <Box>
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            <Typography variant="body2" fontWeight="bold">
                                This action will cancel the match and process refunds for all confirmed bookings.
                            </Typography>
                        </Alert>

                        <Box mb={3}>
                            <Typography variant="subtitle2" gutterBottom>
                                Match Details:
                            </Typography>
                            <Typography variant="body2">
                                Match ID: {preview.match.matchId}
                            </Typography>
                            <Typography variant="body2">
                                Venue: {preview.match.venue}, {preview.match.city}
                            </Typography>
                            <Typography variant="body2">
                                Start Time: {new Date(preview.match.startTime).toLocaleString()}
                            </Typography>
                        </Box>

                        {(preview.confirmedBookings?.length ?? 0) > 0 && (
                            <Box mb={3}>
                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                        Bookings to be Refunded ({preview.confirmedBookings?.length ?? 0}):
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Booking Reference</strong></TableCell>
                                                <TableCell><strong>Email</strong></TableCell>
                                                <TableCell><strong>Razorpay Order ID</strong></TableCell>
                                                <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(preview.confirmedBookings ?? []).map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell>{booking.bookingReference}</TableCell>
                                                    <TableCell>{booking.email}</TableCell>
                                                    <TableCell>
                                                        {booking.razorpayOrderId || (
                                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                                N/A
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        ₹{booking.amount.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box mt={1}>
                                    <Typography variant="body2" fontWeight="bold">
                                        Total Refund Amount: ₹{preview.totalRefundAmount.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {(preview.nonConfirmedBookings?.length ?? 0) > 0 && (
                            <Box mb={3}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Bookings to be Cancelled (No Refund) ({preview.nonConfirmedBookings?.length ?? 0}):
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Booking Reference</strong></TableCell>
                                                <TableCell><strong>Email</strong></TableCell>
                                                <TableCell><strong>Razorpay Order ID</strong></TableCell>
                                                <TableCell align="right"><strong>Amount (₹)</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(preview.nonConfirmedBookings ?? []).map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell>{booking.bookingReference}</TableCell>
                                                    <TableCell>{booking.email}</TableCell>
                                                    <TableCell>
                                                        {booking.razorpayOrderId || (
                                                            <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                                N/A
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        ₹{booking.amount.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                        {(preview.confirmedBookings?.length ?? 0) === 0 &&
                         (preview.nonConfirmedBookings?.length ?? 0) === 0 && (
                            <Alert severity="info">
                                This match has no active bookings to cancel.
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={cancelling}>
                    Cancel
                </Button>
                <Button
                    onClick={handleCancel}
                    color="error"
                    variant="contained"
                    disabled={cancelling || loading || !preview}
                    startIcon={cancelling ? <CircularProgress size={20} /> : <WarningIcon />}
                >
                    {cancelling ? 'Cancelling...' : 'Cancel Match'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

