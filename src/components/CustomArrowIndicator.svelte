<script>
	import { T } from "@threlte/core";
	import * as THREE from "three";

	export let start = new THREE.Vector3();
	export let direction = new THREE.Vector3(0, 0, 0);
	export let length = 1;
	export let color = 0xffff00;

	const lengthScalar = 0.25;

	$: arrowHeadLength = 0.1; // length * 0.2; // Optional: scale according to length
	$: arrowHeadWidth = 0.1; // length * 0.1;

	$: arrowHelper = new THREE.ArrowHelper(
		direction.normalize(),
		start,
		length * lengthScalar,
		color,
		arrowHeadLength,
		arrowHeadWidth
	);

	$: {
		arrowHelper.position.copy(start);

		// Invert the direction
		const invertedDirection = direction.clone().multiplyScalar(-1);
		arrowHelper.setDirection(invertedDirection.normalize());
		arrowHelper.setLength(
			length * lengthScalar,
			arrowHeadLength,
			arrowHeadWidth
		);
		arrowHelper.setColor(new THREE.Color(color));
	}
</script>

<T is={arrowHelper} />
