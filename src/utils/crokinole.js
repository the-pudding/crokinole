import Matter from "matter-js";
import * as S from "$data/specs.js";
import variables from "$data/variables.json";

const DISC_CATEGORY = 0x0001;
const PEG_CATEGORY = 0x0002;
const TRAP_CATEGORY = 0x0004;
const RIM_CATEGORY = 0x0008;
const SURFACE_CATEGORY = 0x0010;
const DISC_RESTITUTION = 0.9;
const DISC_DENSITY = 0.05;
const DISC_FRICTIONAIR = 0.05;

const COLOR = {
	player1: variables.color["pink-aa"],
	player2: variables.color["teal-aa"],
	active: variables.color["black"],
	vector: variables.color["black"]
};

// Define a simple event emitter class
class EventEmitter {
	constructor() {
		this.events = {};
	}

	// Register an event listener
	on(event, listener) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(listener);
	}

	// Emit an event
	emit(event, data) {
		if (this.events[event]) {
			this.events[event].forEach((listener) => listener(data));
		}
	}
}

export default function createCrokinoleSimulation() {
	const emitter = new EventEmitter(); // Event emitter instance

	let engine;
	let world;
	let runner;
	let render;
	let mid;
	let shotMaxMagnitude;
	let shotMaxIndicatorMagnitude;
	let shotVector;
	let indicatorVector;
	let indicatorVisible;

	// things to carry over on resize
	let discs = [];
	let state; // idle, position, shoot, play
	let activeDisc;

	function updateDiscColors() {
		// discs.forEach((d) => {
		// 	d.render.lineWidth = d.id === activeDisc?.id ? 3 : 0;
		// });
	}

	function createZones() {
		const zone20 = Matter.Bodies.circle(
			mid,
			mid,
			mid * S.twenty,
			{
				isStatic: true,
				isSensor: true,
				render: {
					visible: false
				},
				label: "20"
			},
			64
		);

		Matter.World.add(world, [zone20]);
	}

	function createTrap20() {
		const wallCount = 16;
		const wallThickness = Math.max(2, mid * 0.05);
		const wallRadius = S.twenty * mid + wallThickness / 2 - 1;

		const trap = [];

		for (let i = 0; i < wallCount; i++) {
			// Calculate angle for each wall
			const angle = (i / wallCount) * 2 * Math.PI;

			// Calculate the wall position around the center
			const wallX = mid + Math.cos(angle) * wallRadius;
			const wallY = mid + Math.sin(angle) * wallRadius;
			const wallLength = (2 * Math.PI * wallRadius) / wallCount;

			// Create the wall as a small static rectangle
			const wall = Matter.Bodies.rectangle(
				wallX,
				wallY,
				wallThickness,
				wallLength,
				{
					isStatic: true,
					isSensor: false,
					angle: angle,
					render: { visible: false },
					label: "trap 20",
					collisionFilter: {
						category: TRAP_CATEGORY,
						mask: DISC_CATEGORY
					}
				}
			);

			trap.push(wall);
		}

		Matter.World.add(world, trap);
	}

	function createTrapRim() {
		const wallCount = 32;
		const wallThickness = Math.max(8, mid * 0.2);
		const wallRadius = S.base * mid + wallThickness / 2 - 1;

		const trap = [];

		for (let i = 0; i < wallCount; i++) {
			// Calculate angle for each wall
			const angle = (i / wallCount) * 2 * Math.PI;

			// Calculate the wall position around the center
			const wallX = mid + Math.cos(angle) * wallRadius;
			const wallY = mid + Math.sin(angle) * wallRadius;
			const wallLength = (2 * Math.PI * wallRadius) / wallCount;

			// Create the wall as a small static rectangle
			const wall = Matter.Bodies.rectangle(
				wallX,
				wallY,
				wallThickness,
				wallLength,
				{
					isStatic: true,
					isSensor: false,
					angle: angle,
					render: { visible: false },
					label: "trap rim",
					collisionFilter: {
						category: RIM_CATEGORY,
						mask: DISC_CATEGORY
					}
				}
			);

			trap.push(wall);
		}

		Matter.World.add(world, trap);
	}

	function createTrapSurface() {
		const wallCount = 32;
		const wallThickness = Math.max(8, mid * 0.1);
		const wallRadius = S.surface * mid - wallThickness / 2 + 1;

		const trap = [];

		for (let i = 0; i < wallCount; i++) {
			// Calculate angle for each wall
			const angle = (i / wallCount) * 2 * Math.PI;

			// Calculate the wall position around the center
			const wallX = mid + Math.cos(angle) * wallRadius;
			const wallY = mid + Math.sin(angle) * wallRadius;
			const wallLength = (2 * Math.PI * wallRadius) / wallCount;

			// Create the wall as a small static rectangle
			const wall = Matter.Bodies.rectangle(
				wallX,
				wallY,
				wallThickness,
				wallLength,
				{
					isStatic: true,
					isSensor: false,
					angle: angle,
					render: { visible: false },
					label: "trap surface",
					collisionFilter: {
						category: SURFACE_CATEGORY,
						mask: DISC_CATEGORY
					}
				}
			);

			trap.push(wall);
		}

		Matter.World.add(world, trap);
	}

	function createPegs() {
		const pegBodies = [];
		const r = S.peg * mid;

		// Loop through 8 pegs
		for (let i = 0; i < 8; i++) {
			const angle = 3 / 8 + (i / 8) * Math.PI * 2;
			const x = mid + Math.cos(angle) * mid * S.fifteen;
			const y = mid + Math.sin(angle) * mid * S.fifteen;

			const peg = Matter.Bodies.circle(x, y, r, {
				isStatic: true,
				restitution: 0.9,
				render: { visible: false },
				collisionFilter: {
					category: PEG_CATEGORY,
					mask: DISC_CATEGORY
				}
			});

			pegBodies.push(peg);
		}

		Matter.World.add(world, pegBodies);
	}

	function drawIndicator(ctx) {
		if (!activeDisc || !indicatorVector) return;

		const discRadius = activeDisc.circleRadius; // Get the radius of the disc

		// Calculate the direction of the vector (normalized)
		const normalizedVector = Matter.Vector.normalise(indicatorVector);

		// Shift the starting point to the edge of the disc by moving in the direction of the normalized vector
		// start from outer edge of disc
		// old
		// const startX = activeDisc.position.x + normalizedVector.x;
		// const startY = activeDisc.position.y + normalizedVector.y;
		// new
		const startX =
			activeDisc.position.x + normalizedVector.x * discRadius * 1.25;
		const startY =
			activeDisc.position.y + normalizedVector.y * discRadius * 1.25;

		// Calculate the end points for the main line and the opposite dashed line (min should be 0, or the same as the start)
		// old
		// const endX = activeDisc.position.x + indicatorVector.x;
		// const endY = activeDisc.position.y + indicatorVector.y;
		// new
		const endX =
			activeDisc.position.x +
			normalizedVector.x * discRadius * 1.5 +
			indicatorVector.x;
		const endY =
			activeDisc.position.y +
			normalizedVector.y * discRadius * 1.5 +
			indicatorVector.y;

		// const mirrorX = activeDisc.position.x - indicatorVector.x;
		// const mirrorY = activeDisc.position.y - indicatorVector.y;

		// Start drawing the main indicator line
		ctx.beginPath();
		ctx.strokeStyle = COLOR.vector;
		ctx.lineWidth = 2;

		// Draw the solid line starting from the outer edge of the disc
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();

		// Draw the arrow at the end of the line
		const arrowLength = mid * 0.03; // Length of the arrowhead
		const arrowAngle = Math.PI / 4; // Angle for the arrowhead

		// Calculate direction of the arrow based on the indicatorVector
		const angle = Math.atan2(indicatorVector.y, indicatorVector.x);

		// Draw the two lines of the arrowhead
		ctx.beginPath();
		ctx.moveTo(endX, endY);
		ctx.lineTo(
			endX - arrowLength * Math.cos(angle - arrowAngle),
			endY - arrowLength * Math.sin(angle - arrowAngle)
		);
		ctx.moveTo(endX, endY);
		ctx.lineTo(
			endX - arrowLength * Math.cos(angle + arrowAngle),
			endY - arrowLength * Math.sin(angle + arrowAngle)
		);
		ctx.stroke();

		// Draw the dashed line in the mirror opposite direction, also starting from the disc's edge
		// const mirrorStartX =
		// 	activeDisc.position.x - normalizedVector.x * discRadius;
		// const mirrorStartY =
		// 	activeDisc.position.y - normalizedVector.y * discRadius;

		// ctx.setLineDash([5, 5]); // Define the dash pattern [dash length, space length]
		// ctx.beginPath();
		// ctx.moveTo(mirrorStartX, mirrorStartY);
		// ctx.lineTo(mirrorX, mirrorY);
		// ctx.stroke();
		// ctx.setLineDash([]); // Reset to solid lines for future drawing

		ctx.closePath();
	}

	function afterRender() {
		const ctx = render.context;
		// renderQuadrantLines(ctx);
		if (indicatorVisible) drawIndicator(ctx);
	}

	function collisionActive(event) {
		// twenty hole
		event.pairs.forEach(({ bodyA, bodyB }) => {
			const disc =
				bodyA.label === "disc" ? bodyA : bodyB.label === "disc" ? bodyB : null;
			const zone20 =
				bodyA.label === "20" ? bodyA : bodyB.label === "20" ? bodyB : null;

			if (disc && zone20 && !disc.in20) {
				const dist = Matter.Vector.magnitude(
					Matter.Vector.sub(disc.position, zone20.position)
				);

				const discRadius = disc.circleRadius;

				const distThreshold = discRadius * 0.75;
				const speedThreshold = 10;

				const isClose = dist < distThreshold;
				const isSlow = disc.speed < speedThreshold;

				const enableTrap = isClose && isSlow;

				if (enableTrap) {
					disc.in20 = true;
					disc.collisionFilter.mask =
						DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | TRAP_CATEGORY;

					// Matter.Body.setVelocity(disc, {
					// 	x: disc.velocity.x * 0.5,
					// 	y: disc.velocity.y * 0.5
					// });

					disc.restitution = 0.4;
				}
			}
		});
	}

	function collisionStart(event) {
		event.pairs.forEach(({ bodyA, bodyB }) => {
			const disc =
				bodyA.label === "disc" ? bodyA : bodyB.label === "disc" ? bodyB : null;

			const otherDisc =
				bodyA.label === "disc" && bodyA.id !== disc.id
					? bodyA
					: bodyB.label === "disc" && bodyB.id !== disc.id
						? bodyB
						: null;

			const rim =
				bodyA.label === "trap rim"
					? bodyA
					: bodyB.label === "trap rim"
						? bodyB
						: null;

			if (disc && rim) {
				disc.frictionAir = 0.3;
				disc.collisionFilter.mask =
					DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | SURFACE_CATEGORY;
			} else if (disc && otherDisc) {
				disc.collided = true;
				otherDisc.collided = true;
				const opp = disc.player !== otherDisc.player;
				disc.collidedOpp = opp;
				otherDisc.collidedOpp = opp;
			}
		});
	}

	function updateShotVector({ target, speed }) {
		if (!activeDisc) return;
		const vector = {
			x: target.x - activeDisc.position.x,
			y: target.y - activeDisc.position.y
		};

		const normalizedVector = Matter.Vector.normalise(vector);

		if (speed) {
			// preset flick - if its just a speed and a target
			const shotVectorMagnitude = speed * shotMaxMagnitude;
			shotVector = Matter.Vector.mult(normalizedVector, shotVectorMagnitude);
		} else {
			// user flick
			const currentMagnitude = Matter.Vector.magnitude(vector);
			const indicatorMagnitude = Math.min(
				currentMagnitude,
				shotMaxIndicatorMagnitude
			);

			const shotVectorMagnitude =
				(indicatorMagnitude / shotMaxIndicatorMagnitude) * shotMaxMagnitude;

			// update vector based on clamped vector length
			shotVector = Matter.Vector.mult(normalizedVector, shotVectorMagnitude);

			// visual version
			indicatorVector = Matter.Vector.mult(
				normalizedVector,
				indicatorMagnitude
			);
		}
	}

	function panCameraToFollowDisc(disc) {
		// Define how much margin you want around the disc when following
		const margin = 100; // Adjust this value to control how much margin around the disc

		// Calculate the bounds to center the camera on the disc
		render.bounds.min.x = disc.position.x - render.options.width / 2 + margin;
		render.bounds.min.y = disc.position.y - render.options.height / 2 + margin;
		render.bounds.max.x = disc.position.x + render.options.width / 2 - margin;
		render.bounds.max.y = disc.position.y + render.options.height / 2 - margin;
	}

	function zoomCamera(scale) {
		const centerX = (render.bounds.min.x + render.bounds.max.x) / 2;
		const centerY = (render.bounds.min.y + render.bounds.max.y) / 2;

		// Apply zoom by scaling the bounds
		const newWidth = render.options.width * scale;
		const newHeight = render.options.height * scale;

		render.bounds.min.x = centerX - newWidth / 2;
		render.bounds.min.y = centerY - newHeight / 2;
		render.bounds.max.x = centerX + newWidth / 2;
		render.bounds.max.y = centerY + newHeight / 2;
	}

	function afterUpdate() {
		// const threshold = 0.1;
		// const stillMoving = discs.some((d) => d.speed >= threshold);
	}

	function getZoneForDisc(disc) {
		const center = { x: mid, y: mid };

		const discR = disc.circleRadius;
		const discP = disc.position;

		const distance = Math.sqrt(
			Math.pow(discP.x - center.x, 2) + Math.pow(discP.y - center.y, 2)
		);

		const zones = [
			{ r: mid * S.twenty, score: 20 },
			{ r: mid * S.fifteen, score: 15 },
			{ r: mid * S.ten, score: 10 },
			{ r: mid * S.five, score: 5 }
		];

		// see if it is outside, if not move on
		const match = zones.find((zone) => distance + discR < zone.r);

		return match?.score || 0;
	}

	function getIntersect15(disc) {
		const center = { x: mid, y: mid };

		const discR = disc.circleRadius;
		const discP = disc.position;

		const distance = Math.sqrt(
			Math.pow(discP.x - center.x, 2) + Math.pow(discP.y - center.y, 2)
		);

		const zoneR = mid * S.fifteen;

		if (distance - discR < zoneR) return true;
	}

	function sleepStart() {
		// check if all discs sleeping
		const allSleeping = discs.every((d) => d.isSleeping);

		if (allSleeping) {
			// score
			discs.forEach((d) => {
				d.score = getZoneForDisc(d);
				d.intersect15 = getIntersect15(d);
			});

			// validate
			// opponents on board
			const hasOpps = discs.some((d) => d.player !== activeDisc.player);
			const collidedOpp = discs.some((d) => d.collidedOpp);
			const intersected15 = discs
				.filter((d) => d.player === activeDisc.player)
				.some((d) => d.intersect15);
			discs.forEach((d) => {
				// opponent on board
				if (hasOpps) {
					// same as shooter
					const samePlayer = d.player === activeDisc.player;
					if (samePlayer) {
						// if shooter
						const isShooter = d.id === activeDisc.id;
						if (isShooter) {
							d.valid = collidedOpp;
						} else {
							// if non-shooter (if it collided, one disc must have opp collided)
							d.valid = d.collided ? collidedOpp : true;
						}
					} else {
						// opp is always valid
						d.valid = true;
					}
				} else {
					// no opps on board - open 20
					if (d.id === activeDisc.id) {
						d.valid = d.collided ? intersected15 : d.intersect15;
					} else {
						// one disc must be in or on 15 or it didn't get touched
						d.valid = d.collided ? intersected15 : true;
					}
				}
				if (!d.valid || !d.score) Matter.World.remove(world, d);
			});

			// was active disc valid?
			const valid = discs.find((d) => d.id === activeDisc.id).valid;

			// clean up
			discs = discs.filter((d) => d.score > 0 && d.valid);

			const scores = discs.map((d) => ({ player: d.player, score: d.score }));

			// remove 20
			discs.forEach((d) => {
				if (d.score === 20) Matter.World.remove(world, d);
			});

			discs = discs.filter((d) => d.score !== 20);

			activeDisc = null;

			discs.forEach((d) => {
				d.valid = undefined;
				d.collided = undefined;
				d.collidedOpp = undefined;
				d.intersect15 = undefined;
				d.in20 = undefined;
			});

			setState("idle");
			// console.log(
			// 	discs[0].position.x / (mid * 2),
			// 	discs[0].position.y / (mid * 2)
			// );
			emitter.emit("shotComplete", { scores, valid });
		}
		// TODO fire event that says shot all done and provide disc status
		// discs.map(d => d)
	}

	function clearInstance() {
		// Clear the world bodies
		Matter.Composite.clear(world, false);

		// Remove engine events
		Matter.Events.off(engine);

		// Stop the render and remove canvas
		Matter.Render.stop(render);
		render.canvas.remove();
		render.context = null;
		render.textures = {};

		// Stop the runner
		Matter.Runner.stop(runner);
	}

	function reAddDiscs(prevMid) {
		discs.forEach((disc) => {
			// move position of discs scaled based on prevMid compared to mid
			const s = mid / prevMid;
			const x = disc.position.x * s;
			const y = disc.position.y * s;
			Matter.Body.setPosition(disc, { x, y });
			Matter.Body.scale(disc, s, s);
			Matter.World.add(world, disc);
		});
	}

	// public methods
	function removeDiscs() {
		discs.forEach((disc) => {
			Matter.World.remove(world, disc);
		});

		discs = [];
		activeDisc = null;
		indicatorVisible = false;
		indicatorVector = undefined;
		shotVector = undefined;
	}

	function addDisc(opts = {}) {
		const player = opts.player || "player1";
		const m = opts.state || "position";
		const x = opts.x ? opts.x * mid * 2 : mid;
		const y = opts.y
			? opts.y * mid * 2
			: player === "player1"
				? mid + mid * S.five
				: mid - mid * S.five;
		const r = mid * S.disc;
		const density = DISC_DENSITY;
		const restitution = DISC_RESTITUTION;
		const frictionAir = DISC_FRICTIONAIR;

		const disc = Matter.Bodies.circle(
			x,
			y,
			r,
			{
				density,
				restitution,
				frictionAir,
				render: {
					fillStyle: COLOR[player],
					strokeStyle: "#fff",
					lineWidth: 1
				},
				label: "disc",
				collisionFilter: {
					category: DISC_CATEGORY,
					mask: DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY
				},
				sleepThreshold: 60,
				isSleeping: true
			},
			64
		);

		disc.player = player;
		discs.push(disc);
		activeDisc = disc;

		Matter.Events.on(disc, "sleepStart", sleepStart);
		Matter.World.add(world, disc);

		updateDiscColors();
		shotMaxMagnitude = activeDisc.mass * mid * 0.0007;

		setState(m);
	}

	function positionDisc(mouseX) {
		if (!activeDisc || state !== "position") return;
		const buffer = 2;
		const angles = [45 - buffer, 135 + buffer];
		// Set the radius of the five circle
		const fiveCircleRadius = mid * S.five;

		// Calculate the difference in x from the center (mid)
		let diffX = mouseX - mid;

		// Clamp diffX to be within the bounds of the five circle's radius
		diffX = Math.max(-fiveCircleRadius, Math.min(fiveCircleRadius, diffX));

		const p1 = activeDisc.player === "player1";
		const mult = p1 ? -1 : 1;
		const minAngle = angles[p1 ? 0 : 1] * mult * -1;
		const maxAngle = angles[p1 ? 1 : 0] * mult * -1;
		// Calculate the y-coordinate based on the clamped diffX
		const y =
			mid -
			Math.sqrt(
				Math.max(0, Math.pow(fiveCircleRadius, 2) - Math.pow(diffX, 2))
			) *
				mult;

		// Set the disc's position to the clamped x and calculated y
		const newPosition = { x: mid + diffX, y };
		const center = { x: mid, y: mid };
		const radians = Matter.Vector.angle(center, newPosition);
		const degrees = (radians * 180) / Math.PI;
		if (degrees > minAngle && degrees < maxAngle) {
			Matter.Body.setPosition(activeDisc, newPosition);
		} else if (degrees <= minAngle) {
			const radiansClamped = (minAngle * Math.PI) / 180;
			const a = Math.cos(radiansClamped) * fiveCircleRadius;
			const b = Math.sin(radiansClamped) * fiveCircleRadius;
			const x = mid + a;
			const y = mid + b;
			Matter.Body.setPosition(activeDisc, { x, y });
		} else if (degrees >= maxAngle) {
			const radiansClamped = (maxAngle * Math.PI) / 180;
			const a = Math.cos(radiansClamped) * fiveCircleRadius;
			const b = Math.sin(radiansClamped) * fiveCircleRadius;
			const x = mid + a;
			const y = mid + b;
			Matter.Body.setPosition(activeDisc, { x, y });
		}
	}

	function getTarget({ degrees, speed }) {
		const radians = ((degrees - 90) * Math.PI) / 180;
		const x = activeDisc.position.x + Math.cos(radians);
		const y = activeDisc.position.y + Math.sin(radians);

		// make the target maxVectorIndicatorMagnitude away from the activeDisc position
		const target = {
			x: activeDisc.position.x + (x - activeDisc.position.x) * speed,
			y: activeDisc.position.y + (y - activeDisc.position.y) * speed
		};

		return target;
	}

	function aimDisc({ degrees, power, visible }) {
		if (!activeDisc || state !== "shoot") return;

		const v = visible === undefined ? true : visible;
		setIndicatorVisible(v);

		const speed = Math.max(0.01, power) * shotMaxIndicatorMagnitude;
		const target = getTarget({ degrees, speed });
		updateShotVector({ target });
	}

	function flickDisc() {
		if (!activeDisc || state !== "shoot") return;

		setState("play");

		setIndicatorVisible(false);

		Matter.Body.applyForce(activeDisc, activeDisc.position, shotVector);
		updateDiscColors();
	}

	// function flickDisc(opts) {
	// 	if (!activeDisc || state !== "shoot") return;
	// 	if (opts && (!opts.target || !opts.speed)) return;

	// 	setState("play");

	// 	setIndicatorVisible(false);

	// 	if (opts && opts.target && opts.speed) {
	// 		const target = {
	// 			x: opts.target.x * mid * 2,
	// 			y: opts.target.y * mid * 2
	// 		};

	// 		const speed = opts.speed;
	// 		updateShotVector({ target, speed });
	// 	}

	// 	Matter.Body.applyForce(activeDisc, activeDisc.position, shotVector);
	// 	updateDiscColors();
	// }

	function release() {
		if (!activeDisc || state !== "shoot") return;
		flickDisc();
	}

	function setState(v) {
		state = v;
	}

	function setIndicatorVisible(v) {
		indicatorVisible = v;
	}

	function init({ element, width }) {
		let prevMid;

		if (engine) {
			clearInstance();
			prevMid = mid;
		} else {
			setState("idle");
		}

		const height = width;
		mid = width / 2;
		shotMaxIndicatorMagnitude = mid * 0.2;

		engine = Matter.Engine.create({
			enableSleeping: true
		});
		world = engine.world;

		engine.gravity.y = 0;

		runner = Matter.Runner.create();

		render = Matter.Render.create({
			element,
			engine,
			options: {
				width,
				height,
				wireframes: false,
				pixelRatio: "auto",
				background: "transparent",
				hasBounds: true,
				showSleeping: false
			}
		});

		reAddDiscs(prevMid);
		createZones();
		createPegs();
		createTrap20();
		createTrapRim();
		createTrapSurface();

		Matter.Events.on(render, "afterRender", afterRender);

		Matter.Runner.run(runner, engine);
		Matter.Render.run(render);

		Matter.Events.on(engine, "collisionActive", collisionActive);
		Matter.Events.on(engine, "collisionStart", collisionStart);
		// Matter.Events.on(engine, "afterUpdate", afterUpdate);

		if (!discs.length) emitter.emit("ready");
	}

	return {
		removeDiscs,
		addDisc,
		positionDisc,
		aimDisc,
		release,
		flickDisc,
		setState,
		setIndicatorVisible,
		init,
		on: (event, listener) => emitter.on(event, listener)
	};
	// 	if (activeDisc) {
	// 		// Pan to follow the disc
	// 		panCameraToFollowDisc(activeDisc);

	// 		// Optionally, apply zoom based on the speed of the disc or other factors
	// 		// For example, zoom in when the disc is moving fast and zoom out when it's slow
	// 		const speed = Matter.Vector.magnitude(activeDisc.velocity);
	// 		const zoomScale = 1;
	// 		zoomCamera(zoomScale);
	// 	}
	// });

	// export function select({ x, y }) {
	// 	const clickedDiscs = Matter.Query.point(discs, { x, y });

	// 	if (clickedDiscs.length > 0) {
	// 		activeDisc = clickedDiscs[0];
	// 		updateDiscColors();
	// 	}
	// }
}
