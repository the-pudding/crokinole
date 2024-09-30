import Matter from "matter-js";
import * as S from "$data/specs.js";
import variables from "$data/variables.json";
import { Howl } from "howler";
import { muted } from "$stores/misc.js";

const DISC_CATEGORY = 0x0001;
const PEG_CATEGORY = 0x0002;
const TRAP_CATEGORY = 0x0004;
const RIM_CATEGORY = 0x0008;
const SURFACE_CATEGORY = 0x0010;
const DISC_RESTITUTION = 1;
const DISC_DENSITY = 0.05;
const DISC_FRICTIONAIR = 0.05;
const PEG_RESTITUTION = 1;
const MAX_RATE = 0.2;

const COLOR = {
	player1: variables.color["pink-aa"],
	player2: variables.color["teal-aa"],
	active: variables.color["black"],
	vector: variables.color["black"]
};

let globalMuted;

// Create a new sound
// const DISC_SOUND = new Howl({
// 	src: ["assets/audio/disc.mp3"]
// });

// const RIM_SOUND = new Howl({
// 	src: ["assets/audio/rim.mp3"]
// });

// const FLICK_SOUND = new Howl({
// 	src: ["assets/audio/flick.mp3"]
// });

// const HOLE_SOUND = new Howl({
// 	src: ["assets/audio/hole.mp3"]
// });

muted.subscribe((value) => {
	globalMuted = value;
});

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
	let shotMaxMagnitude;
	let shotMaxIndicatorMagnitude;
	let shotVector;
	let indicatorVector;
	let indicatorVisible;
	let manual;
	let muteOverride;
	let canvasWidth;

	// things to carry over on resize
	let discs = [];
	let state; // idle, position, shoot, play
	let activeDisc;

	function createZones() {
		const board = Matter.Bodies.circle(
			S.center,
			S.center,
			S.boardR,
			{
				isStatic: true,
				render: {
					visible: true,
					fillStyle: "rgba(0,0,0,0)",
					lineWidth: 1
				},
				label: "surface"
			},
			64
		);

		const rim = Matter.Bodies.circle(
			S.center,
			S.center,
			S.boardR - S.rimW,
			{
				isStatic: true,
				render: {
					visible: true,
					fillStyle: "rgba(0,0,0,0)",
					lineWidth: 1
				},
				label: "surface"
			},
			64
		);

		const surface = Matter.Bodies.circle(
			S.center,
			S.center,
			S.surfaceR,
			{
				isStatic: true,
				render: {
					visible: true,
					fillStyle: "rgba(0,0,0,0)",
					lineWidth: 1
				},
				label: "surface"
			},
			64
		);

		const zone20 = Matter.Bodies.circle(
			S.center,
			S.center,
			S.twentyR,
			{
				isStatic: true,
				isSensor: true,
				render: {
					visible: true,
					fillStyle: "rgba(0,0,0,0)",
					lineWidth: 1
				},
				label: "20"
			},
			64
		);

		const zone15 = Matter.Bodies.circle(
			S.center,
			S.center,
			S.fifteenR,
			{
				isStatic: true,
				isSensor: true,
				render: {
					visible: true,
					fillStyle: "rgba(0,0,0,0)",
					lineWidth: 1
				},
				label: "15"
			},
			64
		);

		const zone10 = Matter.Bodies.circle(
			S.center,
			S.center,
			S.tenR,
			{
				isStatic: true,
				isSensor: true,
				render: {
					visible: true,
					fillStyle: "rgba(0,0,0,0)",
					lineWidth: 1
				},
				label: "10"
			},
			64
		);

		const zone5 = Matter.Bodies.circle(
			S.center,
			S.center,
			S.fiveR,
			{
				isStatic: true,
				isSensor: true,
				render: {
					visible: true,
					fillStyle: "rgba(0,0,0,0)",
					lineWidth: 1
				},
				label: "5"
			},
			64
		);

		Matter.Composite.add(world, [
			rim,
			board,
			surface,
			zone20,
			zone15,
			zone10,
			zone5
		]);
	}

	function createTrap20() {
		const wallCount = 16;
		const wallThickness = Math.max(2, S.twentyR);
		const wallRadius = S.twentyR + wallThickness / 2 - 1;

		const trap = [];

		for (let i = 0; i < wallCount; i++) {
			// Calculate angle for each wall
			const angle = (i / wallCount) * 2 * Math.PI;

			// Calculate the wall position around the S.center
			const wallX = S.center + Math.cos(angle) * wallRadius;
			const wallY = S.center + Math.sin(angle) * wallRadius;
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

		Matter.Composite.add(world, trap);
	}

	function createTrapRim() {
		const wallCount = 32;
		const wallThickness = S.twentyR * 4;
		const wallRadius = S.baseR + wallThickness / 2 - 1;

		const trap = [];

		for (let i = 0; i < wallCount; i++) {
			// Calculate angle for each wall
			const angle = (i / wallCount) * 2 * Math.PI;

			// Calculate the wall position around the S.center
			const wallX = S.center + Math.cos(angle) * wallRadius;
			const wallY = S.center + Math.sin(angle) * wallRadius;
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

		Matter.Composite.add(world, trap);
	}

	function createTrapSurface() {
		const wallCount = 32;
		const wallThickness = S.twentyR;
		const wallRadius = S.surfaceR - wallThickness / 2 + 1;

		const trap = [];

		for (let i = 0; i < wallCount; i++) {
			// Calculate angle for each wall
			const angle = (i / wallCount) * 2 * Math.PI;

			// Calculate the wall position around the S.center
			const wallX = S.center + Math.cos(angle) * wallRadius;
			const wallY = S.center + Math.sin(angle) * wallRadius;
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

		Matter.Composite.add(world, trap);
	}

	function createPegs() {
		const pegBodies = [];
		const r = S.pegR;

		// Loop through 8 pegs
		for (let i = 0; i < 8; i++) {
			const angle = 3 / 8 + (i / 8) * Math.PI * 2;
			const x = S.center + Math.cos(angle) * S.fifteenR;
			const y = S.center + Math.sin(angle) * S.fifteenR;

			const peg = Matter.Bodies.circle(
				x,
				y,
				r,
				{
					isStatic: true,
					restitution: PEG_RESTITUTION,
					render: { visible: true },
					collisionFilter: {
						category: PEG_CATEGORY,
						mask: DISC_CATEGORY
					}
				},
				32
			);

			pegBodies.push(peg);
		}

		Matter.Composite.add(world, pegBodies);
	}

	function drawArrow(ctx, fromX, fromY, toX, toY, arrowLength) {
		const angle = Math.atan2(toY - fromY, toX - fromX);

		// Calculate the points for the arrowhead
		const arrowX1 = toX - arrowLength * Math.cos(angle - Math.PI / 4);
		const arrowY1 = toY - arrowLength * Math.sin(angle - Math.PI / 4);

		const arrowX2 = toX - arrowLength * Math.cos(angle + Math.PI / 4);
		const arrowY2 = toY - arrowLength * Math.sin(angle + Math.PI / 4);

		// Draw the two lines of the arrowhead
		ctx.moveTo(toX, toY);
		ctx.lineTo(arrowX1, arrowY1);

		ctx.moveTo(toX, toY);
		ctx.lineTo(arrowX2, arrowY2);
	}

	function drawIndicator(ctx) {
		if (!activeDisc) return;

		const discR = activeDisc.circleRadius;
		const discP = activeDisc.position;
		const s = canvasWidth / (S.boardR * 2);

		if (state === "shoot" && indicatorVector && indicatorVisible) {
			// Calculate the direction of the vector (normalized)
			const normalizedVector = Matter.Vector.normalise(indicatorVector);

			const startX = (discP.x + normalizedVector.x * discR * 1.25) * s;
			const startY = (discP.y + normalizedVector.y * discR * 1.25) * s;

			const endX =
				(discP.x + normalizedVector.x * discR * 1.5 + indicatorVector.x) * s;
			const endY =
				(discP.y + normalizedVector.y * discR * 1.5 + indicatorVector.y) * s;

			// Start drawing the main indicator line
			ctx.beginPath();
			ctx.strokeStyle = COLOR.vector;
			ctx.lineWidth = 2;

			// Draw the solid line starting from the outer edge of the disc
			ctx.moveTo(startX, startY);
			ctx.lineTo(endX, endY);
			ctx.stroke();

			// Draw the arrow at the end of the line
			const arrowLength = S.center * 0.03; // Length of the arrowhead
			const arrowAngle = Math.PI / 4; // Angle for the arrowhead

			// Calculate direction of the arrow based on the indicatorVector
			const angle = Math.atan2(indicatorVector.y, indicatorVector.x);

			// Draw the two lines of the arrowhead
			ctx.beginPath();
			ctx.moveTo(endX, endY);
			ctx.lineTo(
				endX - arrowLength * Math.cos(angle - arrowAngle) * s,
				endY - arrowLength * Math.sin(angle - arrowAngle) * s
			);
			ctx.moveTo(endX, endY);
			ctx.lineTo(
				endX - arrowLength * Math.cos(angle + arrowAngle) * s,
				endY - arrowLength * Math.sin(angle + arrowAngle) * s
			);
			ctx.stroke();
			ctx.closePath();
		} else if (state === "position") {
			// draw a rect in the middle of the screen
			ctx.beginPath();
			ctx.strokeStyle = COLOR.vector;
			ctx.stroke();

			ctx.beginPath();
			ctx.strokeStyle = COLOR.vector;
			ctx.lineWidth = 2;

			ctx.moveTo((discP.x - discR * 2.5) * s, discP.y * s);
			ctx.lineTo((discP.x - discR * 1.25) * s, discP.y * s);

			ctx.moveTo((discP.x + discR * 2.5) * s, discP.y * s);
			ctx.lineTo((discP.x + discR * 1.25) * s, discP.y * s);

			ctx.stroke();
			ctx.closePath();

			ctx.beginPath();
			// draw arrows at each end
			drawArrow(
				ctx,
				(discP.x - discR * 1.25) * s,
				discP.y * s,
				(discP.x - discR * 2.5) * s,
				discP.y * s,
				discR * 0.75 * s
			);
			drawArrow(
				ctx,
				(discP.x + discR * 1.25) * s,
				discP.y * s,
				(discP.x + discR * 2.5) * s,
				discP.y * s,
				discR * 0.75 * s
			);

			ctx.stroke();
			ctx.closePath();
		}
	}

	function afterRender() {
		const ctx = render.context;
		drawIndicator(ctx);
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
					if (!globalMuted && !muteOverride) HOLE_SOUND.play();
					disc.in20 = true;
					disc.collisionFilter.mask =
						DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | TRAP_CATEGORY;
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
				if (!globalMuted && !muteOverride) RIM_SOUND.play();
				disc.frictionAir = 0.3;
				disc.collisionFilter.mask =
					DISC_CATEGORY | PEG_CATEGORY | RIM_CATEGORY | SURFACE_CATEGORY;
			} else if (disc && otherDisc) {
				if (!globalMuted && !muteOverride) DISC_SOUND.play();
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

		// Calculate the bounds to S.center the camera on the disc
		render.bounds.min.x = disc.position.x - render.options.width / 2 + margin;
		render.bounds.min.y = disc.position.y - render.options.height / 2 + margin;
		render.bounds.max.x = disc.position.x + render.options.width / 2 - margin;
		render.bounds.max.y = disc.position.y + render.options.height / 2 - margin;
	}

	function getZoneForDisc(disc) {
		const discR = disc.circleRadius;
		const discP = disc.position;

		const distance = Math.sqrt(
			Math.pow(discP.x - S.center, 2) + Math.pow(discP.y - S.center, 2)
		);

		const zones = [
			{ r: S.twentyR, score: 20 },
			{ r: S.fifteenR, score: 15 },
			{ r: S.tenR, score: 10 },
			{ r: S.fiveR, score: 5 }
		];

		// see if it is outside, if not move on
		const match = zones.find((zone) => distance + discR < zone.r);

		return match?.score || 0;
	}

	function getIntersect15(disc) {
		const discR = disc.circleRadius;
		const discP = disc.position;

		const distance = Math.sqrt(
			Math.pow(discP.x - S.center, 2) + Math.pow(discP.y - S.center, 2)
		);

		const zoneR = S.fifteenR;

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
				if (!d.valid || !d.score) Matter.Composite.remove(world, d);
			});

			// was active disc valid?
			const valid = discs.find((d) => d.id === activeDisc.id).valid;

			// clean up
			discs = discs.filter((d) => d.score > 0 && d.valid);

			if (manual) {
				emitter.emit("shotCompleteManual", { discs, valid });
			} else {
				const scores = discs.map((d) => ({
					id: d.id,
					player: d.player,
					score: d.score
				}));

				// remove 20
				discs.forEach((d) => {
					if (d.score === 20) Matter.Composite.remove(world, d);
				});

				discs = discs.filter((d) => d.score !== 20);
				emitter.emit("shotComplete", { discs: scores, valid });
				discs.forEach((d) => {
					d.valid = undefined;
					d.collided = undefined;
					d.collidedOpp = undefined;
					d.intersect15 = undefined;
					d.in20 = undefined;
				});
			}

			activeDisc = null;
			setState("idle");
		}
	}

	function clearInstance() {
		// Clear the world bodies
		Matter.Matter.Composite.clear(world, false);

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
		const s = opts.state || "position";
		const x = opts.x ? opts.x * S.center * 2 : S.center;
		const y = opts.y
			? opts.y * S.center * 2
			: player === "player1"
				? S.center + S.fiveR
				: S.center - S.fiveR;
		const r = S.discR;
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
					fillStyle: COLOR[player]
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
		Matter.Composite.add(world, disc);

		shotMaxMagnitude = activeDisc.mass * MAX_RATE;

		setState(s);
	}

	function positionDisc(inputX) {
		if (!activeDisc || state !== "position") return;
		const buffer = 2;
		const angles = [45 - buffer, 135 + buffer];

		// Clamp diffX to be within the bounds of the five circle's radius
		const diffX = Math.max(-S.fiveR, Math.min(S.fiveR, inputX - S.center));

		const p1 = activeDisc.player === "player1";
		const mult = p1 ? -1 : 1;
		const minAngle = angles[p1 ? 0 : 1] * mult * -1;
		const maxAngle = angles[p1 ? 1 : 0] * mult * -1;
		// Calculate the y-coordinate based on the clamped diffX
		const y =
			S.center -
			Math.sqrt(Math.max(0, Math.pow(S.fiveR, 2) - Math.pow(diffX, 2))) * mult;

		// Set the disc's position to the clamped x and calculated y
		const newPosition = { x: S.center + diffX, y };
		const radians = Matter.Vector.angle(
			{ x: S.center, y: S.center },
			newPosition
		);
		const degrees = (radians * 180) / Math.PI;
		if (degrees > minAngle && degrees < maxAngle) {
			Matter.Body.setPosition(activeDisc, newPosition);
		} else if (degrees <= minAngle) {
			const radiansClamped = (minAngle * Math.PI) / 180;
			const a = Math.cos(radiansClamped) * S.fiveR;
			const b = Math.sin(radiansClamped) * S.fiveR;
			const x = S.center + a;
			const y = S.center + b;
			Matter.Body.setPosition(activeDisc, { x, y });
		} else if (degrees >= maxAngle) {
			const radiansClamped = (maxAngle * Math.PI) / 180;
			const a = Math.cos(radiansClamped) * S.fiveR;
			const b = Math.sin(radiansClamped) * S.fiveR;
			const x = S.center + a;
			const y = S.center + b;
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

		if (!globalMuted && !muteOverride) FLICK_SOUND.play();
	}

	function setState(v) {
		state = v;
	}

	function autoMute(v) {
		muteOverride = v;
	}

	function setIndicatorVisible(v) {
		indicatorVisible = v;
	}

	function resize(w) {
		if (render) {
			canvasWidth = w;
			render.canvas.width = w;
			render.canvas.height = w;

			Matter.Render.setSize(render, w, w);
			Matter.Render;

			Matter.Render.lookAt(render, {
				min: { x: 0, y: 0 },
				max: { x: S.boardR * 2, y: S.boardR * 2 }
			});
		}
	}

	function init({ element, tutorial }) {
		manual = !!tutorial;

		if (engine) {
			clearInstance();
		} else {
			setState("idle");
		}

		shotMaxIndicatorMagnitude = S.center * 0.2;

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
				width: S.boardR * 2,
				height: S.boardR * 2,
				wireframes: false,
				pixelRatio: "auto",
				background: "transparent",
				showSleeping: false,
				hasBounds: true
			}
		});

		createZones();
		createPegs();
		createTrap20();
		createTrapRim();
		createTrapSurface();

		Matter.Runner.run(runner, engine);
		Matter.Render.run(render);

		resize(element.clientWidth);

		Matter.Events.on(render, "afterRender", afterRender);
		Matter.Events.on(engine, "collisionActive", collisionActive);
		Matter.Events.on(engine, "collisionStart", collisionStart);

		// TODO need this?
		// if (!discs.length) emitter.emit("ready");
	}

	return {
		removeDiscs,
		addDisc,
		positionDisc,
		aimDisc,
		flickDisc,
		setState,
		setIndicatorVisible,
		autoMute,
		resize,
		init,
		on: (event, listener) => emitter.on(event, listener)
	};
}
