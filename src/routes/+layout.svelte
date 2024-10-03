<script>
	import "$styles/app.css";
	import Header from "$components/Header.svelte";
	import { page } from "$app/stores";
	$: home = $page.route.id === "/";
</script>

{#if home}
	<Header />
{/if}
<main id="content">
	<slot />
</main>
