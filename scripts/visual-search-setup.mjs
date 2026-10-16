// One-time setup after deploying: downloads the CLIP model into DATA_DIR/models so the
// first customer search is fast. Usage: npm run visual-search:setup
import path from "node:path";
import { AutoProcessor, AutoTokenizer, CLIPVisionModelWithProjection, CLIPTextModelWithProjection, env } from "@huggingface/transformers";

const MODEL_ID = "Xenova/clip-vit-base-patch32";
env.cacheDir = path.join(process.env.DATA_DIR || path.join(process.cwd(), "data"), "models");
console.log(`Downloading ${MODEL_ID} into ${env.cacheDir} …`);
await Promise.all([
  AutoProcessor.from_pretrained(MODEL_ID),
  AutoTokenizer.from_pretrained(MODEL_ID),
  CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { dtype: "q8" }),
  CLIPTextModelWithProjection.from_pretrained(MODEL_ID, { dtype: "q8" }),
]);
console.log("Visual search model ready.");
