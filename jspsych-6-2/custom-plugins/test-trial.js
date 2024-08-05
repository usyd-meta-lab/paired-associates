/**
 * jspsych-test-trial
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/



jsPsych.plugins["test-trial"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'test-trial',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: "<font size = '20pt'>:</font>",
        description: 'The HTML string to be displayed'
      },
      cue: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Cue',
        default: null,
        description: 'The cue word'
      },
      answer: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Answer',
        default: null,
        description: 'The target word'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },

    }
  }

  plugin.trial = function(display_element, trial) {

    var new_html = "<div id = 'stimuli'>";
    new_html += '<div id="jspsych-test-trial-cue">' + "<font size = '6pt'>"+trial.cue+"</font>" +' </div>';
	 new_html += '<div id="jspsych-test-trial-stimulus"><font size = "6"'+trial.stimulus+'</font></div>';
     new_html += '<div id="jspsych-test-trial-target"><font size = "6pt">'+"????"+'</font></div>';
      new_html += '</div>';
      new_html += '<form id="jspsych-test-form">';
      new_html += '<input  type = "text" id="jspsych-test-trial-response"></input>';
    new_html += '<br><br>'
    // add submit button
    new_html += '<input type="submit" id="submit-button" class = "jspsych-btn" value = "Next" height = "20"></input>';
    new_html += '</form>';



    // add prompt
    if(trial.prompt !== null){
      new_html += trial.prompt;
    }

    // draw
    display_element.innerHTML = new_html;



// end trial if trial_duration is set
  //  if (trial.trial_duration !== null) {
    //  jsPsych.pluginAPI.setTimeout(function() {
      //  end_trial();
      //}, trial.trial_duration);
    //}





var end_trial = function(){


      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;
    

  
  

      // save data
      var trial_data = {
        "rt": response_time,
        "response": document.getElementById('jspsych-test-trial-response').value,
        "correctAnswer": trial.answer
      };
      display_element.innerHTML = '';

      console.log(trial_data);

      // next trial
      jsPsych.finishTrial(trial_data);

}





   document.querySelector('form').addEventListener('submit', function(event) {
      event.preventDefault();
      // measure response time
      var endTime = performance.now();
      var response_time = endTime - startTime;
    

  
  

      // save data
      var trial_data = {
        "rt": response_time,
        "response": document.getElementById('jspsych-test-trial-response').value,
        "correctAnswer": trial.answer
      };
      display_element.innerHTML = '';

      console.log(trial_data);

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = performance.now();
  };



  return plugin;
})();


