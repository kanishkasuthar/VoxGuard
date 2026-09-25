import * as ort from "onnxruntime-web";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.resolve(__dirname, "../public/models/voice_antispoof_v1.onnx");

console.log("==================================================");
console.log("AASIST ONNX MODEL VALIDATION");
console.log("==================================================");
console.log(`Checking model file at: ${modelPath}`);

if (!fs.existsSync(modelPath)) {
  console.error("❌ ERROR: Model file does not exist!");
  process.exit(1);
}

const stats = fs.statSync(modelPath);
console.log(`✓ Model file size: ${(stats.size / 1024 / 1024).toFixed(2)} MB (${stats.size} bytes)`);

async function validateModel() {
  try {
    console.log("Initializing ONNX Runtime session...");
    const modelBuffer = fs.readFileSync(modelPath);
    const session = await ort.InferenceSession.create(modelBuffer);

    console.log(`✓ ONNX Session created successfully!`);
    console.log(`Input Names:`, session.inputNames);
    console.log(`Output Names:`, session.outputNames);

    const inputName = session.inputNames[0];
    const outputName = session.outputNames[0];

    // Generate 64,600 Float32 samples representing 4 seconds @ 16kHz
    const windowSize = 64600;
    const dummyAudio = new Float32Array(windowSize);
    for (let i = 0; i < windowSize; i++) {
      dummyAudio[i] = Math.sin(2 * Math.PI * 440 * i / 16000) * 0.1; // 440Hz sine wave tone
    }

    console.log(`Constructing input tensor '${inputName}' shape [1, ${windowSize}]...`);
    const inputTensor = new ort.Tensor("float32", dummyAudio, [1, windowSize]);

    console.log("Running AASIST ONNX inference execution...");
    const startTime = performance.now();
    const results = await session.run({ [inputName]: inputTensor });
    const endTime = performance.now();

    const outputTensor = results[outputName];
    const logits = outputTensor.data;

    console.log(`✓ Inference executed in ${(endTime - startTime).toFixed(2)} ms`);
    console.log(`Output tensor '${outputName}' shape:`, outputTensor.dims);
    console.log(`Raw output logits:`, Array.from(logits));

    if (logits.length >= 2) {
      const bonafideLogit = logits[0]; // Index 0 = bonafide (Human authentic)
      const spoofLogit = logits[1];    // Index 1 = spoof (AI-generated)

      const maxLogit = Math.max(bonafideLogit, spoofLogit);
      const expBona = Math.exp(bonafideLogit - maxLogit);
      const expSpoof = Math.exp(spoofLogit - maxLogit);
      const sum = expBona + expSpoof;

      const bonaProb = (expBona / sum) * 100;
      const spoofProb = (expSpoof / sum) * 100;

      console.log("--------------------------------------------------");
      console.log("SEMANTIC CLASS MAPPING VERIFICATION:");
      console.log(`  Index 0 (bonafide / Human Authentic): Logit = ${bonafideLogit.toFixed(4)}, Prob = ${bonaProb.toFixed(2)}%`);
      console.log(`  Index 1 (spoof / AI-Generated):        Logit = ${spoofLogit.toFixed(4)}, Prob = ${spoofProb.toFixed(2)}%`);
      console.log("--------------------------------------------------");
      console.log("✓ AASIST ONNX MODEL VALIDATION PASSED!");
    } else {
      console.error("❌ ERROR: Unexpected output tensor shape. Expected at least 2 logits.");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ ERROR during model validation:", err);
    process.exit(1);
  }
}

validateModel();
