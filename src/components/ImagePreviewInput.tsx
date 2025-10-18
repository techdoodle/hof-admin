import React, { useState, useEffect } from 'react';
import { useInput } from 'react-admin';
import { Box, Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export const ImagePreviewInput = (props: any) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [openPreview, setOpenPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        field: { onChange, value },
        fieldState: { error: fieldError },
        formState: { isSubmitted }
    } = useInput(props);

    // Set initial preview if value exists
    useEffect(() => {
        if (value && !preview) {
            setPreview(value);
        }
    }, [value]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);

        if (!file) return;

        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Only JPG and PNG files are allowed');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 5MB');
            return;
        }

        // Read and preview file
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setPreview(base64String);
            setOpenPreview(true);
        };
        reader.readAsDataURL(file);
    };

    const handleConfirm = () => {
        onChange(preview);
        setOpenPreview(false);
    };

    const handleCancel = () => {
        setPreview(value); // Revert to current value
        setOpenPreview(false);
    };

    const handleRemove = () => {
        setPreview(null);
        onChange(null);
    };

    return (
        <Box>
            {!preview ? (
                <>
                    <input
                        accept="image/jpeg,image/png"
                        style={{ display: 'none' }}
                        id="banner-upload"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="banner-upload">
                        <Button variant="contained" component="span" color="primary">
                            Upload Banner
                        </Button>
                    </label>
                </>
            ) : (
                <Box>
                    <Box
                        sx={{
                            position: 'relative',
                            width: 'fit-content',
                            mb: 2
                        }}
                    >
                        <img
                            src={preview}
                            alt="Banner preview"
                            style={{
                                maxWidth: '300px',
                                maxHeight: '200px',
                                objectFit: 'contain',
                                borderRadius: '4px'
                            }}
                        />
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <input
                            accept="image/jpeg,image/png"
                            style={{ display: 'none' }}
                            id="banner-replace"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="banner-replace">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<EditIcon />}
                            >
                                Replace
                            </Button>
                        </label>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleRemove}
                            startIcon={<DeleteIcon />}
                        >
                            Remove
                        </Button>
                    </Stack>
                </Box>
            )}

            {error && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                    {error}
                </Typography>
            )}

            <Dialog open={openPreview} maxWidth="md" fullWidth>
                <DialogTitle>Preview Banner</DialogTitle>
                <DialogContent>
                    {preview && (
                        <img
                            src={preview}
                            alt="Banner preview"
                            style={{
                                width: '100%',
                                maxHeight: '500px',
                                objectFit: 'contain'
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color="primary" variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};