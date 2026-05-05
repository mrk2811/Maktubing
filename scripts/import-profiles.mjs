#!/usr/bin/env node

/**
 * Bulk profile import script for Maktub
 *
 * Usage:
 *   node scripts/import-profiles.mjs profiles.csv
 *   node scripts/import-profiles.mjs profiles.csv --dry-run
 *
 * CSV columns (header row required):
 *   name, gender, age, height, residence, relocate, education, profession,
 *   legalStatus, maritalStatus, children, ethnicity, religiousSect, languages,
 *   aboutMe, comments, contactName, contactPhone,
 *   lookingFor_ageRange, lookingFor_height, lookingFor_ethnicity,
 *   lookingFor_residence, lookingFor_legalStatus, lookingFor_maritalStatus,
 *   lookingFor_religiousSect
 *
 * Required columns: name, gender, age
 * Languages: comma-separated (e.g. "English, Urdu")
 * Gender: "Male" or "Female"
 *
 * Environment:
 *   Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local or env vars.
 *   Uses service_role key to bypass RLS (admin operation).
 */

import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

// Load env vars from .env.local
function loadEnv() {
  const envPath = resolve(projectRoot, ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error(
    "Error: Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in environment."
  );
  process.exit(1);
}
if (!supabaseServiceKey) {
  console.error(
    "Error: Missing SUPABASE_SERVICE_ROLE_KEY in environment.\n" +
      "Add it to .env.local:\n  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ---- CSV Parser ----

function* parseCSVRows(content) {
  const rows = [];
  let currentRow = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && content[i + 1] === "\n") i++;
      currentRow.push(currentField.trim());
      currentField = "";
      if (currentRow.some((f) => f !== "")) {
        yield [...currentRow];
      }
      currentRow = [];
    } else {
      currentField += ch;
    }
  }
  currentRow.push(currentField.trim());
  if (currentRow.some((f) => f !== "")) {
    yield [...currentRow];
  }
}

// ---- Validation ----

const REQUIRED_COLUMNS = ["name", "gender", "age"];
const VALID_GENDERS = ["Male", "Female"];
const VALID_MARITAL = ["Single", "Never Married", "Divorced", "Widowed", "Married"];
const VALID_SECTS = ["Sunni", "Shia", "Other"];

function validateProfile(row, lineNum) {
  const errors = [];

  if (!row.name) errors.push(`Line ${lineNum}: name is required`);
  if (!VALID_GENDERS.includes(row.gender))
    errors.push(`Line ${lineNum}: gender must be "Male" or "Female" (got "${row.gender}")`);
  
  const age = parseInt(row.age);
  if (isNaN(age) || age < 18 || age > 99)
    errors.push(`Line ${lineNum}: age must be 18-99 (got "${row.age}")`);

  if (row.religiousSect && !VALID_SECTS.includes(row.religiousSect))
    errors.push(`Line ${lineNum}: religiousSect must be one of ${VALID_SECTS.join(", ")} (got "${row.religiousSect}")`);

  return errors;
}

function csvRowToDbProfile(row) {
  return {
    id: `imported-${randomUUID()}`,
    name: row.name || "",
    gender: row.gender || "Male",
    age: parseInt(row.age) || 25,
    height: row.height || "",
    residence: row.residence || "",
    relocate: row.relocate || "",
    education: row.education || "",
    profession: row.profession || "",
    legal_status: row.legalStatus || "",
    marital_status: row.maritalStatus || "",
    children: row.children || "None",
    ethnicity: row.ethnicity || "",
    religious_sect: row.religiousSect || "",
    languages: row.languages
      ? row.languages.split(",").map((l) => l.trim()).filter(Boolean)
      : [],
    looking_for: {
      ageRange: row.lookingFor_ageRange || "",
      height: row.lookingFor_height || "",
      ethnicity: row.lookingFor_ethnicity || "",
      residence: row.lookingFor_residence || "",
      legalStatus: row.lookingFor_legalStatus || "",
      maritalStatus: row.lookingFor_maritalStatus || "",
      religiousSect: row.lookingFor_religiousSect || "",
    },
    comments: row.comments || "",
    about_me: row.aboutMe || "",
    contact_name: row.contactName || "",
    contact_phone: row.contactPhone || "",
    phone_verified: true,
    admin_verified: true,
    image_url: null,
  };
}

// ---- Main ----

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const csvPath = args.find((a) => !a.startsWith("--"));

  if (!csvPath) {
    console.log("Usage: node scripts/import-profiles.mjs <profiles.csv> [--dry-run]");
    console.log("\nSee scripts/profiles-template.csv for the expected format.");
    process.exit(1);
  }

  const fullPath = resolve(process.cwd(), csvPath);
  if (!existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const content = readFileSync(fullPath, "utf-8");
  const rows = [...parseCSVRows(content)];

  if (rows.length < 2) {
    console.error("CSV must have a header row and at least one data row.");
    process.exit(1);
  }

  const headers = rows[0].map((h) => h.trim());
  const dataRows = rows.slice(1);

  // Check required columns
  for (const col of REQUIRED_COLUMNS) {
    if (!headers.includes(col)) {
      console.error(`Missing required column: ${col}`);
      console.error(`Found columns: ${headers.join(", ")}`);
      process.exit(1);
    }
  }

  // Parse rows into objects
  const profiles = dataRows.map((fields) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = fields[i] || "";
    });
    return obj;
  });

  // Validate all
  const allErrors = [];
  profiles.forEach((p, i) => {
    allErrors.push(...validateProfile(p, i + 2));
  });

  if (allErrors.length > 0) {
    console.error("Validation errors:");
    allErrors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }

  console.log(`Found ${profiles.length} profiles to import.`);

  if (dryRun) {
    console.log("\n--- DRY RUN (no data written) ---\n");
    profiles.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (${p.gender}, ${p.age}, ${p.ethnicity || "N/A"})`);
    });
    console.log(`\n${profiles.length} profiles would be imported.`);
    return;
  }

  // Insert in batches of 20
  const BATCH_SIZE = 20;
  let imported = 0;

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE).map(csvRowToDbProfile);
    const { error } = await supabase.from("profiles").insert(batch);
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      process.exit(1);
    }
    imported += batch.length;
    console.log(`  Imported ${imported}/${profiles.length}...`);
  }

  console.log(`\nDone! ${imported} profiles imported successfully.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
