
/* 
  ===============================================================
  =              TASK PARAMETERS              =
  ===============================================================
*/

let sliderVal = null;   // Tracks slider value
let phase = null;        // Tracks current phase: "Study" or "Test"
let study_time = 4000;
let tetris_time = 120000;
let require_quiz_response = false;

/* ---------- Lenient scoring helpers ---------- */
/*  Levenshtein distance (iterative, two‑row) */
function levenshtein(a, b) {
  if (a === b) return 0;
  const alen = a.length, blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  let v0 = new Array(blen + 1).fill(0);
  let v1 = new Array(blen + 1).fill(0);
  for (let i = 0; i <= blen; i++) v0[i] = i;
  for (let i = 0; i < alen; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < blen; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1,          // deletion
                           v0[j + 1] + 1,       // insertion
                           v0[j] + cost);       // substitution
    }
    [v0, v1] = [v1, v0];
  }
  return v0[blen];
}
/*  Detect simple transposition of two adjacent letters */
function isTransposition(a, b) {
  if (a.length !== b.length) return false;
  let diff = [];
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diff.push(i);
    if (diff.length > 2) return false;
  }
  return diff.length === 2 &&
         a[diff[0]] === b[diff[1]] &&
         a[diff[1]] === b[diff[0]];
}
/*  Lenient match: exact OR edit‑distance ≤1 OR simple transposition */
function isLenientMatch(resp, correct) {
  if (resp === correct) return true;
  if (levenshtein(resp, correct) <= 1) return true;
  return isTransposition(resp, correct);
}




/* 
  ===============================================================
  =              INSTRUCTIONS              =
  ===============================================================
*/


/* ---------- Instructions: Judging Relative Efficacy ---------- */
const efficacy_instructions = {
  type: jsPsychInstructions,   // use jsPsych.plugins['instructions'] if you prefer
  pages: [

    /* Page 1 – Why you are making this judgment */
    `
    <h2>Which study strategy worked better <em>for you</em>?</h2>
    <p>You have just finished learning a list of <strong>word-pairs</strong>.</p>
    <p style="max-width:60ch; margin:0 auto; text-align:left;">
      &bull; For <strong>some</strong> of the pairs you simply <strong>re-read</strong> them.<br>
      &bull; For the others you <strong>quizzed yourself</strong> by trying to recall the target word.
    </p>
    <p>On the next screen you will see a slider labelled from &ldquo;Re-reading more effective&rdquo; (left) to &ldquo;Quizzing more effective&rdquo; (right).</p>
    `,

    /* Page 2 – How to use the slider */
    `
    <h2>Using the slider</h2>
    <p style="max-width:60ch; margin:0 auto; text-align:left;">
      &bull; If you feel <strong>re-reading</strong> helped you remember the pairs <em>much more</em> than quizzing, drag the slider far to the left.<br><br>
      &bull; If you feel <strong>quizzing</strong> helped <em>much more</em> than re-reading, drag it far to the right.<br><br>
      &bull; If you think they&#39;re <strong>about equally effective</strong>, place the slider in the middle at &ldquo;No difference.&rdquo;<br><br>
      &bull; The farther you move the slider from the centre, the <em>bigger</em> the difference you are reporting.
    </p>
    `,

    /* Page 3 – Practical tips & reminder */
    `
    <h2>Before you continue</h2>
    <p style="max-width:60ch; margin:0 auto; text-align:left;">
      &bull; Use your mouse or trackpad to move the slider.<br>
      &bull; Base your judgment purely on how well <em>you personally</em> remembered the word-pairs during the learning phase.<br>
      &bull; There are no right or wrong answers &ndash; we&#39;re interested in your honest opinion.
    </p>
    <p>When you&#39;re ready, click &ldquo;Next&rdquo; to record your judgment.</p>
    `
  ],
  show_clickable_nav: true,
  button_label_next: "Next",
  button_label_previous: "Back"
};



/* 
  ===============================================================
  =             TETRIS              =
  ===============================================================
*/


// preload and timeline setup …
const tetris_trial = {
  timeline: [

{
  type: jsPsychInstructions,
  pages: [
    "<p><strong>Tetris time!</strong> Use &larr; &rarr; to move, &uarr; to rotate, &darr; to soft-drop, space to hard-drop. Press P to pause.</p>",
    "<p>Clear rows to score points. Game ends when blocks reach the top.</p>"
  ],
  show_clickable_nav: true
},

{
  type: TetrisPlugin,   
  total_duration_ms: tetris_time,  
  grid_cols: 10,
  grid_rows: 20,
  cell_px: 28,
  drop_interval: 600
}
  ]

}


/* 
  ===============================================================
  =             CONDITIONAL PRESENTATION              =
  ===============================================================
*/


/* ---------- Condition‑dependent stimulus builder ---------- */
// Will be filled once the `condition` value arrives from jsPsychPipe
let presentation = [];
let stimuli      = [];

function initStimuli(cond){
  let pres;
  if (cond === 0){
    pres = jsPsych.randomization.repeat(["Read","Quiz"], [28,12]);
  } else if (cond === 1){
    pres = jsPsych.randomization.repeat(["Read","Quiz"], [12,28]);
  } else {
    pres = jsPsych.randomization.repeat(["Read","Quiz"], [20,20]);
  }

  presentation.length = 0;
  presentation.push(...pres);

  stimuli.length = 0;
  pres.forEach((p,i)=>{
    stimuli.push({
      cue:    cue[i],
      target: target[i],
      presentation: p
    });
  });
  console.log("Stimuli initialised for condition", cond);
}

// Expose to index.html
window.initStimuli = initStimuli;




// -------------------
// Study Phase
// -------------------
    var study_trial = {
      data: function(){
        return {trialnum: trialnum, blocknum: blocknum, phase: phase}
      },
      timeline: [


          {type: jsPsychHtmlKeyboardResponse,
          stimulus: function() {
            var stim = jsPsych.evaluateTimelineVariable('cue') + ' - ' + jsPsych.evaluateTimelineVariable('target');
            return `<p style = "color: gray;">Read</p><p style = "font-size: 28pt;"><strong>${stim}</strong></p>`;
          },
          choices: "NO_KEYS",
          trial_duration: study_time,
          on_finish: function(data){
            data.trial_type = "Read";
          }
        },

// Summary trial
        {
          type: jsPsychCallFunction,
          func: function(){

          },
          on_finish: function(data){
            data.trial_type = "Study Trial";


          // Data
            data.cue = jsPsych.evaluateTimelineVariable('cue');
            data.correct_target = jsPsych.evaluateTimelineVariable('target');


         

          trialnum++;  // Increment the trial number.
        }
      }

    ]}

    var study_procedure = {
      timeline: [study_trial],
      timeline_variables: stimuli,
      randomize_order: true,
      on_timeline_start: function() {
        phase = "Study";
      }
    };





// -------------------
// Re-study Phase
// -------------------
    var re_study_trial = {
      data: function(){
        return {trialnum: trialnum, blocknum: blocknum, phase: phase}
      },
      timeline: [


// Quiz
        {timeline: [
          {
            type: jsPsychSurveyText,
            questions: function(){
              return(

                [
                  {
                    prompt: `<p style = "color: gray;">Quiz</p><p style = "font-size: 28pt;"><strong>${jsPsych.evaluateTimelineVariable('cue')}</strong> : ?</p>`,
                    name: 'response',
                    required: require_quiz_response,
                    columns: 20
                  }
                ]
              )}
              ,
              on_finish: function(data){
                data.trial_type = "Quiz";
                // Correct cue assignment for Quiz phase
                data.cue = jsPsych.evaluateTimelineVariable('cue');
                data.correct_target = jsPsych.evaluateTimelineVariable('target');
                
                // SurveyText returns an object; extract the string before trimming
                const rawResp = (data.response && data.response.response) ? data.response.response : "";
                data.response = rawResp.trim().toLowerCase();
                const resp = data.response;
                const corr = data.correct_target;
                data.strict_correct  = resp === corr;
                data.lenient_correct = isLenientMatch(resp, corr);
                data.correct = data.strict_correct;   // maintains existing field
              }
            }

          ],
          conditional_function: function(){
            if(jsPsych.evaluateTimelineVariable('presentation') === "Quiz"){
              return true;
            } else {
              return false;
            }
          }
        },




// Re-read
        {
          timeline: [
          {type: jsPsychHtmlKeyboardResponse,
          stimulus: function() {
            var stim = jsPsych.evaluateTimelineVariable('cue') + ' - ' + jsPsych.evaluateTimelineVariable('target');
            return `<p style = "color: gray;">Re-read</p><p style = "font-size: 28pt;"><strong>${stim}</strong></p>`;
          },
          choices: "NO_KEYS",
          trial_duration: study_time,
          on_finish: function(data){
            data.trial_type = "Read";
          }
        }
      ],
       conditional_function: function(){
            if(jsPsych.evaluateTimelineVariable('presentation') === "Quiz"){
              return false;
            } else {
              return true;
            }
          }
    },

// Summary trial
        {
          type: jsPsychCallFunction,
          func: function(){

          },
          on_finish: function(data){
            data.trial_type = "Re-Study Trial";


          // Data
            data.cue = jsPsych.evaluateTimelineVariable('cue');
            data.correct_target = jsPsych.evaluateTimelineVariable('target');
            data.presentation =  jsPsych.evaluateTimelineVariable('presentation');

          // Extra data if a quiz trial
            if(jsPsych.evaluateTimelineVariable('presentation') === "Quiz"){
              const lastResp = jsPsych.data.get().filter({trial_type: "Quiz"}).last(1).values()[0];
              data.rt         = lastResp.rt;
              data.response   = lastResp.response;
              data.correct    = lastResp.correct;
            }

          trialnum++;  // Increment the trial number.
        }
      }

    ]}

    var re_study_procedure = {
      timeline: [re_study_trial],
      timeline_variables: stimuli,
      randomize_order: true,
      on_timeline_start: function() {
        phase = "Re-Study";
      }
    };

// -------------------
// Test Phase
// -------------------
    var test_trial = {
      type: jsPsychSurveyText,
      questions: function(){
        return(

          [
            {
              prompt: `What word was paired with: <strong>${jsPsych.evaluateTimelineVariable('cue')}</strong>?`,
              name: 'response',
              required: true
            }
          ]

          )
      }
      ,
      data: {
        trialnum: trialnum,
        blocknum: blocknum,
        phase: phase,
        trial_type: "Test Trial",
        cue: jsPsych.evaluateTimelineVariable('cue'),
        correct_target: jsPsych.evaluateTimelineVariable('target'),
        presentation: jsPsych.evaluateTimelineVariable('presentation')
      },
      on_finish: function(data) {
        

         data.cue = jsPsych.evaluateTimelineVariable('cue');
                data.correct_target = jsPsych.evaluateTimelineVariable('target');
                
                // SurveyText returns an object; extract the string before trimming
                const rawResp = (data.response && data.response.response) ? data.response.response : "";
                data.response = rawResp.trim().toLowerCase();
                const resp = data.response;
                const corr = data.correct_target;
                data.strict_correct  = resp === corr;
                data.lenient_correct = isLenientMatch(resp, corr);
                data.correct = data.strict_correct;   // maintains existing field


        trialnum++;  // Increment the trial number.
      }
    };

    var test_procedure = {
      timeline: [test_trial],
      timeline_variables: stimuli,
      on_timeline_start: function() {
        phase = "Test";
      }
    };



/* 
  ===============================================================
  =              EFFICACY RATING              =
  ===============================================================
*/



    // Custom stimulus HTML with instructions
    const sliderHTML = `
      <div class="custom-slider-container">
        <div class="roof">
          <div class="triangle left"  id="tri-left"></div>
          <div class="triangle right" id="tri-right"></div>
        </div>
        <input type="range" id="my-slider" min="0" max="100" value="50" step="1" />
        <div class="custom-slider-labels"><span>Re-reading more effective</span><span>No Difference</span><span>Quizzing more effective</span></div>
      </div>
      <p class="prompt-below">Was quizzing or re-reading more effective?</p>`;

      const eff_rating = {
        type: jsPsychHtmlButtonResponse,
        stimulus: sliderHTML,
        choices: ['Submit'],
        css_classes: ["eff_rating"],
        button_html: function(choice){
          return `<button class="jspsych-btn" id="submit-btn" disabled>${choice}</button>`;
        },
        on_load: () => {
          const slider   = document.getElementById('my-slider');
          const triLeft  = document.getElementById('tri-left');
          const triRight = document.getElementById('tri-right');
          const submitBtn = document.getElementById('submit-btn');
          let moved = false;
          const blue = 'rgba(66,133,244,0.9)';

          slider.addEventListener('input', () => { sliderVal = slider.value; });

         // Now reveal the thumb when the slider is used
          const wrapper = document.querySelector('.eff_rating');
          wrapper.addEventListener('pointerdown', function handleFirstClick() {
            wrapper.style.setProperty('--thumb-visibility', 'visible');
            wrapper.removeEventListener('pointerdown', handleFirstClick);
          });


          function updateFill(){
            const v = Number(slider.value);
            const pctLeft  = Math.max(0, (50 - v) / 50);
            const pctRight = Math.max(0, (v - 50) / 50);
            if(pctLeft>0){
              const p = pctLeft*100;
              triLeft.style.backgroundImage = `linear-gradient(to left, ${blue} 0%, ${blue} ${p}%, #ddd ${p}%, #ddd 100%)`;
            } else { triLeft.style.backgroundImage = 'none'; triLeft.style.background = '#ddd'; }
            if(pctRight>0){
              const p = pctRight*100;
              triRight.style.backgroundImage = `linear-gradient(to right, ${blue} 0%, ${blue} ${p}%, #ddd ${p}%, #ddd 100%)`;
            } else { triRight.style.backgroundImage = 'none'; triRight.style.background = '#ddd'; }
          }
          updateFill();
          slider.addEventListener('input', ()=>{
            updateFill();
            if(!moved){ submitBtn.removeAttribute('disabled'); moved=true; }
          });
        },
        on_finish: data => {
          data.slider_value = sliderVal;
          jsPsych.data.addProperties({efficacy: data.slider_value});
        }
      };






// -------------------
// Timeline
// -------------------
      var word_pairs = [
        {
          type: jsPsychInstructions,
          pages: [`<div style="max-width: 800px; text-align: left; margin: auto; font-size: 18px;">
      <h2>Paired Associates Learning Task</h2>
      <p>In this task, you will be shown <strong>a series of word pairs</strong>. Each pair consists of two words that are associated with each other. For example, you might see something like:</p>
      <p style="text-align: center;"><strong>apple : fruit</strong></p>

      <p>Try to <strong>remember each pair as a unit</strong>. These word pairs will only be presented briefly, so please pay close attention.</p></div>
          `,
          `<h3>Study Phase</h3>
      <p>You will first complete a <strong>study phase</strong>, where you will see one pair at a time on the screen. Each pair will appear for about <strong>4 seconds</strong>. Your job is to remember which words were shown together.</p>

      <hr>

          <h3>Restudy Phase</h3>
      <p>After the study phase, you will move on to the <strong>restudy phase</strong>. In this phase, you will have a chance to re-study the pairs. Some of the pairs will be presented in full, while some will instead allow you to quiz your learning by presenting just the <strong>first word (the cue)</strong> and you will have to try and recall the <strong>second word (the target) in the pair</strong>. Just take your best guess if you do not remember the pair, your accuracy is not evalauted in this stage.</p>
      
      <hr> 
              <h3>Intermission Phase</h3>
      <p>After the restudy phase, you will have a brief intermission where you will play a game of Tetris</p>
      
      <hr> 
      <h3>Test Phase</h3>
      <p>After the intermission phase, you will move on to the <strong>test phase</strong>. In this phase, you will see only the <strong>first word (the cue)</strong> from each pair, and you will be asked to type the <strong>second word (the target)</strong> that was originally paired with it.</p>
      
      <p style="text-align: center;">For example:</p>
      <p style="text-align: center;"><em>What word was paired with: <strong>apple</strong>?</em></p>
      <p>You would then type: <strong>fruit</strong> and click Continue when you are ready to begin.</p>
`
        ],
         show_clickable_nav: true
        },
        {
          type: jsPsychInstructions,
          pages: [`<div style="max-width: 800px; text-align: center; margin: auto; font-size: 18px;">
            <h2>Study Phase</h2>`
        ],
         show_clickable_nav: true
        },
        study_procedure,
        {
          type: jsPsychInstructions,
          pages: [`<div style="max-width: 800px; text-align: center; margin: auto; font-size: 18px;">
            <h2>Re-study Phase</h2><p>You will see some pairs again in full, while the others you will see only the first word and should guess its pair.</p>`
        ],
         show_clickable_nav: true
        },
        re_study_procedure,
        efficacy_instructions,
        eff_rating,
        tetris_trial,
        {
          type: jsPsychInstructions,
          pages: [`<div style="max-width: 800px; text-align: center; margin: auto; font-size: 18px;">
            <h2>Test Phase</h2>
          <p>You will now be tested. Type the word that was paired with the word shown.</p><p>Press any key to begin.</p>`
        ],
         show_clickable_nav: true
        },
        test_procedure
      ];


