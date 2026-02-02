import { GameConfig } from "./gameConfig";
import type { GameMode } from "./gameConfig";
import { GameStateManager } from "./gameStateManager";
import { Match } from "../gameObjects/match.ts";
import { registerTournamentMatchs } from "./tournament.ts";
import { fetchRegisterMatchHistory } from "../matchHistory/fetchHistory.ts";



export async function handleEndGame(config: GameConfig, mode: GameMode, stateMgr: GameStateManager, match: Match) {
  stateMgr.winnerAlias = match.getWinnerAlias();
  stateMgr.state = "finished";

  if (mode === "tournament" && config.tournamentMgr) {
    config.tournamentMgr.registerWinner(match.getWinnerAlias());

    // clone du match actuel
    const resultMatch = new Match(match.playerLeft, match.playerRight, mode, match.userplace);
    resultMatch.scoreLeft = match.scoreLeft;   // copie le match du joueur gauche
    resultMatch.scoreRight = match.scoreRight; // copie le match du joueur droit

    config.tournamentMgr.registerMatch(resultMatch);

    if (config.tournamentMgr.isEndOfTournament()) {
      stateMgr.state = "endofTournament";
      registerTournamentMatchs(config.tournamentMgr.matchs, config.username, mode);
    }
  }
  else {
    // Classic ou IA mode -> enregistrer le match dans la DB
    const date = Math.floor(Date.now() / 1000);
    try {
      await fetchRegisterMatchHistory({
        mode: mode,
        playerLeft: match.playerLeft,
        scoreLeft: match.scoreLeft,
        playerRight: match.playerRight,
        scoreRight: match.scoreRight,
        userplace: match.userplace,
        date: date,
      });
      console.log("Match enregistré avec succès !");
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement du match :", err.message);
    }
  }
}

export function restartButtonHandler(
  mode: GameMode,
  stateMgr: GameStateManager,
  match: Match,
  config: GameConfig
) {
  return () => {
    if (stateMgr.state !== "finished")
      return;

    if (mode === "tournament") {
      if (!config.tournamentMgr) {
        console.log("Error during the launch of the next match");
        return;
      }
      match.setPlayers(config.tournamentMgr.nextMatch(config.username));
      stateMgr.startNextMatchAnimation(match.playerLeft, match.playerRight);
    }
    else {
      stateMgr.resetGame();
    }
  };
}

