import './style.css'
import Phaser from "phaser";

const memoryData = [
  { id: "oga", x: 625, y: 300, date: 1, title: "The Origin Story", text: "Field Experiment #1.\nInitial contact established with subject known as Arya\nHypothesis: promising conversational range and suspiciously strong opinions.\nFurther observance required.\nNote: abandoned coffee in favour of first hojicha - unexpectedly delightful results." },
  { id: "kenny_hills", x: 775, y: 300, date: 1, title: "XXX", text: "Dinner #1.\n\nObservation:\nSubject ordered  a salad which she did not finish.\nSuper endearing space themed earing.\nLore acquired on teabag tattoo and bestie." },
  { id: "durian", x: 925, y: 300, date: 1, title: "XXX", text: "YYY" },
  { id: "ni_kizuko", x: 1650, y: 700, date: 2, title: "XXX", text: "YYY" },
  { id: "wawafish", x: 1800, y: 700, date: 2, title: "First brush with the Mafia", text: " " },
  { id: "strangers", x: 625, y: 1100, date: 3, title: "XXX", text: "YYY" },
  { id: "amcorp", x: 775, y: 1100, date: 3, title: "XXX", text: "YYY" },
  { id: "anw", x: 925, y: 1100, date: 3, title: "XXX", text: "YYY" },
  { id: "atap", x: 1500, y: 1500, date: 4, title: "XXX", text: "YYY" },
  { id: "eternyl", x: 1650, y: 1500, date: 4, title: "XXX", text: "YYY" },
  { id: "pampas", x: 1800, y: 1500, date: 4, title: "XXX", text: "YYY" },
  { id: "parking", x: 1950, y: 1500, date: 4, title: "XXX", text: "YYY" },
  { id: "tofu_gelato", x: 625, y: 1900, date: 5, title: "XXX", text: "YYY" },
  { id: "plan_b", x: 775, y: 1900, date: 5, title: "XXX", text: "YYY" },
  { id: "jann", x: 925, y: 1900, date: 5, title: "XXX", text: "YYY" },
  { id: "koyaku", x: 1650, y: 2300, date: 6, title: "XXX", text: "YYY" },
  { id: "tdsc", x: 1800, y: 2300, date: 6, title: "XXX", text: "YYY" },
  { id: "healy_mac", x: 700, y: 2700, date: 7, title: "XXX", text: "YYY" },
  { id: "tsutaya", x: 850, y: 2700, date: 7, title: "XXX", text: "YYY" },
  { id: "poblano", x: 1650, y: 3100, date: 8, title: "XXX", text: "YYY" },
  { id: "deceased", x: 1800, y: 3100, date: 8, title: "XXX", text: "YYY" },
  { id: "gasket_alley", x: 475, y: 3500, date: 9, title: "XXX", text: "YYY" },
  { id: "fluffed", x: 625, y: 3500, date: 9, title: "XXX", text: "YYY" },
  { id: "eternyl_1", x: 775, y: 3500, date: 9, title: "XXX", text: "YYY" },
  { id: "chachi", x: 925, y: 3500, date: 9, title: "XXX", text: "Honey and sauce discussion. could not tell if we got tomato or chili sauce" },
  { id: "project_hail_mary", x: 1075, y: 3500, date: 9, title: "XXX", text: "YYY" },
  { id: "heritage_pizza", x: 1575, y: 3900, date: 10, title: "XXX", text: "YYY" },
  { id: "licky_chan", x: 1725, y: 3900, date: 10, title: "XXX", text: "YYY" },
  { id: "baijiu", x: 1875, y: 3900, date: 10, title: "XXX", text: "YYY" },
  { id: "good_coffee", x: 550, y: 4300, date: 11, title: "XXX", text: "YYY" },
  { id: "fowlboys", x: 700, y: 4300, date: 11, title: "XXX", text: "YYY" },
  { id: "tdsc1", x: 850, y: 4300, date: 11, title: "XXX", text: "YYY" },
  { id: "brew_house", x: 1000, y: 4300, date: 11, title: "XXX", text: "YYY" }
];

class MainScene extends Phaser.Scene {
  constructor() {
    super("main-scene");
  }

  preload() {
    this.load.audio("ambient", "/assets/audio/ambient.mp3");

    memoryData.forEach(m => {
      this.load.image(m.id, `/assets/images/${m.id}.svg`);
      this.load.audio(m.id + "_audio", `/assets/audio/${m.id}.mp3`);
    });
  }

  create() {
    this.worldWidth = 2500;
    this.worldHeight = 4750;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Player
    this.player = this.add.rectangle(250, 250, 40, 40, 0x1e3a8a);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Detect mobile
    this.isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    
    // Mobile tap interaction
    this.input.on("pointerdown", () => {
      if (this.memoryOpen) return;

      if (this.currentMemory && this.isMobile) {
        const mem = memoryData.find(m => m.id === this.currentMemory);
        if (mem) this.openMemory(mem);
      }
    });

    // Title
    this.add.text(this.scale.width / 2, 20, "The Worst Dates Ever™", {
      fontSize: "28px",
      color: "#222",
      fontStyle: "bold"
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // group memories by date
    const groups = {};

    memoryData.forEach(m => {
      if (!groups[m.date]) groups[m.date] = [];
      groups[m.date].push(m);
    });

    this.landmarks = [];

    Object.entries(groups).forEach(([date, group], groupIndex) => {

      // === 1. Island anchor (keeps your timeline intact) ===
      const centerX = group.reduce((sum, m) => sum + m.x, 0) / group.length;
      const centerY = group.reduce((sum, m) => sum + m.y, 0) / group.length;

      // === 2. Give each island a "direction" (varies per date) ===
      const baseAngle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 180));
      const driftStrength = 120 + group.length * 20;

      const placedPoints = [];

      group.forEach((m, i) => {

        let tries = 0;
        let finalX, finalY;

        do {
          // === 3. Directional drift (main structure) ===
          const t = i / (group.length - 1 || 1); // normalized 0 → 1
          const driftX = Math.cos(baseAngle) * driftStrength * (t - 0.5);
          const driftY = Math.sin(baseAngle) * driftStrength * (t - 0.5);

          // === 4. Layered noise (break symmetry) ===
          const noiseX =
            Phaser.Math.Between(-120, 120) +
            Math.sin(i * 1.3 + groupIndex) * 40;

          const noiseY =
            Phaser.Math.Between(-80, 80) +
            Math.cos(i * 1.7 + groupIndex) * 30;

          finalX = centerX + driftX + noiseX;
          finalY = centerY + driftY + noiseY;

          tries++;

          // === 5. Avoid overlap (simple spacing check) ===
        } while (
          placedPoints.some(p =>
            Phaser.Math.Distance.Between(p.x, p.y, finalX, finalY) < 100
          ) && tries < 20
        );

        placedPoints.push({ x: finalX, y: finalY });

        const landmark = this.add.sprite(finalX, finalY, m.id);

        this.physics.add.existing(landmark, true);
        landmark.memoryId = m.id;
        landmark.interactionRadius = 120;

        this.landmarks.push(landmark);
      });

      const graphics = this.add.graphics();
      graphics.lineStyle(2, 0x000000, 0.15);

      for (let i = 0; i < placedPoints.length - 1; i++) {
        const p1 = placedPoints[i];
        const p2 = placedPoints[i + 1];

        graphics.strokeLineShape(
          new Phaser.Geom.Line(p1.x, p1.y, p2.x, p2.y)
        );
      }
    });

    // Prompt text
    this.promptText = this.add.text(0, 0, "", {
      fontSize: "18px",
      color: "#000"
    }).setOrigin(0.5).setVisible(false).setScrollFactor(0);

    // Collisions
    this.physics.add.collider(this.player, this.landmarks);

    // Memory UI
    this.memoryOpen = false;
    this.currentMemoryAudio = null;

    this.memoryContainer = this.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(100)
      .setVisible(false);

    const bg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.6
    );

    // Particles
    const particles = this.add.particles(0, 0, null, {
      x: { min: 0, max: this.worldWidth },
      y: 0,
      speedY: { min: 20, max: 60 },
      lifespan: 8000,
      quantity: 1,
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.2, end: 0 }
    });


    const panelWidth = Math.min(600, this.scale.width * 0.9);
    const panelHeight = Math.min(300, this.scale.height * 0.6);

    const panel = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      panelWidth,
      panelHeight,
      0xffffff
    ).setStrokeStyle(2, 0x000000);

    this.memoryTitle = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 100,
      "",
      { fontSize: "24px", color: "#000", fontStyle: "bold" }
    ).setOrigin(0.5);

    // Controls HUD (left side)
    const controlsContainer = this.add.container(60, 120)
      .setScrollFactor(0)
      .setDepth(200)
      .setAlpha(0.55);

    // helper function to create a keycap
    const createKey = (x, y, label) => {
      const key = this.add.container(x, y);

      const bg = this.add.rectangle(0, 0, 40, 40, 0xffffff, 0.9)
        .setStrokeStyle(1, 0xcccccc);

      const text = this.add.text(0, 0, label, {
        fontSize: "20px",
        color: "#222",
        fontStyle: "bold"
      }).setOrigin(0.5);

      key.add([bg, text]);
      return key;
    };

    // arrow cluster
    const up = createKey(40, -15, "↑");
    const left = createKey(-5, 30, "←");
    const down = createKey(40, 30, "↓");
    const right = createKey(85, 30, "→");

    // E key
    const eKey = createKey(40, 90, "E");

    const eLabel = this.add.text(40, 125, "remember", {
      fontSize: "14px",
      color: "#444"
    }).setOrigin(0.5);

    controlsContainer.add([up, left, down, right, eKey, eLabel]);

    this.tweens.add({
      targets: controlsContainer,
      y: controlsContainer.y + 10,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    this.memoryBody = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "",
      { fontSize: "18px", color: "#333", wordWrap: { width: 500 } }
    ).setOrigin(0.5);

    const hint = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 120,
      "Press ESC to close",
      { fontSize: "14px", color: "#666" }
    ).setOrigin(0.5);

    this.memoryContainer.add([bg, panel, this.memoryTitle, this.memoryBody, hint]);

    // Ambient Music
    this.ambientMusic = this.sound.add("ambient", { loop: true, volume: 0.5 });
    this.ambientMusic.play();

    // Volume Slider
    // container anchored to screen
    this.volumeUI = this.add.container(40, 40)
      .setScrollFactor(0)
      .setDepth(200);

    // background bar
    const sliderBg = this.add.rectangle(0, 0, 120, 10, 0x000000, 0.3)
      .setOrigin(0, 0.5);

    // fill bar (visual volume level)
    this.volumeFill = this.add.rectangle(0, 0, 60, 10, 0xffffff, 0.8)
      .setOrigin(0, 0.5);

    // knob
    this.volumeKnob = this.add.circle(60, 0, 8, 0xffffff)
      .setInteractive({ draggable: true });

    this.volumeUI.add([sliderBg, this.volumeFill, this.volumeKnob]);

    this.input.setDraggable(this.volumeKnob);

    this.volume = 0.5; // default

    this.volumeKnob.on("drag", (pointer, dragX) => {
      const minX = 0;
      const maxX = 120;

      let x = Phaser.Math.Clamp(dragX, minX, maxX);

      this.volumeKnob.x = x;

      // update fill
      this.volumeFill.width = x;

      // convert to 0–1 range
      this.volume = x / maxX;

      // apply volume
      if (this.ambientMusic) this.ambientMusic.setVolume(this.volume);
      if (this.currentMemoryAudio) this.currentMemoryAudio.setVolume(this.volume);
    });

    // Mobile movement (drag to move)
    this.input.on("pointermove", (pointer) => {
      if (!this.memoryOpen && pointer.isDown) {
        this.physics.moveTo(
          this.player,
          pointer.worldX,
          pointer.worldY,
          300
        );
      }
    });
  }

  openMemory(memory) {
    this.memoryOpen = true;
    this.memoryTitle.setText(memory.title);
    this.memoryBody.setText(memory.text);

    this.memoryContainer.setAlpha(0).setVisible(true);
    this.tweens.add({ targets: this.memoryContainer, alpha: 1, duration: 300 });

    if (this.ambientMusic && this.ambientMusic.isPlaying) {
      this.ambientMusic.stop();
    }

    if (this.currentMemoryAudio) {
      this.currentMemoryAudio.stop();
      this.currentMemoryAudio.destroy();
      this.currentMemoryAudio = null;
    }

    const audioKey = memory.id + "_audio";

    if (this.cache.audio.exists(audioKey)) {
      this.currentMemoryAudio = this.sound.add(audioKey, {
        loop: true,
        volume: this.volume
      });
      this.currentMemoryAudio.play();
    } else {
      console.log(`Audio missing for: ${audioKey}`);
    }
  }

  closeMemory() {
    this.tweens.add({
      targets: this.memoryContainer,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.memoryContainer.setVisible(false);
        this.memoryOpen = false;

        if (this.currentMemoryAudio) {
          this.currentMemoryAudio.stop();
          this.currentMemoryAudio.destroy();
          this.currentMemoryAudio = null;
        }

        if (this.ambientMusic) {
          this.ambientMusic.play();
        }
      }
    });
  }

  update() {
    const speed = 2500;
    this.currentMemory = null;
    this.promptText.setVisible(false);

    if (this.memoryOpen) {
      this.player.body.setVelocity(0);
      if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
        this.closeMemory();
      }
      return;
    }

    this.player.body.setVelocity(0);
    this.player.body.setGravityY(0);

    if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.body.setVelocityY(-speed);
    if (this.cursors.down.isDown) this.player.body.setVelocityY(speed);

    let closest = null;
    let closestDist = Infinity;

    this.landmarks.forEach(l => {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        l.x,
        l.y
      );
      if (d < l.interactionRadius && d < closestDist) {
        closest = l;
        closestDist = d;
      }
    });

    this.landmarks.forEach((l, i) => {
      l.y += Math.sin(this.time.now * 0.002 + i) * 0.1;
    });


    if (closest) {
      this.currentMemory = closest.memoryId;
      this.promptText
        .setText(this.isMobile ? "Tap to remember" : "Press E to remember")
        .setPosition(
          this.player.x - this.cameras.main.scrollX,
          this.player.y - 50 - this.cameras.main.scrollY
        )
        .setVisible(true);
    }

    if (this.currentMemory && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      const mem = memoryData.find(m => m.id === this.currentMemory);
      if (mem) this.openMemory(mem);
    }
  }
}

const config = {
  type: Phaser.AUTO,

  parent: "game-container",

  width: 2560,
  height: 1440,

  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.NO_CENTER,

    min: {
      width: 800,
      height: 600
    },
    max: {
      width: 2560,
      height: 1440
    }
  },

  transparent: true,

  physics: {
    default: "arcade",
    arcade: { debug: false }
  },

  scene: MainScene
};

new Phaser.Game(config);