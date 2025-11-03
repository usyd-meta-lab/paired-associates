# If reading the Florida norms Excel file:
# install.packages(c("readxl","dplyr"))
library(readxl)

# Example: adjust the sheet / column names if yours differ
florida <- read_xlsx("~/Downloads/paired-associates-main/stimuli/Florida Norms.xlsx")  # or the path you have

# Suppose your columns are named "CUE", "TARGET", and "FSG":
sample <- select_cue_target_sample(
  df = florida,
  n = 40,
  target_mean_fsg = 0.1,
  cue_min_chars = 3, cue_max_chars = 8,
  target_min_chars = 3, target_max_chars = 8,
  attempts = 8000,
  seed = 42
)
attr(sample, "achieved_mean_fsg")
# sample




# Save

write_stimuli_js <- function(pairs_tbl,
                             file    = "stimuli.js",
                             cue_var = "cue",
                             tgt_var = "target",
                             lowercase = TRUE) {
  stopifnot(is.data.frame(pairs_tbl),
            all(c("cue", "target") %in% names(pairs_tbl)))
  cues    <- pairs_tbl$cue
  targets <- pairs_tbl$target
  
  # Coerce to character and (optionally) lower-case
  cues    <- as.character(cues)
  targets <- as.character(targets)
  if (lowercase) {
    cues    <- tolower(cues)
    targets <- tolower(targets)
  }
  
  # Minimal JS string escaping
  esc <- function(x) {
    x <- gsub("\\\\", "\\\\\\\\", x, perl = TRUE)  # backslashes
    x <- gsub("\"", "\\\\\"", x,  perl = TRUE)     # double quotes
    x
  }
  cues_q    <- sprintf('"%s"', esc(cues))
  targets_q <- sprintf('"%s"', esc(targets))
  
  js_lines <- c(
    sprintf("var %s = [%s];", cue_var, paste(cues_q,    collapse = ", ")),
    sprintf("var %s = [%s];", tgt_var, paste(targets_q, collapse = ", "))
  )
  writeLines(js_lines, file, useBytes = TRUE)
  invisible(file)
}

write.csv(sample, "~/Desktop/selected_word_pairs.csv")
write_stimuli_js(pairs_unrelated, file = "~/Desktop/stimuli.js") 
