"use client";

import { useEffect, useRef } from "react";
import { createLetterShape } from "@/components/hero-letter-field";

const digits = ["4", "0", "4"];

const materials = [
  { color: 0xa68d43, roughness: .38, metalness: .7, clearcoat: .1 },
  { color: 0x223444, roughness: .5, metalness: .42, clearcoat: .12 },
  { color: 0xb6a474, roughness: .5, metalness: .48, clearcoat: .08 },
];

export function NotFoundField() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    let cleanup = () => undefined;

    async function start() {
      try {
        const THREE = await import("three");
        if (cancelled || !mount) return;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = .86;
        renderer.domElement.setAttribute("aria-hidden", "true");
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(32, 1, .1, 30);
        camera.position.set(0, 0, 9);

        scene.add(new THREE.HemisphereLight(0xf1eadc, 0x9aa5b1, 1.5));
        const key = new THREE.DirectionalLight(0xf4dfaa, 2.9);
        key.position.set(-4, 6, 7);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x8197a8, 2);
        rim.position.set(6, -2, 5);
        scene.add(rim);
        const fill = new THREE.PointLight(0xcab777, 3.2, 14, 2);
        fill.position.set(1.5, .4, 4.5);
        scene.add(fill);

        let worldHeight = 5.16;
        let worldWidth = 9;
        let released = false;
        const targetSpeed = .58;
        // The text block, in world units — the digits never enter it.
        const contentBox = { minX: 0, maxX: 0, minY: 0, maxY: 0, valid: false };

        const bodies = digits.map((digit, index) => {
          const geometry = new THREE.ExtrudeGeometry(createLetterShape(THREE, digit), {
            depth: .34, curveSegments: 10, bevelEnabled: true, bevelThickness: .035, bevelSize: .025, bevelSegments: 4,
          });
          geometry.center();
          geometry.computeBoundingSphere();
          const material = new THREE.MeshPhysicalMaterial({ ...materials[index], clearcoatRoughness: .2 });
          const mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);
          const angle = (index / digits.length) * Math.PI * 2 + .7;
          return {
            mesh,
            baseRadius: geometry.boundingSphere?.radius ?? 1.2,
            radius: 1,
            home: new THREE.Vector3(),
            phase: index * 1.37,
            cruiseAngle: angle,
            velocity: new THREE.Vector3(),
            spin: new THREE.Vector3(.1 * (index % 2 ? 1 : -1), .15 * (index % 2 ? -1 : 1), .18 * (index === 1 ? 1 : -1)),
          };
        });

        const measureContent = () => {
          const element = document.querySelector(".not-found");
          if (!element) { contentBox.valid = false; return; }
          const rect = element.getBoundingClientRect();
          contentBox.minX = (rect.left / window.innerWidth - .5) * worldWidth;
          contentBox.maxX = (rect.right / window.innerWidth - .5) * worldWidth;
          contentBox.maxY = -(rect.top / window.innerHeight - .5) * worldHeight;
          contentBox.minY = -(rect.bottom / window.innerHeight - .5) * worldHeight;
          contentBox.valid = rect.width > 0 && rect.height > 0;
        };

        let centerX = 0;
        let centerY = 0;
        const layout = () => {
          const scale = Math.min(1, (worldWidth * .82) / 4.6) * .92;
          const spacing = 1.62 * scale;
          if (worldWidth < worldHeight) {
            // Portrait: rest above the text block with generous air, capped
            // below the header zone.
            centerX = 0;
            centerY = contentBox.valid
              ? Math.min(Math.max(0, contentBox.maxY + scale * 1.12 + .55), worldHeight / 2 - scale * 1.15 - .5)
              : 0;
          } else {
            // Landscape: the text is a left column, so rest in the open space
            // to its right, a touch below center.
            centerX = contentBox.valid
              ? THREE.MathUtils.clamp((contentBox.maxX + worldWidth / 2) / 2, .4, 1.5)
              : .6;
            centerY = -.12;
          }
          bodies.forEach((body, index) => {
            body.mesh.scale.setScalar(scale);
            body.radius = body.baseRadius * scale * .78;
            body.home.set(centerX + (index - 1) * spacing, centerY, 0);
            if (!released) body.mesh.position.copy(body.home);
          });
        };

        const resize = () => {
          renderer.setSize(window.innerWidth, window.innerHeight, false);
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * camera.position.z;
          worldWidth = worldHeight * camera.aspect;
          measureContent();
          layout();
        };
        resize();
        // Fonts settling can move the text block a moment after load.
        window.setTimeout(() => { measureContent(); layout(); }, 600);

        const raycaster = new THREE.Raycaster();
        const pointerNdc = new THREE.Vector2();
        const pointerWorld = new THREE.Vector3();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        let pointerActive = false;

        const trackPointer = (event: PointerEvent) => {
          pointerNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
          pointerNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(pointerNdc, camera);
          raycaster.ray.intersectPlane(plane, pointerWorld);
          pointerActive = true;
        };
        const releasePointer = () => { pointerActive = false; };

        const shove = (event: PointerEvent) => {
          if ((event.target as HTMLElement).closest("a, button")) return;
          trackPointer(event);
          let hit = false;
          bodies.forEach((body) => {
            const dx = body.mesh.position.x - pointerWorld.x;
            const dy = body.mesh.position.y - pointerWorld.y;
            const distance = Math.max(.3, Math.hypot(dx, dy));
            if (distance > body.radius + 1.4) return;
            hit = true;
            const impulse = 1.05 * (1 - distance / (body.radius + 1.4)) + .28;
            body.velocity.x += (dx / distance) * impulse;
            body.velocity.y += (dy / distance) * impulse;
            body.spin.z += (dx / distance) * .5;
          });
          // First real shove breaks the formation loose for good.
          if (hit && !released) {
            released = true;
            bodies.forEach((body) => {
              body.velocity.x += Math.cos(body.cruiseAngle) * targetSpeed * .6;
              body.velocity.y += Math.sin(body.cruiseAngle) * targetSpeed * .6;
            });
          }
        };

        let raf = 0;
        let previous = performance.now();
        const animate = (now: number) => {
          const delta = Math.min(.04, Math.max(.001, (now - previous) / 1000));
          previous = now;
          const elapsed = now * .001;

          bodies.forEach((body) => {
            if (pointerActive) {
              const dx = body.mesh.position.x - pointerWorld.x;
              const dy = body.mesh.position.y - pointerWorld.y;
              const distance = Math.max(.3, Math.hypot(dx, dy));
              const reach = body.radius + 1.1;
              if (distance < reach) {
                const force = (1 - distance / reach) * (released ? 5 : 2.6) * delta;
                body.velocity.x += (dx / distance) * force;
                body.velocity.y += (dy / distance) * force;
              }
            }

            if (!released) {
              // Sticky formation: sway in place and spring back from pokes.
              const targetX = body.home.x + Math.sin(elapsed * .4 + body.phase) * .022;
              const targetY = body.home.y + Math.sin(elapsed * .52 + body.phase) * .04;
              body.velocity.x += (targetX - body.mesh.position.x) * 3 * delta;
              body.velocity.y += (targetY - body.mesh.position.y) * 3 * delta;
              body.velocity.multiplyScalar(Math.exp(-delta * 2.3));
              body.mesh.position.addScaledVector(body.velocity, delta * 3.1);
              body.mesh.rotation.x = Math.sin(elapsed * .3 + body.phase) * .05;
              body.mesh.rotation.y = Math.cos(elapsed * .26 + body.phase) * .06;
              body.mesh.rotation.z = Math.sin(elapsed * .34 + body.phase) * .03;
              return;
            }

            // Slight pull back toward the resting field, with a whisper of
            // orbit, so the drift stays composed instead of chaotic.
            const homeDx = body.mesh.position.x - centerX;
            const homeDy = body.mesh.position.y - centerY;
            const homeDistance = Math.max(.001, Math.hypot(homeDx, homeDy));
            if (homeDistance > 1.4) {
              const pull = (homeDistance - 1.4) * .26 * delta;
              body.velocity.x -= (homeDx / homeDistance) * pull;
              body.velocity.y -= (homeDy / homeDistance) * pull;
            }
            body.velocity.x += (-homeDy / homeDistance) * .09 * delta;
            body.velocity.y += (homeDx / homeDistance) * .09 * delta;

            const speed = body.velocity.length();
            body.velocity.multiplyScalar(THREE.MathUtils.lerp(speed, targetSpeed, 1.1 * delta) / Math.max(speed, .001));
            body.mesh.position.addScaledVector(body.velocity, delta);
            body.mesh.rotation.x += body.spin.x * delta;
            body.mesh.rotation.y += body.spin.y * delta;
            body.mesh.rotation.z += body.spin.z * delta;
            body.spin.z = THREE.MathUtils.lerp(body.spin.z, .2 * Math.sign(body.spin.z || 1), .4 * delta);

            const xLimit = worldWidth / 2 - body.radius;
            const yLimit = worldHeight / 2 - body.radius;
            if (body.mesh.position.x < -xLimit) { body.mesh.position.x = -xLimit; body.velocity.x = Math.abs(body.velocity.x); }
            else if (body.mesh.position.x > xLimit) { body.mesh.position.x = xLimit; body.velocity.x = -Math.abs(body.velocity.x); }
            if (body.mesh.position.y < -yLimit) { body.mesh.position.y = -yLimit; body.velocity.y = Math.abs(body.velocity.y); }
            else if (body.mesh.position.y > yLimit) { body.mesh.position.y = yLimit; body.velocity.y = -Math.abs(body.velocity.y); }

            // Bounce off the text block so the copy stays readable.
            if (contentBox.valid && contentBox.maxY + body.radius < yLimit - .1) {
              const left = contentBox.minX - body.radius;
              const right = contentBox.maxX + body.radius;
              const bottom = contentBox.minY - body.radius;
              const top = contentBox.maxY + body.radius;
              const p = body.mesh.position;
              if (p.x > left && p.x < right && p.y > bottom && p.y < top) {
                const exits = [p.x - left, right - p.x, p.y - bottom, top - p.y];
                const smallest = Math.min(...exits);
                if (smallest === exits[0]) { p.x = left; body.velocity.x = -Math.abs(body.velocity.x); }
                else if (smallest === exits[1]) { p.x = right; body.velocity.x = Math.abs(body.velocity.x); }
                else if (smallest === exits[2]) { p.y = bottom; body.velocity.y = -Math.abs(body.velocity.y); }
                else { p.y = top; body.velocity.y = Math.abs(body.velocity.y); }
              }
            }
          });

          if (released) {
            for (let first = 0; first < bodies.length; first += 1) {
              for (let second = first + 1; second < bodies.length; second += 1) {
                const a = bodies[first];
                const b = bodies[second];
                const dx = a.mesh.position.x - b.mesh.position.x;
                const dy = a.mesh.position.y - b.mesh.position.y;
                const distance = Math.max(.001, Math.hypot(dx, dy));
                const minimum = (a.radius + b.radius) * .92;
                if (distance >= minimum) continue;
                const nx = dx / distance;
                const ny = dy / distance;
                const correction = (minimum - distance) / 2;
                a.mesh.position.x += nx * correction; a.mesh.position.y += ny * correction;
                b.mesh.position.x -= nx * correction; b.mesh.position.y -= ny * correction;
                const closing = (a.velocity.x - b.velocity.x) * nx + (a.velocity.y - b.velocity.y) * ny;
                if (closing < 0) {
                  a.velocity.x -= closing * nx; a.velocity.y -= closing * ny;
                  b.velocity.x += closing * nx; b.velocity.y += closing * ny;
                }
              }
            }
          }

          renderer.render(scene, camera);
          raf = requestAnimationFrame(animate);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", trackPointer, { passive: true });
        window.addEventListener("pointerleave", releasePointer);
        window.addEventListener("pointerdown", shove, { passive: true });
        window.addEventListener("pointerup", releasePointer);
        raf = requestAnimationFrame(animate);

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", resize);
          window.removeEventListener("pointermove", trackPointer);
          window.removeEventListener("pointerleave", releasePointer);
          window.removeEventListener("pointerdown", shove);
          window.removeEventListener("pointerup", releasePointer);
          bodies.forEach((body) => { body.mesh.geometry.dispose(); body.mesh.material.dispose(); });
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        console.warn("404 lettering unavailable", error);
      }
    }

    void start();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div className="not-found-field" ref={mountRef} aria-hidden="true" />;
}
