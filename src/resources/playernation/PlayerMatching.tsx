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
} from '@mui/material';
import {
  Person as PersonIcon,
  Search as SearchIcon,
  Check as CheckIcon,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load external players from stats system
      const externalResponse = await dataProvider.custom(`admin/playernation/unmapped/${matchId}`, {});
      console.log('[PlayerMatching] unmapped external players response:', externalResponse);
      setExternalPlayers(externalResponse.data || []);

      // Load internal match participants via admin API (includes user details)
      const internalResponse = await dataProvider.custom(`admin/match-participants?matchId=${matchId}`, {});
      console.log('[PlayerMatching] admin match participants response:', internalResponse);

      // Normalize response shape from admin API
      const rowsRaw = internalResponse?.data;
      const rows = Array.isArray(rowsRaw)
        ? rowsRaw
        : (rowsRaw?.items || rowsRaw?.data || []);
      console.log('[PlayerMatching] normalized participants rows:', rows);
      if (!Array.isArray(rows)) {
        console.warn('Unexpected participants response shape:', internalResponse);
      }
      // Fetch user details if only IDs are provided
      const userIds: number[] = Array.from(new Set(rows
        .map((p: any) => (typeof p.user === 'number' ? p.user : (p.user?.id ?? p.userId ?? p.user_id)))
        .filter((id: any) => typeof id === 'number')));
      const userDetailResponses = await Promise.all(userIds.map((id) =>
        dataProvider.getOne('users', { id }).catch(() => ({ data: null }))
      ));
      const usersById = new Map<number, any>();
      userDetailResponses.forEach((res, idx) => {
        const id = userIds[idx];
        if (res && res.data) usersById.set(id, res.data);
      });

      const participants = rows.map((participant: any) => {
        const userId = (typeof participant.user === 'number' ? participant.user : (participant.user?.id ?? participant.userId ?? participant.user_id)) as number;
        const user = (typeof participant.user === 'object' && participant.user) ? participant.user : usersById.get(userId) || {};
        return {
          id: (user.id ?? userId) as number,
          firstName: (user.firstName ?? participant.firstName ?? participant.userFirstName ?? '') as string,
          lastName: (user.lastName ?? participant.lastName ?? participant.userLastName ?? '') as string,
          phoneNumber: (user.phoneNumber ?? participant.phoneNumber ?? participant.userPhoneNumber ?? '') as string,
          jerseyNumber: participant.jerseyNumber as string | undefined,
        } as InternalPlayer;
      });

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
        method: 'POST',
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

  const handleProcessStats = async () => {
    try {
      setSaving(true);
      // Ensure no unmapped players remain on client state
      if (externalPlayers.length > 0) {
        notify('Please finish matching all players before processing stats', { type: 'warning' });
        setSaving(false);
        return;
      }
      await dataProvider.custom(`admin/playernation/process-stats/${matchId}`, {
        method: 'POST',
      });
      notify('Stats processed successfully', { type: 'success' });
      onClose && onClose();
    } catch (e: any) {
      notify(e?.message || 'Failed to process stats', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filteredInternalPlayers = internalPlayers.filter(player => {
    const first = (player.firstName || '').toString();
    const last = (player.lastName || '').toString();
    const phoneRaw = (player.phoneNumber || '').toString();
    const fullName = `${first} ${last}`.trim().toLowerCase();
    const phone = phoneRaw.trim().toLowerCase();
    const search = (searchTerm || '').toString().trim().toLowerCase();
    return fullName.includes(search) || phone.includes(search);
  });

  const getPlayerDisplayName = (player: InternalPlayer) => {
    const first = player.firstName || '-';
    const last = player.lastName || '';
    const phone = player.phoneNumber || '-';
    return `${first} ${last}`.trim() + ` (${phone})`;
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
          Match detected players with your registered players
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {externalPlayers.length === 0 ? (
          <Alert severity="success">
            All players have been successfully matched!
          </Alert>
        ) : (
          <Grid container spacing={3}>
              {/* External Players (Stats System) */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Detected Players
              </Typography>
              <List>
                {externalPlayers.map((player) => {
                  const matchedPlayer = getMatchedPlayer(player.externalPlayerId);
                  return (
                    <Card key={player.externalPlayerId} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {player.thumbnailUrls && player.thumbnailUrls[0] ? (
                            <Box
                              component="img"
                              src={player.thumbnailUrls[0]}
                              alt={player.externalName}
                              sx={{
                                mr: 2,
                                width: { xs: 120, sm: 160 },
                                height: 'auto',
                                borderRadius: 1,
                                objectFit: 'cover',
                                boxShadow: 1,
                              }}
                            />
                          ) : (
                            <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
                              <PersonIcon />
                            </Avatar>
                          )}
                          <Box>
                            {/* Intentionally hide PlayerNation-provided name to avoid bias */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`Team ${player.externalTeam}`} 
                                size="small" 
                                color={player.externalTeam === 'A' ? 'primary' : 'secondary'}
                              />
                              {(() => {
                                // Show goals/assists if present in payload (defensive access)
                                const goals = (player as any)?.stats?.goals?.totalCount;
                                const assists = (player as any)?.stats?.assists?.totalCount;
                                return (
                                  <>
                                    {typeof goals !== 'undefined' && (
                                      <Chip label={`Goals: ${goals}`} size="small" color="default" />
                                    )}
                                    {typeof assists !== 'undefined' && (
                                      <Chip label={`Assists: ${assists}`} size="small" color="default" />
                                    )}
                                  </>
                                );
                              })()}
                            </Box>
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
                          renderOption={(props, option) => {
                            const { key, ...rest } = props as any;
                            return (
                            <ListItem key={key} {...rest}>
                              <ListItemAvatar>
                                <Avatar>
                                  <PersonIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={`${option.firstName || '-'} ${option.lastName || ''}`}
                                secondary={`${option.phoneNumber || '-'} ${option.jerseyNumber ? `#${option.jerseyNumber}` : ''}`}
                              />
                            </ListItem>
                          );
                        }}
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
        {externalPlayers.length === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleProcessStats}
            disabled={saving}
          >
            {saving ? 'Processing...' : 'Process Stats'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PlayerMatching;
