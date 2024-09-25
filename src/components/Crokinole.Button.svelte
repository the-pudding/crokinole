<script>
	import { createEventDispatcher } from "svelte";

	export let value;
	export let disabled;

	const dispatch = createEventDispatcher();

	let interval;
	let started;

	function onStart() {
		let dir = -1;
		started = true;
		interval = setInterval(() => {
			if (value >= 1) dir = -1;
			else if (value <= 0) dir = 1;
			value += 0.01 * dir;
			value = +value.toFixed(2);
		}, 17);
	}

	function onStop() {
		if (started) {
			clearInterval(interval);
			dispatch("release", value);
			value = 0;
			started = false;
		}
	}
</script>

<button
	{disabled}
	on:pointerdown={onStart}
	on:pointerup={onStop}
	on:pointerleave={onStop}>Shoot</button
>
