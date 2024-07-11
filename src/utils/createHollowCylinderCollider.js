import R from "@dimforge/rapier3d-compat";

function generateVertices(outerR, innerR, h, segments) {
	const halfH = h * 0.5;
	const points = [];

	// Outer vertices (bottom and top circles)
	for (let i = 0; i < segments; i++) {
		const angle = (i / segments) * Math.PI * 2;
		points.push(outerR * Math.cos(angle), -halfH, outerR * Math.sin(angle)); // Bottom outer circle
		points.push(outerR * Math.cos(angle), halfH, outerR * Math.sin(angle)); // Top outer circle
	}

	// Inner vertices (bottom and top circles)
	for (let i = 0; i < segments; i++) {
		const angle = (i / segments) * Math.PI * 2;
		points.push(innerR * Math.cos(angle), -halfH, innerR * Math.sin(angle)); // Bottom inner circle
		points.push(innerR * Math.cos(angle), halfH, innerR * Math.sin(angle)); // Top inner circle
	}

	return new Float32Array(points);
}

export default function createHollowCylinderCollider(
	outerR,
	innerR,
	h,
	segments
) {
	const vertices = generateVertices(outerR, innerR, h, segments);

	// Create the convex hull collider
	const colliderDesc = R.ColliderDesc.convexHull(vertices);
	return colliderDesc;
}
