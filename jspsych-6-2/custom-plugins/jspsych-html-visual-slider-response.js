/**
 * jspsych-html-slider-response
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['html-slider-response'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-slider-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: 0,
        description: 'Sets the minimum value of the slider.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: 100,
        description: 'Sets the maximum value of the slider',
      },
      start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Sets the starting value of the slider',
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: 1,
        description: 'Sets the step of the slider'
      },
      labels: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name:'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name:'Slider width',
        default: null,
        description: 'Width of the slider in pixels.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the slider before continuing.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the slider.'
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
        description: 'How long to show the trial.'
      },
       feedback: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Feedback',
        default: 0,
        description: 'Sets the feedback given.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
    }
  }




  plugin.trial = function(display_element, trial) {

    var html = '<div id="jspsych-html-slider-response-wrapper" style="margin: 100px 0px;">';
       // html += '<div id="jspsych-html-slider-response-phase" style="font-size: 12pt;"><b>' + trial.phase + '</b><br></div>';
        html += '<div id="jspsych-html-slider-response-cue" style="color: #1333AB; font-size: 20pt;">' + trial.stimulus + '</div>';
         if (trial.prompt !== null){
    html += '<div id="jspsych-html-slider-response-stimulus">' + trial.prompt + '</div>';
  }
          html +=   '<div id="jspsych-html-slider-response-monitor" style="color: #1333AB; font-size: 20pt;">' + '<p>' + trial.start + '%</p>' + '</div>';
    html += '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
    if(trial.slider_width !== null){
      html += 'width:'+trial.slider_width+'px;';
    }
    html += '">';
    html += '<input type="range" value="'+trial.start+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-html-slider-response-response"></input>';
    html += '<div>'
    for(var j=0; j < trial.labels.length; j++){
      var width = 100/(trial.labels.length-1);
      var left_offset = (j * (100 /(trial.labels.length - 1))) - (width/2);
      html += '<div style="display: inline-block; position: absolute; left:'+left_offset+'%; text-align: center; width: '+width+'%;">';
      html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[j]+'</span>';
      html += '</div>'
    }
    html += '</div>';
    html += '</div>';
    html += '<div id="jspsych-html-slider-response-feedback-prompt" style="color: #02C428; font-size: 20pt;">' + '<p>Actual Performance - ' + trial.feedback + '%</p>' + '</div>';
    html += '<input type="range" ng-class="{' + 'disabled-range' + ':isDisabled()}" value="'+trial.feedback+'" min="'+trial.min+'" max="'+trial.max+'" step="'+trial.step+'" style="width: 100%;" id="jspsych-html-slider-response-feedback"></input> ';
    html += '</div>';

  // add continue button to see feedback
  html += '<button id="jspsych-html-slider-response-continue" class="jspsych-btn" ' + '>'+'Continue'+'</button>';





    // add submit button
    html += '<button id="jspsych-html-slider-response-next" class="jspsych-btn" '+ (trial.require_movement ? "disabled" : "") + '>'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    var response = {
      rt: null,
      response: null
    };
    
display_element.querySelector('#jspsych-html-slider-response-response').addEventListener('input', function(){
        document.getElementById("jspsych-html-slider-response-monitor").innerHTML = '<p>' + document.getElementById("jspsych-html-slider-response-response").value + '%</p>';

      })


    if(trial.require_movement){
      display_element.querySelector('#jspsych-html-slider-response-response').addEventListener('change', function(){
        display_element.querySelector('#jspsych-html-slider-response-next').disabled = false;

      })
    }




// Hide feedback on test trials
  if(trial.feedback_on == false){
   var cont = document.getElementById("jspsych-html-slider-response-continue");
    var next = document.getElementById("jspsych-html-slider-response-next");
    cont.style.display = "none";
    next.style.display = "inline";

}






// Display Feedback

    display_element.querySelector('#jspsych-html-slider-response-continue').addEventListener('click', function() {
    var cont = document.getElementById("jspsych-html-slider-response-continue");
    var next = document.getElementById("jspsych-html-slider-response-next");
    var feedback = document.getElementById("jspsych-html-slider-response-feedback");
    var feedbackPrompt = document.getElementById("jspsych-html-slider-response-feedback-prompt");
    document.getElementById('jspsych-html-slider-response-response').id = 'disabled-range-response';
    document.getElementById('jspsych-html-slider-response-feedback').id = 'disabled-range-feedback';
    cont.style.display = "none";
    next.style.display = "inline";
    feedbackPrompt.style.display = "inline";
    feedback.style.display = "inline";
    document.getElementById("disabled-range-response").disabled = true;
    document.getElementById("disabled-range-feedback").disabled = true;

    });



display_element.querySelector('#jspsych-html-slider-response-continue').addEventListener('click', function() {
  // measure response time
      var endTimeInitial = performance.now();
      response.rtInitial = endTimeInitial - startTime;
 });



    display_element.querySelector('#jspsych-html-slider-response-next').addEventListener('click', function() {

      if (trial.feedback_on == false) {document.getElementById('jspsych-html-slider-response-response').id = 'disabled-range-response';}
      // measure response time
      var endTime = performance.now();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#disabled-range-response').value;
    
      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector('#jspsych-html-slider-response-next').disabled = true;
      }

    });





    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
       var trialdata = {
        "rt": response.rtInitial,
        "rtTotal": response.rt,
        "response": response.response,
        "stimulus": trial.stimulus,
        "feedback": trial.feedback,
        "Training": trial.feedback_on

      };


    

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }

    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-slider-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    var startTime = performance.now();
  };

  return plugin;
})();
