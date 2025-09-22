import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Step,
    Stepper,
    StepLabel,
    Container
} from '@mui/material';
import { useLogin, useNotify } from 'react-admin';
import PhoneIcon from '@mui/icons-material/Phone';
import SecurityIcon from '@mui/icons-material/Security';
import { getCurrentEnvironment } from '../config/environment';

export const LoginPage = () => {
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(0); // 0: enter mobile, 1: enter OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const login = useLogin();
    const notify = useNotify();

    const steps = ['Enter Mobile Number', 'Verify OTP'];

    const validateMobile = (mobile: string) => {
        const mobileRegex = /^[6-9]\d{9}$/;
        return mobileRegex.test(mobile);
    };

    const handleSendOtp = async () => {
        if (!validateMobile(mobile)) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // The login function will handle sending OTP
            // We'll use a temporary call to get OTP sent
            const apiUrl = getCurrentEnvironment().apiUrl;
            console.log("apiURL", apiUrl)
            const response = await fetch(`${apiUrl}/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mobile }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Store OTP data for verification
            localStorage.setItem('otpData', JSON.stringify({
                encryptedOtp: data.encryptedOtp,
                iv: data.iv,
                mobile
            }));

            setStep(1);
            notify('OTP sent successfully to your mobile number', { type: 'success' });
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await login({ mobile, otp });
            notify('Login successful!', { type: 'success' });
        } catch (err: any) {
            setError(err || 'Invalid OTP or login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtp('');
        setError('');
        await handleSendOtp();
    };

    const handleBack = () => {
        setStep(0);
        setOtp('');
        setError('');
        localStorage.removeItem('otpData');
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Card sx={{ width: '100%', maxWidth: 400 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                            <Typography component="h1" variant="h4" gutterBottom>
                                HOF Admin
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sign in with your mobile number
                            </Typography>
                        </Box>

                        <Stepper activeStep={step} sx={{ mb: 4 }}>
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {step === 0 && (
                            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
                                <TextField
                                    fullWidth
                                    label="Mobile Number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Enter 10-digit mobile number"
                                    InputProps={{
                                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    }}
                                    sx={{ mb: 3 }}
                                    disabled={loading}
                                    inputProps={{
                                        maxLength: 10,
                                        pattern: '[6-9][0-9]{9}',
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading || !mobile}
                                    sx={{ py: 1.5 }}
                                >
                                    {loading ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        'Send OTP'
                                    )}
                                </Button>
                            </Box>
                        )}

                        {step === 1 && (
                            <Box component="form" onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
                                <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                                    OTP sent to <strong>{mobile}</strong>
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter 6-digit OTP"
                                    InputProps={{
                                        startAdornment: <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    }}
                                    sx={{ mb: 3 }}
                                    disabled={loading}
                                    inputProps={{
                                        maxLength: 6,
                                        pattern: '[0-9]{6}',
                                    }}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    disabled={loading || !otp}
                                    sx={{ py: 1.5, mb: 2 }}
                                >
                                    {loading ? (
                                        <CircularProgress size={20} />
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </Button>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Button
                                        variant="text"
                                        onClick={handleBack}
                                        disabled={loading}
                                    >
                                        Back
                                    </Button>

                                    <Button
                                        variant="text"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                    >
                                        Resend OTP
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Admin access required • Contact administrator for account setup
                </Typography>
            </Box>
        </Container>
    );
};
