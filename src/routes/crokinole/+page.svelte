<script>
	import { onMount } from "svelte";
	import Matter from "matter-js";
	import * as S from "$data/specs.js";

	let engine;
	let world;
	let runner;
	let discs = [];
	let trap = [];

	const width = 600;
	const height = width;
	const half = width / 2;

	let activeDisc;
	let canvas;
	let isDragging;
	let mousePosition;
	let vector;

	function startDrag(event) {
		if (!activeDisc) return;
		isDragging = true;
		console.log({ isDragging });
		mousePosition = { x: event.offsetX, y: event.offsetY };
	}

	function onDrag(event) {
		if (!isDragging) return;
		mousePosition = { x: event.offsetX, y: event.offsetY };
		vector = {
			x: mousePosition.x - activeDisc.position.x,
			y: mousePosition.y - activeDisc.position.y
		};

		// Cap the vector length for max power
		const maxDragLength = width * 0.1;
		const maxSpeed = activeDisc.mass * half * 0.0005; // Maximum speed when drag is at max length

		// Calculate the current vector length
		const currentVectorLength = Matter.Vector.magnitude(vector);

		// Limit the vector length to the maximum drag length
		const clampedVectorLength = Math.min(currentVectorLength, maxDragLength);

		// update vector based on clamped vector length
		vector = Matter.Vector.mult(
			Matter.Vector.normalise(vector),
			clampedVectorLength
		);
	}

	function endDrag() {
		isDragging = false;
		if (!activeDisc) return;

		const maxSpeed = activeDisc.mass * half * 0.0005;
		const maxDragLength = width * 0.1;
		// const forceMagnitude = maxSpeed * 1;

		const speed = (Matter.Vector.magnitude(vector) / maxDragLength) * maxSpeed;

		// Apply the scaled speed to the normalized vector (direction)
		const force = Matter.Vector.mult(Matter.Vector.normalise(vector), speed);

		// Apply force to active disc based on the vector
		// const force = Matter.Vector.mult(
		// 	Matter.Vector.normalise(vector),
		// 	Matter.Vector.magnitude(vector) / maxSpeed
		// );

		// Scale the speed proportionally to the vector length

		Matter.Body.applyForce(activeDisc, activeDisc.position, force);
	}

	function addDisc() {
		const x = half;
		const y = half + S.five * half;
		const r = half * S.disc;
		const density = 0.05;
		const restitution = 0.9;
		const frictionAir = 0.05;

		const disc = Matter.Bodies.circle(
			x,
			y,
			r,
			{
				density,
				restitution,
				frictionAir,
				render: { fillStyle: "#666" }
			},
			64
		);

		discs.push(disc);
		Matter.World.add(world, disc);
	}

	function setActiveDisc(event) {
		const mouseX = event.offsetX;
		const mouseY = event.offsetY;

		// Cast a ray at the mouse position to find the clicked disc
		const clickedDiscs = Matter.Query.point(discs, { x: mouseX, y: mouseY });

		if (clickedDiscs.length > 0) {
			// Set the first intersected disc as the active disc
			activeDisc = clickedDiscs[0];
			highlightActiveDisc();
		}
	}

	function highlightActiveDisc() {
		discs.forEach((disc) => {
			disc.render.fillStyle = disc.id === activeDisc.id ? "#000" : "#666"; // Red for active, blue for others
		});
	}

	function createZones() {
		const zone20 = Matter.Bodies.circle(
			half,
			half,
			half * S.twenty,
			{
				isStatic: true,
				isSensor: true,
				render: { fillStyle: "#f0f", lineWidth: 2 },
				label: "zone 20"
			},
			64
		);

		const zone15 = Matter.Bodies.circle(
			half,
			half,
			half * S.fifteen,
			{
				isStatic: true,
				isSensor: true,
				render: { fillStyle: "#0ff", lineWidth: 2 },
				label: "zone 15"
			},
			64
		);

		const zone10 = Matter.Bodies.circle(
			half,
			half,
			half * S.ten,
			{
				isStatic: true,
				isSensor: true,
				render: { fillStyle: "#0f0", lineWidth: 2 },
				label: "zone 10"
			},
			64
		);

		const zone5 = Matter.Bodies.circle(
			half,
			half,
			half * S.five,
			{
				isStatic: true,
				isSensor: true,
				render: { fillStyle: "#ff0", lineWidth: 2 },
				label: "zone 5"
			},
			64
		);

		const zoneSurface = Matter.Bodies.circle(
			half,
			half,
			half * S.surface,
			{
				isStatic: true,
				isSensor: true,
				render: { fillStyle: "#fff", lineWidth: 2 },
				label: "surface"
			},
			64
		);

		const zoneBase = Matter.Bodies.circle(
			half,
			half,
			half * S.base,
			{
				isStatic: true,
				isSensor: true,
				render: { fillStyle: "#ccc", lineWidth: 8 },
				label: "base"
			},
			64
		);

		Matter.World.add(world, [
			zoneBase,
			zoneSurface,
			zone5,
			zone10,
			zone15,
			zone20
		]);

		Matter.Events.on(engine, "collisionActive", (event) => {
			event.pairs.forEach(({ bodyA, bodyB }) => {
				const disc = discs.includes(bodyA)
					? bodyA
					: discs.includes(bodyB)
						? bodyB
						: null;

				const zone = zone20 === bodyA ? bodyA : zone20 === bodyB ? bodyB : null;

				if (disc && zone) {
					// console.log("intersection:", zone.label);

					// Calculate distance between the disc and the center of the 20 zone
					const distance = Matter.Vector.magnitude(
						Matter.Vector.sub(disc.position, zone.position)
					);

					// Get the radii of the disc and the 20 zone
					const discRadius = disc.circleRadius;
					// const zoneRadius = zone.circleRadius;
					// console.log(discRadius, zoneRadius);

					// // Calculate overlap based on the distance between centers
					// const overlap = discRadius - (distance - zoneRadius);

					// Define the overlap threshold (80% of the disc must be inside the hole)
					const distanceThreshold = discRadius * 0.67;
					const isClose = distance < distanceThreshold;
					const speedThreshold = 10;
					const isSlow = disc.speed < speedThreshold;
					// console.log(distance, distanceThreshold);
					// console.log("disc in 20:", distance, discRadius);

					if (isClose && isSlow && disc.restitution > 0.2) {
						trap.forEach((t) => {
							Matter.Body.set(t, "isSensor", false);
						});

						// scale down velocity
						Matter.Body.setVelocity(disc, {
							x: disc.velocity.x * 0.5,
							y: disc.velocity.y * 0.5
						});

						disc.restitution = 0.2;
						// disc.frictionAir = 0.1;
					}
				}
			});
		});
	}

	// function createZones() {
	// 	const zone20 = Matter.Bodies.circle(
	// 		half,
	// 		half,
	// 		half * S.twenty,
	// 		{
	// 			isStatic: true,
	// 			isSensor: true,
	// 			render: { fillStyle: "#f0f", lineWidth: 2 },
	// 			label: "zone 20"
	// 		},
	// 		64
	// 	);

	// 	const zone15 = Matter.Bodies.circle(
	// 		half,
	// 		half,
	// 		half * S.fifteen,
	// 		{
	// 			isStatic: true,
	// 			isSensor: true,
	// 			render: { fillStyle: "#0ff", lineWidth: 2 },
	// 			label: "zone 15"
	// 		},
	// 		64
	// 	);

	// 	const zone10 = Matter.Bodies.circle(
	// 		half,
	// 		half,
	// 		half * S.ten,
	// 		{
	// 			isStatic: true,
	// 			isSensor: true,
	// 			render: { fillStyle: "#0f0", lineWidth: 2 },
	// 			label: "zone 10"
	// 		},
	// 		64
	// 	);

	// 	const zone5 = Matter.Bodies.circle(
	// 		half,
	// 		half,
	// 		half * S.five,
	// 		{
	// 			isStatic: true,
	// 			isSensor: true,
	// 			render: { fillStyle: "#ff0", lineWidth: 2 },
	// 			label: "zone 5"
	// 		},
	// 		64
	// 	);

	// 	const zoneSurface = Matter.Bodies.circle(
	// 		half,
	// 		half,
	// 		half * S.surface,
	// 		{
	// 			isStatic: true,
	// 			isSensor: true,
	// 			render: { fillStyle: "#fff", lineWidth: 2 },
	// 			label: "surface"
	// 		},
	// 		64
	// 	);

	// 	const zoneBase = Matter.Bodies.circle(
	// 		half,
	// 		half,
	// 		half * S.base,
	// 		{
	// 			isStatic: true,
	// 			isSensor: true,
	// 			render: { fillStyle: "#ccc", lineWidth: 8 },
	// 			label: "base"
	// 		},
	// 		64
	// 	);

	// 	Matter.World.add(world, [
	// 		zoneBase,
	// 		zoneSurface,
	// 		zone5,
	// 		zone10,
	// 		zone15,
	// 		zone20
	// 	]);

	// 	Matter.Events.on(engine, "collisionStart", (event) => {
	// 		event.pairs.forEach(({ bodyA, bodyB }) => {
	// 			const disc = discs.includes(bodyA)
	// 				? bodyA
	// 				: discs.includes(bodyB)
	// 					? bodyB
	// 					: null;
	// 			const zone = [zone20, zone15, zone10, zone5, zoneSurface].includes(
	// 				bodyA
	// 			)
	// 				? bodyA
	// 				: [zone20, zone15, zone10, zone5, zoneSurface].includes(bodyB)
	// 					? bodyB
	// 					: null;

	// 			if (disc && zone) {
	// 				console.log("intersection:", zone.label);

	// 				// If the collision is with the 20 zone, perform the overlap check
	// 				if (zone.label === "zone 20") {
	// 					// Calculate distance between the disc and the center of the 20 zone
	// 					const distance = Matter.Vector.magnitude(
	// 						Matter.Vector.sub(disc.position, zone.position)
	// 					);

	// 					// Get the radii of the disc and the 20 zone
	// 					const discRadius = disc.circleRadius;
	// 					// const zoneRadius = zone.circleRadius;
	// 					// console.log(discRadius, zoneRadius);

	// 					// // Calculate overlap based on the distance between centers
	// 					// const overlap = discRadius - (distance - zoneRadius);

	// 					// Define the overlap threshold (80% of the disc must be inside the hole)
	// 					const distanceThreshold = discRadius * 0.67;
	// 					const close = distance < distanceThreshold;
	// 					console.log(distance, distanceThreshold);
	// 					// console.log("disc in 20:", distance, discRadius);

	// 					if (close) {
	// 						// trap.forEach((t) => {
	// 						// 	Matter.Body.set(t, "isSensor", false);
	// 						// });
	// 						// set velocity to opposite direction
	// 						console.log("set");
	// 						Matter.Body.setVelocity(disc, {
	// 							x: -disc.velocity.x,
	// 							y: -disc.velocity.y
	// 						});

	// 						// Optionally increase air friction once the disc is inside the hole
	// 						// disc.frictionAir = 0.2;

	// 						// If the disc is very close to the center, count it as a successful shot
	// 					}
	// 					// if (overlap < 0.8) {
	// 					// 	// Check if the disc's velocity is below a threshold to consider it falling in
	// 					// 	const speedLimit = 10;
	// 					// 	const speed = disc.speed;

	// 					// 	console.log({ speed, speedLimit });

	// 					// 	// Aim disc toward the center (half, half)
	// 					// 	const forceDirection = Matter.Vector.sub(
	// 					// 		{ x: half, y: half },
	// 					// 		disc.position
	// 					// 	);
	// 					// 	const normalizedForce = Matter.Vector.normalise(forceDirection);

	// 					// 	// Apply a force that increases as the disc gets closer to the center
	// 					// 	// This simulates the gravity pull toward the center
	// 					// 	const distanceToCenter = Matter.Vector.magnitude(forceDirection);
	// 					// 	const pullStrength = Math.min(1 * distanceToCenter, 1); // Increase the force as the disc gets closer, but cap it to prevent overshooting

	// 					// 	const pullForce = Matter.Vector.mult(
	// 					// 		normalizedForce,
	// 					// 		pullStrength
	// 					// 	);
	// 					// 	Matter.Body.applyForce(disc, disc.position, pullForce);

	// 					// 	// Increase air friction as disc gets closer, but keep it moving towards the center
	// 					// 	if (distanceToCenter < 5) {
	// 					// 		disc.frictionAir = 0.1; // Add friction only when very close
	// 					// 	} else {
	// 					// 		disc.frictionAir = 0.02; // Keep the friction low so it keeps moving
	// 					// 	}

	// 					// 	// If the disc is very close to the center, count it as 20
	// 					// 	if (distanceToCenter < 1) {
	// 					// 		console.log("Disc has fallen into the hole, count as 20!");

	// 					// 		// Remove the disc from the world and update the score
	// 					// 		// Matter.World.remove(world, disc);
	// 					// 		// addScore(20); // Assuming you have a scoring function
	// 					// 	}
	// 					// }
	// 				}
	// 			}
	// 		});
	// 	});
	// }

	function createTrap() {
		const wallCount = 8;
		const wallThickness = 1;
		const wallRadius = S.twenty * half;

		trap = [];

		for (let i = 0; i < wallCount; i++) {
			// Calculate angle for each wall
			const angle = (i / wallCount) * 2 * Math.PI;

			// Calculate the wall position around the center
			const wallX = half + Math.cos(angle) * wallRadius;
			const wallY = half + Math.sin(angle) * wallRadius;

			// Create the wall as a small static rectangle
			const wall = Matter.Bodies.rectangle(
				wallX,
				wallY,
				wallThickness,
				wallRadius * 1,
				{
					isStatic: true,
					isSensor: true,
					angle: angle,
					render: { visible: false }
				}
			);

			// Add the wall to the array of containment walls
			trap.push(wall);
		}

		// Add all walls to the world
		Matter.World.add(world, trap);
	}

	function createPegs() {
		const pegBodies = [];
		const pegRadius = width * 0.01; // Example peg radius
		const pegHeight = 20; // Height of pegs

		// Loop through 8 pegs
		for (let i = 0; i < 8; i++) {
			const angle = 3 / 8 + (i / 8) * Math.PI * 2;
			const x = half + Math.cos(angle) * half * S.fifteen;
			const y = half + Math.sin(angle) * half * S.fifteen;

			const peg = Matter.Bodies.circle(x, y, half * S.peg, {
				isStatic: true,
				restitution: 0.9,
				render: { fillStyle: "#000" }
			});

			pegBodies.push(peg);
		}

		Matter.World.add(world, pegBodies);
	}

	function flickDisc() {
		// Ensure there is at least one disc
		if (discs.length === 0) return;

		const disc = discs[discs.length - 1]; // Get the last added disc

		const maxSpeed = disc.mass * half * 0.0005;
		const forceMagnitude = maxSpeed * 0.5;

		const r = Math.random() * 0;

		const angle = Math.atan2(half - disc.position.y, half - disc.position.x);

		const forceX = forceMagnitude * Math.cos(angle);
		const forceY = forceMagnitude * Math.sin(angle);

		Matter.Body.applyForce(disc, disc.position, { x: forceX, y: forceY });
	}

	function createQuadrantLines(render, ctx) {
		const numLines = 4; // Four quadrants
		ctx.beginPath();
		ctx.strokeStyle = "#333"; // Black color for the lines
		ctx.lineWidth = 1;

		for (let i = 0; i < numLines; i++) {
			const angle = 3 / 4 + (i / numLines) * Math.PI * 2;

			// Calculate starting (innerR) and ending (outerR) points
			const x1 = half + Math.cos(angle) * half * S.five;
			const y1 = half + Math.sin(angle) * half * S.five;
			const x2 = half + Math.cos(angle) * half * S.ten;
			const y2 = half + Math.sin(angle) * half * S.ten;

			// Draw the line from the inner radius to the outer radius
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
		}
		ctx.stroke();
		ctx.closePath();
	}

	function drawVector(render, ctx) {
		if (!activeDisc || !vector) return;

		ctx.beginPath();
		ctx.strokeStyle = "#555";
		ctx.lineWidth = 2;

		// Draw a line from the active disc's center to the vector endpoint
		ctx.moveTo(activeDisc.position.x, activeDisc.position.y);
		ctx.lineTo(
			activeDisc.position.x + vector.x,
			activeDisc.position.y + vector.y
		);

		ctx.stroke();
		ctx.closePath();
	}

	onMount(() => {
		// Create the engine and world
		engine = Matter.Engine.create();
		world = engine.world;

		// Disable gravity (since it's top-down)
		world.gravity.y = 0;

		// Create a runner to control the update loop
		runner = Matter.Runner.create();

		// Set up the renderer
		const render = Matter.Render.create({
			element: canvas,
			engine: engine,
			options: {
				width,
				height,
				wireframes: false,
				pixelRatio: "auto",
				background: "transparent"
			}
		});

		Matter.Events.on(render, "afterRender", function () {
			const ctx = render.context;
			createQuadrantLines(render, ctx);
			drawVector(render, ctx);
		});

		createZones();
		createTrap();
		createPegs();

		// Run the engine using the runner
		Matter.Runner.run(runner, engine);

		// Start the renderer
		Matter.Render.run(render);
	});
</script>

<main>
	<div
		class="c"
		bind:this={canvas}
		on:click={setActiveDisc}
		on:mousedown={startDrag}
		on:mousemove={onDrag}
		on:mouseup={endDrag}
		style:width={`${width}px`}
		style:height={`${height}px`}
	></div>

	<div>
		<button on:click={flickDisc}>Flick Disc</button>
		<button on:click={addDisc}>Add Disc</button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: half;
		justify-content: half;
	}

	button {
		padding: 10px;
		font-size: 16px;
	}

	.c {
		margin: 0 auto;
	}
</style>
