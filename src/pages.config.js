import Home from './pages/Home';
import Game from './pages/Game';
import ParentDashboard from './pages/ParentDashboard';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Game": Game,
    "ParentDashboard": ParentDashboard,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};