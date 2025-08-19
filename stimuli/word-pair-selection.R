library(MetaLab)
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# Pairs
pairs_unrelated <- sample_word_pairs(
  path             = "Florida Norms.xlsx",
  seed              = 999,          
  n_pairs          = 70,
  pair_type        = "unrelated",
  unrelated_cutoff = 0,    # strict zero-links in either direction
  min_char         = 3,    # optional length constraints
  max_char         = 8,
  max_iter         = 50000 # give the search plenty of room
)


# Remove bad words
pairs_unrelated <- pairs_unrelated[!grepl(" ", pairs_unrelated$cue, fixed = TRUE), ]
pairs_unrelated <- pairs_unrelated[!grepl(" ", pairs_unrelated$target, fixed = TRUE), ]

pairs_unrelated <- subset(pairs_unrelated, cue != "L.A." & target != "INQUIRER" & cue != "CHOOSIER" & cue != "HIROHITO" )






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

write.csv(pairs_unrelated, "selected_word_pairs.csv")
write_stimuli_js(pairs_unrelated, file = "stimuli.js") 
