class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) return true;
    
    const float32Data = input[0]; 
    // Just pass raw float32 data to main thread; we'll downsample there for simplicity
    // or implement a simple decimator here if we know the sample rate.
    // Assuming 48kHz -> 16kHz = 3:1 decimation
    
    this.port.postMessage(float32Data);
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
