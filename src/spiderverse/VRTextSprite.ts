import * as THREE from 'three';

export class VRTextSprite extends THREE.Sprite {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;

  constructor(text = '', { width = 512, height = 128, font = '24px monospace', textColor = 'white', background = 'rgba(0,0,0,0.6)', padding = 20, scale = new THREE.Vector3(1.5, 0.4, 1) } = {}) {
    // --- canvas setup ---
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d')!;
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false // better for HUD-style text
    });

    super(material);

    this.canvas = canvas;
    this.ctx = ctx;
    this.texture = texture;

    this.scale.copy(scale);

    // initial draw
    this.draw(text, { font, textColor, background, padding });
  }

  // --- draw / update text ---
  draw(text: string, { font = '13px monospace', textColor = 'white', background = 'rgba(0,0,0,0.6)', padding = 20 } = {}) {
    const { ctx, canvas, texture } = this;

    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    if (background) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // text
    ctx.font = font;
    ctx.fillStyle = textColor;
    ctx.textBaseline = 'middle';

    ctx.fillText(text, padding, canvas.height / 2);

    texture.needsUpdate = true;
  }

  // convenience alias
  setText(text: string) {
    this.draw(text);
  }
}
