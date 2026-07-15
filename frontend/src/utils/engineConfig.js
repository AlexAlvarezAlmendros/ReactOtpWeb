// The analysis engines are tuned for this rate; the browser client resamples
// decoded audio to it. Kept in its own module so the lightweight client can
// import it without pulling the DSP code into the main bundle.
export const ENGINE_SAMPLE_RATE = 22050
