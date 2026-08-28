import * as THREE from 'three';

/**
 * Props are paper stand-ups and ground decals: flat planes carrying ink
 * textures, exactly like drawings standing up out of the page.
 */

export function makeStandee(
  tex: THREE.Texture,
  w: number,
  h: number,
  opacity = 1
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h);
  geo.translate(0, h / 2, 0);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    alphaTest: 0.08,
    opacity,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(geo, mat);
}

export function makeDecal(
  tex: THREE.Texture,
  w: number,
  h: number,
  opacity = 1
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(w, h);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const m = new THREE.Mesh(geo, mat);
  m.position.y = 0.01;
  m.renderOrder = -6;
  return m;
}

/** Dispose a group's geometries/materials/textures recursively. */
export function disposeGroup(root: THREE.Object3D) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      const mm = m as THREE.MeshBasicMaterial;
      if (mm.map) mm.map.dispose();
      m.dispose();
    }
  });
}

/**
 * A flat ink ribbon that follows an XZ polyline on the ground — used for
 * inked lines the player "draws" by walking. Revealed via drawRange.
 */
export function makeRibbon(
  points: [number, number][],
  width: number,
  color: number,
  y = 0.02
): { mesh: THREE.Mesh; segments: number; setProgress: (t: number) => void } {
  const n = points.length;
  const positions = new Float32Array(n * 2 * 3);
  const dir = new THREE.Vector2();
  for (let i = 0; i < n; i++) {
    const [x, z] = points[i];
    const [nx, nz] = points[Math.min(i + 1, n - 1)];
    const [px, pz] = points[Math.max(i - 1, 0)];
    dir.set(nx - px, nz - pz).normalize();
    // perpendicular in XZ
    const ox = -dir.y * width * 0.5;
    const oz = dir.x * width * 0.5;
    positions.set([x + ox, y, z + oz], i * 6);
    positions.set([x - ox, y, z - oz], i * 6 + 3);
  }
  const indices: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -5;
  const segments = n - 1;
  geo.setDrawRange(0, 0);
  return {
    mesh,
    segments,
    setProgress: (t: number) => {
      const seg = Math.round(THREE.MathUtils.clamp(t, 0, 1) * segments);
      geo.setDrawRange(0, seg * 6);
    },
  };
}
