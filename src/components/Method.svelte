<script>
	export let text;
</script>

<div id="method" class="c">
	{#each text as { value }}
		<p>{@html value}</p>
	{/each}
</div>

<style>
	.c {
		margin-top: 64px;
	}

	p {
		font-size: var(--20px);
	}

	@media only screen and (max-width: 800px) {
		p {
			font-size: var(--14px);
		}
	}
</style>
