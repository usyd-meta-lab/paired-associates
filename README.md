# Paired Associates Task – Cue Density and Metacognition

This repository contains a fully implemented jsPsych experiment designed to investigate how cue density affects metacognitive judgments. The experiment includes study, restudy (quiz vs re-read), intermission (Tetris), test, and efficacy judgment phases.

---

## 📋 Overview

Participants learn pairs of cue-target words, experience a restudy phase (with variable quiz/re-read ratios), engage in a Tetris distractor task, and are tested on recall. At the end, of re-study they judge the relative efficacy of quizzing vs re-reading.

### Key Features

- **Condition manipulation** via DataPipe to alter the ratio of quizzing to rereading
- **Lenient response scoring** using Levenshtein edit distance and transposition detection
- **Slider-based efficacy rating**
- **Tetris game intermission** to reduce recency effects
- **Hosted info sheet injection**
- **Compatible with Prolific, SONA, and DataPipe**

---

## 🧪 Experimental Flow

1. **Pre-task setup**  
   - Browser compatibility check  
   - Fullscreen enforcement  
   - Consent & demographic info (via injected info_sheets.js)

2. **Study Phase**  
   - 40 cue-target pairs shown for 4 seconds each

3. **Restudy Phase**  
   - Pairs randomly assigned to either:
     - **Re-read**: Full pair shown again
     - **Quiz**: Only cue shown; participant types target

4. **Efficacy Judgment**  
   - Slider: “Which was more effective re-reading or quizzing?”

5. **Tetris Intermission**  
   - Custom jsPsych Tetris plugin
   - 2-minute gameplay

6. **Test Phase**  
   - Participants recall the target when shown the cue
   - Responses scored both strictly and leniently

---

## 🧰 File Structure

```bash
.
├── index.html              # Main experiment launcher
├── assets/
│   ├── js/
│   │   ├── global.js       # Shared parameters or functions
│   │   ├── stimuli.js      # Word-pair list (cue, target)
│   │   ├── tetris.js       # Tetris plugin and settings
│   │   ├── experiment.js   # Main experimental logic
│   │   ├── survey.js       # Optional post-task survey logic
│   └── css/
│       └── custom-css.css  # Styles for sliders, instructions, etc.