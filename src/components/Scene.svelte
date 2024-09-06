<script>
	import { T, useFrame } from "@threlte/core";
	import { OrbitControls } from "@threlte/extras";
	import { interactivity } from "@threlte/extras";
	import { gameState } from "$stores/game.js";
	import { writable } from "svelte/store";
	import * as THREE from "three";

	interactivity();

	// Writables
	let discs = writable([]);
	let fallingDiscs = writable([]);
	let dragStart = null;
	let currentDisc = writable(null);
	let flickDirection = writable({ x: 0, z: 0 });

	// Constants
	const FLICK_STRENGTH_FACTOR = 0.001;
	const FRICTION = 0.98;
	const BOARD_RADIUS = 2;
	const COLLISION_DAMPING = 0.8;
	const CENTER_HOLE_RADIUS = 0.15;
	const GRAVITY = -9.8;
	const FALL_DURATION = 1; // seconds

	// Circles
	const INNER_CIRCLE_RADIUS = BOARD_RADIUS / 4;
	const MIDDLE_CIRCLE_RADIUS = BOARD_RADIUS / 1.6;
	const OUTER_CIRCLE_RADIUS = BOARD_RADIUS;

	// Constants for pegs
	const PEG_RADIUS = 0.02;
	const PEG_HEIGHT = 0.1;
	const NUM_PEGS = 8;
	const PEG_CIRCLE_RADIUS = INNER_CIRCLE_RADIUS; // Set to match the inner circle

	// Colors
	const LIGHT_WOOD_COLOR = new THREE.Color("#D2B48C"); // Light wood color (e.g., maple)
	const DARK_WOOD_COLOR = new THREE.Color("#8B4513"); // Dark wood color (e.g., walnut)

	// Discs
	const DISC_RADIUS = 0.1;
	const DISC_HEIGHT = 0.05;

	// Update the custom shader
	const discVertexShader = `
		varying vec2 vUv;
		varying vec3 vPosition;
		varying vec3 vNormal;
		void main() {
			vUv = uv;
			vPosition = position;
			vNormal = normal;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`;

	const discFragmentShader = `
		uniform vec3 color;
		uniform float centerHoleRadius;
		uniform float discRadius;
		uniform float boardHeight;
		uniform float glossiness;
		uniform float transparency;
		varying vec2 vUv;
		varying vec3 vPosition;
		varying vec3 vNormal;

		void main() {
			float distFromCenter = length(vPosition.xz);
			float clipHeight = boardHeight - (vPosition.y + ${DISC_HEIGHT / 2.0});
			// float visibleRadius = mix(discRadius, centerHoleRadius, clipHeight / ${DISC_HEIGHT}); // Makes more rounded.
			float visibleRadius = mix(discRadius, centerHoleRadius, clipHeight);
			if (distFromCenter > visibleRadius) {
			discard;
			}

			// Simple lighting calculation
			vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
			float diff = max(dot(vNormal, lightDir), 0.0);
			vec3 viewDir = normalize(-vPosition);
			vec3 reflectDir = reflect(-lightDir, vNormal);
			float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * glossiness;

			vec3 finalColor = color * (diff + 0.5) + vec3(spec);
			
			gl_FragColor = vec4(finalColor, transparency);
		}
	`;

	// Update the createDiscMaterial function
	const createDiscMaterial = (isLightWood, isCenterHole) => {
		return new THREE.ShaderMaterial({
			uniforms: {
				color: { value: isLightWood ? LIGHT_WOOD_COLOR : DARK_WOOD_COLOR },
				centerHoleRadius: { value: CENTER_HOLE_RADIUS },
				discRadius: { value: DISC_RADIUS },
				boardHeight: { value: 0 },
				glossiness: { value: 0.8 },
				transparency: { value: 1.0 }
			},
			vertexShader: discVertexShader,
			fragmentShader: discFragmentShader,
			side: THREE.DoubleSide,
			transparent: true
		});
	};

	function startFlick(event) {
		if (
			($gameState.currentPlayer === "player1" && $gameState.player1Discs > 0) ||
			($gameState.currentPlayer === "player2" && $gameState.player2Discs > 0)
		) {
			dragStart = {
				x: event.nativeEvent.clientX,
				y: event.nativeEvent.clientY
			};
			const position = event.point;
			currentDisc.set({
				position: { x: position.x, y: DISC_HEIGHT / 2, z: position.z },
				velocity: { x: 0, y: 0, z: 0 },
				player: $gameState.currentPlayer
			});
		}
	}

	function updateFlick(event) {
		if (dragStart && $currentDisc) {
			const dragCurrent = {
				x: event.nativeEvent.clientX,
				y: event.nativeEvent.clientY
			};
			const dx = dragCurrent.x - dragStart.x;
			const dy = dragCurrent.y - dragStart.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			const angle = Math.atan2(dy, dx);

			flickDirection.set({
				x: -Math.cos(angle) * distance * FLICK_STRENGTH_FACTOR,
				z: -Math.sin(angle) * distance * FLICK_STRENGTH_FACTOR
			});
		}
	}

	function endFlick(event) {
		if (dragStart && $currentDisc) {
			const flickedDisc = {
				...$currentDisc,
				velocity: {
					x: $flickDirection.x,
					y: 0,
					z: $flickDirection.z
				}
			};
			discs.update((d) => [...d, flickedDisc]);

			gameState.update((state) => ({
				...state,
				[state.currentPlayer + "Discs"]:
					state[state.currentPlayer + "Discs"] - 1,
				currentPlayer: state.currentPlayer === "player1" ? "player2" : "player1"
			}));

			dragStart = null;
			currentDisc.set(null);
			flickDirection.set({ x: 0, z: 0 });
		}
	}

	function isDiscOutOfBounds(disc) {
		const distanceFromCenter = Math.sqrt(
			disc.position.x ** 2 + disc.position.z ** 2
		);
		return distanceFromCenter > BOARD_RADIUS - DISC_RADIUS;
	}

	function isDiscInCenterHole(disc) {
		const distanceFromCenter = Math.sqrt(
			disc.position.x ** 2 + disc.position.z ** 2
		);
		return distanceFromCenter < CENTER_HOLE_RADIUS;
	}

	function checkDiscCollision(disc1, disc2) {
		const dx = disc1.position.x - disc2.position.x;
		const dz = disc1.position.z - disc2.position.z;
		const distance = Math.sqrt(dx * dx + dz * dz);

		if (distance < DISC_RADIUS * 2) {
			// Collision detected
			const angle = Math.atan2(dz, dx);
			const sin = Math.sin(angle);
			const cos = Math.cos(angle);

			// Rotate disc velocities
			let vx1 = disc1.velocity.x * cos + disc1.velocity.z * sin;
			let vz1 = disc1.velocity.z * cos - disc1.velocity.x * sin;
			let vx2 = disc2.velocity.x * cos + disc2.velocity.z * sin;
			let vz2 = disc2.velocity.z * cos - disc2.velocity.x * sin;

			// Collision reaction
			const temp = vx1;
			vx1 = vx2 * COLLISION_DAMPING;
			vx2 = temp * COLLISION_DAMPING;

			// Rotate velocities back
			disc1.velocity.x = vx1 * cos - vz1 * sin;
			disc1.velocity.z = vz1 * cos + vx1 * sin;
			disc2.velocity.x = vx2 * cos - vz2 * sin;
			disc2.velocity.z = vz2 * cos + vx2 * sin;

			// Move discs apart to prevent sticking
			const overlap = (DISC_RADIUS * 2 - distance) / 2;
			disc1.position.x += overlap * cos;
			disc1.position.z += overlap * sin;
			disc2.position.x -= overlap * cos;
			disc2.position.z -= overlap * sin;
		}
	}

	function startFallingAnimation(disc, isCenterHole) {
		const fallTarget = isCenterHole ? -1 : -2; // Fall further if off the board
		const material = createDiscMaterial(
			disc.player === "player1",
			isCenterHole
		);
		fallingDiscs.update((fd) => [
			...fd,
			{
				...disc,
				fallStart: disc.position.y,
				fallTarget,
				fallProgress: 0,
				isCenterHole,
				material
			}
		]);
	}

	function generatePegPositions() {
		const pegPositions = [];
		for (let i = 0; i < NUM_PEGS; i++) {
			const angle = (i / NUM_PEGS) * Math.PI * 2;
			const x = Math.cos(angle) * PEG_CIRCLE_RADIUS;
			const z = Math.sin(angle) * PEG_CIRCLE_RADIUS;
			pegPositions.push({ x, z });
		}
		return pegPositions;
	}

	const pegPositions = generatePegPositions();

	useFrame((_, delta) => {
		discs.update((d) => {
			let discsToBeFalled = [];

			// Update positions and check for collisions
			for (let i = 0; i < d.length; i++) {
				d[i].position.x += d[i].velocity.x * delta * 60;
				d[i].position.z += d[i].velocity.z * delta * 60;
				d[i].velocity.x *= FRICTION;
				d[i].velocity.z *= FRICTION;

				// Check collisions with other discs
				for (let j = i + 1; j < d.length; j++) {
					checkDiscCollision(d[i], d[j]);
				}

				// Check collisions with pegs
				for (const peg of pegPositions) {
					const dx = d[i].position.x - peg.x;
					const dz = d[i].position.z - peg.z;
					const distance = Math.sqrt(dx * dx + dz * dz);

					if (distance < DISC_RADIUS + PEG_RADIUS) {
						// Collision with peg detected
						const angle = Math.atan2(dz, dx);

						// Calculate the normal and tangent vectors
						const normal = { x: Math.cos(angle), z: Math.sin(angle) };
						const tangent = { x: -normal.z, z: normal.x };

						// Project velocity onto normal and tangent
						const normalVelocity =
							d[i].velocity.x * normal.x + d[i].velocity.z * normal.z;
						const tangentVelocity =
							d[i].velocity.x * tangent.x + d[i].velocity.z * tangent.z;

						// Reverse the normal velocity and apply damping
						const newNormalVelocity = -normalVelocity * COLLISION_DAMPING;

						// Recombine velocities
						d[i].velocity.x =
							newNormalVelocity * normal.x + tangentVelocity * tangent.x;
						d[i].velocity.z =
							newNormalVelocity * normal.z + tangentVelocity * tangent.z;

						// Move disc outside of peg
						const overlapDistance = DISC_RADIUS + PEG_RADIUS - distance;
						d[i].position.x += normal.x * overlapDistance;
						d[i].position.z += normal.z * overlapDistance;
					}
				}

				// Check if disc should start falling
				if (isDiscOutOfBounds(d[i])) {
					discsToBeFalled.push({ disc: d[i], isCenterHole: false });
				} else if (isDiscInCenterHole(d[i])) {
					discsToBeFalled.push({ disc: d[i], isCenterHole: true });
				}
			}

			// Start falling animation for discs that are out of bounds or in the center hole
			discsToBeFalled.forEach(({ disc, isCenterHole }) => {
				startFallingAnimation(disc, isCenterHole);
			});

			// Remove discs that have started falling
			return d.filter(
				(disc) =>
					!discsToBeFalled.some((fallingDisc) => fallingDisc.disc === disc)
			);
		});

		// Update falling discs
		fallingDiscs.update((fd) => {
			return fd.filter((disc) => {
				disc.fallProgress += delta / FALL_DURATION;
				if (disc.fallProgress >= 1) {
					return false; // Remove completed animations
				}

				// Update position using a simple physics equation
				disc.position.y =
					disc.fallStart +
					0.5 * GRAVITY * Math.pow(disc.fallProgress * FALL_DURATION, 2);

				// If it's falling off the board, add some horizontal movement
				if (!disc.isCenterHole) {
					const direction = Math.atan2(disc.position.z, disc.position.x);
					disc.position.x += Math.cos(direction) * 0.01;
					disc.position.z += Math.sin(direction) * 0.01;
				}

				// Update shader uniform
				disc.material.uniforms.boardHeight.value =
					disc.position.y + DISC_HEIGHT / 2;

				return true;
			});
		});
	});

	import CustomArrowIndicator from "./CustomArrowIndicator.svelte";
	$: arrowProps =
		$currentDisc && $flickDirection
			? {
					start: new THREE.Vector3(
						$currentDisc.position.x,
						0.1,
						$currentDisc.position.z
					),
					direction: new THREE.Vector3(
						-$flickDirection.x,
						0,
						-$flickDirection.z
					).normalize(),
					length: Math.min(
						Math.max(
							Math.sqrt($flickDirection.x ** 2 + $flickDirection.z ** 2) * 100,
							0.2
						),
						2
					),
					color: 0x000000
				}
			: null;
</script>

<T.PerspectiveCamera makeDefault position={[0, 5, 5]} fov={40}>
	<OrbitControls enableZoom={true} enableRotate={false} />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.5} />
<T.DirectionalLight position={[10, 10, 5]} intensity={1} castShadow />

<!-- Board -->
<T.Mesh
	position={[0, -0.1, 0]}
	rotation.x={-Math.PI / 2}
	on:pointerdown={startFlick}
	on:pointermove={updateFlick}
	on:pointerup={endFlick}
	on:pointerleave={endFlick}
	receiveShadow
>
	<T.RingGeometry args={[CENTER_HOLE_RADIUS, BOARD_RADIUS, 192]} />
	<T.MeshStandardMaterial color="#eac89e" />
</T.Mesh>

<!-- Board outline -->
<T.Mesh position={[0, -0.05, 0]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.RingGeometry args={[BOARD_RADIUS - 0.1, BOARD_RADIUS, 192]} />
	<T.MeshStandardMaterial color="#000000" />
</T.Mesh>

<!-- Center hole -->
<T.Mesh position={[0, -0.15, 0]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.CircleGeometry args={[CENTER_HOLE_RADIUS, 32]} />
	<T.MeshStandardMaterial color="#000000" />
</T.Mesh>

<!-- Inner circle -->
<T.Mesh position={[0, -0.089, 0]} rotation.x={-Math.PI / 2}>
	<T.RingGeometry
		args={[INNER_CIRCLE_RADIUS - 0.005, INNER_CIRCLE_RADIUS + 0.005, 64]}
	/>
	<T.MeshBasicMaterial color="#000000" />
</T.Mesh>

<!-- Middle circle -->
<T.Mesh position={[0, -0.089, 0]} rotation.x={-Math.PI / 2}>
	<T.RingGeometry
		args={[MIDDLE_CIRCLE_RADIUS - 0.005, MIDDLE_CIRCLE_RADIUS + 0.005, 64]}
	/>
	<T.MeshBasicMaterial color="#000000" />
</T.Mesh>

<!-- Outer circle -->
<T.Mesh position={[0, -0.089, 0]} rotation.x={-Math.PI / 2}>
	<T.RingGeometry
		args={[OUTER_CIRCLE_RADIUS - 0.005, OUTER_CIRCLE_RADIUS + 0.005, 64]}
	/>
	<T.MeshBasicMaterial color="#000000" />
</T.Mesh>

<!-- Pegs -->
{#each pegPositions as peg}
	<T.Mesh position={[peg.x, -0.089 / 2, peg.z]}>
		<T.CylinderGeometry args={[PEG_RADIUS, PEG_RADIUS, PEG_HEIGHT, 16]} />
		<T.MeshStandardMaterial color="#8B4513" />
	</T.Mesh>
{/each}

<!-- Discs -->
{#each $discs as disc, i (i)}
	<T.Mesh position={[disc.position.x, disc.position.y, disc.position.z]}>
		<T.CylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, DISC_HEIGHT, 32]} />
		<T.ShaderMaterial
			args={[createDiscMaterial(disc.player === "player1", false)]}
		/>
	</T.Mesh>
{/each}

<!-- Falling discs -->
{#each $fallingDiscs as disc, i (i)}
	<T.Mesh
		position={[disc.position.x, disc.position.y, disc.position.z]}
		material={disc.material}
	>
		<T.CylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, DISC_HEIGHT, 32]} />
	</T.Mesh>
{/each}

<!-- Active disc -->
{#if $currentDisc}
	<T.Mesh
		position={[
			$currentDisc.position.x,
			$currentDisc.position.y,
			$currentDisc.position.z
		]}
	>
		<T.CylinderGeometry args={[DISC_RADIUS, DISC_RADIUS, DISC_HEIGHT, 32]} />
		<T.ShaderMaterial
			args={[createDiscMaterial($currentDisc.player === "player1", false)]}
			wireframe={true}
		/>
	</T.Mesh>

	<!-- Arrow -->
	{#if arrowProps}
		<CustomArrowIndicator {...arrowProps} />
	{/if}
{/if}
