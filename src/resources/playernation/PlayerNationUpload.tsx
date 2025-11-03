import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  VideoCall as VideoCallIcon,
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDataProvider, useNotify } from 'react-admin';
import VideoRecorder from './VideoRecorder';

interface Player {
  id: string;
  name: string;
  hofPlayerId?: string;
  phoneNumber?: string;
  jerseyNumber?: string;
  goal?: number;
  ownGoal?: number;
  playerVideo?: string;
  playerImages?: string[];
  team: string;
}

interface MatchInfo {
  teamA: string;
  teamB: string;
  matchDate: string;
  matchLink: string;
  matchFormat?: string;
  matchDuration?: number;
  matchName?: string;
  teamAScore?: number;
  teamBScore?: number;
}

const PlayerNationUpload: React.FC = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get('matchId');
  const navigate = useNavigate();
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [matchInfo, setMatchInfo] = useState<MatchInfo>({
    teamA: '',
    teamB: '',
    matchDate: '',
    matchLink: '',
    matchFormat: 'ELEVEN_VS_ELEVEN',
    matchDuration: 90,
    teamAScore: 0,
    teamBScore: 0,
  });
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamATab, setTeamATab] = useState(0);
  const [uploadingVideos, setUploadingVideos] = useState<Set<string>>(new Set());
  const [videoRecorderOpen, setVideoRecorderOpen] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('');
  const steps = ['Team Assignment', 'Match Info', 'Players', 'Review & Submit'];

  useEffect(() => {
    loadMatchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const loadMatchParticipants = async () => {
    try {
      setLoading(true);
      
      // Validate matchId
      if (!matchId || isNaN(parseInt(matchId))) {
        notify('Invalid match ID. Please go back and try again.', { type: 'error' });
        return;
      }
      
      console.log('Loading participants for match ID:', matchId);
      
      // Load match details and participants in parallel
      const [matchResponse, participantsResponse] = await Promise.all([
        dataProvider.getOne('matches', { id: parseInt(matchId) }),
        dataProvider.getList('match-participants', {
          filter: { matchId: parseInt(matchId) },
          pagination: { page: 1, perPage: 100 },
          sort: { field: 'id', order: 'ASC' },
        })
      ]);

      const match = matchResponse.data;
      setMatchDetails(match);

      console.log('Match data:', match);
      console.log('Participants data:', participantsResponse.data);
      console.log('Sample participant structure:', participantsResponse.data[0]);

      // Auto-populate match info from match details
      // Format date for datetime-local input (YYYY-MM-DDTHH:MM)
      const matchStartTime = new Date(match.startTime);
      const year = matchStartTime.getFullYear();
      const month = String(matchStartTime.getMonth() + 1).padStart(2, '0');
      const day = String(matchStartTime.getDate()).padStart(2, '0');
      const hours = String(matchStartTime.getHours()).padStart(2, '0');
      const minutes = String(matchStartTime.getMinutes()).padStart(2, '0');
      const matchDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      
      console.log('Match start time:', match.startTime);
      console.log('Formatted match date:', matchDate);
      
      // Use team names from match details instead of extracting from participants
      const teamAName = match.teamAName || 'Home';
      const teamBName = match.teamBName || 'Away';
      
      console.log('Team names from match:', { teamAName, teamBName });

      // Derive match format from playerCapacity (total players → per team)
      const deriveFormat = (capacity: number | undefined) => {
        const perTeam = capacity && capacity > 0 ? Math.round(capacity / 2) : 11;
        const size = Math.min(11, Math.max(5, perTeam));
        const map: Record<number, string> = {
          5: 'FIVE_VS_FIVE',
          6: 'SIX_VS_SIX',
          7: 'SEVEN_VS_SEVEN',
          8: 'EIGHT_VS_EIGHT',
          9: 'NINE_VS_NINE',
          10: 'TEN_VS_TEN',
          11: 'ELEVEN_VS_ELEVEN',
        };
        return map[size] || 'ELEVEN_VS_ELEVEN';
      };

      setMatchInfo({
        teamA: teamAName,
        teamB: teamBName,
        matchDate: matchDate,
        matchLink: '', // User needs to provide this
        matchFormat: deriveFormat(match.playerCapacity),
        matchDuration: 90,
        teamAScore: match.teamAScore || 0,
        teamBScore: match.teamBScore || 0,
      });

      // Get unique user IDs from participants
      const userIds = Array.from(new Set(participantsResponse.data.map((p: any) => p.user)));
      console.log('User IDs to fetch:', userIds);

      // Fetch user details for all participants
      const userPromises = userIds.map(userId => 
        dataProvider.getOne('users', { id: userId }).catch(error => {
          console.error(`Failed to fetch user ${userId}:`, error);
          return { data: null };
        })
      );

      const userResponses = await Promise.all(userPromises);
      const users = userResponses.reduce((acc, response) => {
        if (response.data) {
          acc[response.data.id] = response.data;
        }
        return acc;
      }, {} as Record<number, any>);

      console.log('Fetched users:', users);
      console.log('Raw participants data:', participantsResponse.data);
      console.log('Sample raw participant:', participantsResponse.data[0]);

      // Create participants with user data
      const participants = participantsResponse.data
        .filter((participant: any) => {
          const user = users[participant.user];
          const hasUser = !!user;
          console.log(`Participant ${participant.id} has user data:`, hasUser, 'user:', user);
          return hasUser;
        })
        .map((participant: any) => {
          const user = users[participant.user];
          const playerId = `player-${participant.id}`;
          
          return {
            id: playerId,
            name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown Player',
            hofPlayerId: user?.id?.toString() || '',
            phoneNumber: user?.phoneNumber || '',
            jerseyNumber: participant.jerseyNumber || '',
            goal: 0,
            ownGoal: 0,
            team: participant.teamName, // Use actual team name instead of 'A'/'B'
            playerVideo: participant.playernationVideoUrl || '', // Get video URL from database
          };
        });

      console.log('Processed participants:', participants);
      console.log('Sample participant with video URL:', participants[0]?.playerVideo);
      setPlayers(participants);

      if (participants.length === 0) {
        notify('No valid participants found for this match', { type: 'warning' });
        return;
      }
    } catch (error) {
      console.error('Error loading match data:', error);
      notify('Failed to load match data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validate team assignment step (step 0)
    if (activeStep === 0) {
      const unassignedPlayers = players.filter(p => !p.team || p.team === 'Unassigned');
      if (unassignedPlayers.length > 0) {
        notify(`${unassignedPlayers.length} player(s) still need to be assigned to a team`, { type: 'error' });
        return;
      }
    }
    
    // Validate match info step (step 1)
    if (activeStep === 1) {
      const requiredFields = ['matchDate', 'matchLink'];
      const missingFields = requiredFields.filter(field => !matchInfo[field as keyof MatchInfo]?.toString().trim());
      
      if (missingFields.length > 0) {
        const fieldLabels = {
          matchDate: 'Match Date',
          matchLink: 'Match Video URL'
        };
        const missingLabels = missingFields.map(field => fieldLabels[field as keyof typeof fieldLabels]);
        notify(`Please fill in the required fields: ${missingLabels.join(', ')}`, { type: 'error' });
        return;
      }
    }
    
    // Validate players step (step 2) - check if all players have videos uploaded
    if (activeStep === 2) {
      const playersWithoutVideos = players.filter(p => !p.playerVideo);
      if (playersWithoutVideos.length > 0) {
        notify(`${playersWithoutVideos.length} player(s) still need to have their 360° videos uploaded`, { type: 'error' });
        return;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleMatchInfoChange = (field: keyof MatchInfo, value: any) => {
    setMatchInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePlayerChange = (playerId: string, field: keyof Player, value: any) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, [field]: value } : player
    ));
  };

  const openVideoRecorder = (playerId: string) => {
    setCurrentPlayerId(playerId);
    setVideoRecorderOpen(true);
  };

  const clearUploadedVideo = async (playerId: string) => {
    try {
      const participantId = parseInt(playerId.replace('player-', ''));
      
      // Clear from database
      await dataProvider.custom('admin/playernation/clear-video', {
        method: 'POST',
        data: {
          participantId: participantId,
          matchId: parseInt(matchId || '0')
        }
      });
      
      // Clear from local state
      handlePlayerChange(playerId, 'playerVideo', '');
      notify('Video cleared successfully', { type: 'success' });
    } catch (error) {
      console.error('Error clearing video:', error);
      notify('Failed to clear video', { type: 'error' });
    }
  };

  // Allow uploading an existing local video file instead of recording
  const handleLocalFileSelected = async (playerId: string, file: File | null) => {
    try {
      if (!file) return;
      setUploadingVideos(prev => new Set(prev).add(playerId));

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const base64Content = base64Data.split(',')[1];
          const participantId = parseInt(playerId.replace('player-', ''));

          // Use original filename if available, fallback to generated
          const safeName = players.find(p => p.id === playerId)?.name?.replace(/\s+/g, '-') || 'player';
          const fileName = file.name || `${safeName}-${Date.now()}.webm`;
          const contentType = file.type || 'video/webm';

          // Upload through backend proxy
          const response = await dataProvider.custom('admin/playernation/upload-video', {
            method: 'POST',
            data: {
              fileName,
              contentType,
              base64Data: base64Content,
              participantId,
              matchId: parseInt(matchId || '0'),
            },
            timeout: 120000,
          });

          // Update local state with returned URL
          handlePlayerChange(playerId, 'playerVideo', response.data.downloadUrl);
          notify('Video uploaded successfully', { type: 'success' });
        } catch (err) {
          console.error('Local upload error:', err);
          notify('Failed to upload selected video', { type: 'error' });
        } finally {
          setUploadingVideos(prev => {
            const s = new Set(prev);
            s.delete(playerId);
            return s;
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Local file select error:', error);
      notify('Failed to process selected video', { type: 'error' });
      setUploadingVideos(prev => {
        const s = new Set(prev);
        s.delete(playerId);
        return s;
      });
    }
  };

  const handleVideoRecorded = async (videoBlob: Blob, fileName: string) => {
    try {
      setUploadingVideos(prev => new Set(prev).add(currentPlayerId));
      
      // Convert blob to base64 for upload through backend
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const base64Content = base64Data.split(',')[1]; // Remove data:video/webm;base64, prefix
          
          // Upload through backend proxy with extended timeout
          const response = await dataProvider.custom('admin/playernation/upload-video', {
            method: 'POST',
            data: {
              fileName,
              contentType: 'video/webm',
              base64Data: base64Content,
              participantId: parseInt(currentPlayerId.replace('player-', '')), // Extract participant ID
              matchId: parseInt(matchId || '0')
            },
            timeout: 120000, // 2 minutes for video uploads
          });

          // Update player with video URL
          handlePlayerChange(currentPlayerId, 'playerVideo', response.data.downloadUrl);
          
          notify('Video uploaded successfully', { type: 'success' });

        } catch (error) {
          console.error('Upload error:', error);
          notify('Failed to upload video', { type: 'error' });
        } finally {
          setUploadingVideos(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentPlayerId);
            return newSet;
          });
        }
      };
      
      reader.readAsDataURL(videoBlob);

    } catch (error) {
      console.error('Upload error:', error);
      notify('Failed to upload video', { type: 'error' });
      setUploadingVideos(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentPlayerId);
        return newSet;
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Group players by team
      const teamAPlayers = players
        .filter(p => p.team === matchInfo.teamA)
        .map(p => ({
          name: p.name,
          hofPlayerId: p.hofPlayerId,
          playerVideo: p.playerVideo,
          playerImages: p.playerImages || [],
          goal: p.goal || 0,
          ownGoal: p.ownGoal || 0,
        }));
      
      const teamBPlayers = players
        .filter(p => p.team === matchInfo.teamB)
        .map(p => ({
          name: p.name,
          hofPlayerId: p.hofPlayerId,
          playerVideo: p.playerVideo,
          playerImages: p.playerImages || [],
          goal: p.goal || 0,
          ownGoal: p.ownGoal || 0,
        }));
      
      // Normalize match date to ISO UTC with 'Z'
      const matchDateIso = matchInfo.matchDate ? new Date(matchInfo.matchDate).toISOString() : '';

      // Normalize match link to include protocol
      let normalizedLink = matchInfo.matchLink?.trim() || '';
      if (normalizedLink && !/^https?:\/\//i.test(normalizedLink)) {
        normalizedLink = `https://${normalizedLink}`;
      }

      if (!normalizedLink) {
        notify('Match Video URL is required', { type: 'error' });
        setLoading(false);
        return;
      }

      const payload = {
        ...matchInfo,
        matchDate: matchDateIso,
        matchLink: normalizedLink,
        players: {
          teamA: teamAPlayers,
          teamB: teamBPlayers,
        },
      };

      console.log('=== FRONTEND PAYLOAD DEBUG ===');
      console.log('Match Info:', matchInfo);
      console.log('Team A Players:', teamAPlayers);
      console.log('Team B Players:', teamBPlayers);
      console.log('Complete Payload:', JSON.stringify(payload, null, 2));
      console.log('=== END FRONTEND DEBUG ===');

      await dataProvider.custom(`admin/playernation/submit/${parseInt(matchId!)}`, {
        method: 'POST',
        data: payload,
      });

      notify('Match submitted to PlayerNation successfully', { type: 'success' });
      navigate(`/matches/${matchId}`);
    } catch (error) {
      notify('Failed to submit match to PlayerNation', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const saveAssignment = async (participantId: number, newTeam: string) => {
    try {
      await dataProvider.custom(`match-participants/${participantId}/team-name`, {
        method: 'PUT',
        data: { teamName: newTeam },
      });
      setPlayers(prev => prev.map(p => p.id === `player-${participantId}` ? { ...p, team: newTeam } : p));
    } catch (e: any) {
      notify(e.message || 'Failed to update team', { type: 'error' });
    }
  };

  const renderTeamAssignmentStep = () => {
    const unassignedPlayers = players.filter(p => !p.team || p.team === 'Unassigned');
    
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Assign Teams
        </Typography>
        
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Match Teams:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip label={matchInfo.teamA} color="primary" />
            <Chip label={matchInfo.teamB} color="secondary" />
          </Box>
        </Box>
        
        {unassignedPlayers.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {unassignedPlayers.length} player(s) still need to be assigned to a team before proceeding.
          </Alert>
        )}
        
        <Alert severity="info" sx={{ mb: 2 }}>
          Select a team for each participant. All players must be assigned before submission.
        </Alert>
        
        <Grid container spacing={2}>
          {players.map((p) => (
            <Grid item xs={12} sm={6} key={p.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography sx={{ flexGrow: 1 }}>{p.name}</Typography>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Team</InputLabel>
                  <Select
                    label="Team"
                    value={p.team || ''}
                    onChange={(e) => {
                      const participantId = parseInt(p.id.replace('player-', ''));
                      saveAssignment(participantId, String(e.target.value));
                    }}
                  >
                    <MenuItem value={matchInfo.teamA}>{matchInfo.teamA}</MenuItem>
                    <MenuItem value={matchInfo.teamB}>{matchInfo.teamB}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderMatchInfoStep = () => (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Match Information
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Team names are read-only and taken from your match data. 
          Match date and scores are pre-populated but can be edited if needed. 
          The match video URL is required for PlayerNation processing.
        </Typography>
      </Alert>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Team A Name"
            value={matchInfo.teamA}
            InputProps={{ readOnly: true }}
            helperText="Read-only - from match data"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Team B Name"
            value={matchInfo.teamB}
            InputProps={{ readOnly: true }}
            helperText="Read-only - from match data"
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Match Date"
            type="datetime-local"
            value={matchInfo.matchDate}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
            helperText={matchInfo.matchDate ? "Read-only - from match data" : "Required field"}
            error={!matchInfo.matchDate}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Match Format</InputLabel>
            <Select value={matchInfo.matchFormat} disabled>
              <MenuItem value="FIVE_VS_FIVE">5 vs 5</MenuItem>
              <MenuItem value="SIX_VS_SIX">6 vs 6</MenuItem>
              <MenuItem value="SEVEN_VS_SEVEN">7 vs 7</MenuItem>
              <MenuItem value="EIGHT_VS_EIGHT">8 vs 8</MenuItem>
              <MenuItem value="NINE_VS_NINE">9 vs 9</MenuItem>
              <MenuItem value="TEN_VS_TEN">10 vs 10</MenuItem>
              <MenuItem value="ELEVEN_VS_ELEVEN">11 vs 11</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Match Video URL"
            value={matchInfo.matchLink}
            onChange={(e) => handleMatchInfoChange('matchLink', e.target.value)}
            placeholder="https://example.com/match-video.mp4"
            helperText={!matchInfo.matchLink ? "Required field - Enter the full match video URL" : "Enter the full match video URL"}
            error={!matchInfo.matchLink}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Team A Score"
            type="number"
            value={matchInfo.teamAScore}
            onChange={(e) => handleMatchInfoChange('teamAScore', parseInt(e.target.value) || 0)}
            helperText="Pre-populated from match data"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Team B Score"
            type="number"
            value={matchInfo.teamBScore}
            onChange={(e) => handleMatchInfoChange('teamBScore', parseInt(e.target.value) || 0)}
            helperText="Pre-populated from match data"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderPlayersStep = () => {
    const playersWithoutVideos = players.filter(p => !p.playerVideo);
    
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Player Information & Video Upload
        </Typography>
        
        {playersWithoutVideos.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {playersWithoutVideos.length} player(s) still need to have their 360° videos uploaded before proceeding.
          </Alert>
        )}
        
        <Alert severity="info" sx={{ mb: 3 }}>
          ⚠️ Save each video individually to avoid data loss. Upload 360° videos for better player detection.
        </Alert>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={teamATab} onChange={(_, newValue) => setTeamATab(newValue)}>
          <Tab label={`${matchInfo.teamA} (${players.filter(p => p.team === matchInfo.teamA).length} players)`} />
          <Tab label={`${matchInfo.teamB} (${players.filter(p => p.team === matchInfo.teamB).length} players)`} />
        </Tabs>
      </Box>

      {players
        .filter(p => p.team === (teamATab === 0 ? matchInfo.teamA : matchInfo.teamB))
        .map((player) => (
          <Accordion key={player.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {player.name} {player.jerseyNumber && `#${player.jerseyNumber}`}
                </Typography>
                <Chip 
                  label={player.team} 
                  color={player.team === matchInfo.teamA ? 'primary' : 'secondary'}
                  size="small"
                />
                {player.playerVideo && (
                  <CheckCircleIcon color="success" sx={{ ml: 1 }} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Goals"
                    type="number"
                    value={player.goal}
                    onChange={(e) => handlePlayerChange(player.id, 'goal', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Own Goals"
                    type="number"
                    value={player.ownGoal}
                    onChange={(e) => handlePlayerChange(player.id, 'ownGoal', parseInt(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={player.playerVideo ? <CheckCircleIcon /> : <VideoCallIcon />}
                      onClick={() => openVideoRecorder(player.id)}
                      disabled={uploadingVideos.has(player.id)}
                      color={player.playerVideo ? 'success' : 'primary'}
                    >
                      {uploadingVideos.has(player.id) ? (
                        <CircularProgress size={20} />
                      ) : player.playerVideo ? (
                        'Video Uploaded'
                      ) : (
                        'Upload 360° Video'
                      )}
                    </Button>
                    {/* Upload from device */}
                    <input
                      id={`file-input-${player.id}`}
                      type="file"
                      accept="video/webm,video/mp4,video/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleLocalFileSelected(player.id, e.target.files?.[0] || null)}
                    />
                    <label htmlFor={`file-input-${player.id}`}>
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={uploadingVideos.has(player.id)}
                      >
                        Upload from device
                      </Button>
                    </label>
                    {player.playerVideo && (
                      <>
                        <Chip
                          label="Video Ready"
                          color="success"
                          size="small"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          color="warning"
                          onClick={() => clearUploadedVideo(player.id)}
                        >
                          Retake
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  };

  const renderReviewStep = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Review & Submit
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Match Details</Typography>
          <Typography><strong>Teams:</strong> {matchInfo.teamA} vs {matchInfo.teamB}</Typography>
          <Typography><strong>Date:</strong> {matchInfo.matchDate}</Typography>
          <Typography><strong>Format:</strong> {matchInfo.matchFormat}</Typography>
          <Typography><strong>Score:</strong> {matchInfo.teamAScore} - {matchInfo.teamBScore}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Players Summary</Typography>
          <Typography>
            <strong>{matchInfo.teamA}:</strong> {players.filter(p => p.team === matchInfo.teamA).length} players
            ({players.filter(p => p.team === matchInfo.teamA && p.playerVideo).length} with videos)
          </Typography>
          <Typography>
            <strong>{matchInfo.teamB}:</strong> {players.filter(p => p.team === matchInfo.teamB).length} players
            ({players.filter(p => p.team === matchInfo.teamB && p.playerVideo).length} with videos)
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  // Show error if no valid matchId
  if (!matchId || isNaN(parseInt(matchId))) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom color="error">
          Invalid Match ID
        </Typography>
        <Typography variant="body1" gutterBottom>
          No valid match ID provided. Please go back to the match details page and try again.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/matches')}
          sx={{ mt: 2 }}
        >
          Back to Matches
        </Button>
      </Box>
    );
  }

  if (loading && (!matchDetails || players.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading match data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Upload Match to PlayerNation
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && renderTeamAssignmentStep()}
      {activeStep === 1 && renderMatchInfoStep()}
      {activeStep === 2 && renderPlayersStep()}
      {activeStep === 3 && renderReviewStep()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (activeStep === 0) {
              const unassigned = players.some(p => !p.team || p.team === 'Unassigned');
              if (unassigned) {
                notify('Please assign a team to all players before proceeding', { type: 'warning' });
                return;
              }
            }
            if (activeStep === steps.length - 1) {
              handleSubmit();
            } else {
              handleNext();
            }
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 
           activeStep === steps.length - 1 ? 'Submit to PlayerNation' : 'Next'}
        </Button>
      </Box>

      {/* Video Recorder Dialog */}
      <VideoRecorder
        open={videoRecorderOpen}
        onClose={() => setVideoRecorderOpen(false)}
        onVideoRecorded={handleVideoRecorded}
        playerName={players.find(p => p.id === currentPlayerId)?.name || 'Player'}
      />
    </Box>
  );
};

export default PlayerNationUpload;
