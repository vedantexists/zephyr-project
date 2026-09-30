# ZephyrMess — Mess Feedback Digest

> Built for **Vibe Coding Event 2026 — Day 2 (30th)**  
> **Problem Statement #06:** Mess Feedback Digest  
> **Target Persona:** Hostel Students (&lt;10 s feedback) &amp; Mess Committee Manager (~2 min digest)  

---

## Problem & Solution

Campus dining halls cater to 300+ students 3 times a day. Feedback currently manifests as disorganized WhatsApp rants, heated dining hall arguments, or ignored comment books that managers never have time to analyze.

**ZephyrMess** solves this with a two-sided, high-velocity intelligence system:
1. **Student Flow (&lt;10s):** An ultra-fast 3-tap rating interface with an active stopwatch, auto-selected meal windows, quick tags, and Hinglish speech/text processing.
2. **Manager Flow (~2min):** A synthesized daily executive digest ranking recurring grievance clusters, highlighting meal-day anomalies, providing tickable kitchen directives for the Head Cook, and generating a 1-click WhatsApp kitchen dispatch.
3. **Anti-Spam &amp; Duplicate Shield:** SHA-256 student roll hashing, 1-submission-per-meal enforcement, 60s burst throttling, and near-duplicate comment filtering (cosine &gt; 0.92) to prevent rating manipulation.

---

## Constraints Addressed

1. **Student Constraint (&lt;10 seconds):**
   - The UI auto-detects meal windows by time-of-day.
   - Large 1-tap emoji/star targets immediately start a high-visibility live stopwatch.
   - Measured submission time is stored in milliseconds (`msToSubmit`) and validated against the &lt;10s target.
2. **Manager Constraint (~2 minutes read time):**
   - The digest adheres to a strict 250–350 word budget.
   - Read time is strictly computed (`words / 200 * 60`) and displayed in the KPI bar (averaging ~60–80 seconds, strictly &lt;120 seconds).
   - Information hierarchy prioritizes computed facts: 1-sentence bottom line, KPI bar, top 3 severity-ranked clusters, anomalies, and assigned action directives.
3. **Dining Integrity Constraint (Anti-Spam):**
   - One verified rating per `(studentHash, meal, date)`. Repeat submissions are blocked with clear cooldown explanations and tracked in the transparent blocked counter.

---

## Core AI Architecture

- **Model / Service:** **Hinglish-aware Lexical NLP with Hashed n-Gram Vectors (Pure-TypeScript, Zero API Keys / Zero WASM downloads)**. Optional MiniLM embeddings via transformers.js as an experimental upgrade.
- **Workflow:**
  1. **Hinglish Normalization:** Lowers case, strips punctuation, and appends an English gloss from a curated Hinglish glossary (`namak→salt`, `khatam→finished stockout`, `thanda→cold`, `chawal→rice`, `paani→watery`) without replacing original terms.
  2. **Sublinear n-Gram Vectorization:** Extracts character 3- to 5-grams and word unigrams, hashed into 512 buckets with sublinear term-frequency weighting (`1 + ln(tf)`) and L2 unit-norm normalization.
  3. **Multi-Label Pillar Scoring:** Computes cosine similarity against 6–10 prototype phrases per operational pillar (*taste, portion, hygiene, delay, stockout, positive*). Test Case 2 accurately triggers both *taste* (under-salted) and *stockout*.
  4. **Entity Extraction:** Extracts regex timestamps (`1:15 pm`, `after 8:30`), maps dishes from `DISH_LEXICON`, and detects language.
  5. **Single-Linkage Clustering:** Groups complaints by `(day, meal, pillar)` using cosine similarity, ranking clusters by severity score (`count × (6 − avgRating)/5 × weight`). Representative quotes are selected nearest the cluster centroid.
- **Error Handling &amp; Guardrails:**
  - **Zero Hallucination Guarantee:** No free-form LLM text generation is used in the core path; digests are synthesized from verified template rules and computed facts.
  - **Zero-Dependency Resilience:** No external cloud API keys, network endpoints, or large model downloads. The application runs 100% offline on any standard browser.

---

## Prerequisites & Installation

```bash
# 1. Clone repository
git clone https://github.com/vedantexists/zephyr-project.git
cd zephyr-project

# 2. Install dependencies
npm install

# 3. Environment variables
# NO API KEY REQUIRED! Everything runs 100% locally and offline out-of-the-box.

# 4. Run development server (runs on port 3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Testing

Run the automated test suite (24 unit tests across 5 files covering seed calibration, NLP classification, entity extraction, statistics, and digest word budget):

```bash
npm test
```

### Reproducing Day 2 Problem Test Cases:
Click the **Judge presets** buttons at the top of the interface:
- **Case #1 (Tuesday Dinner):**
  - Input: `"Dal was too watery and chapati was cold and hard after 8:30."` (Rating: 2/5)
  - Verified Output: Tagged `[Taste: Poor, Temp: Cold]`, clustered with 24 Tuesday dinner reports, dishes identified as Dal & Chapati, time extracted as `after 8:30`.
- **Case #2 (Wednesday Lunch Hinglish):**
  - Input: `"Chole me namak bilkul nahi tha aur chawal khatam ho gaye the 1:15 pm pe."` (Rating: 1/5)
  - Verified Output: Language detected as `Hinglish`, tags `[Taste: Under-salted, Quantity: Stockout at 1:15 pm]`, triggers kitchen refill protocol lapse alert.
- **Case #3 (Weekly 900-Meal Aggregate Digest):**
  - Input: 900 meal submissions weekly dataset.
  - Verified Output: Overall score computed at **3.4/5 (+0.3 WoW)**, primary bottleneck identified as Wednesday lunch stockouts (42 reports), peak satisfaction identified as Sunday Special Breakfast (**4.8/5**), and estimated read time computed under 80s (&lt;120s limit).

---

## Participant Info

- **Name:** Vedant
- **College ID:** 
- **Day:** Day 2 (30th September 2026)
- **Live URL (if deployed):** [Optional deployed link]
- **Demo Video (if recorded):** [Optional Google Drive link]
