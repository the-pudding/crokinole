import * as T from "three";
export default function debug({ lines, scene, world }) {
	const { vertices, colors } = world.debugRender();
	const geometry = new T.BufferGeometry();

	// Clear previous lines
	lines.forEach((line) => {
		scene.remove(line);
		if (line.geometry) line.geometry.dispose();
		if (line.material) line.material.dispose();
	});
	lines = [];

	const positions = new Float32Array(vertices);
	const colorArray = new Float32Array(colors);

	const positionAttribute = new T.BufferAttribute(positions, 3);
	const colorAttribute = new T.BufferAttribute(colorArray, 4);

	geometry.setAttribute("position", positionAttribute);
	geometry.setAttribute("color", colorAttribute);

	const material = new T.LineBasicMaterial({ vertexColors: true });

	const line = new T.LineSegments(geometry, material);

	lines.push(line);
	scene.add(line);

	return lines;
}
