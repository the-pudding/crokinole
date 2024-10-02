<script>
	import { range } from "d3";
	export let shots;
	export let width;
</script>

<div class="game" style:width="{width}px">
	<p class="shots you">
		{#each range(shots.player1) as i}
			<span class="disc"></span>
		{/each}
	</p>
	<p class="shots opp">
		{#each range(shots.player2) as i}
			<span class="disc"></span>
		{/each}
	</p>
</div>

<style>
	p {
		margin: 0;
		font-size: var(--14px);
		text-align: center;
	}

	.game {
		display: flex;
		justify-content: space-between;
		font-family: var(--sans);
		font-size: var(--14px);
		pointer-events: none;
		margin: 0 auto 8px auto;
	}

	.game p {
		margin: 0;
	}

	.shots {
		display: flex;
		/* align-items: center; */
	}

	.shots.you .disc {
		background: var(--color-you-bg);
	}

	.shots.opp .disc {
		background: var(--color-opp-bg);
	}

	.disc {
		display: inline-block;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		margin: 0 2px;
	}

	.shots.opp .disc:last-of-type {
		margin-right: 0;
	}

	.shots.you .disc:last-of-type {
		margin-right: 0;
	}
</style>
