import { type blocType, usernameAreLinkToPublicProfile } from "../FriendsPage";
import { setupRemoveButtons } from "./btnHandler/removeBtn";
import { setupBlockButtons } from "./btnHandler/blockBtn";
import { userCardHtml } from "../FriendsPage";
import { setupAddButtons } from "./btnHandler/addBtn";

export function updateAllSections(container: HTMLDivElement, allUsersBloc: blocType, pendingFriendsBloc: blocType, myFriendsBloc: blocType, blockedFriendsBloc: blocType) {
    section_allUsers(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
    section_pendingFriends(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
    section_myFriends(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
    section_blockedFriends(container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc);
}

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
////// les users quon peut ajouter en ami
export function section_allUsers(container: HTMLDivElement, allUsersBloc: blocType, pendingFriendsBloc: blocType, myFriendsBloc: blocType, blockedFriendsBloc: blocType) {
    // on parcourt notre liste de user et on renvoie leur card
    const allUsername = allUsersBloc.data.map((user) => {
        return userCardHtml(user, true, false, false, true);
    });
    allUsersBloc.el.innerHTML = allUsername.join(""); // si on join pas alors on aura la virgule qui separe chaque element du tableau

    setupBlockButtons({
        containerBlock: allUsersBloc,
        updateSection: section_allUsers, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    });

    setupAddButtons({
        containerBlock: allUsersBloc,
        updateSection: section_allUsers, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    })
    usernameAreLinkToPublicProfile(allUsersBloc.el);
}
////// fin de users a ajouter
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
////// les users qui sont en attente detre mes amis
export function section_pendingFriends(container: HTMLDivElement, allUsersBloc: blocType, pendingFriendsBloc: blocType, myFriendsBloc: blocType, blockedFriendsBloc: blocType) {
    const allUsername = pendingFriendsBloc.data.map((user) => {
        return userCardHtml(user, false, true, true, true);
    });
    pendingFriendsBloc.el.innerHTML = allUsername.join(""); // si on join pas alors on aura la virgule qui separe chaque element du tableau

    setupRemoveButtons({
        containerBlock: pendingFriendsBloc,
        updateSection: section_pendingFriends, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    });
    setupBlockButtons({
        containerBlock: pendingFriendsBloc,
        updateSection: section_pendingFriends, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    });

    setupAddButtons({
        containerBlock: pendingFriendsBloc,
        updateSection: section_myFriends, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    })

    // en gros on update les click de notre section
    usernameAreLinkToPublicProfile(pendingFriendsBloc.el);
}
////// fin de users a ajouter
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
////// les users qui sont mes amis
export function section_myFriends(container: HTMLDivElement, allUsersBloc: blocType, pendingFriendsBloc: blocType, myFriendsBloc: blocType, blockedFriendsBloc: blocType) {
    // la je dois faire gaffe car si cest moi qui ait fait laction alors je dois avoir un - sinon un + et -
    const allUsername = myFriendsBloc.data.map((user) => {
        return userCardHtml(user, false, false, true, true);
    });

    myFriendsBloc.el.innerHTML = allUsername.join(""); // si on join pas alors on aura la virgule qui separe chaque element du tableau

    // ecouter tous les boutons - avec lid removeFriendBtn
    setupRemoveButtons({
        containerBlock: myFriendsBloc,
        updateSection: section_myFriends, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    });
    setupBlockButtons({
        containerBlock: myFriendsBloc,
        updateSection: section_myFriends, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    });
    // en gros on update les click de notre section
    usernameAreLinkToPublicProfile(myFriendsBloc.el);
}
////// fin de users a ajouter
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
////// les users que jai bloqué
export function section_blockedFriends(container: HTMLDivElement, allUsersBloc: blocType, pendingFriendsBloc: blocType, myFriendsBloc: blocType, blockedFriendsBloc: blocType) {
    // la je dois faire gaffe car si cest moi qui ait fait laction alors je dois avoir un - sinon un + et -
    const allUsername = blockedFriendsBloc.data.map((user) => {
        return userCardHtml(user, false, false, true, false, true);
    });
    blockedFriendsBloc.el.innerHTML = allUsername.join(""); // si on join pas alors on aura la virgule qui separe chaque element du tableau
    setupRemoveButtons({
        containerBlock: blockedFriendsBloc,
        updateSection: section_blockedFriends, container, allUsersBloc, pendingFriendsBloc, myFriendsBloc, blockedFriendsBloc
    });    // ecouter tous les boutons - avec lid removeFriendBtn

}
////// fin de users bloqué
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////