<script>
	export let text;
</script>

<div id="method" class="c">
	{#each text as { value }}
		<p>{@html value}</p>
	{/each}
</div>
