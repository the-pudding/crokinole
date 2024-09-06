import { writable } from "svelte/store";

export const gameState = writable({
	currentPlayer: "player1",
	player1Discs: 12,
	player2Discs: 12
});
