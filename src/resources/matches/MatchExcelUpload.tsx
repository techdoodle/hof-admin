import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Alert,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { useNotify } from 'react-admin';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { getCurrentEnvironment } from '../../config/environment';

interface UploadError {
    row: number;
    errors: string[];
    data?: any;
}

// Helper function to get correction steps based on error message
const getCorrectionSteps = (errorMessage: string): string[] => {
    const steps: string[] = [];
    
    if (errorMessage.includes('startTime format') || errorMessage.includes('endTime format') || errorMessage.includes('Invalid startTime') || errorMessage.includes('Invalid endTime')) {
        steps.push('Date format is incorrect. Use one of these formats:');
        steps.push('  • YYYY-MM-DD HH:mm:ss (e.g., 2025-01-15 18:00:00)');
        steps.push('  • YYYY-MM-DDTHH:mm:ss (e.g., 2025-01-15T18:00:00)');
        steps.push('  • YYYY-MM-DD HH:mm (e.g., 2025-01-15 18:00)');
        steps.push('Make sure dates are in the future and endTime is after startTime');
    }
    
    if (errorMessage.includes('endTime must be after startTime')) {
        steps.push('The end time must be later than the start time');
        steps.push('Check that your endTime is after startTime in the same row');
    }
    
    if (errorMessage.includes('footballChiefPhone') && errorMessage.includes('10 digits')) {
        steps.push('Phone number must be exactly 10 digits (numbers only, no spaces or dashes)');
        steps.push('Example: 9876543210 (not 98765-43210 or +91 9876543210)');
    }
    
    if (errorMessage.includes('Football Chief not found')) {
        steps.push('The phone number does not match any Football Chief in the system');
        steps.push('Verify the phone number is correct and the user exists with the correct role');
        steps.push('Check that the phone number matches exactly (10 digits, no country code)');
    }
    
    if (errorMessage.includes('Venue not found')) {
        steps.push('The venue name does not exist in the system');
        steps.push('Verify the venue name matches exactly (case-sensitive)');
        steps.push('Check for typos or extra spaces in the venue name');
    }
    
    if (errorMessage.includes('City not found')) {
        steps.push('The city name does not exist in the system');
        steps.push('Verify the city name matches exactly (case-sensitive)');
        steps.push('Check for typos or extra spaces in the city name');
    }
    
    if (errorMessage.includes('Match Type not found')) {
        steps.push('Match type name must be exactly "HOF Play" or "HOF Select"');
        steps.push('Check for typos, extra spaces, or incorrect capitalization');
        steps.push('Valid options: "HOF Play" or "HOF Select" (case-sensitive)');
    }
    
    if (errorMessage.includes('playerCapacity') && (errorMessage.includes('positive') || errorMessage.includes('number'))) {
        steps.push('Player capacity must be a positive number (greater than 0)');
        steps.push('Common values: 10 (for 5v5), 14 (for 7v7), 22 (for 11v11)');
        steps.push('Make sure there are no letters or special characters');
    }
    
    if (errorMessage.includes('venueCost') && (errorMessage.includes('non-negative') || errorMessage.includes('number'))) {
        steps.push('Venue cost must be a number (0 or greater)');
        steps.push('Do not include currency symbols (₹, $, etc.) or commas');
        steps.push('Example: 5000 (not ₹5,000 or 5000.00)');
    }
    
    if (errorMessage.includes('slotPrice') || errorMessage.includes('offerPrice')) {
        if (errorMessage.includes('non-negative') || errorMessage.includes('number')) {
            steps.push('Price must be a number (0 or greater)');
            steps.push('Do not include currency symbols (₹, $, etc.) or commas');
        }
        if (errorMessage.includes('offerPrice') && errorMessage.includes('less than or equal')) {
            steps.push('Offer price must be less than or equal to slot price');
            steps.push('If slot price is 1000, offer price can be 1000 or less (e.g., 900)');
        }
    }
    
    if (errorMessage.includes('venue') && errorMessage.includes('does not belong to city')) {
        steps.push('The venue does not belong to the specified city');
        steps.push('Verify that the venue name and city name are correct');
        steps.push('Check that the venue is assigned to the correct city in the system');
    }
    
    if (errorMessage.includes('matchType must be')) {
        steps.push('Match type must be exactly "recorded" or "non_recorded"');
        steps.push('Check for typos or incorrect values');
        steps.push('Valid options: "recorded" or "non_recorded" (lowercase, with underscore)');
    }
    
    if (errorMessage.includes('Missing required field')) {
        steps.push('A required field is missing or empty');
        steps.push('Check that all required columns have values in this row');
        steps.push('Required fields: matchType, matchTypeName, startTime, endTime, footballChiefPhone, venueName, cityName, playerCapacity, venueCost');
    }
    
    // If no specific guidance, provide general help
    if (steps.length === 0) {
        steps.push('Review the error message above');
        steps.push('Check the Excel template for the correct format');
        steps.push('Verify all data matches the expected format and values');
    }
    
    return steps;
};

interface UploadWarning {
    row: number;
    message: string;
    data?: any;
}

interface CreatedMatch {
    matchId: number;
    startTime: string;
    venueName: string;
    cityName: string;
}

interface UploadResult {
    success: boolean;
    message: string;
    totalRows: number;
    successfulRows: number;
    failedRows: number;
    errors: UploadError[];
    warnings: UploadWarning[];
    createdMatches: CreatedMatch[];
}

export const MatchExcelUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const notify = useNotify();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const validExtensions = ['.xlsx', '.xls'];
            const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
            
            if (!validExtensions.includes(fileExtension)) {
                notify('Please select a valid Excel file (.xlsx or .xls)', { type: 'error' });
                return;
            }
            
            setFile(selectedFile);
            // Clear previous results when a new file is selected
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        console.log('=== FRONTEND DOWNLOAD TEMPLATE START ===');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                notify('Please log in to download the template', { type: 'error' });
                return;
            }

            const apiUrl = getCurrentEnvironment().apiUrl;
            const fullUrl = `${apiUrl}/admin/matches/excel-template`;
            console.log('API URL:', apiUrl);
            console.log('Full URL:', fullUrl);
            console.log('Token present:', !!token);
            console.log('Token length:', token.length);
            
            console.log('Making fetch request...');
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Response received');
            console.log('Response status:', response.status);
            console.log('Response statusText:', response.statusText);
            console.log('Response ok:', response.ok);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const responseText = await response.text();
                console.error('Response not OK. Response body:', responseText);
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: responseText };
                }
                console.error('Parsed error:', errorData);
                throw new Error(errorData.message || errorData.error || 'Failed to download template');
            }

            console.log('Response OK, converting to blob...');
            const blob = await response.blob();
            console.log('Blob created, size:', blob.size, 'type:', blob.type);
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'match_template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('Template downloaded successfully');
            notify('Template downloaded successfully', { type: 'success' });
        } catch (error: any) {
            console.error('=== FRONTEND DOWNLOAD TEMPLATE ERROR ===');
            console.error('Error:', error);
            console.error('Error message:', error?.message);
            notify(error?.message || 'Failed to download template', { type: 'error' });
        }
    };

    const handleUpload = async () => {
        if (!file) {
            notify('Please select a file first', { type: 'error' });
            return;
        }

        const confirmed = window.confirm(
            '⚠️ WARNING: This will create new matches based on the Excel file. Are you sure you want to continue?'
        );

        if (!confirmed) {
            return;
        }

        setUploading(true);
        // Don't clear result immediately - let it update with new results

        try {
            const formData = new FormData();
            formData.append('file', file);

            const apiUrl = getCurrentEnvironment().apiUrl;
            const token = localStorage.getItem('token');
            
            console.log('=== FRONTEND UPLOAD START ===');
            console.log('API URL:', apiUrl);
            console.log('Full URL:', `${apiUrl}/admin/matches/upload-excel`);
            console.log('File name:', file.name);
            console.log('File size:', file.size);
            console.log('File type:', file.type);
            console.log('Has token:', !!token);
            console.log('Token length:', token?.length);
            
            if (!token) {
                notify('Please log in to upload matches', { type: 'error' });
                return;
            }
            
            const uploadUrl = `${apiUrl}/admin/matches/upload-excel`;
            console.log('Making request to:', uploadUrl);
            
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type - let browser set it with boundary for FormData
                },
                body: formData,
            });
            
            console.log('Response status:', response.status);
            console.log('Response statusText:', response.statusText);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.error('Response not OK:', response.status, response.statusText);
                const responseText = await response.text();
                console.error('Response body:', responseText);
                let errorData;
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    errorData = { message: responseText || 'Upload failed' };
                }
                console.error('Parsed error data:', errorData);
                throw new Error(errorData.message || errorData.error || 'Upload failed');
            }

            const responseText = await response.text();
            console.log('Response body:', responseText);
            let result;
            try {
                result = JSON.parse(responseText);
            } catch {
                result = { message: 'Invalid JSON response', raw: responseText };
            }
            console.log('Parsed result:', result);
            console.log('Result errors:', result.errors);
            console.log('Result errors length:', result.errors?.length);
            console.log('Result failedRows:', result.failedRows);
            
            // Ensure errors array exists
            if (!result.errors) {
                result.errors = [];
            }
            if (!result.warnings) {
                result.warnings = [];
            }
            if (!result.createdMatches) {
                result.createdMatches = [];
            }
            
            // Update result state - this will refresh the results section on the page
            setResult(result);
            
            // Simple notification - detailed results are shown on the page
            if (result.failedRows > 0 && result.successfulRows > 0) {
                notify(`Upload completed: ${result.successfulRows} successful, ${result.failedRows} failed. See details below.`, { type: 'warning', autoHideDuration: 5000 });
            } else if (result.failedRows > 0) {
                notify(`Upload completed with ${result.failedRows} error(s). See details below.`, { type: 'error', autoHideDuration: 5000 });
            } else {
                notify(`Successfully created ${result.successfulRows} match(es)`, { type: 'success', autoHideDuration: 3000 });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            // Set error result so it displays on the page
            setResult({
                success: false,
                message: error?.message || 'Failed to upload file',
                totalRows: 0,
                successfulRows: 0,
                failedRows: 1,
                errors: [{
                    row: 0,
                    errors: [error?.message || 'Failed to upload file']
                }],
                warnings: [],
                createdMatches: [],
            });
            notify(error?.message || 'Failed to upload file', { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Upload Matches via Excel
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>How it works:</strong> Upload an Excel file to create multiple matches at once. 
                    The system will validate all data and create matches. Required fields: matchType, matchTypeName 
                    ("HOF Play" or "HOF Select"), startTime, endTime, footballChiefPhone, venueName, cityName, 
                    playerCapacity (determines format like 5v5, 7v7, etc.), venueCost.
                </Typography>
            </Alert>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Step 1: Download Template
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Download the Excel template to see the required format and column structure.
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadTemplate}
                    sx={{ mb: 3 }}
                >
                    Download Excel Template
                </Button>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Step 2: Upload Excel File
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select your Excel file (.xlsx or .xls) containing match data.
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                    <input
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        id="excel-file-input"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="excel-file-input">
                        <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            disabled={uploading}
                        >
                            Select File
                        </Button>
                    </label>
                    {file && (
                        <Typography variant="body2" sx={{ mt: 1, ml: 2, display: 'inline-block' }}>
                            Selected: {file.name}
                        </Typography>
                    )}
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                >
                    {uploading ? 'Uploading...' : 'Upload Matches'}
                </Button>
            </Paper>

            {/* Results Section - Always visible when result exists, refreshes on each upload */}
            {result && (
                <Paper sx={{ p: 3, mt: 3, border: result.failedRows > 0 ? '2px solid' : '1px solid', borderColor: result.failedRows > 0 ? 'error.main' : 'divider' }}>
                    <Typography variant="h5" gutterBottom sx={{ color: result.failedRows > 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                        Upload Results
                    </Typography>
                    <Alert 
                        severity={result.failedRows > 0 ? 'warning' : 'success'} 
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="body2">
                            Total rows: <strong>{result.totalRows}</strong> | 
                            Successful: <strong>{result.successfulRows}</strong> | 
                            Failed: <strong>{result.failedRows}</strong>
                        </Typography>
                        {result.warnings && result.warnings.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Warnings: <strong>{result.warnings.length}</strong>
                            </Typography>
                        )}
                        {result.failedRows > 0 && (
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                ⚠️ Please review the errors below and fix them in your Excel file before re-uploading.
                            </Typography>
                        )}
                    </Alert>

                    {/* Show errors FIRST and prominently if any exist */}
                    {(result.errors?.length > 0 || result.failedRows > 0) && (
                        <Box sx={{ mb: 3 }}>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Errors ({result.errors?.length || result.failedRows || 0}):
                                </Typography>
                                <Typography variant="body2">
                                    The following rows failed to create matches. Please fix these errors in your Excel file and try again.
                                </Typography>
                            </Alert>
                            {result.errors && result.errors.length > 0 ? (
                                <Box>
                                    <TableContainer sx={{ mb: 2 }}>
                                        <Table size="small" sx={{ border: '1px solid', borderColor: 'error.main' }}>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: 'error.light' }}>
                                                    <TableCell><strong>Row #</strong></TableCell>
                                                    <TableCell><strong>Error Message</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {result.errors.map((error: UploadError, index: number) => (
                                                    <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(211, 47, 47, 0.05)' } }}>
                                                        <TableCell><strong>{error.row}</strong></TableCell>
                                                        <TableCell>
                                                            {error.errors && error.errors.length > 0 ? (
                                                                <Box>
                                                                    {error.errors.map((err: string, errIndex: number) => (
                                                                        <Box key={errIndex} sx={{ mb: 2 }}>
                                                                            <Typography variant="body2" color="error" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                                                • {err}
                                                                            </Typography>
                                                                            {/* Show correction steps for this error */}
                                                                            {getCorrectionSteps(err).length > 0 && (
                                                                                <Box sx={{ ml: 3, mt: 1, mb: 2, p: 1.5, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: 1, border: '1px solid', borderColor: 'warning.main' }}>
                                                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'warning.dark', display: 'block', mb: 1 }}>
                                                                                        How to fix:
                                                                                    </Typography>
                                                                                    {getCorrectionSteps(err).map((step: string, stepIndex: number) => (
                                                                                        <Typography key={stepIndex} variant="caption" sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}>
                                                                                            {step}
                                                                                        </Typography>
                                                                                    ))}
                                                                                </Box>
                                                                            )}
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="body2" color="error">
                                                                    Unknown error
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ) : (
                                <Alert severity="warning">
                                    <Typography variant="body2">
                                        {result.failedRows} row(s) failed but error details are not available. Please check the backend logs.
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    )}

                    {result.createdMatches && result.createdMatches.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Successfully Created Matches ({result.createdMatches.length}):
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Match ID</strong></TableCell>
                                            <TableCell><strong>Venue</strong></TableCell>
                                            <TableCell><strong>City</strong></TableCell>
                                            <TableCell><strong>Start Time</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {result.createdMatches.map((match, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{match.matchId}</TableCell>
                                                <TableCell>{match.venueName}</TableCell>
                                                <TableCell>{match.cityName}</TableCell>
                                                <TableCell>{new Date(match.startTime).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}

                    {result.warnings && result.warnings.length > 0 && (
                        <Box>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Warnings ({result.warnings.length}):
                                </Typography>
                                <Typography variant="body2">
                                    These are non-critical issues. Matches were created but you may want to review them.
                                </Typography>
                            </Alert>
                            <List dense>
                                {result.warnings.map((warning, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={`Row ${warning.row}: ${warning.message}`}
                                            primaryTypographyProps={{ variant: 'body2', color: 'warning.main' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}
                </Paper>
            )}
        </Box>
    );
};
