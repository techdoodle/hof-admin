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
import { MatchParticipantList, MatchParticipantCreate } from './resources/matchParticipants';
import { PlayerNationUpload } from './resources/playernation';
import { VenueList, VenueEdit, VenueCreate, VenueShow } from './resources/venues';
import { VenueCsvUpload } from './resources/venues/VenueExcelUpload';
import { MatchStatsEdit } from './resources/matchStats';
import { AccountingDashboard } from './resources/accounting';
import { BallonDorLeaderboard } from './resources/footballChiefLeaderboard/BallonDorLeaderboard';
import { PromoCodeList, PromoCodeCreate, PromoCodeEdit, PromoCodeShow } from './resources/promo-codes';
import { Updates } from './resources/updates/Updates';
import { TicketList } from './resources/tickets/TicketList';
import { TicketEdit } from './resources/tickets/TicketEdit';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

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
      create={MatchParticipantCreate}
      icon={GroupIcon}
      options={{ label: 'Participants' }}
    />

    {/* PlayerNation Upload & Updates - All admin roles */}
    <CustomRoutes>
      <Route path="/updates" element={<Updates />} />
      <Route path="/playernation/upload" element={<PlayerNationUpload />} />
      <Route path="/match-stats/:matchId/edit" element={<MatchStatsEdit />} />
      <Route path="/venues/upload-csv" element={<VenueCsvUpload />} />
      <Route path="/ballon-dor" element={<BallonDorLeaderboard />} />
    </CustomRoutes>

    {/* Venue Management */}
    <Resource
      name="venues"
      list={VenueList}
      edit={VenueEdit}
      create={VenueCreate}
      show={VenueShow}
      icon={LocationOnIcon}
      options={{ label: 'Venues' }}
    />

    {/* Accounting - Super Admin only */}
    <Resource
      name="accounting"
      list={AccountingDashboard}
      icon={AccountBalanceIcon}
      options={{ label: 'Accounting' }}
    />

    {/* Promo Codes - Super Admin only */}
    <Resource
      name="promo-codes"
      list={PromoCodeList}
      create={PromoCodeCreate}
      edit={PromoCodeEdit}
      show={PromoCodeShow}
      icon={LocalOfferIcon}
      options={{ label: 'Promo Codes' }}
    />
    {/* Tickets - Admin & Super Admin */}
    <Resource
      name="tickets"
      list={TicketList}
      edit={TicketEdit}
      options={{ label: 'Tickets' }}
    />
  </Admin>
);

export default App;