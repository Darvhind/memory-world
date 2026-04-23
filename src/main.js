import './style.css'
import PreloadScene from './bootscene'
import { memoryData } from './memoryData'
import Phaser from "phaser";

// mobile block prior to game load
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function renderMobileGate() {
  const app = document.getElementById("game-container");

  if (!app) {
    console.error("Missing #game-container in HTML");
    return;
  }

  app.innerHTML = `
    <div style="
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 24px;
      box-sizing: border-box;
      background: #0f0f0f;
      color: white;
      font-family: sans-serif;
      text-align: center;
    ">
      
      <div style="max-width: 320px;">
        <h1 style="font-size: 26px; margin-bottom: 16px;">
          Heyy :D I made something for you 💌
        </h1>

        <p style="font-size: 16px; opacity: 0.8; margin-bottom: 32px;">
          It really feels better on a laptop though 💻
        </p>

        <button id="wa-btn" style="
          width: 100%;
          padding: 16px;
          font-size: 16px;
          font-weight: bold;
          border: none;
          border-radius: 12px;
          background: #25D366;
          color: white;
        ">
          Send via WhatsApp
        </button>
      </div>
    </div>
  `;

  const btn = document.getElementById("wa-btn");

  btn.addEventListener("click", () => {
    const url = window.location.href;

    const message =
      "Heyy :D Send this to yourself please 💌\n\n" +
      "Didn't wanna doxx you by linking it straight to your number haha\n\n" +
      url;

    const encoded = encodeURIComponent(message);

    window.location.href = `https://wa.me/?text=${encoded}`;
  });
}

function groupMemoriesByDate(memories) {
  const sorted = [...memories].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const groups = {};

  sorted.forEach(m => {
    if (!groups[m.date]) groups[m.date] = [];
    groups[m.date].push(m);
  });

  return groups;
}

function computeTimelineLayout(groups) {
  const dates = Object.keys(groups).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const layout = [];

  let currentY = 300;

  const baseGap = 200;
  const gapScale = 120;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];

    if (i > 0) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(date);

      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      const gap = Math.min(
        1000,
        baseGap + Math.pow(diffDays, 0.7) * gapScale
      );

      currentY += gap;
    }

    layout.push({
      date,
      y: currentY,
      memories: groups[date]
    });
  }

  return layout;
}

function assignXPositions(layout, worldWidth) {
  const centerX = worldWidth / 2;
  const spacing = 150;

  layout.forEach(group => {
    const count = group.memories.length;
    const totalWidth = (count - 1) * spacing;
    const startX = centerX - totalWidth / 2;

    group.memories.forEach((m, i) => {
      m.x = startX + i * spacing;
      m.y = group.y;
    });
  });

  return layout;
}

class MainScene extends Phaser.Scene {
  constructor() {
    super("main-scene");
  }

  create() {
    this.worldWidth = 2500;
    //this.worldHeight = 4750;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Player
    // Player (orb + aura)
    this.player = this.add.circle(250, 250, 6, 0xffffff);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // outer aura ring
    this.playerRing = this.add.circle(250, 250, 18, 0xffffff, 0.08);

    // subtle breathing pulse
    this.tweens.add({
      targets: this.player,
      scale: 1.2,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // trail
    this.playerTrail = this.add.particles(0, 0, null, {
      follow: this.player,

      lifespan: 500,
      frequency: 40,

      scale: { start: 0.25, end: 0 },
      alpha: { start: 0.4, end: 0 },

      tint: 0x96b4ff,
      quantity: 1
    });

    // Camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // // Detect mobile
    // this.isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS;

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    
    // // Mobile tap interaction
    // this.input.on("pointerdown", () => {
    //   if (this.memoryOpen) return;

    //   if (this.currentMemory && this.isMobile) {
    //     const mem = memoryData.find(m => m.id === this.currentMemory);
    //     if (mem) this.openMemory(mem);
    //   }
    // });

    // Title
    this.add.text(this.scale.width / 2, 20, "The Worst Dates Ever™", {
      fontSize: "28px",
      color: "#222",
      fontStyle: "bold"
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // Timeline layout
    const groups = groupMemoriesByDate(memoryData);

    let layout = computeTimelineLayout(groups);

    layout = assignXPositions(layout, this.worldWidth);

    // Flatten
    const positionedMemories = layout.flatMap(g => g.memories);

    // Update world height based on layout
    const lastY = Math.max(...positionedMemories.map(m => m.y));
    this.worldHeight = lastY + 500;
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

    // Landmarks
    this.landmarks = [];

    this.incompleteZones = [];

    positionedMemories.forEach(m => {
      if (m.incomplete) {
        // create invisible blocker zone
        const zone = this.add.zone(m.x, m.y, 200, 200);
        this.physics.add.existing(zone, true);

        zone.isIncomplete = true;

        this.incompleteZones.push(zone);

        // faint visual indicator
        const overlay = this.add.rectangle(
          m.x,
          m.y,
          140,
          70,
          0x999999,
          0.6
        ).setDepth(2);

        this.tweens.add({
          targets: overlay,
          alpha: { from: 0.1, to: 0.35 },
          duration: 2000,
          yoyo: true,
          repeat: -1
        });

      } else {
        const landmark = this.add.sprite(m.x, m.y, m.id);

        this.physics.add.existing(landmark, true);

        landmark.memoryId = m.id;
        landmark.interactionRadius = 120;

        this.landmarks.push(landmark);
      }
    });

    // Timeline spine

    const graphics = this.add.graphics();
    graphics.setDepth(-10);
    graphics.lineStyle(2, 0xcccccc, 1);

    const spineX = this.worldWidth / 5;

    layout.forEach((group, i) => {
      if (i === 0) return;

      const prev = layout[i - 1];

      graphics.strokeLineShape(
        new Phaser.Geom.Line(
          spineX,
          prev.y,
          spineX,
          group.y
        )
      );
    });

    // Date anchors
    layout.forEach(group => {
      // Anchor dot sits on spine
      const dot = this.add.circle(
        spineX,
        group.y,
        40,
        0x222222
      ).setDepth(5);

      // Label slightly offset from spine (right side)
      if (group.date === "2050-01-01") return;
      const label = this.add.text(
        spineX,
        group.y,
        group.date,
        {
          fontSize: "16px",
          color: "#444",
          backgroundColor: "rgba(255,255,255,1)",
          padding: { x: 6, y: 2 }
        }
      )
      .setOrigin(0, 0.5)
      .setDepth(5);

      // subtle floating animation
      this.tweens.add({
        targets: label,
        y: label.y - 5,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    });

    // Prompt text
    this.promptText = this.add.text(0, 0, "", {
      fontSize: "18px",
      color: "#000"
    }).setOrigin(0.5).setVisible(false).setScrollFactor(0);

    // Collisions
    this.physics.add.collider(this.player, this.landmarks);

    this.physics.add.collider(this.player, this.incompleteZones);

    // Memory UI
    this.memoryOpen = false;
    this.currentMemoryAudio = null;

    // pagination state
    this.memoryPages = [];
    this.currentPage = 0;

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

    // Mac fullscreen keys
    const ctrlKey = createKey(-10, 170, "⌃");
    const cmdKey = createKey(40, 170, "⌘");
    const fKey = createKey(90, 170, "F");

    const fsLabel = this.add.text(40, 205, "fullscreen", {
      fontSize: "14px",
      color: "#444"
    }).setOrigin(0.5);

    controlsContainer.add([ctrlKey, cmdKey, fKey, fsLabel]);

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
      this.scale.height / 2 + 10,
      "",
      { fontSize: "18px", color: "#333", wordWrap: { width: 500 } }
    ).setOrigin(0.5);

    const hint = this.add.text(
      this.scale.width / 2 - 40,
      this.scale.height / 2 + 120,
      "Press ESC to close",
      { fontSize: "14px", color: "#666" }
    ).setOrigin(0.5);

    // pagination controls
    this.prevBtn = this.add.text(
      this.scale.width / 2 - 200,
      this.scale.height / 2 + 120,
      "← Prev",
      { fontSize: "16px", color: "#000" }
    )
    .setOrigin(0.5)
    .setInteractive();

    this.nextBtn = this.add.text(
      this.scale.width / 2 + 200,
      this.scale.height / 2 + 120,
      "Next →",
      { fontSize: "16px", color: "#000" }
    )
    .setOrigin(0.5)
    .setInteractive();

    this.pageIndicator = this.add.text(
      this.scale.width / 2 + 90,
      this.scale.height / 2 + 120,
      "",
      { fontSize: "14px", color: "#666" }
    ).setOrigin(0.5);

    // button interactions
    this.prevBtn.on("pointerdown", () => this.changePage(-1));
    this.nextBtn.on("pointerdown", () => this.changePage(1));

    this.memoryContainer.add([
      bg,
      panel,
      this.memoryTitle,
      this.memoryBody,
      this.prevBtn,
      this.nextBtn,
      this.pageIndicator,
      hint
    ]);

    // audio state
    this.volume = 0.5;
    this.sound.volume = this.volume;

    this.ambientMusic = this.sound.add("ambient", {
      loop: true,
    });

    this.currentMemoryAudio = null;

    // start ambient immediately
    this.playAmbient();

    // Volume Slider
    this.volumeUI = this.add.container(40, 40)
      .setScrollFactor(0)
      .setDepth(200);

    const sliderWidth = 120;

    // background
    const sliderBg = this.add.rectangle(0, 0, sliderWidth, 10, 0x000000, 0.3)
      .setOrigin(0, 0.5);

    // fill
    this.volumeFill = this.add.rectangle(0, 0, sliderWidth * this.volume, 10, 0xffffff, 0.8)
      .setOrigin(0, 0.5);

    // knob
    this.volumeKnob = this.add.circle(sliderWidth * this.volume, 0, 8, 0xffffff)
      .setInteractive({ draggable: true });

    this.volumeUI.add([sliderBg, this.volumeFill, this.volumeKnob]);

    this.input.setDraggable(this.volumeKnob);

    // drag logic
    this.volumeKnob.on("drag", (pointer, dragX) => {
      const x = Phaser.Math.Clamp(dragX, 0, sliderWidth);

      this.volumeKnob.x = x;
      this.volumeFill.displayWidth = x;

      this.volume = x / sliderWidth;

      this.updateAudioVolume();
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

  playAmbient() {
    if (this.currentMemoryAudio) {
      this.currentMemoryAudio.stop();
      this.currentMemoryAudio.destroy();
      this.currentMemoryAudio = null;
    }

    if (!this.ambientMusic.isPlaying) {
      this.ambientMusic.play();
    }

    // enforce volume
    this.ambientMusic.setVolume(this.volume);
  }

  playMemoryAudio(audioKey) {
    if (this.ambientMusic.isPlaying) {
      this.ambientMusic.stop();
    }

    if (this.currentMemoryAudio) {
      this.currentMemoryAudio.stop();
      this.currentMemoryAudio.destroy();
    }

    this.currentMemoryAudio = this.sound.add(audioKey, {
      loop: true
    });

    this.currentMemoryAudio.play();

    // ✅ CRITICAL: set volume AFTER play
    this.currentMemoryAudio.setVolume(this.volume);
  }

  updateAudioVolume() {
    if (this.ambientMusic) {
      this.ambientMusic.setVolume(this.volume);
    }

    if (this.currentMemoryAudio) {
      this.currentMemoryAudio.setVolume(this.volume);
    }
  }

  openMemory(memory) {
    this.memoryOpen = true;

    this.memoryTitle.setText(memory.title);
    this.memoryPages = this.paginateText(memory.text);
    this.currentPage = 0;
    this.updatePageDisplay();

    this.memoryContainer.setAlpha(0).setVisible(true);
    this.tweens.add({ targets: this.memoryContainer, alpha: 1, duration: 300 });

    const audioKey = memory.id + "_audio";

    if (this.cache.audio.exists(audioKey)) {
      this.playMemoryAudio(audioKey);
    } else {
      console.warn("Audio not loaded:", audioKey);
      this.playAmbient();
    }
  }

  paginateText(text, maxCharsPerPage = 400) {
    text = text
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // manual page breaks
    const rawPages = text.split("[PAGE_BREAK]");
    const pages = [];

    for (let block of rawPages) {
      const paragraphs = block.split("\n\n");
      let current = "";

      for (let p of paragraphs) {
        // 👉 weight line breaks inside paragraph
        const weightedLength = (str) =>
          str.replace(/\n/g, "XX").length; 
          // each \n ≈ 2 chars

        // handle oversized paragraph
        while (weightedLength(p) > maxCharsPerPage) {
          const slice = p.slice(0, maxCharsPerPage);

          if (current) {
            pages.push(current.trim());
            current = "";
          }

          pages.push(slice.trim());
          p = p.slice(maxCharsPerPage);
        }

        const candidate = current
          ? current + "\n\n" + p
          : p;

        if (weightedLength(candidate) > maxCharsPerPage) {
          if (current) pages.push(current.trim());
          current = p;
        } else {
          current = candidate;
        }
      }

      if (current) {
        pages.push(current.trim());
        current = "";
      }
    }

    return pages;
  }

  changePage(direction) {
    if (!this.memoryPages.length) return;

    this.currentPage = Phaser.Math.Clamp(
      this.currentPage + direction,
      0,
      this.memoryPages.length - 1
    );

    this.updatePageDisplay();
  }

  updatePageDisplay() {
    this.memoryBody.setText(this.memoryPages[this.currentPage]);

    this.pageIndicator.setText(
      `${this.currentPage + 1} / ${this.memoryPages.length}`
    );

    this.prevBtn.setAlpha(this.currentPage === 0 ? 0.3 : 1);
    this.nextBtn.setAlpha(
      this.currentPage === this.memoryPages.length - 1 ? 0.3 : 1
    );
  }

  closeMemory() {
    this.tweens.add({
      targets: this.memoryContainer,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.memoryContainer.setVisible(false);
        this.memoryOpen = false;
        this.memoryPages = [];
        this.currentPage = 0;

        if (this.currentMemoryAudio) {
          this.currentMemoryAudio.stop();
          this.currentMemoryAudio.destroy();
          this.currentMemoryAudio = null;
        }

        // resume ambient
        this.playAmbient();
      }
    });
  }

  update() {
    const speed = 3000;
    this.currentMemory = null;
    this.promptText.setVisible(false);

    this.playerRing.x = this.player.x;
    this.playerRing.y = this.player.y;

    if (this.memoryOpen) {
      this.player.body.setVelocity(0);
      if (Phaser.Input.Keyboard.JustDown(this.keyESC)) {
        this.closeMemory();
      }
      if (Phaser.Input.Keyboard.JustDown(this.keyLEFT)) {
        this.changePage(-1);
      }

      if (Phaser.Input.Keyboard.JustDown(this.keyRIGHT)) {
        this.changePage(1);
      }
      return;
    }

    const targetVelocityX =
      (this.cursors.left.isDown ? -1 : 0) +
      (this.cursors.right.isDown ? 1 : 0);

    const targetVelocityY =
      (this.cursors.up.isDown ? -1 : 0) +
      (this.cursors.down.isDown ? 1 : 0);

    this.player.body.velocity.x = Phaser.Math.Linear(
      this.player.body.velocity.x,
      targetVelocityX * speed,
      0.1
    );

    this.player.body.velocity.y = Phaser.Math.Linear(
      this.player.body.velocity.y,
      targetVelocityY * speed,
      0.1
    );

    let blocked = false;

    this.incompleteZones.forEach(zone => {
      const d = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        zone.x,
        zone.y
      );

      if (d < 140) {
        blocked = true;
      }
    });

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

    // apply effect on based on closest
    if (closest) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        closest.x,
        closest.y
      );

      const t = Phaser.Math.Clamp(1 - dist / 250, 0, 1);

      this.player.setScale(1 + t * 0.8);
      this.playerRing.setScale(1 + t * 2);

      // color shift (cold → warm)
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        new Phaser.Display.Color(150, 180, 255), // far (soft blue)
        new Phaser.Display.Color(255, 120, 160), // near (pinkish)
        100,
        t * 100
      );

      const finalColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      this.player.setFillStyle(finalColor, 0.9);

      // aura gets stronger
      this.playerRing.setFillStyle(finalColor, 0.15 + t * 0.25);

    } else {
      // reset
      this.player.setScale(1);
      this.playerRing.setScale(1);
      this.player.setFillStyle(0x96b4ff, 0.8);
      this.playerRing.setFillStyle(0x96b4ff, 0.1);
    }

    this.landmarks.forEach((l, i) => {
      // retains original float
      l.y += Math.sin(this.time.now * 0.002 + i) * 0.1;

      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        l.x,
        l.y
      );

      const t = Phaser.Math.Clamp(1 - dist / 300, 0, 1);

      // very subtle tint shift (barely noticeable, but felt)
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        new Phaser.Display.Color(255, 255, 255),   // neutral
        new Phaser.Display.Color(255, 220, 201),   // warm
        100,
        t * 100
      );

      const tint = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      l.setTint(tint);
    });


    if (closest) {
      this.currentMemory = closest.memoryId;
      this.promptText
        .setText("Press E to remember")
        .setPosition(
          this.player.x - this.cameras.main.scrollX,
          this.player.y - 50 - this.cameras.main.scrollY
        )
        .setVisible(true);
    }

    if (blocked) {
      this.promptText
        .setText("Not yet...")
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

function initGame() {
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

    scene: [PreloadScene, MainScene]
  };

  new Phaser.Game(config);
}

window.addEventListener("DOMContentLoaded", () => {
  if (isMobileDevice()) {
    renderMobileGate();
  } else {
    initGame();
  }
});