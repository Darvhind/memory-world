import Phaser from "phaser";

const memoryData = [
  {
    id: "oga",
    x: 700,
    y: 300,
    title: "Our First Coffee",
    text: "You ordered something complicated and I pretended I knew what it was."
  },
  {
    id: "kenny_hills",
    x: 850,
    y: 300,
    title: "Our First Coffee",
    text: "You ordered something complicated and I pretended I knew what it was."
  },
  {
    id: "ni_kizuko",
    x: 1650,
    y: 700,
    title: "That Long Walk",
    text: "We talked about everything and nothing for hours."
  },
  {
    id: "wawafish",
    x: 1800,
    y: 700,
    title: "That Long Walkdcasa",
    text: "We talked about everything and nothing for hours."
  },
  {
    id: "strangers",
    x: 630,
    y: 1100,
    title: "That Long Walk",
    text: "We talked about everything and nothing for hours."
  },
  {
    id: "amcorp",
    x: 780,
    y: 1100,
    title: "That Long Walk",
    text: "We talked about everything and nothing for hours."
  },
  {
    id: "anw",
    x: 930,
    y: 1100,
    title: "That Long Walkdcasa",
    text: "We talked about everything and nothing for hours."
  }
];

class MainScene extends Phaser.Scene {
  constructor() {
    super("main-scene");
  }

  preload() {
    // Ambient background
    this.load.audio("ambient", "/assets/audio/ambient.mp3");

    // Memory images
    this.load.image("oga", "/assets/images/oga.svg");
    this.load.image("kenny_hills", "/assets/images/kenny_hills.svg");
    this.load.image("ni_kizuko", "/assets/images/ni_kizoku.svg");
    this.load.image("wawafish", "/assets/images/wawafish.svg");
    this.load.image("strangers", "/assets/images/strangers.svg");
    this.load.image("amcorp", "/assets/images/amcorp.svg");
    this.load.image("anw", "/assets/images/anw.svg");

    // Memory audio
    memoryData.forEach((memory) => {
      // e.g., each memory has a file named by id
      this.load.audio(memory.id + "_audio", `/assets/audio/${memory.id}.mp3`);
    });
  }


  create() {
    this.worldWidth = 2500;
    this.worldHeight = 2000;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // PLAYER
    this.player = this.add.rectangle(250, 250, 40, 40, 0x1e3a8a);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // CAMERA
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // INPUT
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyE = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );
    this.keyESC = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // STATIC TITLE (UI layer)
    this.add
      .text(this.scale.width / 2, 20, "The Worst Dates Ever™", {
        fontSize: "28px",
        color: "#222",
        fontStyle: "bold"
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    // LANDMARKS
    this.landmarks = [];

    memoryData.forEach((memory) => {
    const landmark = this.add.sprite(memory.x, memory.y, memory.id);

    // Scale the image if needed
    // landmark.setDisplaySize(memory.width, memory.height);

    // Add physics for collision if needed
    this.physics.add.existing(landmark, true);

    // Store memory ID
    landmark.memoryId = memory.id;

    this.landmarks.push(landmark);
    });

    // BLOCK movement
    this.physics.add.collider(this.player, this.landmarks);

    // PROMPT
    this.promptText = this.add
      .text(0, 0, "Press E to remember", {
        fontSize: "18px",
        color: "#000"
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setScrollFactor(0);

    // MEMORY UI
    this.memoryOpen = false;

    this.memoryContainer = this.add.container(0, 0).setScrollFactor(0);
    this.memoryContainer.setDepth(100);
    this.memoryContainer.setVisible(false);

    const bg = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.6
    );

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

    this.memoryBody = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "",
      {
        fontSize: "18px",
        color: "#333",
        wordWrap: { width: 500 }
      }
    ).setOrigin(0.5);

    const hint = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 120,
      "Press ESC to close",
      { fontSize: "14px", color: "#666" }
    ).setOrigin(0.5);

    this.memoryContainer.add([bg, panel, this.memoryTitle, this.memoryBody, hint]);

    // Play ambient sound
    this.ambientMusic = this.sound.add("ambient", {
      loop: true,    // loop continuously
      volume: 0.5
    });
    this.ambientMusic.play();
  }

  openMemory(memory) {
    this.memoryOpen = true;
    this.memoryTitle.setText(memory.title);
    this.memoryBody.setText(memory.text);

    this.memoryContainer.setAlpha(0);
    this.memoryContainer.setVisible(true);

    this.tweens.add({
      targets: this.memoryContainer,
      alpha: 1,
      duration: 300
    });

    // Stop previous memory audio if any
    if (this.currentMemoryAudio) {
      this.currentMemoryAudio.stop();
    }

    // Play this memory's audio
    this.currentMemoryAudio = this.sound.add(memory.id + "_audio");
    this.currentMemoryAudio.play();
  }

  closeMemory() {
    this.tweens.add({
      targets: this.memoryContainer,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.memoryContainer.setVisible(false);
        this.memoryOpen = false;

        // Stop memory audio
        if (this.currentMemoryAudio) {
          this.currentMemoryAudio.stop();
          this.currentMemoryAudio = null;
        }
      }
    });
  }

  update() {
    const speed = 800;
    this.currentMemory = null;
    this.promptText.setVisible(false);

    if (this.memoryOpen) {
      this.player.body.setVelocity(0);

      if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
        this.closeMemory();
      }
      return;
    }

    // Movement
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) this.player.body.setVelocityX(-speed);
    if (this.cursors.right.isDown) this.player.body.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.body.setVelocityY(-speed);
    if (this.cursors.down.isDown) this.player.body.setVelocityY(speed);

    // PROXIMITY CHECK
    this.landmarks.forEach((landmark) => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        landmark.x,
        landmark.y
      );

      if (dist < 100) {
        this.currentMemory = landmark.memoryId;

        this.promptText
          .setPosition(
            this.player.x - this.cameras.main.scrollX,
            this.player.y - 50 - this.cameras.main.scrollY
          )
          .setVisible(true);
      }
    });

    // Interaction
    if (this.currentMemory && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      const memory = memoryData.find(
        (m) => m.id === this.currentMemory
      );
      this.openMemory(memory);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#ffffff",
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: MainScene
};

new Phaser.Game(config);
