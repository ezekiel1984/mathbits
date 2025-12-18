import Home from './pages/Home';
import Game from './pages/Game';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Game": Game,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};