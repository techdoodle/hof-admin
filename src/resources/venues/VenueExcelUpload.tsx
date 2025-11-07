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
} from '@mui/material';
import { useNotify } from 'react-admin';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';

interface UploadResult {
    created: number;
    updated: number;
    errors: string[];
}

export const VenueExcelUpload = () => {
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
            setResult(null);
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                notify('Please log in to download the template', { type: 'error' });
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/admin/venues/excel-template`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download template');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'venue_template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            notify('Template downloaded successfully', { type: 'success' });
        } catch (error) {
            notify('Failed to download template', { type: 'error' });
        }
    };

    const handleUpload = async () => {
        if (!file) {
            notify('Please select a file first', { type: 'error' });
            return;
        }

        const confirmed = window.confirm(
            '⚠️ WARNING: This will update existing venues (matched by phone number) and create new ones. Existing venues not in the Excel file will remain unchanged. Are you sure you want to continue?'
        );

        if (!confirmed) {
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            const token = localStorage.getItem('token');
            
            if (!token) {
                notify('Please log in to upload venues', { type: 'error' });
                return;
            }
            
            const response = await fetch(`${apiUrl}/admin/venues/upload-excel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
                throw new Error(errorData.message || 'Upload failed');
            }

            const result = await response.json();
            setResult(result);
            
            if (result.errors && result.errors.length > 0) {
                notify(`Upload completed with ${result.errors.length} error(s)`, { type: 'warning' });
            } else {
                const total = (result.created || 0) + (result.updated || 0);
                const message = result.updated 
                    ? `Successfully processed ${total} venues (${result.created} created, ${result.updated} updated)`
                    : `Successfully created ${result.created} venues`;
                notify(message, { type: 'success' });
            }
        } catch (error: any) {
            notify(error?.message || 'Failed to upload file', { type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Upload Venues via Excel
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>How it works:</strong> Venues are matched by phone number. If a venue with the same phone number exists, it will be updated. 
                    New venues will be created. Existing venues not in the Excel file will remain unchanged. This preserves venue IDs and maintains links to existing matches.
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
                    Download Template
                </Button>

                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Step 2: Upload Excel File
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select your Excel file (.xlsx or .xls) containing venue data.
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
                    {uploading ? 'Uploading...' : 'Upload Venues'}
                </Button>
            </Paper>

            {result && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Upload Results
                    </Typography>
                    <Alert severity={result.errors.length > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            Successfully processed: <strong>{result.created || 0}</strong> created, <strong>{result.updated || 0}</strong> updated
                        </Typography>
                        {result.errors.length > 0 && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Errors: <strong>{result.errors.length}</strong>
                            </Typography>
                        )}
                    </Alert>

                    {result.errors.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" gutterBottom>
                                Errors:
                            </Typography>
                            <List dense>
                                {result.errors.map((error, index) => (
                                    <ListItem key={index}>
                                        <ListItemText
                                            primary={error}
                                            primaryTypographyProps={{ variant: 'body2', color: 'error' }}
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

