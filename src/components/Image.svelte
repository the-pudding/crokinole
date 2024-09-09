<script>
	export let src;
	export let alt;
</script>

<figure>
	<img {src} {alt} />

	{#if alt}
		<figcaption>
			{@html alt}
		</figcaption>
	{/if}
</figure>

<style>
	figure {
		position: relative;
		margin: 32px 0;
	}

	figcaption {
		font-size: var(--14px);
		padding: 4px 0;
		text-align: center;
	}

	img {
		display: block;
		margin: 0;
	}
</style>
