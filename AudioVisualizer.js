class AudioVisualizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.source = null;
    this.animationFrameId = null;
    this.canvasCtx = this.canvas.getContext("2d");
  }

  start(audioBlob) {
    this.stop();

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const arrayBuffer = fileReader.result;
      this.audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = audioBuffer;
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.source.start(0);
        this.drawVisualizer();
      });
    };

    fileReader.readAsArrayBuffer(audioBlob);
  }

  stop() {
    if (this.source) {
      this.source.stop(0);
      this.source.disconnect();
      this.analyser.disconnect();
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  drawVisualizer() {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const WIDTH = this.canvas.width;
    const HEIGHT = this.canvas.height;
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    this.animationFrameId = requestAnimationFrame(
      this.drawVisualizer.bind(this)
    );

    this.analyser.getByteFrequencyData(dataArray);
    this.canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      const opacity = (barHeight / 255) * 0.4 + 0.6;
      this.canvasCtx.fillStyle = `rgba(192, 192, 192, ${opacity})`;
      this.canvasCtx.fillRect(
        x,
        HEIGHT - barHeight / 2,
        barWidth,
        barHeight / 2
      );

      x += barWidth + 1;
    }
  }
}
