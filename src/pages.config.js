import Home from './pages/Home';
import Game from './pages/Game';
import ParentDashboard from './pages/ParentDashboard';
import Settings from './pages/Settings';
import QuestMap from './pages/QuestMap';
import Lesson from './pages/Lesson';
import Rewards from './pages/Rewards';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import LandingPage from './pages/LandingPage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Game": Game,
    "ParentDashboard": ParentDashboard,
    "Settings": Settings,
    "QuestMap": QuestMap,
    "Lesson": Lesson,
    "Rewards": Rewards,
    "Support": Support,
    "Privacy": Privacy,
    "LandingPage": LandingPage,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};