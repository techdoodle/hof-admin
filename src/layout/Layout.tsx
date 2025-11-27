import React from 'react';
import { Layout as RALayout, AppBar, Menu, UserMenu, usePermissions, MenuItemLink } from 'react-admin';
import { Box, Chip, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getCurrentEnvironment } from '../config/environment';

const CustomAppBar = () => {
  const environment = getCurrentEnvironment();
  const navigate = useNavigate();

  return (
    <AppBar>
      <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
        <Link
          component="button"
          variant="h6"
          color="inherit"
          underline="none"
          onClick={() => navigate('/')}
          sx={{
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          HOF Admin Panel
        </Link>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={environment.label}
            size="small"
            color={environment.name === 'production' ? 'error' : environment.name === 'staging' ? 'warning' : 'info'}
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
          <UserMenu />
        </Box>
      </Box>
    </AppBar>
  );
};

const CustomMenu = () => {
  const { permissions } = usePermissions();
  const role = permissions as string;
  const canViewUsers = ['admin', 'super_admin'].includes(role);
  const isSuperAdmin = role === 'super_admin';
  
  return (
    <Menu>
      {canViewUsers && <Menu.ResourceItem name="users" />}
      <Menu.ResourceItem name="matches" />
      <Menu.ResourceItem name="match-participants" />
      <Menu.ResourceItem name="venues" />
      <MenuItemLink
        to="/ballon-dor"
        primaryText="HoF Ballon d'Or"
        leftIcon={<EmojiEventsIcon />}
      />
      {isSuperAdmin && <Menu.ResourceItem name="accounting" />}
    </Menu>
  );
};

export const Layout = (props: any) => (
  <RALayout
    {...props}
    appBar={CustomAppBar}
    menu={CustomMenu}
  />
);
