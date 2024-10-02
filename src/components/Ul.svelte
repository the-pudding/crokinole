<script>
	export let list;
</script>

<ul>
	{#each list as item}
		<li>{@html item}</li>
	{/each}
</ul>

<style>
	ul {
		padding-left: 40px;
	}
	li {
		margin-bottom: 16px;
	}
</style>
