import React, { useState, useMemo } from 'react';
import {
  ReferenceInput,
  SelectInput,
  NumberInput,
  TextInput,
  useNotify,
  useDataProvider,
  required,
  SimpleForm,
} from 'react-admin';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Paper,
  Alert,
  IconButton,
  Divider,
  TextField,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { format } from 'date-fns';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

interface PreviewMatch {
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
}

export const RecurringMatchCreate: React.FC = () => {
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const [pattern, setPattern] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([{ startTime: '', endTime: '' }]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<any>({});

  // Generate preview of matches
  const previewMatches = useMemo((): PreviewMatch[] => {
    if (!startDate || !endDate || timeSlots.some(slot => !slot.startTime || !slot.endTime)) {
      return [];
    }

    const matches: PreviewMatch[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      let shouldInclude = false;

      if (pattern === 'daily') {
        shouldInclude = true;
      } else if (pattern === 'weekly' || pattern === 'custom') {
        shouldInclude = selectedDays.includes(dayOfWeek);
      }

      if (shouldInclude) {
        for (const slot of timeSlots) {
          if (slot.startTime && slot.endTime) {
            matches.push({
              date: format(current, 'yyyy-MM-dd'),
              startTime: slot.startTime,
              endTime: slot.endTime,
              dayOfWeek: WEEKDAYS[dayOfWeek].label,
            });
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return matches;
  }, [pattern, startDate, endDate, selectedDays, timeSlots]);

  const handleAddTimeSlot = () => {
    setTimeSlots([...timeSlots, { startTime: '', endTime: '' }]);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const handleTimeSlotChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...timeSlots];
    updated[index][field] = value;
    setTimeSlots(updated);
  };

  const handleDayToggle = (dayValue: number) => {
    setSelectedDays(prev =>
      prev.includes(dayValue)
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleReview = (formValues: any) => {
    // Validate before showing confirmation
    if (!startDate || !endDate) {
      notify('Please select start and end dates', { type: 'error' });
      return;
    }

    if (timeSlots.some(slot => !slot.startTime || !slot.endTime)) {
      notify('Please fill in all time slots', { type: 'error' });
      return;
    }

    if ((pattern === 'weekly' || pattern === 'custom') && selectedDays.length === 0) {
      notify('Please select at least one day of the week', { type: 'error' });
      return;
    }

    if (previewMatches.length === 0) {
      notify('No matches would be generated with the current settings', { type: 'error' });
      return;
    }

    // Store form values for use in confirmation dialog
    setFormValues(formValues);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Extract venue and footballChief IDs if they're objects
      const venueId = typeof formValues.venue === 'object' ? formValues.venue?.id : formValues.venue;
      const footballChiefId = typeof formValues.footballChief === 'object' ? formValues.footballChief?.id : formValues.footballChief;
      const matchTypeId = typeof formValues.matchTypeId === 'object' ? formValues.matchTypeId?.id : formValues.matchTypeId;

      const payload = {
        pattern,
        startDate,
        endDate,
        daysOfWeek: pattern !== 'daily' ? selectedDays : undefined,
        timeSlots: timeSlots.filter(slot => slot.startTime && slot.endTime),
        venue: venueId,
        footballChief: footballChiefId,
        matchType: formValues.matchType,
        matchTypeId: matchTypeId || formValues.matchTypeId,
        slotPrice: formValues.slotPrice || 0,
        offerPrice: formValues.offerPrice || 0,
        playerCapacity: formValues.playerCapacity,
        bufferCapacity: formValues.bufferCapacity || 0,
        teamAName: formValues.teamAName || 'Home',
        teamBName: formValues.teamBName || 'Away',
      };

      const result = await dataProvider.custom('admin/matches/recurring', {
        method: 'POST',
        data: payload,
      });

      notify(
        `Successfully created ${result.data.created} matches${result.data.errors?.length > 0 ? ` (${result.data.errors.length} errors)` : ''}`,
        { type: 'success' }
      );

      if (result.data.errors && result.data.errors.length > 0) {
        console.error('Errors creating matches:', result.data.errors);
      }

      setShowConfirmDialog(false);
      // Reset form
      setFormValues({});
      setStartDate('');
      setEndDate('');
      setSelectedDays([]);
      setTimeSlots([{ startTime: '', endTime: '' }]);
      setPattern('daily');
    } catch (error: any) {
      notify(error.message || 'Failed to create recurring matches', { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create Recurring Matches
      </Typography>

      <SimpleForm onSubmit={handleReview}>
        <Box>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Recurrence Pattern
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <TextField
              select
              label="Pattern"
              value={pattern}
              onChange={(e) => setPattern(e.target.value as any)}
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </TextField>
          </Box>
          <Box flex="1 1 300px">
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
          <Box flex="1 1 300px">
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
          </Box>
        </Box>

        {(pattern === 'weekly' || pattern === 'custom') && (
          <>
            <Typography variant="h6" gutterBottom>
              Days of Week
            </Typography>
            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {WEEKDAYS.map(day => (
                <Chip
                  key={day.value}
                  label={day.label}
                  onClick={() => handleDayToggle(day.value)}
                  color={selectedDays.includes(day.value) ? 'primary' : 'default'}
                  variant={selectedDays.includes(day.value) ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </>
        )}

        <Typography variant="h6" gutterBottom>
          Time Slots
        </Typography>
        <Box sx={{ mb: 3 }}>
          {timeSlots.map((slot, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
              <Box flex="1 1 200px">
                <TextField
                  label="Start Time"
                  placeholder="HH:mm (e.g., 14:30)"
                  fullWidth
                  value={slot.startTime}
                  onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                  helperText="Format: HH:mm"
                />
              </Box>
              <Box flex="1 1 200px">
                <TextField
                  label="End Time"
                  placeholder="HH:mm (e.g., 16:30)"
                  fullWidth
                  value={slot.endTime}
                  onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                  helperText="Format: HH:mm"
                />
              </Box>
              {timeSlots.length > 1 && (
                <IconButton
                  onClick={() => handleRemoveTimeSlot(index)}
                  color="error"
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddTimeSlot}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Time Slot
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
          Match Details
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <SelectInput
              source="matchType"
              label="Recording Type"
              choices={[
                { id: 'recorded', name: 'Recorded' },
                { id: 'non_recorded', name: 'Non-Recorded' },
              ]}
              validate={required()}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <ReferenceInput source="matchTypeId" reference="match_types" label="Match Type">
              <SelectInput
                optionText="matchName"
                optionValue="id"
                validate={required()}
                fullWidth
                defaultValue={1}
              />
            </ReferenceInput>
          </Box>
          <Box flex="1 1 300px">
            <ReferenceInput source="venue" reference="venues">
              <SelectInput optionText="name" validate={required()} fullWidth />
            </ReferenceInput>
          </Box>
          <Box flex="1 1 300px">
            <ReferenceInput source="footballChief" reference="chiefs">
              <SelectInput optionText="fullName" validate={required()} fullWidth />
            </ReferenceInput>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
          Pricing
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <NumberInput
              source="slotPrice"
              label="Slot Price (₹)"
              min={0}
              defaultValue={0}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <NumberInput
              source="offerPrice"
              label="Offer Price (₹)"
              min={0}
              defaultValue={0}
              fullWidth
            />
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
          Match Settings
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box flex="1 1 300px">
            <NumberInput
              source="playerCapacity"
              label="Player Capacity"
              min={0}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <NumberInput
              source="bufferCapacity"
              label="Buffer Capacity"
              min={0}
              defaultValue={0}
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <TextInput
              source="teamAName"
              label="Team A Name"
              defaultValue="Home"
              fullWidth
            />
          </Box>
          <Box flex="1 1 300px">
            <TextInput
              source="teamBName"
              label="Team B Name"
              defaultValue="Away"
              fullWidth
            />
          </Box>
        </Box>

        {previewMatches.length > 0 && (
          <Box sx={{ mb: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview ({previewMatches.length} matches will be created)
            </Typography>
            <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
              <Grid container spacing={1}>
                {previewMatches.slice(0, 20).map((match, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Chip
                      label={`${match.dayOfWeek} ${match.date} ${match.startTime}-${match.endTime}`}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                ))}
                {previewMatches.length > 20 && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      ... and {previewMatches.length - 20} more matches
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={previewMatches.length === 0}
          >
            Review & Confirm
          </Button>
        </Box>
        </Box>
      </SimpleForm>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircleIcon color="primary" />
            <Typography variant="h6">Confirm Recurring Matches Creation</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to create <strong>{previewMatches.length} matches</strong>. Please review the details below.
          </Alert>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, fontWeight: 'bold' }}>
            Recurrence Pattern
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography><strong>Pattern:</strong> {pattern.charAt(0).toUpperCase() + pattern.slice(1)}</Typography>
            <Typography><strong>Start Date:</strong> {startDate ? format(new Date(startDate), 'PPP') : '-'}</Typography>
            <Typography><strong>End Date:</strong> {endDate ? format(new Date(endDate), 'PPP') : '-'}</Typography>
            {pattern !== 'daily' && (
              <Typography>
                <strong>Days:</strong> {selectedDays.map(d => WEEKDAYS[d].label).join(', ')}
              </Typography>
            )}
            <Typography>
              <strong>Time Slots:</strong> {timeSlots.filter(s => s.startTime && s.endTime).map(s => `${s.startTime}-${s.endTime}`).join(', ')}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Match Configuration
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography><strong>Venue:</strong> {typeof formValues.venue === 'object' ? formValues.venue?.name : formValues.venue || '-'}</Typography>
            <Typography><strong>Match Type:</strong> {formValues.matchType || '-'}</Typography>
            <Typography><strong>Slot Price:</strong> ₹{formValues.slotPrice || 0}</Typography>
            <Typography><strong>Offer Price:</strong> ₹{formValues.offerPrice || 0}</Typography>
            <Typography><strong>Player Capacity:</strong> {formValues.playerCapacity || '-'}</Typography>
            <Typography><strong>Team A:</strong> {formValues.teamAName || 'Home'}</Typography>
            <Typography><strong>Team B:</strong> {formValues.teamBName || 'Away'}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Generated Matches ({previewMatches.length} total)
          </Typography>
          <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto', bgcolor: 'grey.50' }}>
            <Grid container spacing={1}>
              {previewMatches.map((match, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Box sx={{ p: 1, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight="bold">{match.dayOfWeek}</Typography>
                    <Typography variant="body2">{match.date}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {match.startTime} - {match.endTime}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <></> : <CheckCircleIcon />}
          >
            {isSubmitting ? 'Creating...' : `Confirm & Create ${previewMatches.length} Matches`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

