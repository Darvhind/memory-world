import Phaser from "phaser";
import { memoryData } from './memoryData'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload-scene");
  }

  preload() {
    const { width, height } = this.scale;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0xffffff);

    // Intro text
    this.loadingText = this.add.text(
      width / 2,
      height / 2 - 40,
      "Replaying memories...",
      {
        fontSize: "24px",
        color: "#222"
      }
    ).setOrigin(0.5);

    // Progress bar
    const barWidth = 300;
    const barHeight = 10;

    const progressBg = this.add.rectangle(
      width / 2,
      height / 2 + 40,
      barWidth,
      barHeight,
      0xcccccc
    );

    this.progressBar = this.add.rectangle(
      width / 2 - barWidth / 2,
      height / 2 + 40,
      0,
      barHeight,
      0x222222
    ).setOrigin(0, 0.5);

    // Update progress
    this.load.on("progress", (value) => {
      this.progressBar.width = barWidth * value;
    });

    // When done, go to main scene
    this.load.on("complete", () => {
      this.scene.start("main-scene");
    });


    // Ambient
    this.load.audio("ambient", "assets/audio/ambient.ogg");

    memoryData.forEach(m => {
      this.load.image(m.id, `assets/images/${m.id}.svg`);

      this.load.audio(m.id + "_audio", [
        `assets/audio/${m.id}.ogg`
      ]);
    });

    const messages = [
      "Replaying memories...",
      "Reconstructing timeline...",
      "Decoding fragments...",
      "Some memories are clearer than others...",
      "Some moments linger longer than others...",
      "Loading emotional damage (of which there are many)..."
    ];

    let i = 0;

    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        this.loadingText.setText(messages[i % messages.length]);
        i++;
      }
    });
  }
}