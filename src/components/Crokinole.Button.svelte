<script>
	import { createEventDispatcher } from "svelte";

	export let value;

	const dispatch = createEventDispatcher();

	let interval;

	function onStart() {
		let dir = -1;
		interval = setInterval(() => {
			if (value >= 1) dir = -1;
			else if (value <= 0) dir = 1;
			value += 0.01 * dir;
			value = +value.toFixed(2);
		}, 17);
	}

	function onStop() {
		clearInterval(interval);
		dispatch("release", value);
		value = 0;
	}
</script>

<button on:mousedown={onStart} on:mouseup={onStop}>Flick</button>
