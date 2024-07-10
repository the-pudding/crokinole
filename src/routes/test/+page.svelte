<script>
	import { onMount } from "svelte";
	import * as THREE from "three";
	import { OrbitControls } from "three/addons/controls/OrbitControls.js";

	/*
	Overall playing surface diameter: 26” (13” / ~330mm radius)
Outer circle diameter: 24” (12” / ~305mm radius)
Middle circle diameter: 16” (8” / ~203mm radius)
Inner circle diameter: 8” (4” / ~102mm radius)
Ditch: 2” (~51mm) minimum
20 hole diameter: 1 3/8” (35mm)
20 hole depth: 1/4” (6mm)
Dividing circle lines: 1/16” (1.5mm) to 1/8” (3mm)
Discs: 1 1/4” x 3/8” diameter (32mm x 10mm) Standard Crokinole discs
Rim: 1 1/2” (1/2”/12mm taller than the playing surface)
Playing surface: 1/2” thickness on most boards.


	*/

	const outerRadius = 0.3302;
	const innerRadius = 0.0175;
	const height = 0.0127;
	const ditch = 0.051;
	const rim = 0.00635;
	const rimHeight = 0.0381;
	const bottomHeight = height / 2;

	let el;
	let offsetWidth;
	let offsetHeight;

	function cylinderLathe(outerRadius, innerRadius, height) {
		const halfH = height * 0.5;

		const points = [
			new THREE.Vector2(innerRadius, -halfH),
			new THREE.Vector2(outerRadius, -halfH),
			new THREE.Vector2(outerRadius, halfH),
			new THREE.Vector2(innerRadius, halfH),
			new THREE.Vector2(innerRadius, -halfH)
		];

		let g = new THREE.LatheGeometry(points, 96);

		return g;
	}

	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(
			40,
			offsetWidth / offsetHeight,
			0.1,
			10
		);
		camera.position.set(1.1, 0.8, 0);
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(offsetWidth, offsetHeight);
		el.appendChild(renderer.domElement);

		const controls = new OrbitControls(camera, renderer.domElement);

		const light = new THREE.DirectionalLight(0xffffff, 1);
		// light.position.setScalar(10);
		scene.add(light);
		const size = 1;
		const divisions = 10;

		const gridHelper = new THREE.GridHelper(size, divisions);
		scene.add(gridHelper);

		scene.add(new THREE.AmbientLight(0xffffff, 0.5));

		const g = cylinderLathe(outerRadius, innerRadius, height);
		const m = new THREE.MeshStandardMaterial({
			color: 0x4488ff,
			flatShading: true
		});
		const o = new THREE.Mesh(g, m);
		o.position.set(0, height / 2 + bottomHeight / 2, 0);

		// let wm = new THREE.MeshBasicMaterial({ wireframe: true });
		// let wo = new THREE.Mesh(g, wm);
		// o.add(wo);

		// let pg = new THREE.BufferGeometry().setFromPoints(g.parameters.points);
		// let pm = new THREE.LineBasicMaterial({ color: 0x000000, depthTest: false });
		// let po = new THREE.Line(pg, pm);
		// o.add(po);

		// create new cylinder
		const bottom = outerRadius + ditch;
		const g2 = new THREE.CylinderGeometry(bottom, bottom, bottomHeight, 96);

		const m2 = new THREE.MeshStandardMaterial({
			color: 0xff4488,
			flatShading: true
		});

		const o2 = new THREE.Mesh(g2, m2);
		o2.position.set(0, bottomHeight / 2, 0);

		const g3 = cylinderLathe(bottom + rim, bottom, rimHeight);
		const m3 = new THREE.MeshStandardMaterial({
			color: 0xff88ff,
			flatShading: true
		});
		const o3 = new THREE.Mesh(g3, m3);
		o3.position.set(0, rimHeight / 2, 0);

		scene.add(o);
		scene.add(o2);
		scene.add(o3);
		renderer.setAnimationLoop(() => {
			renderer.render(scene, camera);
		});
	});
</script>

<div bind:this={el} bind:offsetWidth bind:offsetHeight></div>

<style>
	div {
		width: 600px;
		aspect-ratio: 1;
		margin: 0 auto;
		background: #000;
	}
</style>
