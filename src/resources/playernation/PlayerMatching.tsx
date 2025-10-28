import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Autocomplete,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDataProvider, useNotify } from 'react-admin';

interface PlayerNationPlayer {
  id: number;
  externalPlayerId: string;
  externalName: string;
  externalTeam: string;
  thumbnailUrls: string[];
  internalPlayerId?: number;
  internalPhone?: string;
  status: 'UNMATCHED' | 'MATCHED' | 'IGNORED';
}

interface InternalPlayer {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  jerseyNumber?: string;
}

interface PlayerMatchingProps {
  matchId: number;
  onClose?: () => void;
}

const PlayerMatching: React.FC<PlayerMatchingProps> = ({ matchId, onClose }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [externalPlayers, setExternalPlayers] = useState<PlayerNationPlayer[]>([]);
  const [internalPlayers, setInternalPlayers] = useState<InternalPlayer[]>([]);
  const [mappings, setMappings] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [matchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load external players from PlayerNation
      const externalResponse = await dataProvider.custom(`admin/playernation/unmapped/${matchId}`, {});
      setExternalPlayers(externalResponse.data || []);

      // Load internal match participants
      const internalResponse = await dataProvider.getList('match-participants', {
        filter: { matchId },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'id', order: 'ASC' },
      });

      const participants = internalResponse.data.map((participant: any) => ({
        id: participant.user.id,
        firstName: participant.user.firstName,
        lastName: participant.user.lastName,
        phoneNumber: participant.user.phoneNumber,
        jerseyNumber: participant.jerseyNumber,
      }));

      setInternalPlayers(participants);
    } catch (error) {
      notify('Failed to load player data', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMappingChange = (externalPlayerId: string, internalPlayerId: number | null) => {
    const newMappings = new Map(mappings);
    if (internalPlayerId) {
      newMappings.set(externalPlayerId, internalPlayerId);
    } else {
      newMappings.delete(externalPlayerId);
    }
    setMappings(newMappings);
  };

  const handleSaveMappings = async () => {
    try {
      setSaving(true);
      
      const mappingData = Array.from(mappings.entries()).map(([externalPlayerId, internalPlayerId]) => {
        const internalPlayer = internalPlayers.find(p => p.id === internalPlayerId);
        return {
          externalPlayerId,
          internalPlayerId,
          internalPhone: internalPlayer?.phoneNumber || '',
        };
      });

      await dataProvider.custom(`admin/playernation/save-mappings/${matchId}`, {
        data: mappingData,
      });

      notify('Player mappings saved successfully', { type: 'success' });
      loadData(); // Reload to refresh status
    } catch (error) {
      notify('Failed to save mappings', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filteredInternalPlayers = internalPlayers.filter(player => {
    const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
    const phone = player.phoneNumber.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || phone.includes(search);
  });

  const getPlayerDisplayName = (player: InternalPlayer) => {
    return `${player.firstName} ${player.lastName} (${player.phoneNumber})`;
  };

  const getMatchedPlayer = (externalPlayerId: string) => {
    const internalPlayerId = mappings.get(externalPlayerId);
    return internalPlayers.find(p => p.id === internalPlayerId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Dialog open maxWidth="lg" fullWidth>
      <DialogTitle>
        Player Matching
        <Typography variant="body2" color="text.secondary">
          Match PlayerNation detected players with your registered players
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {externalPlayers.length === 0 ? (
          <Alert severity="success">
            All players have been successfully matched!
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {/* External Players (PlayerNation) */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                PlayerNation Detected Players
              </Typography>
              <List>
                {externalPlayers.map((player) => {
                  const matchedPlayer = getMatchedPlayer(player.externalPlayerId);
                  return (
                    <Card key={player.externalPlayerId} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={player.thumbnailUrls[0]} 
                            sx={{ mr: 2, width: 56, height: 56 }}
                          >
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{player.externalName}</Typography>
                            <Chip 
                              label={`Team ${player.externalTeam}`} 
                              size="small" 
                              color={player.externalTeam === 'A' ? 'primary' : 'secondary'}
                            />
                          </Box>
                        </Box>
                        
                        <Autocomplete
                          options={filteredInternalPlayers}
                          getOptionLabel={getPlayerDisplayName}
                          value={matchedPlayer || null}
                          onChange={(_, newValue) => 
                            handleMappingChange(player.externalPlayerId, newValue?.id || null)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Match with registered player"
                              placeholder="Search by name or phone number"
                              size="small"
                            />
                          )}
                          renderOption={(props, option) => (
                            <ListItem {...props}>
                              <ListItemAvatar>
                                <Avatar>
                                  <PersonIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`${option.firstName} ${option.lastName}`}
                                secondary={`${option.phoneNumber} ${option.jerseyNumber ? `#${option.jerseyNumber}` : ''}`}
                              />
                            </ListItem>
                          )}
                        />
                        
                        {matchedPlayer && (
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <CheckIcon color="success" sx={{ mr: 1 }} />
                            <Typography variant="body2" color="success.main">
                              Matched with {matchedPlayer.firstName} {matchedPlayer.lastName}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </List>
            </Grid>

            {/* Internal Players */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Registered Players
              </Typography>
              
              <TextField
                fullWidth
                label="Search players"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ mb: 2 }}
              />
              
              <List>
                {filteredInternalPlayers.map((player) => {
                  const isMapped = Array.from(mappings.values()).includes(player.id);
                  return (
                    <ListItem key={player.id} sx={{ 
                      bgcolor: isMapped ? 'action.selected' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                    }}>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${player.firstName} ${player.lastName}`}
                        secondary={`${player.phoneNumber} ${player.jerseyNumber ? `#${player.jerseyNumber}` : ''}`}
                      />
                      {isMapped && (
                        <CheckIcon color="success" />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {externalPlayers.length > 0 && (
          <Button
            variant="contained"
            onClick={handleSaveMappings}
            disabled={saving || mappings.size === 0}
            startIcon={saving ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            {saving ? 'Saving...' : `Save ${mappings.size} Mappings`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PlayerMatching;
