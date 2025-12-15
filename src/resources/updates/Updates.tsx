import React, { useEffect, useState } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, Divider, CircularProgress } from '@mui/material';

interface AdminUpdateEntry {
  version: string;
  date: string;
  whatChanged: string[];
  howToTest: string[];
}

export const Updates: React.FC = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<AdminUpdateEntry[]>([]);

  useEffect(() => {
    const loadUpdates = async () => {
      try {
        setLoading(true);
        const response = await dataProvider.custom('admin/updates', {
          method: 'GET',
        });
        const data = (response as any)?.data?.data || [];
        setUpdates(Array.isArray(data) ? data : []);
      } catch (e: any) {
        notify(e?.message || 'Failed to load updates', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    loadUpdates();
  }, [dataProvider, notify]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Updates
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Showing changes from the last 7 days based on the admin-facing changelog.
      </Typography>

      {updates.length === 0 ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="body1">
              No updates in the last 7 days.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List sx={{ mt: 2 }}>
          {updates.map((entry, index) => (
            <React.Fragment key={`${entry.version}-${entry.date}-${index}`}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    {entry.version} &mdash; {entry.date}
                  </Typography>

                  {entry.whatChanged && entry.whatChanged.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        What changed
                      </Typography>
                      <List dense>
                        {entry.whatChanged.map((line, idx) => {
                          // If there are multiple lines, treat the first as the main point (a)
                          // and the remaining as sub-bullets under that same point.
                          if (idx === 0) {
                            const label = 'a';
                            const subLines = entry.whatChanged.slice(1);
                            return (
                              <ListItem key={`wc-${idx}`} sx={{ pl: 2, alignItems: 'flex-start', display: 'block' }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                  <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>
                                    {label})
                                  </Box>
                                  <Typography component="span">{line}</Typography>
                                </Box>
                                {subLines.length > 0 && (
                                  <List dense sx={{ pl: 4, pt: 0.5 }}>
                                    {subLines.map((sub, sIdx) => (
                                      <ListItem key={`wc-sub-${sIdx}`} sx={{ pl: 0 }}>
                                        <ListItemText primary={sub} />
                                      </ListItem>
                                    ))}
                                  </List>
                                )}
                              </ListItem>
                            );
                          }
                          // Remaining lines rendered as part of the first item (handled above)
                          return null;
                        })}
                      </List>
                    </Box>
                  )}

                  {entry.howToTest && entry.howToTest.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        How to test
                      </Typography>
                      <List dense>
                        {entry.howToTest.map((line, idx) => (
                          <ListItem key={`ht-${idx}`} sx={{ pl: 2, alignItems: 'flex-start' }}>
                            <ListItemText
                              primaryTypographyProps={{ component: 'span' }}
                              primary={
                                <Box component="span">
                                  <Box component="span" sx={{ fontWeight: 600, mr: 1 }}>
                                    {idx + 1}.
                                  </Box>
                                  {line}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </CardContent>
              </Card>
              {index < updates.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};


