<script>
	import { Slider } from "bits-ui";

	export let label;
	export let value;
	export let min;
	export let max;
	export let disabled;
	export let step;
	export let animate;

	$: animateClass = animate ? "animate" : "";
</script>

<div class="c">
	<p class="label">{label}</p>
	<Slider.Root bind:value let:thumbs {min} {max} {step} {disabled}>
		<span class="bg">
			<Slider.Range />
		</span>
		{#each thumbs as thumb}
			<Slider.Thumb {thumb} class={animateClass} />
		{/each}
	</Slider.Root>
</div>

<style>
	.c {
		--h: 32px;
		--m: 21%;
		height: var(--h);
		width: calc(100% - var(--m) * 2);
		margin: 0 auto;
		position: relative;
	}

	.label {
		position: absolute;
		font-family: var(--sans);
		text-transform: uppercase;
		font-size: var(--12px);
		margin: 0;
		top: 50%;
		left: -16px;
		transform: translate(-100%, -50%);
		color: var(--color-fg-light);
	}

	:global([data-slider-root]) {
		display: block;
		height: 100%;
		transform: translateY(50%);
	}

	:global([data-slider-root][disabled]) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.bg {
		display: block;
		height: 4px;
		background: var(--color-fg-lightest);
		transform: translateY(2px);
	}

	:global([data-slider-range]) {
		position: absolute;
		/* background: blue; */
	}

	:global([data-slider-thumb]) {
		background: var(--color-fg);
		border-radius: 50%;
		width: 32px;
		height: 32px;
		transform: translateY(-50%);
		cursor: ew-resize;
	}

	:global([data-slider-thumb]:focus) {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}

	:global([data-slider-thumb].animate) {
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0% {
			transform: translateY(-50%) scale(1);
			box-shadow: 0 0 0 0 transparent;
		}
		50% {
			transform: translateY(-50%) scale(1.2);
			box-shadow: 0 0 4px 4px var(--color-mark);
		}
		100% {
			transform: translateY(-50%) scale(1);
			box-shadow: 0 0 0 0 transparent;
		}
	}
</style>
