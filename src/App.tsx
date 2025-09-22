import React from 'react';
import { Admin, Resource, CustomRoutes } from 'react-admin';
import { Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { authProvider } from './providers/authProvider';
import { dataProvider } from './providers/dataProvider';
import { theme } from './theme';
import { LoginPage } from './components/LoginPage';

// Resource components
import { UserList, UserEdit, UserCreate, UserShow } from './resources/users';
import { MatchList, MatchEdit, MatchCreate, MatchShow } from './resources/matches';
import { MatchParticipantList } from './resources/matchParticipants';
import { StatsUpload } from './resources/statsUpload';
import { VenueList, VenueEdit, VenueCreate } from './resources/venues';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Custom Layout
import { Layout } from './layout/Layout';
import { Dashboard } from './dashboard/Dashboard';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    theme={theme}
    layout={Layout}
    dashboard={Dashboard}
    loginPage={LoginPage}
    requireAuth
  >
    {/* User Management - Admin & Super Admin only */}
    <Resource
      name="users"
      list={UserList}
      edit={UserEdit}
      create={UserCreate}
      show={UserShow}
      icon={PersonIcon}
      options={{ label: 'Users' }}
    />

    {/* Match Management - All admin roles */}
    <Resource
      name="matches"
      list={MatchList}
      edit={MatchEdit}
      create={MatchCreate}
      show={MatchShow}
      icon={SportsFootballIcon}
      options={{ label: 'Matches' }}
    />

    {/* Match Participants - All admin roles */}
    <Resource
      name="match-participants"
      list={MatchParticipantList}
      icon={GroupIcon}
      options={{ label: 'Participants' }}
    />

    {/* Stats Upload - All admin roles */}
    <CustomRoutes>
      <Route path="/stats-upload" element={<StatsUpload />} />
    </CustomRoutes>

    {/* Venue Management */}
    <Resource
      name="venues"
      list={VenueList}
      edit={VenueEdit}
      create={VenueCreate}
      icon={LocationOnIcon}
      options={{ label: 'Venues' }}
    />
  </Admin>
);

export default App;