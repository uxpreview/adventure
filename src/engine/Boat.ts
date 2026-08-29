import * as THREE from 'three';
import { rowboatTexture } from '../world/textures';
import { BOAT_HOME } from '../world/layout';

/**
 * THE ROWBOAT — the first mount (WORLD-SYSTEMS §4).
 *
 * The rules for a mount in this world are not negotiable and they were
 * written before this one existed:
 *
 *   **Every mount is fast on its own ground and refuses every other
 *   ground.** The rowboat's ground is WATER. On it you are half again
 *   as quick as a walk and you can go where the page has always said
 *   no; off it you are not in a boat at all, you are a person standing
 *   next to one.
 *
 *   **It is found in the world and left in the world.** There is no
 *   menu, there is no inventory, there is no summon. It is drawn up at
 *   the river mouth on a fresh page, and after that it is wherever you
 *   left it — which is saved, so it is still there tomorrow. Walking
 *   stays the universal verb: you can complete this world without ever
 *   touching an oar, and the boat is a second reading of the map rather
 *   than a faster way through the first one.
 *
 *   **And it is the PLAYER'S ALONE** (STORY §8 rule 1). Nobody crosses
 *   a border but the walker; it is the engine of the whole story. So no
 *   inhabitant may ever be shown using a boat to leave their own land,
 *   and the two boats already drawn on this coast — Pye's, up on the
 *   sand in Shelter Cove, and the one resting on the south beach —
 *   belong to people who row out and come back. They are not this boat
 *   and they never move.
 *
 * WHY IT IS A STANDEE AND NOT A DECAL. Session 5's hardest-won gotcha:
 * *a flat quad that runs away from the camera is invisible.* The camera
 * only ever looks north, so a rowboat lying on the water seen from
 * behind is four pixels of gunwale. This boat is a paper cutout, drawn
 * broadside, standing on the water exactly like every other drawing in
 * this world stands on the ground — and it mirrors with the direction
 * of travel the way Pip does, so the bow always leads. That is not a
 * compromise, it is the house style: nothing on this sheet has ever
 * been anything but a cutout facing you.
 */
export class Boat {
  group = new THREE.Group();
  /** Where the boat is, whether or not anyone is in it. */
  pos = new THREE.Vector2(BOAT_HOME.x, BOAT_HOME.z);
  aboard = false;

  private sprite: THREE.Mesh;
  private mat: THREE.MeshBasicMaterial;
  private bobT = 0;
  private lean = 0;

  constructor() {
    /* Four and a half units of hull for a walker who is one and a half
     * tall: a real dinghy against a real person. The first pass was
     * 5.6 wide and it read as a barge — at the shipping camera the
     * boat has to sit UNDER the walker, not around them. */
    const w = 4.5;
    const h = w * (104 / 200);
    const geo = new THREE.PlaneGeometry(w, h);
    geo.translate(0, h * 0.30, 0);
    this.mat = new THREE.MeshBasicMaterial({
      map: rowboatTexture(6100),
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
    this.sprite = new THREE.Mesh(geo, this.mat);
    this.group.add(this.sprite);
    /* Drawn AFTER the walker, and a third of a unit south of them, so
     * the hull hides the legs of whoever is sitting in it. The camera
     * only ever looks north, so "south of" is "in front of" and the
     * depth buffer does the rest. */
    this.group.renderOrder = 2;
  }

  setAt(x: number, z: number) {
    this.pos.set(x, z);
  }

  /**
   * Float it. `y` is the water's own surface (the terrain's height
   * there, because the river's bed IS the page), `heading` is which way
   * the walker is pointed, and `speed` is how hard they are pulling.
   */
  update(dt: number, y: number, heading: number, speed: number, afloat: boolean) {
    this.bobT += dt;
    /* HALF A UNIT SOUTH OF WHOEVER IS IN HER. The camera only ever
     * looks north, so south is toward the lens and the hull draws over
     * the walker's legs — which is the whole of what makes somebody
     * read as sitting IN a boat rather than standing on one. Round 2 of
     * the gate had a figure balanced on a gunwale. */
    this.group.position.set(this.pos.x, y, this.pos.y + (this.aboard ? 0.5 : 0));
    if (afloat) {
      // a hull sits IN the water, not on it — and it moves, because
      // water does. Drawn up on the sand it does neither: a boat
      // rocking on dry paper is the tell that nothing here is real.
      this.group.position.y -= 0.18;
      const work = Math.min(1, speed * 0.34);
      this.group.rotation.z = Math.sin(this.bobT * 1.35) * 0.028 * (1 + work);
      this.group.position.y += Math.sin(this.bobT * 1.05 + 0.8) * 0.06;
    } else {
      // up past the wrack line, canted over the way a boat left on a
      // beach always is
      this.group.rotation.z = 0.045;
    }
    // bow to the direction of travel
    if (Math.abs(heading) > 0.001 || this.aboard) {
      const west = Math.sin(heading) < -0.15;
      const east = Math.sin(heading) > 0.15;
      if (west) this.lean = -1;
      else if (east) this.lean = 1;
    }
    this.sprite.scale.x = this.lean < 0 ? -1 : 1;
  }

  dispose() {
    this.sprite.geometry.dispose();
    this.mat.map?.dispose();
    this.mat.dispose();
  }
}
