<script>
	import { createEventDispatcher } from "svelte";
	import Slider from "$components/Crokinole.Slider.svelte";
	import Button from "$components/Crokinole.Button.svelte";

	export let visible;
	export let width;
	export let power;
	export let replay;
	export let phase;
	export let disabled;
	export let rangeValuePosition;
	export let rangeValueShoot;
	export let rangeDefault;
	export let animate;

	const dispatch = createEventDispatcher();
</script>

<div class="ui" class:visible style:width="{width}px">
	<div class="top">
		{#if !replay}
			{#if phase === "shoot"}
				<Button {disabled} bind:value={power} on:release></Button>
			{:else}
				<button on:click>Place Disc</button>
			{/if}
		{/if}
	</div>

	<div class="bottom">
		{#if !replay}
			{#if phase === "position"}
				<Slider
					label="position"
					min={rangeDefault.position.min}
					max={rangeDefault.position.max}
					step={rangeDefault.position.step}
					{disabled}
					{animate}
					bind:value={rangeValuePosition}
					on:change
				></Slider>
			{:else if phase === "shoot"}
				<Slider
					label="aim"
					min={rangeDefault.shoot.min}
					max={rangeDefault.shoot.max}
					step={rangeDefault.shoot.step}
					{disabled}
					bind:value={rangeValueShoot}
				></Slider>
			{/if}
		{/if}
	</div>
</div>

<style>
	.ui {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s;
		user-select: none;
		margin: 0 auto;
	}

	.ui.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.ui > div {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.ui .top {
		height: 40px;
		margin-top: 16px;
		margin-bottom: 8px;
	}

	.ui .bottom {
		height: 32px;
	}

	:global(.ui button) {
		padding: 0;
		width: 11em;
		text-transform: uppercase;
		height: 100%;
	}
</style>
