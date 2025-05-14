
/* 
  ===============================================================
  =              GLOBAL SETTINGS & INITIALIZATION               =
  ===============================================================
*/

let trialnum = 1;           // Trial counter
let blocknum = 1;           // Block counter
let aborted = false;        // Tracks whether user was aborted from experiment
let in_fullscreen = false   // Tracks whether participant is in fullscreen (set to false to begin with)

// Initialize jsPsych
  const jsPsych = initJsPsych({
    on_interaction_data_update: function(data) {
    // If participant exits fullscreen, note it (unless it's a pilot).
      if (data.event === 'fullscreenexit' && pilot !== 'true') {
        in_fullscreen = false;
      }
    },
    on_finish: function(data) {

    // If user is forced to abort (wrong browser or device), show alert
      if (aborted === true) {
        alert("You must use Safari, Chrome or Firefox on a Desktop or Laptop to complete this experiment.");
      }


      if (aborted === false) {

      // If not aborted, first save total time and then check average accuracy from summary trials
        var start_time = jsPsych.getStartTime();
        jsPsych.data.addProperties({ start_time: start_time });
        var total_time = jsPsych.getTotalTime();
        jsPsych.data.addProperties({ total_time: total_time });


        // Turn on to save a local copy
        //jsPsych.data.get().localSave('csv','mydata.csv'); 

        const meanCorrect = jsPsych.data.get().filter({trial_type: "Test Trial"}).select('correct').mean();
        if (meanCorrect < accuracy_criterion) {
        // Failed check
          window.location = attention_redirect_link;
        } else {
        // Passed check
          window.location = redirect_link;
        }
      }
    }
  });




/* 
  ===============================================================
  =                 BROWSER & FULLSCREEN CHECKS                 =
  ===============================================================
*/

// Check that participant is using Chrome or Firefox on a desktop. Note that previously excluded Safari but it seems to be working
const browser_check = {
  timeline: [
    {
      type: jsPsychBrowserCheck,
      inclusion_function: (data) => {
        // Accept only if browser is Chrome, Safari, or Firefox and not on mobile
        return ['chrome', 'firefox', 'safari'].includes(data.browser) && data.mobile === false;
      },
      exclusion_message: (data) => {
        aborted = true;
        if (data.mobile) {
          return '<p>You must use a desktop/laptop computer to participate in this experiment.</p>';
        } else if (!['chrome','firefox', 'safari'].includes(data.browser)) {
          return '<p>You must use Chrome, Safari, or Firefox as your browser to complete this experiment.</p>';
        }
      }
    }
  ],
  conditional_function: function() {
    // Skip this check if pilot mode
    if (pilot === 'true') {
      return false;
    } 
    return true;
  }
};

// Request participant enter fullscreen
const enter_fullscreen = {
  timeline: [
    {
      type: jsPsychFullscreen,
      message: '<p>To take part in the experiment, your browser must be in fullscreen mode. Exiting fullscreen mode will pause the experiment.<br><br>Please click the button below to enable fullscreen and continue.</p>',
      fullscreen_mode: true,
      on_finish: function(){
        in_fullscreen = true;
      }
    }
  ],
  conditional_function: function() {
    // Skip if pilot
    if (pilot === 'true') {
      return false;
    } 
    return true;
  }
};




/* 
  ===============================================================
  =                    FINAL DEBRIEF & SAVE                     =
  ===============================================================
*/

// Optional debug question: Issues encountered?
const debug = {
  type: jsPsychSurveyText,
  questions: [
    {prompt: 'Did you experience any issues while completing this study?', rows: 5}
  ]
};

const data_saved = {
  type: jsPsychHtmlButtonResponse,
  stimulus: '<p>Data saved successfully. Press <strong>Continue</strong> to be redirected back to your recruitment platform.</p>',
  choices: ['Continue'],
  on_load: function(data){
    jsPsych.data.get().localSave('csv','mydata.csv'); 
  }
}


// Capture URL parameters (Prolific, SONA, pilot, etc.)
const PROLIFIC_PID = jsPsych.data.getURLVariable('PROLIFIC_PID');
const SONAID       = jsPsych.data.getURLVariable('SONAID');
const pilot        = jsPsych.data.getURLVariable('pilot');

// Decide how to redirect user depending on whether they're from SONA or Prolific
let redirect_link, attention_redirect_link;

if (typeof SONAID !== 'undefined') {
  // SONA
  jsPsych.data.addProperties({ participant_id: SONAID, Source: "SONA" });
  redirect_link = `https://sydneypsych.sona-systems.com/webstudy_credit.aspx?experiment_id=${sona_experiment_id}&credit_token=${sona_credit_token}&survey_code=${SONAID}&id=${SONAID}`;
  attention_redirect_link = `https://sydney.au1.qualtrics.com/jfe/form/SV_3h2qh8pBAnv00QK?SONAID=${SONAID}&accuracy=`;
} else {
  // Prolific
  jsPsych.data.addProperties({ participant_id: PROLIFIC_PID, Source: "Prolific" });
  redirect_link = `https://app.prolific.com/submissions/complete?cc=${Prolific_redirect}`;
  attention_redirect_link = `https://app.prolific.co/submissions/complete?cc=${Prolific_failed_check}`;
}

// Filename and location to save data
const subject_id = jsPsych.randomization.randomID(10);
const filename   = `participant-${subject_id}_data.csv`;

// We use jsPsychPipe to save to OSF (or another DataPipe-supported platform)
const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: DataPipe_ID,
  filename: filename,
  data_string: () => jsPsych.data.get().csv()
};

