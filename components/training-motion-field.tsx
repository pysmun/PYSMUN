"use client";

import { useEffect, useRef, useState } from "react";
import { createLetterShape } from "@/components/hero-letter-field";

const letterSlots = [
  { x: -2.5, y: .16, z: -.1, scale: .53, rotation: -.06 },
  { x: -1.45, y: -.08, z: .11, scale: .58, rotation: .045 },
  { x: -.42, y: .11, z: -.05, scale: .56, rotation: -.035 },
  { x: .48, y: -.12, z: .14, scale: .59, rotation: .035 },
  { x: 1.3, y: .09, z: -.11, scale: .58, rotation: -.045 },
  { x: 2.36, y: -.06, z: .07, scale: .54, rotation: .045 },
];

const supportedLetters = new Set(["P", "Y", "S", "M", "U", "N", "O", "T", "I", "R", "G", "A", "D", "E", "C", "V", "W", "X", "L"]);

function createLetterLayout(word: string, spread = 1) {
  const normalizedWord = word.toUpperCase().replace(/[^A-Z0-9 ]/g, "").trim().replace(/\s+/g, " ").slice(0, 20);
  const requestedLetters = normalizedWord.replace(/\s/g, "").split("");
  const letters = requestedLetters.length && requestedLetters.every((letter) => supportedLetters.has(letter))
    ? requestedLetters
    : ["P", "Y", "S", "M", "U", "N"];

  if (requestedLetters.some((letter) => !supportedLetters.has(letter))) {
    console.warn(`Unsupported page-motion word "${word}"; using PYSMUN instead.`);
  }

  if (letters.length === letterSlots.length && !normalizedWord.includes(" ") && spread === 1) {
    return letterSlots.map((slot, index) => ({ ...slot, letter: letters[index] }));
  }

  const isLongPhrase = letters.length > 10;
  const spacing = (isLongPhrase ? 1.12 : letters.length > 7 ? .72 : letters.length === 7 ? .78 : letters.length <= 2 ? 1.62 : .9) * spread;
  const scale = isLongPhrase ? .55 : letters.length > 7 ? .4 : letters.length === 7 ? .47 : letters.length <= 2 ? .78 : .54;
  const tokens = letters === requestedLetters ? normalizedWord.split("") : letters;
  const totalWidth = tokens.reduce((width, token) => width + (token === " " ? spacing * .72 : spacing), 0);
  let cursor = -totalWidth / 2;
  let letterIndex = 0;

  return tokens.flatMap((token) => {
    if (token === " ") {
      cursor += spacing * .72;
      return [];
    }

    const index = letterIndex;
    letterIndex += 1;
    const item = {
      letter: token,
      x: cursor + spacing / 2,
      y: [0.16, -0.08, 0.11, -0.12, 0.09, -0.06][index % 6] * (isLongPhrase ? .28 : 1),
      z: [-0.1, 0.11, -0.05, 0.14, -0.11, 0.07][index % 6] * (isLongPhrase ? .55 : 1),
      scale,
      rotation: [-0.06, 0.045, -0.035, 0.035, -0.045, 0.045][index % 6] * (isLongPhrase ? .3 : 1),
    };
    cursor += spacing;
    return [item];
  });
}

const materialProfiles = [
  { color: 0x223444, roughness: .5, metalness: .42, clearcoat: .12 },
  { color: 0xd8d0bf, roughness: .24, metalness: .04, clearcoat: .72 },
  { color: 0xa68d43, roughness: .38, metalness: .7, clearcoat: .1 },
  { color: 0x343d43, roughness: .88, metalness: .05, clearcoat: 0 },
  { color: 0xb6a474, roughness: .5, metalness: .48, clearcoat: .08 },
  { color: 0x53636c, roughness: .72, metalness: .18, clearcoat: .04 },
];

export function PageMotionField({ word = "MOTION", mobileWord, spread = 1, floorLift = 0, leftInset = 0, mobileLeftReach = 0, className = "" }: { word?: string; mobileWord?: string; spread?: number; floorLift?: number; leftInset?: number; mobileLeftReach?: number; className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewportMode, setViewportMode] = useState<"mobile" | "tablet" | "desktop" | null>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const tabletQuery = window.matchMedia("(max-width: 1100px)");
    const updateMode = () => setViewportMode(mobileQuery.matches ? "mobile" : tabletQuery.matches ? "tablet" : "desktop");

    updateMode();
    mobileQuery.addEventListener("change", updateMode);
    tabletQuery.addEventListener("change", updateMode);
    return () => {
      mobileQuery.removeEventListener("change", updateMode);
      tabletQuery.removeEventListener("change", updateMode);
    };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !viewportMode || viewportMode === "tablet") return;
    const mobile = viewportMode === "mobile";
    const activeWord = mobile && mobileWord ? mobileWord : word;
    const activeLetterCount = activeWord.replace(/[^A-Z0-9]/gi, "").length;
    const compactMobileField = mobile && activeLetterCount <= 2;
    const longDesktopPhrase = !mobile && activeLetterCount > 10;

    let cancelled = false;
    let cleanup = () => undefined;

    async function start() {
      try {
        const THREE = await import("three");
        if (cancelled || !mount) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: mobile ? "default" : "high-performance" });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.65 : 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = .86;
        renderer.domElement.className = "page-motion-field__canvas";
        renderer.domElement.setAttribute("aria-hidden", "true");
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, .1, 30);
        camera.position.set(0, .08, 9.2);

        scene.add(new THREE.HemisphereLight(0xf1eadc, 0x192838, 1.55));
        const key = new THREE.DirectionalLight(0xf4dfaa, 3.1);
        key.position.set(-4, 6, 7);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x8197a8, 2.15);
        rim.position.set(6, -2, 5);
        scene.add(rim);
        const fill = new THREE.PointLight(0xcab777, 3.6, 14, 2);
        fill.position.set(1.5, .4, 4.5);
        scene.add(fill);

        const group = new THREE.Group();
        group.rotation.x = -.035;
        group.rotation.z = mobile ? -Math.PI / 2 : 0;
        if (mobile) group.scale.setScalar(.82);
        else if (longDesktopPhrase) group.scale.setScalar(1.3);
        scene.add(group);

        // The mobile field shows the word rotated vertical inside a fixed world
        // slice, so a wide spread would crop its ends — cap it there.
        const effectiveSpread = mobile ? Math.min(spread, 1.12) : spread;
        const motionLetters = createLetterLayout(activeWord, effectiveSpread);
        const objects = motionLetters.map((item, index) => {
          const geometry = new THREE.ExtrudeGeometry(createLetterShape(THREE, item.letter), {
            depth: .34,
            curveSegments: 10,
            bevelEnabled: true,
            bevelThickness: .035,
            bevelSize: .025,
            bevelSegments: 4,
          });
          geometry.center();
          geometry.scale(item.scale, item.scale, item.scale);
          geometry.computeBoundingSphere();
          const collisionRadius = Math.max(.42, (geometry.boundingSphere?.radius ?? .65) * .88);

          const profile = materialProfiles[index % materialProfiles.length];
          const material = new THREE.MeshPhysicalMaterial({
            color: profile.color,
            roughness: profile.roughness,
            metalness: profile.metalness,
            clearcoat: profile.clearcoat,
            clearcoatRoughness: profile.clearcoat ? .2 : 0,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(item.x, item.y, item.z);
          mesh.rotation.set(.035 * (index % 2 ? 1 : -1), -.04 * (index % 3 - 1), item.rotation);
          group.add(mesh);

          return {
            mesh,
            home: new THREE.Vector3(item.x, item.y, item.z),
            velocity: new THREE.Vector3(),
            angularVelocity: new THREE.Vector3(),
            homeRotation: new THREE.Vector3(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z),
            phase: index * 1.37,
            collisionRadius,
            releaseRadius: Math.hypot(item.x, item.y),
          };
        });
        const boundaryRadiusScale = mobile ? .68 : .72;
        const formationHorizontalExtent = Math.max(...objects.map((object) => Math.abs(object.home.x) + object.collisionRadius * boundaryRadiusScale)) + .08;
        const formationVerticalExtent = Math.max(...objects.map((object) => Math.abs(object.home.y) + object.collisionRadius * boundaryRadiusScale)) + .08;

        const raycaster = new THREE.Raycaster();
        const pointerNdc = new THREE.Vector2();
        const pointerWorld = new THREE.Vector3();
        const pointerLocal = new THREE.Vector3();
        const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        let pointerActive = false;
        let pointerStrength = 0;
        let visible = true;
        let destroyed = false;
        let raf = 0;
        let previousTime = performance.now();
        let scrollTarget = 0;
        let scrollProgress = 0;
        let worldWidth = 7;
        let worldHeight = 5;
        let released = false;
        let releaseProgress = 0;
        let interactionCharge = 0;
        let previousPointer: { x: number; y: number } | null = null;
        let mobilePointerStart: { x: number; y: number; time: number } | null = null;
        let orbitDirection = 1;

        const updatePointerWorld = () => {
          raycaster.setFromCamera(pointerNdc, camera);
          raycaster.ray.intersectPlane(interactionPlane, pointerWorld);
          group.updateMatrixWorld();
          group.worldToLocal(pointerLocal.copy(pointerWorld));
        };

        const onPointerMove = (event: PointerEvent) => {
          const rect = mount.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          pointerActive = pointerNdc.x > -1.18 && pointerNdc.x < 1.18 && pointerNdc.y > -1.2 && pointerNdc.y < 1.2;
          pointerStrength = Math.min(1, pointerStrength + .12);
          updatePointerWorld();
          const isMeddling = objects.some((object) => Math.hypot(object.mesh.position.x - pointerLocal.x, object.mesh.position.y - pointerLocal.y) < 1.65);
          if (!mobile && previousPointer && pointerActive && isMeddling && !released) {
            interactionCharge += Math.hypot(event.clientX - previousPointer.x, event.clientY - previousPointer.y) / 600;
          }
          previousPointer = { x: event.clientX, y: event.clientY };
          if (interactionCharge >= 4.75) releaseLetters();
        };

        const onPointerLeave = () => {
          pointerActive = false;
          previousPointer = null;
          mobilePointerStart = null;
        };

        const releaseLetters = () => {
          if (released) return;
          released = true;
          releaseProgress = 0;
          orbitDirection = Math.random() > .5 ? 1 : -1;
          objects.forEach((object) => {
            object.releaseRadius = Math.hypot(object.mesh.position.x, object.mesh.position.y);
          });
        };

        const applyTap = (event: PointerEvent) => {
          onPointerMove(event);
          if (!pointerActive) return;
          interactionCharge += 1;
          if (interactionCharge >= 4.75) releaseLetters();
          objects.forEach((object, index) => {
            const dx = object.mesh.position.x - pointerLocal.x;
            const dy = object.mesh.position.y - pointerLocal.y;
            const distance = Math.max(.32, Math.hypot(dx, dy));
            if (distance > 2.2) return;
            const impulse = (1 - distance / 2.2) * (released ? .45 : .32);
            object.velocity.x += (dx / distance) * impulse;
            object.velocity.y += (dy / distance) * impulse;
            object.velocity.z += .12 + impulse * .18;
            object.angularVelocity.z += (index % 2 ? 1 : -1) * impulse * .28;
            object.angularVelocity.y += impulse * .2;
          });
        };

        const onPointerDown = (event: PointerEvent) => {
          if ((event.target as HTMLElement).closest("a, button")) return;
          if (mobile) {
            mobilePointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
            onPointerMove(event);
            return;
          }
          event.preventDefault();
          applyTap(event);
        };

        const onPointerUp = (event: PointerEvent) => {
          if (!mobile || !mobilePointerStart) return;
          const travel = Math.hypot(event.clientX - mobilePointerStart.x, event.clientY - mobilePointerStart.y);
          const duration = performance.now() - mobilePointerStart.time;
          if (travel < 14 && duration < 650) applyTap(event);
          mobilePointerStart = null;
          pointerActive = false;
          previousPointer = null;
        };

        const onPointerCancel = () => {
          mobilePointerStart = null;
          pointerActive = false;
          previousPointer = null;
        };

        const onScroll = () => {
          scrollTarget = THREE.MathUtils.clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1);
        };

        const resize = () => {
          const rect = mount.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          renderer.setSize(rect.width, rect.height, false);
          camera.aspect = rect.width / rect.height;
          camera.updateProjectionMatrix();
          worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * camera.position.z;
          worldWidth = worldHeight * camera.aspect;
        };

        const animate = (now: number) => {
          if (destroyed || !visible) return;
          const delta = Math.min(.035, Math.max(.001, (now - previousTime) / 1000));
          previousTime = now;
          const elapsed = now * .001;
          scrollProgress += (scrollTarget - scrollProgress) * (1 - Math.exp(-delta * 5));
          pointerStrength += ((pointerActive ? 1 : 0) - pointerStrength) * (1 - Math.exp(-delta * 7));
          if (released) releaseProgress += (1 - releaseProgress) * (1 - Math.exp(-delta * 2.2));

          objects.forEach((object, index) => {
            if (released) {
              const distance = Math.max(.25, Math.hypot(object.mesh.position.x, object.mesh.position.y));
              const nx = object.mesh.position.x / distance;
              const ny = object.mesh.position.y / distance;
              const settledRadius = mobile ? 1.3 + (index % 3) * .24 : 1.15 + (index % 3) * .28;
              const targetRadius = THREE.MathUtils.lerp(object.releaseRadius, settledRadius, releaseProgress);
              const radialError = targetRadius - distance;
              object.velocity.x += (nx * radialError * .56 - ny * .08 * orbitDirection) * delta * releaseProgress;
              object.velocity.y += (ny * radialError * .56 + nx * .08 * orbitDirection) * delta * releaseProgress;
              object.velocity.z += (-object.mesh.position.z * .34 + Math.sin(elapsed * .4 + object.phase) * .025) * delta * releaseProgress;
              object.velocity.multiplyScalar(Math.exp(-delta * .68));
              object.angularVelocity.multiplyScalar(Math.exp(-delta * .58));
            } else {
              const targetX = object.home.x + Math.sin(elapsed * .3 + object.phase) * .014;
              const targetY = object.home.y + Math.sin(elapsed * .42 + object.phase) * .034;
              const targetZ = object.home.z + Math.cos(elapsed * .28 + object.phase) * .02;
              object.velocity.x += (targetX - object.mesh.position.x) * 2.9 * delta;
              object.velocity.y += (targetY - object.mesh.position.y) * 2.9 * delta;
              object.velocity.z += (targetZ - object.mesh.position.z) * 3.4 * delta;
              object.velocity.multiplyScalar(Math.exp(-delta * 2.25));

              object.angularVelocity.x += (object.homeRotation.x + Math.sin(elapsed * .26 + object.phase) * .014 - object.mesh.rotation.x) * 1.8 * delta;
              object.angularVelocity.y += (object.homeRotation.y + Math.cos(elapsed * .24 + object.phase) * .02 - object.mesh.rotation.y) * 1.8 * delta;
              object.angularVelocity.z += (object.homeRotation.z - object.mesh.rotation.z) * 2 * delta;
              object.angularVelocity.multiplyScalar(Math.exp(-delta * 2.8));
            }

            if (pointerActive) {
              const dx = object.mesh.position.x - pointerLocal.x;
              const dy = object.mesh.position.y - pointerLocal.y;
              const distance = Math.max(.26, Math.hypot(dx, dy));
              const radius = released ? 1.65 : 1.28;
              if (distance < radius) {
                const force = (1 - distance / radius) * pointerStrength * (released ? 4.5 : 4.2) * delta;
                object.velocity.x += (dx / distance) * force;
                object.velocity.y += (dy / distance) * force;
                object.velocity.z += force * .13;
                object.angularVelocity.z += (dx / distance) * force * .16;
                object.angularVelocity.y += (index % 2 ? -1 : 1) * force * .1;
              }
            }
          });

          const collisionProgress = mobile
            ? THREE.MathUtils.smoothstep(releaseProgress, .3, 1)
            : releaseProgress;
          if (released && collisionProgress > 0) {
            for (let first = 0; first < objects.length; first += 1) {
              for (let second = first + 1; second < objects.length; second += 1) {
                const a = objects[first];
                const b = objects[second];
                const dx = a.mesh.position.x - b.mesh.position.x;
                const dy = a.mesh.position.y - b.mesh.position.y;
                const dz = a.mesh.position.z - b.mesh.position.z;
                const distance = Math.max(.001, Math.hypot(dx, dy, dz));
                const fullCollisionDistance = a.collisionRadius + b.collisionRadius;
                const minimumDistance = fullCollisionDistance * (.58 + collisionProgress * .42);
                if (distance >= minimumDistance) continue;

                const nx = dx / distance;
                const ny = dy / distance;
                const nz = dz / distance;
                const overlap = minimumDistance - distance;
                const correction = overlap * (.14 + collisionProgress * .3);
                a.mesh.position.x += nx * correction;
                a.mesh.position.y += ny * correction;
                a.mesh.position.z += nz * correction;
                b.mesh.position.x -= nx * correction;
                b.mesh.position.y -= ny * correction;
                b.mesh.position.z -= nz * correction;

                const relativeX = a.velocity.x - b.velocity.x;
                const relativeY = a.velocity.y - b.velocity.y;
                const relativeZ = a.velocity.z - b.velocity.z;
                const closingSpeed = relativeX * nx + relativeY * ny + relativeZ * nz;
                if (closingSpeed < 0) {
                  const impulse = -(1 + .32) * closingSpeed * .5;
                  a.velocity.x += nx * impulse;
                  a.velocity.y += ny * impulse;
                  a.velocity.z += nz * impulse * .45;
                  b.velocity.x -= nx * impulse;
                  b.velocity.y -= ny * impulse;
                  b.velocity.z -= nz * impulse * .45;
                  const spinTransfer = Math.min(.08, Math.abs(impulse) * .12);
                  a.angularVelocity.z += (first % 2 ? 1 : -1) * spinTransfer;
                  b.angularVelocity.z -= (second % 2 ? 1 : -1) * spinTransfer;
                }
              }
            }
          }

          const horizontalLimit = Math.max(formationHorizontalExtent, mobile
            ? compactMobileField ? 2.15 : Math.min(3.4, Math.max(2.9, worldHeight * .6))
            : Math.min(3.3, Math.max(2.45, worldWidth * .35)));
          const verticalLimit = Math.max(formationVerticalExtent, mobile
            ? compactMobileField ? 1.55 : Math.min(1.18, Math.max(.9, worldWidth * .32))
            : Math.min(2.15, Math.max(1.6, worldHeight * .32)));
          const constrainToWalls = (object: (typeof objects)[number], restitution: number) => {
            const radiusPadding = object.collisionRadius * boundaryRadiusScale;
            const xLimit = Math.max(.15, horizontalLimit - radiusPadding);
            const yLimit = Math.max(.15, verticalLimit - radiusPadding);
            // Asymmetric walls. Desktop: pull the left/bottom edges inward for
            // fields sitting close to headline text, never below the resting
            // formation extent so the word at rest is never clamped/distorted.
            // Mobile: the group is rotated 90deg, so the negative-Y wall is the
            // screen-left edge — extend it outward by mobileLeftReach.
            const xLimitLeft = mobile ? xLimit : Math.max(formationHorizontalExtent - radiusPadding, xLimit - leftInset);
            const negYLimit = mobile ? yLimit + mobileLeftReach : Math.max(formationVerticalExtent - radiusPadding, yLimit - floorLift);
            if (object.mesh.position.x < -xLimitLeft) {
              object.mesh.position.x = -xLimitLeft;
              if (object.velocity.x < 0) object.velocity.x *= -restitution;
            } else if (object.mesh.position.x > xLimit) {
              object.mesh.position.x = xLimit;
              if (object.velocity.x > 0) object.velocity.x *= -restitution;
            }
            if (object.mesh.position.y < -negYLimit) {
              object.mesh.position.y = -negYLimit;
              if (object.velocity.y < 0) object.velocity.y *= -restitution;
            } else if (object.mesh.position.y > yLimit) {
              object.mesh.position.y = yLimit;
              if (object.velocity.y > 0) object.velocity.y *= -restitution;
            }
            if (object.mesh.position.z < -1.15) {
              object.mesh.position.z = -1.15;
              if (object.velocity.z < 0) object.velocity.z *= -restitution;
            } else if (object.mesh.position.z > 1.15) {
              object.mesh.position.z = 1.15;
              if (object.velocity.z > 0) object.velocity.z *= -restitution;
            }
          };
          objects.forEach((object) => {
            const maximumSpeed = released ? (mobile ? .34 : .48) : .72;
            const speed = object.velocity.length();
            if (speed > maximumSpeed) object.velocity.multiplyScalar(maximumSpeed / speed);
            const maximumSpin = released ? (mobile ? .28 : .36) : .24;
            const spin = object.angularVelocity.length();
            if (spin > maximumSpin) object.angularVelocity.multiplyScalar(maximumSpin / spin);

            object.mesh.position.addScaledVector(object.velocity, delta * (released ? 2.7 : 3.25));
            constrainToWalls(object, released ? .56 : .34);

            object.mesh.rotation.x += object.angularVelocity.x * delta * 3;
            object.mesh.rotation.y += object.angularVelocity.y * delta * 3;
            object.mesh.rotation.z += object.angularVelocity.z * delta * 3;
          });

          if (released && collisionProgress > 0) {
            for (let pass = 0; pass < 2; pass += 1) {
              for (let first = 0; first < objects.length; first += 1) {
                for (let second = first + 1; second < objects.length; second += 1) {
                  const a = objects[first];
                  const b = objects[second];
                  const dx = a.mesh.position.x - b.mesh.position.x;
                  const dy = a.mesh.position.y - b.mesh.position.y;
                  const dz = a.mesh.position.z - b.mesh.position.z;
                  const distance = Math.max(.001, Math.hypot(dx, dy, dz));
                  const minimumDistance = (a.collisionRadius + b.collisionRadius) * (.58 + collisionProgress * .42);
                  if (distance >= minimumDistance) continue;
                  const correction = (minimumDistance - distance) * .505;
                  const nx = dx / distance;
                  const ny = dy / distance;
                  const nz = dz / distance;
                  a.mesh.position.x += nx * correction;
                  a.mesh.position.y += ny * correction;
                  a.mesh.position.z += nz * correction;
                  b.mesh.position.x -= nx * correction;
                  b.mesh.position.y -= ny * correction;
                  b.mesh.position.z -= nz * correction;
                }
              }
            }
            objects.forEach((object) => {
              constrainToWalls(object, .42);
            });
          }

          group.position.y += ((-.18 * scrollProgress) - group.position.y) * .045;
          const groupRotationTarget = (mobile ? -Math.PI / 2 : 0) - .035 * scrollProgress;
          group.rotation.z += (groupRotationTarget - group.rotation.z) * .035;
          const cameraTargetX = pointerActive ? pointerNdc.x * .055 : 0;
          const cameraTargetY = pointerActive ? pointerNdc.y * .035 + .08 : .08;
          camera.position.x += (cameraTargetX - camera.position.x) * .028;
          camera.position.y += (cameraTargetY - camera.position.y) * .028;
          camera.lookAt(0, 0, 0);
          renderer.render(scene, camera);
          raf = requestAnimationFrame(animate);
        };

        const resizeObserver = new ResizeObserver(resize);
        const visibilityObserver = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            previousTime = performance.now();
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(animate);
          } else {
            cancelAnimationFrame(raf);
          }
        }, { threshold: .01 });
        const interactionSurface = mount.parentElement ?? mount;

        resizeObserver.observe(mount);
        visibilityObserver.observe(mount);
        interactionSurface.addEventListener("pointermove", onPointerMove, { passive: true });
        interactionSurface.addEventListener("pointerleave", onPointerLeave);
        interactionSurface.addEventListener("pointerdown", onPointerDown);
        interactionSurface.addEventListener("pointerup", onPointerUp);
        interactionSurface.addEventListener("pointercancel", onPointerCancel);
        window.addEventListener("scroll", onScroll, { passive: true });
        resize();
        onScroll();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);

        cleanup = () => {
          destroyed = true;
          cancelAnimationFrame(raf);
          resizeObserver.disconnect();
          visibilityObserver.disconnect();
          interactionSurface.removeEventListener("pointermove", onPointerMove);
          interactionSurface.removeEventListener("pointerleave", onPointerLeave);
          interactionSurface.removeEventListener("pointerdown", onPointerDown);
          interactionSurface.removeEventListener("pointerup", onPointerUp);
          interactionSurface.removeEventListener("pointercancel", onPointerCancel);
          window.removeEventListener("scroll", onScroll);
          objects.forEach((object) => {
            object.mesh.geometry.dispose();
            object.mesh.material.dispose();
          });
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        console.warn("Page 3D lettering unavailable", error);
      }
    }

    void start();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [floorLift, leftInset, mobileLeftReach, mobileWord, spread, viewportMode, word]);

  return <div className={`page-motion-field ${className}`.trim()} ref={mountRef} aria-hidden="true" />;
}
