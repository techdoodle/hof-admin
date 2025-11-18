import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    FormControlLabel,
    Checkbox,
    Box,
    Alert,
} from '@mui/material';

interface ParticipantRemoveDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (shouldRefund: boolean) => void;
    participantName?: string;
    paymentType?: string;
    isOnlinePayment?: boolean;
}

export const ParticipantRemoveDialog: React.FC<ParticipantRemoveDialogProps> = ({
    open,
    onClose,
    onConfirm,
    participantName,
    paymentType,
    isOnlinePayment = false,
}) => {
    const [shouldRefund, setShouldRefund] = useState(false);

    const handleConfirm = () => {
        onConfirm(shouldRefund);
        setShouldRefund(false); // Reset for next time
    };

    const handleClose = () => {
        setShouldRefund(false); // Reset when closing
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Remove Participant</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to remove{' '}
                        <strong>{participantName || 'this participant'}</strong> from the match?
                    </Typography>
                </Box>

                {isOnlinePayment && (
                    <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            This participant has an online payment. You can choose whether to initiate a refund.
                        </Alert>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={shouldRefund}
                                    onChange={(e) => setShouldRefund(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Initiate refund for this participant"
                        />
                        {shouldRefund && (
                            <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1, ml: 4 }}>
                                A refund will be processed for the per-slot amount.
                            </Typography>
                        )}
                    </Box>
                )}

                {!isOnlinePayment && paymentType === 'Cash' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        This participant has a cash payment. No refund will be processed.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleConfirm} color="error" variant="contained">
                    Remove Participant
                </Button>
            </DialogActions>
        </Dialog>
    );
};

