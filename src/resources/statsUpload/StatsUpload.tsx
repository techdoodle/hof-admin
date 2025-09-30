import React, { useState, useCallback } from 'react';
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
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import { apiClient } from '../../utils/apiClient';

interface CsvRow {
    rowIndex: number;
    originalData: any;
    user?: any;
    validationErrors: string[];
    isValid: boolean;
    isEditing?: boolean;
    editedData?: any;
}

interface PreviewData {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    previewData: CsvRow[];
    headers: string[];
}

const steps = ['Upload CSV', 'Review & Edit', 'Confirm Upload'];

export const StatsUpload = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const matchId = searchParams.get('matchId');

    const [activeStep, setActiveStep] = useState(0);
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, setSuccess] = useState(false);
    const [uploadResults, setUploadResults] = useState<any>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv'],
        },
        maxFiles: 1,
    });

    const handlePreviewUpload = async () => {
        if (!file || !matchId) return;

        setLoading(true);
        setError(null);

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvContent = event.target?.result as string;
                const lines = csvContent.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());

                const previewRows = lines.slice(1)
                    .filter(line => line.trim()) // Skip empty lines
                    .map((line, index) => {
                        // Handle quoted values properly
                        const values: string[] = [];
                        let currentValue = '';
                        let insideQuotes = false;

                        for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            if (char === '"') {
                                insideQuotes = !insideQuotes;
                            } else if (char === ',' && !insideQuotes) {
                                values.push(currentValue.trim());
                                currentValue = '';
                            } else {
                                currentValue += char;
                            }
                        }
                        values.push(currentValue.trim()); // Push the last value

                        // Remove quotes from values
                        const cleanValues = values.map(v => v.replace(/^"(.*)"$/, '$1').trim());

                        const rowData = headers.reduce((obj, header, i) => {
                            obj[header] = cleanValues[i] || '';
                            return obj;
                        }, {} as any);

                        return {
                            rowIndex: index + 1,
                            originalData: rowData,
                            editedData: { ...rowData },
                            isEditing: false,
                            validationErrors: [],
                            isValid: true
                        };
                    });

                setPreviewData({
                    totalRows: previewRows.length,
                    validRows: previewRows.length,
                    invalidRows: 0,
                    previewData: previewRows,
                    headers: headers
                });
                setActiveStep(1);
            };
            reader.readAsText(file);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to preview CSV');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRow = (rowIndex: number) => {
        if (!previewData) return;

        const updatedData = { ...previewData };
        const row = updatedData.previewData.find(r => r.rowIndex === rowIndex);
        if (row) {
            row.originalData = { ...row.editedData };
            row.validationErrors = []; // Reset validation errors
            row.isValid = true; // Assume valid after edit (will be validated on server)
        }
        setPreviewData(updatedData);
    };

    const handleFieldChange = (rowIndex: number, field: string, value: any) => {
        if (!previewData) return;

        const updatedData = { ...previewData };
        const row = updatedData.previewData.find(r => r.rowIndex === rowIndex);
        if (row) {
            if (!row.editedData) {
                row.editedData = { ...row.originalData };
            }
            row.editedData[field] = value;
        }
        setPreviewData(updatedData);
    };

    const handleFinalUpload = async () => {
        if (!previewData || !matchId) return;

        setLoading(true);
        setError(null);

        try {
            // Create CSV content from edited data, ensuring proper quoting of values with commas
            const csvContent = [
                previewData.headers.join(','),
                ...previewData.previewData.map(row => {
                    return previewData.headers.map(header => {
                        const value = row.editedData?.[header] || row.originalData[header] || '';
                        // Quote values that contain commas or are dates
                        if (header === 'date' || value.includes(',')) {
                            return `"${value}"`;
                        }
                        return value;
                    }).join(',');
                })
            ].join('\n');

            // Create a new File object from the CSV content
            const csvFile = new File([csvContent], 'edited_stats.csv', { type: 'text/csv' });

            const formData = new FormData();
            formData.append('file', csvFile);
            const response = await apiClient.post(`/match-participant-stats/upload-csv/${matchId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Store upload results for display
            setUploadResults(response.data);

            // Handle response with errors and warnings
            const { failedRows, errors = [], warnings = [], totalRows, successfulRows } = response.data;

            let resultMessage = '';

            if (failedRows > 0 && errors.length > 0) {
                const errorMessages = errors.map((error: any) =>
                    `Row ${error.row}: ${Array.isArray(error.errors) ? error.errors.join(', ') : error.errors || 'Unknown error'}`
                ).join('\n');
                resultMessage += `Failed rows:\n${errorMessages}`;
            }

            if (warnings.length > 0) {
                const warningMessages = warnings.map((warning: any) =>
                    `Row ${warning.row}: ${warning.message}`
                ).join('\n');

                if (resultMessage) {
                    resultMessage += '\n\nWarnings:\n' + warningMessages;
                } else {
                    resultMessage = `Warnings:\n${warningMessages}`;
                }
            }

            // If there are only warnings (no errors), show success with warnings
            if (failedRows === 0 && warnings.length > 0) {
                setError(`Upload completed with warnings:\n\n${resultMessage}\n\nSuccessfully processed ${successfulRows}/${totalRows} rows.`);
                setSuccess(true);
                setActiveStep(2);
            }
            // If there are errors, show error message but don't advance if all failed
            else if (failedRows > 0) {
                if (successfulRows > 0) {
                    // Partial success - show mixed results and advance
                    setError(`Upload completed with issues:\n\n${resultMessage}\n\nSuccessfully processed ${successfulRows}/${totalRows} rows.`);
                    setSuccess(true);
                    setActiveStep(2);
                } else {
                    // Complete failure - don't advance
                    throw new Error(resultMessage);
                }
            }
            // Complete success
            else {
                setSuccess(true);
                setActiveStep(2);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to upload stats');
        } finally {
            setLoading(false);
        }
    };

    const renderUploadStep = () => (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Upload CSV File for Match {matchId}
                </Typography>

                <Box
                    {...getRootProps()}
                    sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: isDragActive ? '#f5f5f5' : 'transparent',
                        '&:hover': {
                            backgroundColor: '#f9f9f9',
                        },
                    }}
                >
                    <input {...getInputProps()} />
                    <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                        {isDragActive
                            ? 'Drop the CSV file here'
                            : 'Drag & drop a CSV file here, or click to select'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Supported format: .csv files only
                    </Typography>
                </Box>

                {file && (
                    <Box mt={2}>
                        <Alert severity="info">
                            Selected file: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                        </Alert>
                    </Box>
                )}

                <Box mt={3}>
                    <Button
                        variant="contained"
                        onClick={handlePreviewUpload}
                        disabled={!file || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        fullWidth
                    >
                        {loading ? 'Processing...' : 'Preview Upload'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );

    const renderPreviewStep = () => {
        if (!previewData) return null;

        return (
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Review CSV Data
                    </Typography>

                    <Box display="inline-flex" gap={2} sx={{ mb: 3 }}>
                        <Box>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {previewData.totalRows}
                                </Typography>
                                <Typography variant="body2">Total Rows</Typography>
                            </Paper>
                        </Box>
                        <Box>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main">
                                    {previewData.validRows}
                                </Typography>
                                <Typography variant="body2">Valid Rows</Typography>
                            </Paper>
                        </Box>
                        <Box>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                                <Typography variant="h4" color="error.main">
                                    {previewData.invalidRows}
                                </Typography>
                                <Typography variant="body2">Invalid Rows</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ minWidth: 70 }}>Row</TableCell>
                                    {previewData.headers.map((header) => {
                                        // Define min widths based on column type
                                        let minWidth = 150; // default width
                                        if (['id', 'matchId'].includes(header)) minWidth = 100;
                                        else if (header === 'date') minWidth = 120;
                                        else if (header === 'name' || header === 'teamName') minWidth = 150;
                                        else if (header === 'phoneNumber') minWidth = 130;
                                        else if (header.toLowerCase().includes('percent')) minWidth = 100;
                                        else if (header.startsWith('total')) minWidth = 120;

                                        return (
                                            <TableCell key={header} sx={{ minWidth }}>
                                                {header}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell sx={{ minWidth: 100 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {previewData.previewData.map((row) => (
                                    <TableRow key={row.rowIndex}>
                                        <TableCell sx={{ minWidth: 70 }}>{row.rowIndex}</TableCell>
                                        {previewData.headers.map((header) => {
                                            // Define min widths based on column type
                                            let minWidth = 150; // default width
                                            if (['id', 'matchId'].includes(header)) minWidth = 100;
                                            else if (header === 'date') minWidth = 120;
                                            else if (header === 'name' || header === 'teamName') minWidth = 150;
                                            else if (header === 'phoneNumber') minWidth = 130;
                                            else if (header.toLowerCase().includes('percent')) minWidth = 100;
                                            else if (header.startsWith('total')) minWidth = 120;

                                            return (
                                                <TableCell key={header} sx={{ minWidth }}>
                                                    {['id', 'date', 'matchId'].includes(header) ? (
                                                        <Typography variant="body2">
                                                            {row.originalData[header] || ''}
                                                        </Typography>
                                                    ) : (
                                                        <TextField
                                                            value={row.editedData?.[header] || row.originalData[header] || ''}
                                                            onChange={(e) => handleFieldChange(row.rowIndex, header, e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                            type={typeof row.originalData[header] === 'number' ? 'number' : 'text'}
                                                        />
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell sx={{ minWidth: 100 }}>
                                            <Button
                                                size="small"
                                                onClick={() => handleSaveRow(row.rowIndex)}
                                                startIcon={<SaveIcon />}
                                            >
                                                Save
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box mt={3} display="flex" gap={2}>
                        <Button
                            variant="outlined"
                            onClick={() => setActiveStep(0)}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleFinalUpload}
                            disabled={loading || previewData.validRows === 0}
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        >
                            {loading ? 'Uploading...' : 'Upload Stats'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    const renderSuccessStep = () => {
        const results = uploadResults || {};
        const hasWarnings = results.warnings && results.warnings.length > 0;
        const hasErrors = results.errors && results.errors.length > 0;

        return (
            <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        Upload {hasErrors && results.successfulRows === 0 ? 'Failed' : 'Completed'}!
                    </Typography>

                    {/* Upload Summary */}
                    {results.totalRows && (
                        <Box display="flex" gap={2} justifyContent="center" sx={{ mb: 3 }}>
                            <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                                <Typography variant="h4" color="primary">
                                    {results.totalRows}
                                </Typography>
                                <Typography variant="body2">Total Rows</Typography>
                            </Paper>
                            <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                                <Typography variant="h4" color="success.main">
                                    {results.successfulRows || 0}
                                </Typography>
                                <Typography variant="body2">Successful</Typography>
                            </Paper>
                            {results.failedRows > 0 && (
                                <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                                    <Typography variant="h4" color="error.main">
                                        {results.failedRows}
                                    </Typography>
                                    <Typography variant="body2">Failed</Typography>
                                </Paper>
                            )}
                            {hasWarnings && (
                                <Paper sx={{ p: 2, textAlign: 'center', minWidth: 100 }}>
                                    <Typography variant="h4" color="warning.main">
                                        {results.warnings.length}
                                    </Typography>
                                    <Typography variant="body2">Warnings</Typography>
                                </Paper>
                            )}
                        </Box>
                    )}

                    {/* Warnings Section */}
                    {hasWarnings && (
                        <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom>Warnings:</Typography>
                            {results.warnings.map((warning: any, index: number) => (
                                <Typography key={index} variant="body2" component="div">
                                    Row {warning.row}: {warning.message}
                                </Typography>
                            ))}
                        </Alert>
                    )}

                    {/* Errors Section */}
                    {hasErrors && (
                        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                            <Typography variant="h6" gutterBottom>Errors:</Typography>
                            {results.errors.map((error: any, index: number) => (
                                <Typography key={index} variant="body2" component="div">
                                    Row {error.row}: {Array.isArray(error.errors) ? error.errors.join(', ') : error.errors || 'Unknown error'}
                                </Typography>
                            ))}
                        </Alert>
                    )}

                    <Typography variant="body1" color="textSecondary" mb={3}>
                        {results.successfulRows > 0
                            ? `Successfully processed ${results.successfulRows} out of ${results.totalRows} rows.`
                            : 'No rows were processed successfully.'
                        }
                    </Typography>

                    <Box display="flex" gap={2} justifyContent="center">
                        <Button
                            variant="contained"
                            onClick={() => navigate('/matches')}
                        >
                            Back to Matches
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setActiveStep(0);
                                setFile(null);
                                setPreviewData(null);
                                setSuccess(false);
                                setUploadResults(null);
                                setError(null);
                            }}
                        >
                            Upload Another
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    if (!matchId) {
        return (
            <Alert severity="error">
                No match ID provided. Please select a match first.
            </Alert>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Upload Match Statistics
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {activeStep === 0 && renderUploadStep()}
            {activeStep === 1 && renderPreviewStep()}
            {activeStep === 2 && renderSuccessStep()}
        </Box>
    );
};
