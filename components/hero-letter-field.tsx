"use client";

import { useEffect, useRef } from "react";

type OrientationPermissionConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const palettes = [
  ["#d7d0c0", "#9c8b60", "#53606a", "#1d2c3b", "#b7b0a2"],
  ["#c7c4ba", "#81775f", "#44545d", "#263846", "#a8a293"],
  ["#d0c8b9", "#8c8066", "#5c6267", "#20313f", "#aaa497"],
];

const letters = [
  { letter: "P", x: .585, y: .485, z: .08, size: .38, rotation: .018 },
  { letter: "Y", x: .655, y: .485, z: -.06, size: .37, rotation: -.012 },
  { letter: "S", x: .725, y: .485, z: .12, size: .37, rotation: .009 },
  { letter: "M", x: .795, y: .485, z: -.08, size: .34, rotation: -.008 },
  { letter: "U", x: .875, y: .485, z: .09, size: .37, rotation: .007 },
  { letter: "N", x: .945, y: .485, z: 0, size: .36, rotation: -.014 },
  { letter: "P", x: .62, y: .315, z: -.82, size: .2, rotation: -.11 },
  { letter: "Y", x: .755, y: .29, z: -.68, size: .18, rotation: .08 },
  { letter: "S", x: .89, y: .325, z: -.9, size: .2, rotation: -.06 },
  { letter: "M", x: .625, y: .69, z: -.72, size: .18, rotation: .07 },
  { letter: "U", x: .765, y: .705, z: -.86, size: .2, rotation: -.08 },
  { letter: "N", x: .9, y: .68, z: -.74, size: .19, rotation: .1 },
  { letter: "P", x: .535, y: .205, z: -1.1, size: .14, rotation: -.13 },
  { letter: "Y", x: .675, y: .195, z: -.96, size: .15, rotation: .09 },
  { letter: "S", x: .82, y: .205, z: -1.18, size: .13, rotation: -.08 },
  { letter: "M", x: .95, y: .225, z: -1.02, size: .13, rotation: .11 },
  { letter: "U", x: .545, y: .805, z: -1.08, size: .15, rotation: .1 },
  { letter: "N", x: .69, y: .825, z: -.92, size: .14, rotation: -.09 },
  { letter: "P", x: .835, y: .805, z: -1.14, size: .15, rotation: .08 },
  { letter: "Y", x: .96, y: .77, z: -.98, size: .13, rotation: -.12 },
  { letter: "S", x: .55, y: .365, z: -1.25, size: .12, rotation: .14 },
  { letter: "M", x: .965, y: .39, z: -1.12, size: .12, rotation: -.1 },
  { letter: "U", x: .555, y: .625, z: -1.2, size: .13, rotation: -.08 },
  { letter: "N", x: .96, y: .615, z: -1.04, size: .14, rotation: .12 },
];

export function createLetterShape(THREE: typeof import("three"), letter: string) {
  const shape = new THREE.Shape();
  if (letter === "P") {
    shape.moveTo(-.12, 0); shape.lineTo(.64, 0); shape.lineTo(.64, .11); shape.lineTo(.46, .19);
    shape.lineTo(.46, .86); shape.lineTo(.75, .86);
    shape.bezierCurveTo(1.22, .86, 1.42, 1.08, 1.42, 1.43);
    shape.bezierCurveTo(1.42, 1.82, 1.16, 2, .7, 2);
    shape.lineTo(-.12, 2); shape.lineTo(-.12, 1.89); shape.lineTo(.04, 1.81);
    shape.lineTo(.04, .19); shape.lineTo(-.12, .11); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(.46, 1.1); hole.lineTo(.69, 1.1);
    hole.bezierCurveTo(.93, 1.1, 1.02, 1.22, 1.02, 1.45);
    hole.bezierCurveTo(1.02, 1.67, .92, 1.76, .69, 1.76);
    hole.lineTo(.46, 1.76); hole.closePath();
    shape.holes.push(hole);
  } else if (letter === "Y") {
    const points: [number, number][] = [[-.1,2],[.66,2],[.66,1.9],[.51,1.84],[.82,1.2],[1.14,1.84],[.98,1.9],[.98,2],[1.72,2],[1.72,1.9],[1.51,1.8],[1.06,.94],[1.06,.19],[1.3,.11],[1.3,0],[.42,0],[.42,.11],[.66,.19],[.66,.91],[.15,1.81],[-.1,1.9]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "S") {
    shape.moveTo(1.2, 1.72);
    shape.bezierCurveTo(.97, 2.04, .32, 2.12, .08, 1.7);
    shape.bezierCurveTo(-.13, 1.33, .08, 1.04, .67, .78);
    shape.bezierCurveTo(1.02, .62, 1.11, .49, 1, .31);
    shape.bezierCurveTo(.85, .08, .38, .08, .08, .39);
    shape.lineTo(-.03, .08);
    shape.bezierCurveTo(.39, -.13, 1.12, -.15, 1.38, .32);
    shape.bezierCurveTo(1.62, .76, 1.31, 1.07, .73, 1.33);
    shape.bezierCurveTo(.4, 1.48, .29, 1.58, .38, 1.72);
    shape.bezierCurveTo(.5, 1.91, .91, 1.88, 1.1, 1.57);
    shape.closePath();
  } else if (letter === "M") {
    const points: [number, number][] = [[-.12,0],[.58,0],[.58,.11],[.43,.19],[.43,1.62],[1.04,.03],[1.18,.03],[1.75,1.65],[1.75,.19],[1.57,.11],[1.57,0],[2.35,0],[2.35,.11],[2.17,.19],[2.17,1.81],[2.35,1.89],[2.35,2],[1.68,2],[1.15,.55],[.59,2],[-.12,2],[-.12,1.89],[.04,1.81],[.04,.19],[-.12,.11]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "4") {
    shape.moveTo(.98, 2); shape.lineTo(1.36, 2); shape.lineTo(1.36, 0); shape.lineTo(.98, 0);
    shape.lineTo(.98, .56); shape.lineTo(-.08, .56); shape.lineTo(-.08, .84); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(.6, .86); hole.lineTo(.96, .86); hole.lineTo(.96, 1.44); hole.closePath();
    shape.holes.push(hole);
  } else if (letter === "O" || letter === "0") {
    shape.moveTo(.72, 2.06);
    shape.bezierCurveTo(.18, 2.06, -.08, 1.62, -.08, 1);
    shape.bezierCurveTo(-.08, .38, .18, -.06, .72, -.06);
    shape.bezierCurveTo(1.26, -.06, 1.52, .38, 1.52, 1);
    shape.bezierCurveTo(1.52, 1.62, 1.26, 2.06, .72, 2.06);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(.72, .25);
    hole.bezierCurveTo(1.02, .25, 1.12, .54, 1.12, 1);
    hole.bezierCurveTo(1.12, 1.46, 1.02, 1.75, .72, 1.75);
    hole.bezierCurveTo(.42, 1.75, .32, 1.46, .32, 1);
    hole.bezierCurveTo(.32, .54, .42, .25, .72, .25);
    hole.closePath();
    shape.holes.push(hole);
  } else if (letter === "T") {
    const points: [number, number][] = [[-.12,2],[1.68,2],[1.75,1.52],[1.61,1.52],[1.43,1.8],[1.06,1.8],[1.06,.2],[1.31,.11],[1.31,0],[.25,0],[.25,.11],[.5,.2],[.5,1.8],[.13,1.8],[-.05,1.52],[-.19,1.52]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "I") {
    const points: [number, number][] = [[-.08,2],[.92,2],[.92,1.89],[.7,1.8],[.7,.2],[.92,.11],[.92,0],[-.08,0],[-.08,.11],[.14,.2],[.14,1.8],[-.08,1.89]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "U") {
    shape.moveTo(-.12, 2); shape.lineTo(.68, 2); shape.lineTo(.68, 1.89); shape.lineTo(.49, 1.81);
    shape.lineTo(.49, .63); shape.bezierCurveTo(.49, .24, .72, .1, 1.04, .1);
    shape.bezierCurveTo(1.4, .1, 1.6, .3, 1.6, .67); shape.lineTo(1.6, 1.81);
    shape.lineTo(1.4, 1.89); shape.lineTo(1.4, 2); shape.lineTo(2.06, 2); shape.lineTo(2.06, 1.89);
    shape.lineTo(1.91, 1.81); shape.lineTo(1.91, .61); shape.bezierCurveTo(1.91, .08, 1.56, -.1, .98, -.1);
    shape.bezierCurveTo(.4, -.1, .08, .13, .08, .64); shape.lineTo(.08, 1.81); shape.lineTo(-.12, 1.89); shape.closePath();
  } else if (letter === "R") {
    shape.moveTo(-.12, 0); shape.lineTo(.72, 0); shape.lineTo(.72, .11); shape.lineTo(.5, .19);
    shape.lineTo(.5, .84); shape.lineTo(.73, .84); shape.lineTo(1.23, 0); shape.lineTo(1.7, 0);
    shape.lineTo(1.7, .11); shape.lineTo(1.51, .2); shape.lineTo(1.03, .96);
    shape.bezierCurveTo(1.3, 1.07, 1.42, 1.23, 1.42, 1.45);
    shape.bezierCurveTo(1.42, 1.82, 1.16, 2, .7, 2);
    shape.lineTo(-.12, 2); shape.lineTo(-.12, 1.89); shape.lineTo(.04, 1.81);
    shape.lineTo(.04, .19); shape.lineTo(-.12, .11); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(.5, 1.1); hole.lineTo(.69, 1.1);
    hole.bezierCurveTo(.93, 1.1, 1.02, 1.22, 1.02, 1.45);
    hole.bezierCurveTo(1.02, 1.67, .92, 1.76, .69, 1.76);
    hole.lineTo(.5, 1.76); hole.closePath();
    shape.holes.push(hole);
  } else if (letter === "G") {
    shape.moveTo(1.68, 1.04); shape.lineTo(1.68, .08); shape.lineTo(1.52, .08);
    shape.lineTo(1.42, .25);
    shape.bezierCurveTo(1.22, .03, .98, -.06, .72, -.06);
    shape.bezierCurveTo(.18, -.06, -.08, .38, -.08, 1);
    shape.bezierCurveTo(-.08, 1.62, .18, 2.06, .72, 2.06);
    shape.bezierCurveTo(1.04, 2.06, 1.32, 1.94, 1.5, 1.7);
    shape.lineTo(1.19, 1.48);
    shape.bezierCurveTo(1.05, 1.67, .9, 1.75, .72, 1.75);
    shape.bezierCurveTo(.42, 1.75, .32, 1.46, .32, 1);
    shape.bezierCurveTo(.32, .54, .42, .25, .72, .25);
    shape.bezierCurveTo(.93, .25, 1.1, .35, 1.25, .51);
    shape.lineTo(1.25, .78); shape.lineTo(.82, .78); shape.lineTo(.82, 1.04); shape.closePath();
  } else if (letter === "A") {
    const points: [number, number][] = [[-.12,0],[.62,0],[.62,.11],[.43,.2],[.72,.84],[1.57,.84],[1.84,.2],[1.65,.11],[1.65,0],[2.48,0],[2.48,.11],[2.3,.2],[1.42,2.05],[.96,2.05],[.1,.2],[-.12,.11]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(.86, 1.05); hole.lineTo(1.42, 1.05); hole.lineTo(1.14, 1.72); hole.closePath();
    shape.holes.push(hole);
  } else if (letter === "D") {
    shape.moveTo(-.08, 0); shape.lineTo(.78, 0);
    shape.bezierCurveTo(1.7, 0, 2.1, .38, 2.1, 1);
    shape.bezierCurveTo(2.1, 1.62, 1.7, 2, .78, 2);
    shape.lineTo(-.08, 2); shape.lineTo(-.08, 1.84); shape.lineTo(.1, 1.76);
    shape.lineTo(.1, .24); shape.lineTo(-.08, .16); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(.55, .3); hole.lineTo(.78, .3);
    hole.bezierCurveTo(1.42, .3, 1.68, .56, 1.68, 1);
    hole.bezierCurveTo(1.68, 1.44, 1.42, 1.7, .78, 1.7);
    hole.lineTo(.55, 1.7); hole.closePath();
    shape.holes.push(hole);
  } else if (letter === "E") {
    const points: [number, number][] = [[-.12,0],[1.58,0],[1.58,.28],[.5,.28],[.5,.88],[1.28,.88],[1.28,1.12],[.5,1.12],[.5,1.72],[1.58,1.72],[1.58,2],[-.12,2],[-.12,1.84],[.08,1.76],[.08,.24],[-.12,.16]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "C") {
    shape.moveTo(1.5, 1.68);
    shape.bezierCurveTo(1.28, 1.94, 1, 2.06, .7, 2.06);
    shape.bezierCurveTo(.16, 2.06, -.08, 1.62, -.08, 1);
    shape.bezierCurveTo(-.08, .38, .16, -.06, .7, -.06);
    shape.bezierCurveTo(1, -.06, 1.28, .06, 1.5, .32);
    shape.lineTo(1.2, .58);
    shape.bezierCurveTo(1.05, .38, .88, .28, .7, .28);
    shape.bezierCurveTo(.4, .28, .3, .55, .3, 1);
    shape.bezierCurveTo(.3, 1.45, .4, 1.72, .7, 1.72);
    shape.bezierCurveTo(.88, 1.72, 1.05, 1.62, 1.2, 1.42);
    shape.closePath();
  } else if (letter === "V") {
    const points: [number, number][] = [[-.1,2],[.7,2],[.7,1.89],[.52,1.8],[1.02,.34],[1.5,1.8],[1.31,1.89],[1.31,2],[2.05,2],[2.05,1.89],[1.85,1.8],[1.18,-.03],[.82,-.03],[.13,1.8],[-.1,1.89]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "W") {
    const points: [number, number][] = [[-.1,2],[.66,2],[.66,1.89],[.48,1.8],[.94,.3],[1.52,1.58],[2.1,.3],[2.56,1.8],[2.38,1.89],[2.38,2],[3.14,2],[3.14,1.89],[2.96,1.8],[2.46,-.03],[2.06,-.03],[1.52,1],[.98,-.03],[.58,-.03],[.08,1.8],[-.1,1.89]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "X") {
    const points: [number, number][] = [[-.08,2],[.5,2],[1.02,1.3],[1.55,2],[2.12,2],[1.31,1],[2.12,0],[1.55,0],[1.02,.7],[.5,0],[-.08,0],[.73,1]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else if (letter === "L") {
    const points: [number, number][] = [[-.12,2],[.72,2],[.72,1.89],[.5,1.8],[.5,.22],[1.38,.22],[1.57,.57],[1.72,.57],[1.66,0],[-.12,0],[-.12,.11],[.08,.2],[.08,1.8],[-.12,1.89]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  } else {
    const points: [number, number][] = [[-.12,0],[.62,0],[.62,.11],[.44,.19],[.44,1.58],[1.68,-.02],[1.89,-.02],[1.89,1.81],[2.08,1.89],[2.08,2],[1.35,2],[1.35,1.89],[1.54,1.81],[1.54,.61],[.47,2],[-.12,2],[-.12,1.89],[.06,1.81],[.06,.19],[-.12,.11]];
    shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  }
  return shape;
}

export function HeroLetterField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    let cleanup = () => undefined;

    async function start() {
      try {
        const [THREE, CANNON] = await Promise.all([import("three"), import("cannon-es")]);
        if (cancelled || !mount) return;

        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const dprCap = Math.min(window.devicePixelRatio || 1, coarse ? 1.12 : 1.55);
        let currentDpr = dprCap;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !coarse, powerPreference: coarse ? "low-power" : "high-performance" });
        renderer.setPixelRatio(currentDpr);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = coarse ? .94 : .82;
        renderer.shadowMap.enabled = !coarse;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.className = "hero-letter-field__canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x071426, .028);
        const camera = new THREE.PerspectiveCamera(34, 1, .1, 40);
        camera.position.set(0, 0, 10);

        const hemisphere = new THREE.HemisphereLight(0xe5ded0, 0x06101e, 1.35);
        scene.add(hemisphere);
        const warmKey = new THREE.DirectionalLight(0xf3dfb2, 2.75);
        warmKey.position.set(-4, 7, 8);
        warmKey.castShadow = !coarse;
        warmKey.shadow.mapSize.set(1024, 1024);
        warmKey.shadow.camera.left = -8; warmKey.shadow.camera.right = 8;
        warmKey.shadow.camera.top = 6; warmKey.shadow.camera.bottom = -6;
        scene.add(warmKey);
        const coolRim = new THREE.DirectionalLight(0x71869b, 1.8);
        coolRim.position.set(7, -2, 5);
        scene.add(coolRim);
        const softFill = new THREE.PointLight(0xc9b98c, 4.8, 15, 2);
        softFill.position.set(2, 1, 5);
        scene.add(softFill);

        const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), new THREE.ShadowMaterial({ color: 0x020713, opacity: .2, transparent: true }));
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.receiveShadow = !coarse;
        scene.add(shadowPlane);

        const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.allowSleep = true;
        const solver = new CANNON.GSSolver();
        solver.iterations = coarse ? 5 : 7;
        solver.tolerance = .001;
        world.solver = solver;
        const physicsMaterial = new CANNON.Material("letter");
        world.addContactMaterial(new CANNON.ContactMaterial(physicsMaterial, physicsMaterial, { friction: .2, restitution: .5, contactEquationStiffness: 1e7 }));

        const boundaryMaterial = new CANNON.Material("boundary");
        world.addContactMaterial(new CANNON.ContactMaterial(physicsMaterial, boundaryMaterial, { friction: .42, restitution: .3 }));
        const createBoundary = (rotation: [number, number, number]) => {
          const body = new CANNON.Body({ mass: 0, material: boundaryMaterial, shape: new CANNON.Plane() });
          body.quaternion.setFromEuler(...rotation);
          world.addBody(body);
          return body;
        };
        const floorBody = createBoundary([-Math.PI / 2, 0, 0]);
        const ceilingBody = createBoundary([Math.PI / 2, 0, 0]);
        const leftBody = createBoundary([0, Math.PI / 2, 0]);
        const rightBody = createBoundary([0, -Math.PI / 2, 0]);
        const backBody = createBoundary([0, 0, 0]);
        const frontBody = createBoundary([0, Math.PI, 0]);

        const profiles = [
          { roughness: .92, metalness: .01, clearcoat: 0 },
          { roughness: .46, metalness: .05, clearcoat: .2 },
          { roughness: .54, metalness: .7, clearcoat: .04 },
          { roughness: .2, metalness: .08, clearcoat: .82 },
        ];
        const activeLetters = coarse ? letters.slice(0, 20) : letters;
        let randomSeed = window.crypto.getRandomValues(new Uint32Array(1))[0] || Date.now();
        const random = () => {
          randomSeed += 0x6d2b79f5;
          let value = randomSeed;
          value = Math.imul(value ^ (value >>> 15), value | 1);
          value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
          return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
        const shuffledAssignments = (count: number, variants: number) => {
          const assignments: number[] = [];
          while (assignments.length < count) {
            const cycle = Array.from({ length: variants }, (_, index) => index);
            for (let index = cycle.length - 1; index > 0; index -= 1) {
              const other = Math.floor(random() * (index + 1));
              [cycle[index], cycle[other]] = [cycle[other], cycle[index]];
            }
            assignments.push(...cycle);
          }
          return assignments.slice(0, count);
        };
        const colorsFor = (palette: string[]) => coarse ? palette.filter((_, index) => index !== 3) : palette;
        const initialColors = colorsFor(palettes[0]);
        const materialAssignments = shuffledAssignments(activeLetters.length, profiles.length);
        const colorAssignments = shuffledAssignments(activeLetters.length, initialColors.length);
        const objects: {
          mesh: import("three").Mesh<import("three").ExtrudeGeometry, import("three").MeshPhysicalMaterial>;
          body: import("cannon-es").Body;
          targetColor: import("three").Color;
          mass: number;
        }[] = [];

        activeLetters.forEach((item, index) => {
          const geometry = new THREE.ExtrudeGeometry(createLetterShape(THREE, item.letter), {
            depth: coarse ? .18 : .24,
            curveSegments: coarse ? 5 : 9,
            bevelEnabled: true,
            bevelThickness: coarse ? .018 : .026,
            bevelSize: coarse ? .014 : .02,
            bevelSegments: coarse ? 2 : 3,
          });
          geometry.center();
          const objectScale = coarse ? Math.max(.105, item.size * .52) : item.size;
          geometry.scale(objectScale, objectScale, objectScale);
          geometry.computeBoundingBox();
          const bounds = new THREE.Vector3();
          geometry.boundingBox?.getSize(bounds);
          const profile = profiles[materialAssignments[index]];
          const color = new THREE.Color(initialColors[colorAssignments[index]]);
          const material = new THREE.MeshPhysicalMaterial({
            color,
            roughness: THREE.MathUtils.clamp(profile.roughness + (random() - .5) * .07, .08, 1),
            metalness: profile.metalness,
            clearcoat: profile.clearcoat,
            clearcoatRoughness: profile.clearcoat ? .16 + random() * .24 : 0,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = !coarse;
          mesh.receiveShadow = !coarse;
          scene.add(mesh);

          const mass = .55 + objectScale * .8;
          const body = new CANNON.Body({ mass, type: CANNON.Body.KINEMATIC, material: physicsMaterial, linearDamping: .4, angularDamping: .5, allowSleep: false });
          body.addShape(new CANNON.Box(new CANNON.Vec3(Math.max(.1, bounds.x * .4), Math.max(.13, bounds.y * .43), Math.max(.07, bounds.z * .42))));
          world.addBody(body);
          objects.push({ mesh, body, targetColor: color.clone(), mass });
        });

        let worldWidth = 1;
        let worldHeight = 1;
        let paletteIndex = 0;
        let released = false;
        let flowDirection = 1;
        let pointerX = .74;
        let pointerY = .42;
        let pointerActive = false;
        let previousPointer: { x: number; y: number } | null = null;
        let pointerTravel = 0;
        let visible = true;
        let destroyed = false;
        let raf = 0;
        let previousTime = performance.now();
        let frameSamples = 0;
        let sampledSeconds = 0;
        let scrollTarget = Math.min(1, Math.max(0, window.scrollY / Math.max(window.innerHeight, 1)));
        let scrollProgress = scrollTarget;
        let previousScrollY = window.scrollY;
        let scrollVelocity = 0;
        let orientationListening = false;
        let orientationPermissionRequested = false;
        let orientationBaseline: { x: number; y: number } | null = null;
        let tiltTargetX = 0;
        let tiltTargetY = 0;
        let tiltX = 0;
        let tiltY = 0;

        const remapOrientation = (beta: number, gamma: number) => {
          const screenAngle = window.screen.orientation?.angle ?? 0;
          if (screenAngle === 90) return { x: beta, y: -gamma };
          if (screenAngle === 270 || screenAngle === -90) return { x: -beta, y: gamma };
          if (screenAngle === 180) return { x: -gamma, y: -beta };
          return { x: gamma, y: beta };
        };
        const shortestAngleDelta = (value: number, origin: number) => {
          let difference = value - origin;
          while (difference > 180) difference -= 360;
          while (difference < -180) difference += 360;
          return difference;
        };
        const onDeviceOrientation = (event: DeviceOrientationEvent) => {
          if (event.beta === null || event.gamma === null) return;
          const orientation = remapOrientation(event.beta, event.gamma);
          if (!orientationBaseline) {
            orientationBaseline = orientation;
            return;
          }
          const range = 17;
          tiltTargetX = THREE.MathUtils.clamp(shortestAngleDelta(orientation.x, orientationBaseline.x) / range, -1, 1);
          tiltTargetY = THREE.MathUtils.clamp(shortestAngleDelta(orientation.y, orientationBaseline.y) / range, -1, 1);
        };
        const attachOrientation = () => {
          if (orientationListening) return;
          orientationListening = true;
          window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
        };
        const requestOrientation = () => {
          if (!coarse || orientationPermissionRequested || typeof window.DeviceOrientationEvent === "undefined") return;
          orientationPermissionRequested = true;
          const orientationEvent = window.DeviceOrientationEvent as OrientationPermissionConstructor;
          if (typeof orientationEvent.requestPermission !== "function") {
            attachOrientation();
            return;
          }
          void orientationEvent.requestPermission()
            .then((permission) => { if (permission === "granted") attachOrientation(); })
            .catch(() => undefined);
        };
        const resetOrientationBaseline = () => {
          orientationBaseline = null;
          tiltTargetX = 0;
          tiltTargetY = 0;
        };

        const positionBoundaries = () => {
          const floorY = -worldHeight * .5 + .2;
          floorBody.position.set(0, floorY, 0);
          ceilingBody.position.set(0, worldHeight * .5 + .8, 0);
          leftBody.position.set(coarse ? -worldWidth * .48 : -worldWidth * .08, 0, 0);
          rightBody.position.set(worldWidth * .5 - .08, 0, 0);
          backBody.position.set(0, 0, -2.3);
          frontBody.position.set(0, 0, 2.3);
          shadowPlane.position.y = floorY + .012;
        };

        const resize = () => {
          const rect = mount.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          renderer.setSize(rect.width, rect.height, false);
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * camera.position.z;
          worldWidth = worldHeight * camera.aspect;
          positionBoundaries();
          if (!released) {
            objects.forEach((object, index) => {
              const item = activeLetters[index];
              const x = coarse ? .1 + (index % 5) * .2 : item.x - .055;
              const y = coarse ? .69 + Math.floor(index / 5) * .065 + Math.sin(index * .9) * .01 : item.y;
              object.body.position.set((x - .5) * worldWidth, (.5 - y) * worldHeight, item.z * (coarse ? .45 : 1));
              object.body.quaternion.setFromEuler(0, 0, coarse ? item.rotation * .6 : item.rotation);
            });
            if (coarse) releaseLetters(.045);
          }
        };

        const pointerWorld = () => ({ x: (pointerX - .5) * worldWidth, y: (.5 - pointerY) * worldHeight });
        const releaseLetters = (strength = .18) => {
          if (released) return;
          released = true;
          objects.forEach((object, index) => {
            object.body.type = CANNON.Body.DYNAMIC;
            object.body.mass = object.mass;
            object.body.updateMassProperties();
            object.body.wakeUp();
            const angle = index * 2.39996;
            object.body.angularVelocity.set(Math.sin(angle) * .25, Math.cos(angle) * .18, (index % 3 - 1) * .24);
            object.body.applyImpulse(new CANNON.Vec3(Math.cos(angle) * strength, Math.sin(angle) * strength, Math.sin(angle * .7) * strength * .55));
          });
        };
        const onPointerMove = (event: PointerEvent) => {
          const rect = mount.getBoundingClientRect();
          const nextX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          const nextY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
          if (previousPointer) pointerTravel += Math.hypot((nextX - previousPointer.x) * rect.width, (nextY - previousPointer.y) * rect.height);
          previousPointer = { x: nextX, y: nextY };
          pointerX = nextX;
          pointerY = nextY;
          pointerActive = true;
          if (pointerTravel > (coarse ? 12 : 34)) releaseLetters(coarse ? .1 : .16);
        };
        const onPointerLeave = () => { pointerActive = false; previousPointer = null; };
        const onPointerUp = () => { if (coarse) pointerActive = false; previousPointer = null; };
        const onScroll = () => {
          const nextScrollY = window.scrollY;
          const scrollDelta = nextScrollY - previousScrollY;
          previousScrollY = nextScrollY;
          scrollTarget = Math.min(1, Math.max(0, nextScrollY / Math.max(window.innerHeight, 1)));
          scrollVelocity = THREE.MathUtils.clamp(scrollVelocity + scrollDelta / Math.max(window.innerHeight, 1), -.12, .12);
          if (Math.abs(scrollDelta) > 1) releaseLetters(coarse ? .04 : .07);
        };
        const onPointerDown = (event: PointerEvent) => {
          if ((event.target as HTMLElement).closest("a, button")) return;
          const rect = mount.getBoundingClientRect();
          pointerX = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
          pointerY = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
          previousPointer = { x: pointerX, y: pointerY };
          pointerActive = true;
          requestOrientation();
          releaseLetters(coarse ? .16 : .28);
          flowDirection *= -1;
          const origin = pointerWorld();
          objects.forEach((object, index) => {
            const dx = object.body.position.x - origin.x;
            const dy = object.body.position.y - origin.y;
            const dz = object.body.position.z;
            const distance = Math.max(.45, Math.hypot(dx, dy, dz));
            const strength = Math.max(.12, 1.55 - distance * .25) * object.body.mass;
            object.body.wakeUp();
            object.body.applyImpulse(new CANNON.Vec3((dx / distance) * strength, (dy / distance) * strength, (dz / distance) * strength * .35 + ((index % 3) - 1) * .14));
            object.body.angularVelocity.x += ((index % 3) - 1) * .24;
            object.body.angularVelocity.y += ((index % 5) - 2) * .12;
          });
          paletteIndex = (paletteIndex + 1) % palettes.length;
          const paletteColors = colorsFor(palettes[paletteIndex]);
          const nextColors = shuffledAssignments(objects.length, paletteColors.length);
          objects.forEach((object, index) => object.targetColor.set(paletteColors[nextColors[index]]));
        };
        const animate = (now: number) => {
          if (destroyed || !visible) return;
          const delta = Math.min(.05, Math.max(.001, (now - previousTime) / 1000));
          previousTime = now;
          frameSamples += 1;
          sampledSeconds += delta;
          scrollProgress += (scrollTarget - scrollProgress) * (1 - Math.exp(-delta * 5));
          scrollVelocity *= Math.exp(-delta * 7);
          const tiltEase = 1 - Math.exp(-delta * 4.2);
          tiltX += (tiltTargetX - tiltX) * tiltEase;
          tiltY += (tiltTargetY - tiltY) * tiltEase;

          if (released) {
            const centerX = (coarse ? 0 : worldWidth * .19) + tiltX * worldWidth * (coarse ? .035 : 0);
            const centerY = (coarse ? -worldHeight * .31 : 0) - scrollProgress * worldHeight * (coarse ? .035 : .018) - tiltY * worldHeight * (coarse ? .018 : 0);
            const orbitRadius = coarse ? Math.min(worldWidth * .37, worldHeight * .145) : Math.min(worldWidth * .15, worldHeight * .3);
            const elapsed = now * .001;

            objects.forEach((object, index) => {
              const anchorX = coarse ? centerX + Math.sin(index * 2.39996) * worldWidth * .055 : centerX;
              const anchorY = coarse ? centerY + Math.cos(index * 1.27) * worldHeight * .015 : centerY;
              const dx = object.body.position.x - anchorX;
              const dy = object.body.position.y - anchorY;
              const distance = Math.max(.22, Math.hypot(dx, dy));
              const nx = dx / distance;
              const ny = dy / distance;
              const centerResident = coarse ? index % 7 === 0 : index % 8 === 0;
              const individualRadius = centerResident
                ? orbitRadius * (coarse ? .12 + (index % 3) * .12 : .2 + (index % 3) * .08)
                : orbitRadius * (coarse ? .56 + (index % 5) * .115 : .78 + (index % 4) * .13);
              const radialError = individualRadius - distance;
              const radialStrength = radialError * object.body.mass * (centerResident ? 1.15 : coarse ? .58 : .76);
              const tangentStrength = object.body.mass * (centerResident ? .04 : coarse ? .055 : .15 + (index % 3) * .025) * flowDirection;
              const drift = Math.sin(elapsed * .55 + index * 1.91) * object.body.mass * (centerResident ? .018 : .045);
              object.body.applyForce(new CANNON.Vec3(
                nx * radialStrength - ny * tangentStrength + tiltX * object.body.mass * (coarse ? .24 : 0),
                ny * radialStrength + nx * tangentStrength + drift - scrollVelocity * object.body.mass * (coarse ? 2.2 : 1.6) - tiltY * object.body.mass * (coarse ? .19 : 0),
                -object.body.position.z * object.body.mass * .38 + Math.cos(elapsed * .42 + index) * .014 + tiltY * object.body.mass * (coarse ? .045 : 0),
              ));
            });

            const spacing = coarse ? .3 : .58;
            for (let first = 0; first < objects.length; first += 1) {
              for (let second = first + 1; second < objects.length; second += 1) {
                const a = objects[first].body;
                const b = objects[second].body;
                const dx = a.position.x - b.position.x;
                const dy = a.position.y - b.position.y;
                const dz = (a.position.z - b.position.z) * .55;
                const distance = Math.max(.08, Math.hypot(dx, dy, dz));
                if (distance >= spacing) continue;
                const strength = (spacing - distance) * .85;
                const force = new CANNON.Vec3((dx / distance) * strength, (dy / distance) * strength, (dz / distance) * strength * .35);
                a.applyForce(force);
                b.applyForce(new CANNON.Vec3(-force.x, -force.y, -force.z));
              }
            }
          }

          if (released && pointerActive) {
            const pointer = pointerWorld();
            objects.forEach((object) => {
              const dx = object.body.position.x - pointer.x;
              const dy = object.body.position.y - pointer.y;
              const distance = Math.max(.25, Math.hypot(dx, dy));
              const radius = coarse ? .82 : 1.25;
              if (distance < radius) {
                const strength = (radius - distance) * object.body.mass * (coarse ? 7 : 10);
                object.body.wakeUp();
                object.body.applyForce(new CANNON.Vec3((dx / distance) * strength, (dy / distance) * strength, strength * .035));
              }
            });
          }

          if (released) {
            world.step(1 / 120, delta, 7);
            const maximumSpeed = coarse ? .54 : .98;
            const maximumSpin = coarse ? .32 : .62;
            objects.forEach((object) => {
              const speed = object.body.velocity.length();
              if (speed > maximumSpeed) object.body.velocity.scale(maximumSpeed / speed, object.body.velocity);
              const spin = object.body.angularVelocity.length();
              if (spin > maximumSpin) object.body.angularVelocity.scale(maximumSpin / spin, object.body.angularVelocity);
            });
          }
          const colorEase = 1 - Math.exp(-delta * 1.45);
          objects.forEach((object) => {
            object.mesh.position.set(object.body.position.x, object.body.position.y, object.body.position.z);
            object.mesh.quaternion.set(object.body.quaternion.x, object.body.quaternion.y, object.body.quaternion.z, object.body.quaternion.w);
            object.mesh.material.color.lerp(object.targetColor, colorEase);
          });

          const targetCameraX = pointerActive ? (pointerX - .5) * .1 : coarse ? tiltX * .075 : 0;
          const targetCameraY = pointerActive ? (.5 - pointerY) * .06 : coarse ? -tiltY * .05 : 0;
          camera.position.x += (targetCameraX - camera.position.x) * .025;
          camera.position.y += (targetCameraY - camera.position.y) * .025;
          warmKey.position.x += ((-4 + tiltX * .8) - warmKey.position.x) * .035;
          warmKey.position.y += ((7 - tiltY * .45) - warmKey.position.y) * .035;
          softFill.position.x += ((2 - tiltX * .45) - softFill.position.x) * .03;
          softFill.position.y += ((1 + tiltY * .3) - softFill.position.y) * .03;
          camera.lookAt(0, 0, 0);
          renderer.render(scene, camera);

          if (frameSamples >= 120) {
            const averageFrame = sampledSeconds / frameSamples;
            if (averageFrame > 1 / 45 && currentDpr > .76) {
              currentDpr = Math.max(.76, currentDpr - .14);
              renderer.setPixelRatio(currentDpr);
              resize();
            } else if (averageFrame < 1 / 95 && currentDpr < dprCap) {
              currentDpr = Math.min(dprCap, currentDpr + .08);
              renderer.setPixelRatio(currentDpr);
              resize();
            }
            frameSamples = 0;
            sampledSeconds = 0;
          }
          raf = requestAnimationFrame(animate);
        };

        const visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) { previousTime = performance.now(); raf = requestAnimationFrame(animate); }
          else cancelAnimationFrame(raf);
        }, { threshold: .01 });
        const resizeObserver = new ResizeObserver(resize);
        const interactionSurface = mount.parentElement ?? mount;
        visibilityObserver.observe(mount);
        resizeObserver.observe(mount);
        interactionSurface.addEventListener("pointermove", onPointerMove, { passive: true });
        interactionSurface.addEventListener("pointerleave", onPointerLeave);
        interactionSurface.addEventListener("pointerup", onPointerUp);
        interactionSurface.addEventListener("pointercancel", onPointerUp);
        interactionSurface.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("scroll", onScroll, { passive: true });
        window.screen.orientation?.addEventListener("change", resetOrientationBaseline);
        if (coarse && typeof window.DeviceOrientationEvent !== "undefined") {
          const orientationEvent = window.DeviceOrientationEvent as OrientationPermissionConstructor;
          if (typeof orientationEvent.requestPermission !== "function") {
            orientationPermissionRequested = true;
            attachOrientation();
          }
        }
        resize();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);

        cleanup = () => {
          destroyed = true;
          cancelAnimationFrame(raf);
          visibilityObserver.disconnect();
          resizeObserver.disconnect();
          interactionSurface.removeEventListener("pointermove", onPointerMove);
          interactionSurface.removeEventListener("pointerleave", onPointerLeave);
          interactionSurface.removeEventListener("pointerup", onPointerUp);
          interactionSurface.removeEventListener("pointercancel", onPointerUp);
          interactionSurface.removeEventListener("pointerdown", onPointerDown);
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("deviceorientation", onDeviceOrientation);
          window.screen.orientation?.removeEventListener("change", resetOrientationBaseline);
          objects.forEach((object) => { object.mesh.geometry.dispose(); object.mesh.material.dispose(); world.removeBody(object.body); });
          shadowPlane.geometry.dispose();
          (shadowPlane.material as import("three").Material).dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        console.warn("3D letter field unavailable", error);
      }
    }

    start();
    return () => { cancelled = true; cleanup(); };
  }, []);

  return (
    <div className="hero-letter-field" ref={mountRef} aria-hidden="true" />
  );
}
