import "./tailwind-classes.css"
import { HomePage } from "./pages/home/HomePage.ts"
import { DashboardPage } from "./pages/dashboard/DashboardPage.ts"
import { ErrorPage } from './pages/utils/404.ts';
import { renderPongMenu } from "./pages/pong/gameInterface/renderMenu.ts";
import { auth } from "./authentication/auth.ts";
import { ProfilePage as MyProfilePage } from "./pages/profile/ProfilePage.ts"
import { renderMatchHistory } from "./pages/pong/matchHistory/renderHistory.ts";
import { FriendsPage } from "./pages/friends/FriendsPage.ts";
import { loadPage } from "./pages/DOM_helper.ts";
import { PublicProfilePage } from "./pages/friends/public_profile/PublicProfilePage.ts";
import { renderRGPD } from "./pages/RGPD/renderRGPD.ts";
import { createFooter } from "./pages/footer/FooterElement.ts";

const appContainer = document.querySelector<HTMLDivElement>('#app')!;
const mainDiv = document.createElement('div');
mainDiv.style.minHeight = "100vh";
mainDiv.style.display = "flex";
mainDiv.style.flexDirection = "column";

const pageContainer = document.createElement('div');
pageContainer.style.flexGrow = "1";
pageContainer.style.flexShrink = "0";
pageContainer.style.overflow = "auto";
pageContainer.style.minHeight = "0";
pageContainer.style.display = "flex";
pageContainer.style.flexDirection = "column";
pageContainer.style.justifyContent = "center";
pageContainer.style.alignItems = "center";

const footer = document.createElement('footer');
footer.style.flexShrink = "0";
footer.style.height = "10vh";
createFooter(footer);

mainDiv.appendChild(pageContainer);
mainDiv.appendChild(footer);
appContainer.appendChild(mainDiv);


// desactive la touche entree et espace globalement pour eviter les de pouvoir reouvrir les modal
// cependant ne casse pas le entree du form ni le pause du jeu car je suppose cest des nouveaux objets
pageContainer.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
    }
});

type Route = {
    render: (appContainer: HTMLDivElement, params?: any) => void | Promise<void>;
    requiresAuth: boolean;
};

const routes: Record<string, Route> = {
    "/": { render: DashboardPage, requiresAuth: true },
    "/pong": { render: renderPongMenu, requiresAuth: true },
    "/profile": { render: PublicProfilePage, requiresAuth: true },
    "/profile/me": { render: MyProfilePage, requiresAuth: true },
    "/matchHistory": { render: renderMatchHistory, requiresAuth: true },
    "/friends": { render: FriendsPage, requiresAuth: true },
    "/privacy-policy": { render: renderRGPD, requiresAuth: false },
};

export async function navigate(path: string) {
    history.pushState({}, "", path);
    await updateRoute();
}

export async function updateRoute() {
    if (!appContainer) return;
    const path = window.location.pathname;
    pageContainer.innerHTML = ''; // vide seulement le contenu interne
    if (auth.loading) {
        footer.style.display = "none";
        loadPage(pageContainer);
        return;
    }

    let route = routes[path];

    if (!route) {
        if (auth.user) {
            
            const isProfilePage = path.match(/^\/profile\/(.+)$/);
            if (isProfilePage) {
                // on defini la route en premier donc ca sera profile pour publicprofilepage
                route = routes["/profile"];

                await route.render(pageContainer, { username: decodeURIComponent(isProfilePage[1]) });
                return;
            }
            const isMatchHistoryPage = path.match(/^\/matchHistory\/(.+)$/);
            if (isMatchHistoryPage) {
                route = routes["/matchHistory"];
                await route.render(pageContainer, { username: decodeURIComponent(isMatchHistoryPage[1]) });
                return;
            }
        }
        ErrorPage(pageContainer);
        return;
    }
    if (route.requiresAuth && !auth.user) {
        await HomePage(pageContainer);
        return;
    }
    await route.render(pageContainer);
}

