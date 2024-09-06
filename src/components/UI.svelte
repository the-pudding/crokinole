<script>
	import { gameState } from "$stores/game.js";
</script>

<div class="ui">
	<p>Current Player: {$gameState.currentPlayer}</p>
	<p>Player 1 Discs: {$gameState.player1Discs}</p>
	<p>Player 2 Discs: {$gameState.player2Discs}</p>
</div>

<style>
	.ui {
		position: absolute;
		top: 10px;
		left: 10px;
		color: white;
		background-color: rgba(0, 0, 0, 0.5);
		padding: 10px;
		border-radius: 5px;
	}

	p {
		margin: 0;
	}
</style>
