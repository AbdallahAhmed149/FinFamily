import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Splash from './pages/fin/Splash';
import Onboarding from './pages/fin/Onboarding';
import RoleSelect from './pages/fin/RoleSelect';
import ChildLayout from './components/fin/ChildLayout';
import ParentLayout from './components/fin/ParentLayout';
import ChildHome from './pages/fin/child/ChildHome';
import WalletPage from './pages/fin/child/Wallet';
import MeezaCard from './pages/fin/child/MeezaCard';
import Learn from './pages/fin/child/Learn';
import Rewards from './pages/fin/child/Rewards';
import Coach from './pages/fin/child/Coach';
import Goals from './pages/fin/child/Goals';
import ChildProfile from './pages/fin/child/Profile';
import ParentDashboard from './pages/fin/parent/ParentDashboard';
import Allowance from './pages/fin/parent/Allowance';
import Insights from './pages/fin/parent/Insights';
import Approvals from './pages/fin/parent/Approvals';
import FamilyMembers from './pages/fin/parent/FamilyMembers';
import Chores from './pages/fin/parent/Chores';
import SpendingLimits from './pages/fin/parent/SpendingLimits';
import FamilyCards from './pages/fin/parent/FamilyCards';
import RewardApprovals from './pages/fin/parent/RewardApprovals';
import ParentCoach from './pages/fin/parent/ParentCoach';
import Leaderboard from './pages/fin/child/Leaderboard';
import AdventureMap from './pages/fin/child/AdventureMap';
import Missions from './pages/fin/child/Missions';
import ChildMissions from './pages/fin/parent/ChildMissions';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/role-select" element={<RoleSelect />} />
      <Route element={<ChildLayout />}>
        <Route path="/child" element={<ChildHome />} />
        <Route path="/child/wallet" element={<WalletPage />} />
        <Route path="/child/card" element={<MeezaCard />} />
        <Route path="/child/learn" element={<Learn />} />
        <Route path="/child/rewards" element={<Rewards />} />
        <Route path="/child/coach" element={<Coach />} />
        <Route path="/child/goals" element={<Goals />} />
        <Route path="/child/leaderboard" element={<Leaderboard />} />
        <Route path="/child/adventure" element={<AdventureMap />} />
        <Route path="/child/missions" element={<Missions />} />
        <Route path="/child/profile" element={<ChildProfile />} />
      </Route>
      <Route element={<ParentLayout />}>
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/parent/allowance" element={<Allowance />} />
        <Route path="/parent/insights" element={<Insights />} />
        <Route path="/parent/approvals" element={<Approvals />} />
        <Route path="/parent/members" element={<FamilyMembers />} />
        <Route path="/parent/chores" element={<Chores />} />
        <Route path="/parent/limits" element={<SpendingLimits />} />
        <Route path="/parent/cards" element={<FamilyCards />} />
        <Route path="/parent/rewards" element={<RewardApprovals />} />
        <Route path="/parent/coach" element={<ParentCoach />} />
        <Route path="/parent/child-missions" element={<ChildMissions />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App