import { Match } from "../gameObjects/match.ts";
import type { GameMode } from "./gameConfig";
import { fetchRegisterMatchHistory } from "../matchHistory/fetchHistory.ts";
import { fetchTournamentMatchByDate } from "../matchHistory/fetchHistory.ts";

export async function registerTournamentMatchs(
  matchs: Match[],
  username: string,
  mode: GameMode
) {
  let date = Math.floor(Date.now() / 1000);

  // 🟦 Étape 1 : si mode = tournament, trouver une date unique AVANT la boucle
  if (mode === "tournament") {
    let exists = true;

    while (exists) {
      exists = await fetchTournamentMatchByDate(username, date);
      if (exists) {
        date += 1; // ⏫ On incrémente jusqu'à trouver une date libre
      }
    }
  }

  // 🟩 Étape 2 : tous les matchs du tournoi utiliseront *exactement* cette date
  for (const match of matchs) {
    try {
      await fetchRegisterMatchHistory({
        mode,
        playerLeft: match.playerLeft,
        scoreLeft: match.scoreLeft,
        playerRight: match.playerRight,
        scoreRight: match.scoreRight,
        userplace: match.userplace,
        date: date, // 👈 même date pour les 3 matchs d'un tournoi
      });

      console.log(
        `✅ Match ${match.playerLeft} vs ${match.playerRight} `
      );
    } catch (err: any) {
      console.error(
        `❌ Erreur lors de l'enregistrement du match ${match.playerLeft} vs ${match.playerRight} :`,
        err.message
      );
    }
  }

  console.log("🏁 Tous les matchs du tournoi ont été enregistrés !");
}



export class TournamentManager {
  public players: string[];
  public winners: string[];
  public matchnum: number;
  public matchs: Match[];

  constructor(players: string[]) {
    this.players = [...players].sort(() => Math.random() - 0.5); // shuffle
    this.winners = [];
    this.matchnum = 0;
    this.matchs = [];
  }
  // remplir tableau de joueur a chaque fin de match
  public nextMatch(username: string) {
    let playerLeft: string = "";
    let playerRight: string = "";

    if (this.players.length >= 2) {

      playerLeft = this.players[0];
      playerRight = this.players[1];
      this.players.splice(0, 2);
    }
    else if (this.winners.length === 2) {
      playerLeft = this.winners[0];
      playerRight = this.winners[1];
      this.winners.splice(0, 2);
    }
    let userplace;
    if (playerLeft == username) {
      userplace = "left";
    }
    else if (playerRight == username) {
      userplace = "right";
    }
    else {
      userplace = "none";
    }
    return { playerLeft, playerRight, userplace };
  }

  public registerWinner(winner: string) {
    this.winners.push(winner);
    this.matchnum += 1;
  }

  public isEndOfTournament(): boolean {
    if (this.matchnum === 3)
      return true;
    return false;
  }

  public registerMatch(match: Match) {
    this.matchs.push(match);
  }
}
