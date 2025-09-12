# Paired Associates Task

This repository contains a web-based **paired associates learning task** built with [jsPsych](https://www.jspsych.org/).  
The task presents participants with cue–target word pairs to study, includes optional judgments of learning,  
and then tests memory for the pairs after a distractor task.

## Overview of the Task

1. **Study Phase**  
   - Participants view a series of word pairs (e.g., `apple – fruit`).  
   - Each pair is displayed for 8 seconds.  
   - In some conditions, participants also provide a **judgment of learning (JOL)** by rating how likely they are to remember the pair later.

2. **Intermission (Distractor Task)**  
   - After studying, participants complete a short **Tetris game** (~2 minutes).  
   - This prevents rehearsal and creates a delay before testing.

3. **Test Phase**  
   - Participants are shown the **cue word** (e.g., `apple`) and asked to recall the **target word** (`fruit`).  
   - Responses are marked as correct if they exactly match or are close under a lenient matching algorithm (edit distance ≤ 1 or transposition).

## Key Features

- Built with **jsPsych 8.2.1** and standard plugins.  
- Runs in fullscreen with browser compatibility checks.  
- **Lenient scoring** of recall responses (handles typos and letter swaps using Levenshtein edit distance and transposition detection).  
- Randomized order of word pairs across participants.  
- Optional **JOL phase** can be toggled via experimental condition.  
- Data is stored via [DataPipe](https://datapipe.org).  

## File Structure
```bash
- `index.html` — experiment entry point, loads dependencies and defines the timeline.  
- `experiment.js` — main experiment code (study, JOL, Tetris, test, instructions).  
- `stimuli.js` — lists of cue–target word pairs.  
- `survey.js` — optional file to
add survey questions.  
- `word-pair-selection.R` — helper script for generating stimuli sets.  
- `README.md` — current file.  
```

## Generating New Stimuli

To generate new word-pair lists for the experiment:

1. Open the `word-pair-selection.R` script in R.  
2. Run the script to sample or construct new **cue–target pairs** from your chosen word pool.  
3. Export the generated stimuli to a format compatible with `stimuli.js` (arrays of `cue` and `target`).  
4. Replace the contents of `stimuli.js` with the new pairs to update the task.  

This allows you to easily create multiple versions of the experiment or adapt it for different research questions.


## Running the Experiment

1. Open `index.html` in a browser or host on a web server (e.g., GitHub Pages).  
2. The experiment will load automatically and save data to the configured **DataPipe ID**.  
3. Adjust study duration, distractor duration, and conditions in `experiment.js`.  
