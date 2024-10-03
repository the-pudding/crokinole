<script>
	export let holderVisible;
	export let pointsVisible;
	export let animate;
	export let holder;
	export let score;
	export let width;
</script>

<div class="score" style:width="{width}px">
	<p
		class="holder you"
		class:animate={animate.player1}
		class:visible={holderVisible}
	>
		<span class="label">20s</span>
		<strong>{holder.player1}</strong>
	</p>
	<p class="points" class:visible={pointsVisible}>
		<span class="label">POINTS</span>
		<strong
			><span class="you">{score.player1}</span> -
			<span class="opp">{score.player2}</span></strong
		>
	</p>
	<p
		class="holder opp"
		class:animate={animate.player2}
		class:visible={holderVisible}
	>
		<span class="label">20s</span>
		<strong>{holder.player2}</strong>
	</p>
</div>

<style>
	p {
		margin: 0;
		font-size: var(--14px);
		text-align: center;
	}

	.score {
		display: flex;
		justify-content: space-between;
		font-family: var(--sans);
		font-size: var(--14px);
		pointer-events: none;
		margin: 0 auto 8px auto;
	}

	.score p {
		margin: 0;
		transform-origin: center;
	}

	.holder {
		visibility: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.holder.visible {
		visibility: visible;
	}

	.holder.you {
		color: var(--color-you-text);
		text-align: left;
	}

	.holder.opp {
		color: var(--color-opp-text);
		text-align: right;
	}

	.points {
		color: var(--color-fg-light);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.score .label {
		font-size: var(--12px);
	}

	.score p.animate {
		animation: zoom 0.5s ease-in-out;
	}

	.points {
		visibility: hidden;
		text-align: center;
	}

	.points.visible {
		visibility: visible;
	}

	.points .you {
		color: var(--color-you-text);
		text-align: left;
	}

	.points .opp {
		color: var(--color-opp-text);
		text-align: right;
	}

	@keyframes zoom {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.2);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
