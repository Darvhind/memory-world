import './style.css'
import Phaser from "phaser";

const memoryData = [
  { id: "oga", x: 625, y: 300, title: "The Origin Story", text: "Field Experiment #1.\nInitial contact established with subject known as Arya\nHypothesis: promising conversational range and suspiciously strong opinions.\nFurther observance required.\nNote: abandoned coffee in favour of first hojicha - unexpectedly delightful results." },
  { id: "kenny_hills", x: 775, y: 300, title: "XXX", text: "Dinner #1.\n\nObservation:\nSubject ordered  a salad which she did not finish.\nSuper endearing space themed earing.\nLore acquired on teabag tattoo." },
  { id: "durian", x: 925, y: 300, title: "XXX", text: "YYY" },
  { id: "ni_kizuko", x: 1650, y: 700, title: "XXX", text: "YYY" },
  { id: "wawafish", x: 1800, y: 700, title: "First brush with the Mafia", text: " " },
  { id: "strangers", x: 625, y: 1100, title: "XXX", text: "YYY" },
  { id: "amcorp", x: 775, y: 1100, title: "XXX", text: "YYY" },
  { id: "anw", x: 925, y: 1100, title: "XXX", text: "YYY" },
  { id: "atap", x: 1500, y: 1500, title: "XXX", text: "YYY" },
  { id: "eternyl", x: 1650, y: 1500, title: "XXX", text: "YYY" },
  { id: "pampas", x: 1800, y: 1500, title: "XXX", text: "YYY" },
  { id: "parking", x: 1950, y: 1500, title: "XXX", text: "YYY" },
  { id: "tofu_gelato", x: 625, y: 1900, title: "XXX", text: "YYY" },
  { id: "plan_b", x: 775, y: 1900, title: "XXX", text: "YYY" },
  { id: "jann", x: 925, y: 1900, title: "XXX", text: "YYY" },
  { id: "koyaku", x: 1650, y: 2300, title: "XXX", text: "YYY" },
  { id: "tsdc", x: 1800, y: 2300, title: "XXX", text: "YYY" },
  { id: "healy_mac", x: 700, y: 2700, title: "XXX", text: "YYY" },
  { id: "tsutaya", x: 850, y: 2700, title: "XXX", text: "YYY" },
  { id: "poblano", x: 1650, y: 3100, title: "XXX", text: "YYY" },
  { id: "deceased", x: 1800, y: 3100, title: "XXX", text: "YYY" },
  { id: "gasket_alley", x: 475, y: 3500, title: "XXX", text: "YYY" },
  { id: "fluffed", x: 625, y: 3500, title: "XXX", text: "YYY" },
  { id: "eternyl_1", x: 775, y: 3500, title: "XXX", text: "YYY" },
  { id: "chachi", x: 925, y: 3500, title: "XXX", text: "YYY" },
  { id: "project_hail_mary", x: 1075, y: 3500, title: "XXX", text: "YYY" },
  { id: "heritage_pizza", x: 1575, y: 3900, title: "XXX", text: "YYY" },
  { id: "licky_chan", x: 1725, y: 3900, title: "XXX", text: "YYY" },
  { id: "baijiu", x: 1875, y: 3900, title: "XXX", text: "YYY" }
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
    this.worldHeight = 4250;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Player
    this.player = this.add.rectangle(250, 250, 40, 40, 0x1e3a8a);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Title
    this.add.text(this.scale.width / 2, 20, "The Worst Dates Ever™", {
      fontSize: "28px",
      color: "#222",
      fontStyle: "bold"
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Landmarks
    this.landmarks = [];
    memoryData.forEach(m => {
      const landmark = this.add.sprite(m.x, m.y, m.id);
      this.physics.add.existing(landmark, true);
      landmark.memoryId = m.id;
      landmark.interactionRadius = 120;
      this.landmarks.push(landmark);
    });

    // Prompt text
    this.promptText = this.add.text(0, 0, "Press E to remember", {
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
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.05, end: 0 }
    });


    const panel = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      600,
      300,
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
    const up = createKey(0, -65, "↑");
    const left = createKey(-45, -20, "←");
    const down = createKey(0, -20, "↓");
    const right = createKey(45, -20, "→");

    // E key
    const eKey = createKey(0, 40, "E");

    const eLabel = this.add.text(0, 75, "remember", {
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
    const volumeSlider = document.createElement("input");
    volumeSlider.type = "range";
    volumeSlider.min = 0;
    volumeSlider.max = 1;
    volumeSlider.step = 0.01;
    volumeSlider.value = 0.5;

    volumeSlider.style.position = "absolute";
    volumeSlider.style.top = "10px";
    volumeSlider.style.left = "10px";
    volumeSlider.style.zIndex = "1000";

    document.body.appendChild(volumeSlider);

    volumeSlider.addEventListener("input", () => {
      const val = parseFloat(volumeSlider.value);
      if (this.ambientMusic) this.ambientMusic.setVolume(val);
      if (this.currentMemoryAudio) this.currentMemoryAudio.setVolume(val);
    });

    this.volumeSlider = volumeSlider;
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
        volume: parseFloat(this.volumeSlider.value)
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
    const speed = 1000;
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
  width: window.innerWidth,
  height: window.innerHeight,
  //backgroundColor: "#f3e8dc",
  transparent: true,
  physics: { default: "arcade", arcade: { debug: false } },
  scene: MainScene
};

new Phaser.Game(config);