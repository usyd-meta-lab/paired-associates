var jsPsychTetris = (function (jspsych) {
  'use strict';

  const info = {
      name: "line-learning",
      parameters: {
          /** The HTML string to be displayed */
          stimulus: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Stimulus",
              default: 'Hi',
          },
          /** Array containing the label(s) for the button(s). */
          choices: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Choices",
              default: undefined,
              array: true,
          },
          /** The HTML for creating button. Can create own style. Use the "%choice%" string to indicate where the label from the choices parameter should be inserted. */
          button_html: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Button HTML",
              default: '<button class="jspsych-btn">%choice%</button>',
              array: true,
          },
          /** Any content here will be displayed under the button(s). */
          prompt: {
              type: jspsych.ParameterType.HTML_STRING,
              pretty_name: "Prompt",
              default: null,
          },
          /** How long to show the stimulus. */
          stimulus_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Stimulus duration",
              default: null,
          },
          /** How long to show the trial. */
          trial_duration: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Trial duration",
              default: null,
          },
          /** The vertical margin of the button. */
          margin_vertical: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin vertical",
              default: "0px",
          },
          /** The border around the grid. */
          border_colour: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Border colour",
              default: "transparent",
          },
            /** The size of the squares */
          square_size: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Square size",
              default: 30,
          },
               /** Category membership, should include  */
          category: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "The category memebership of the current trial",
              default: null,
          },
                /** Colours  */
          colours: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "The colours used for the stimuli",
              default: ["red", "green", "blue", "yellow"],
              array: true
          },
                /** The probabilities of a red, green, blue, and yellow square respectively */
          colour_prob: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Colour Probabilities",
              default: [35,35,15,15],
              array: true
          },
          empirical_col_probs:{
             type: jspsych.ParameterType.BOOL,
              pretty_name: "Should the colour probabilities be sampled from a distribution?",
              default: true
            },
          /** The plength of the three lines as an array from left to right */
          line_lengths: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Length of the three lines from left to right",
              default: null,
              array: true
          },
              monotonic_pallette: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Draw from the blue or red pallete on the monotonic label category?",
              default: null,
              array: false
          },
            /** The vertical spacing between the squares */
              square_closeness: {
              type: jspsych.ParameterType.INT,
              pretty_name: "Vertical spacing between rows",
              default: 3
          },
          /** Set a border around the grid */
           grid_border: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Adds a border around the grid",
              default: "solid black"
           },
          /** The horizontal margin of the button. */
          margin_horizontal: {
              type: jspsych.ParameterType.STRING,
              pretty_name: "Margin horizontal",
              default: "8px",
          },
          /** If true, then trial will end when user responds. */
          response_ends_trial: {
              type: jspsych.ParameterType.BOOL,
              pretty_name: "Response ends trial",
              default: true,
          },
      },
  };

  class TetrisPlugin {
      constructor(jsPsych) {
          this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {


//


















          // store response
          var response = {
              rt: null,
              button: null,
          };
          // function to end trial when it is time
          const end_trial = () => {
              // kill any remaining setTimeout handlers
              this.jsPsych.pluginAPI.clearAllTimeouts();

              // Score the trial
              trial.accuracy = 0;
              if((trial.choices[response.button] == trial.monotonic_label | trial.choices[response.button] == trial.conf_monotonic_label) & trial.category == "Mono"){trial.accuracy = 1}
              if(trial.choices[response.button] != trial.monotonic_label & trial.choices[response.button] != trial.conf_monotonic_label & trial.category != "Mono"){trial.accuracy = 1}

             

              if(response.button == null){trial.accuracy = 0};
              
              // gather the data to store for the trial
              var trial_data = {
                  rt: response.rt,
                  stimulus: "tetris"
              };
              // clear the display
              display_element.innerHTML = "";
              // move on to the next trial
              this.jsPsych.finishTrial(trial_data);
          };
          // function to handle responses by the subject
          function after_response(choice) {
              // measure rt
              var end_time = performance.now();
              var rt = Math.round(end_time - start_time);
              response.button = parseInt(choice);
              response.rt = rt;
              // after a valid response, the stimulus will have the CSS class 'responded'
              // which can be used to provide visual feedback that a response was recorded
              display_element.querySelector("#jspsych-html-button-response-stimulus").className +=
                  " responded";
              // disable all the buttons after a response
              var btns = document.querySelectorAll(".jspsych-html-button-response-button button");
              for (var i = 0; i < btns.length; i++) {
                  //btns[i].removeEventListener('click');
                  btns[i].setAttribute("disabled", "disabled");
              }
              if (trial.response_ends_trial) {
                  end_trial();
              }
          }
          // hide image if timing is set
          if (trial.stimulus_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(() => {
                  display_element.querySelector("#jspsych-html-button-response-stimulus").style.visibility = "hidden";
              }, trial.stimulus_duration);
          }
          // end trial if time limit is set
          if (trial.trial_duration !== null) {
              this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
          }
      }
      simulate(trial, simulation_mode, simulation_options, load_callback) {
          if (simulation_mode == "data-only") {
              load_callback();
              this.simulate_data_only(trial, simulation_options);
          }
          if (simulation_mode == "visual") {
              this.simulate_visual(trial, simulation_options, load_callback);
          }
      }
      create_simulation_data(trial, simulation_options) {
          const default_data = {
              stimulus: trial.stimulus,
              rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
              response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1),
          };
          const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
          this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
          return data;
      }
      simulate_data_only(trial, simulation_options) {
          const data = this.create_simulation_data(trial, simulation_options);
          this.jsPsych.finishTrial(data);
      }
      simulate_visual(trial, simulation_options, load_callback) {
          const data = this.create_simulation_data(trial, simulation_options);
          const display_element = this.jsPsych.getDisplayElement();
          this.trial(display_element, trial);
          load_callback();
          if (data.rt !== null) {
              this.jsPsych.pluginAPI.clickTarget(display_element.querySelector(`div[data-choice="${data.response}"] button`), data.rt);
          }
      }
  }
  TetrisPlugin.info = info;

  return TetrisPlugin;

})(jsPsychModule);