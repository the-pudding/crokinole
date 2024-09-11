<script>
	export let text;
</script>

<div id="method">
	<h2>Data and Methods</h2>
	{#each text as { value }}
		<p>{@html value}</p>
	{/each}
</div>
