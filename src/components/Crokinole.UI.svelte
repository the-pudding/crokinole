<script>
	import { Slider } from "bits-ui";

	export let value = [0.5];
	let min = 0.22;
	let max = 0.78;
	let step = 0.01;

	export let phase;
</script>

{#if ["place", "aim"].includes(phase)}
	<div class="c">
		<Slider.Root bind:value let:thumbs {min} {max} {step}>
			<span class="bg">
				<Slider.Range />
			</span>
			{#each thumbs as thumb}
				<Slider.Thumb {thumb} />
			{/each}
		</Slider.Root>
	</div>
{/if}

<style>
	.c {
		--h: 32px;
		--m: 22%;
		height: var(--h);
		width: calc(100% - var(--m) * 2);
		margin: 0 auto;
	}

	:global([data-slider-root]) {
		display: block;
		height: 100%;
		transform: translateY(50%);
	}

	.bg {
		display: block;
		height: 2px;
		background: var(--color-fg);
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
		cursor: pointer;
	}
</style>
