<script>
	export let src;
	export let alt;
	export let figcaption;
</script>

<figure>
	<img {src} {alt} />

	{#if figcaption}
		<figcaption>
			{@html figcaption}
		</figcaption>
	{/if}
</figure>

<style>
	figure {
		position: relative;
		margin: 32px auto;
	}

	figcaption {
		font-size: var(--14px);
		padding: 4px 0;
		text-align: center;
	}

	img {
		display: block;
		margin: 0;
		width: 100%;
	}
</style>
