# -----------------------------------------------------------
#  Word‑pair sampler for the Florida Free Association Norms
# -----------------------------------------------------------
#  Requirements:  tidyverse, readxl, janitor
#  Install if needed:
#  install.packages(c("tidyverse", "readxl", "janitor"))

library(tidyverse)
library(readxl)
library(janitor)
setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

# ---------- helper -----------------------------------------------------------
is_isolated <- function(pair_set, all_assoc, fas_cut = .05, bsg_cut = .05) {
  ## 1.  Check that no cue is strongly linked to any *other* target in pair_set
  cross_ct <- pair_set %>%
    select(cue, target) %>%
    mutate(dummy = 1) %>%
    inner_join(rename(., cue2 = cue, target2 = target), by = "dummy") %>%  # cartesian
    filter(cue != cue2 | target != target2) %>%                             # exclude own row
    select(cue, target_other = target2) %>%
    left_join(all_assoc, by = c("cue", "target_other" = "target")) %>%
    filter(!is.na(fsg) & fsg > fas_cut)
  
  ## 2.  Check that no target is strongly linked *backward* to any other cue
  cross_tc <- pair_set %>%
    select(cue, target) %>%
    mutate(dummy = 1) %>%
    inner_join(rename(., cue2 = cue, target2 = target), by = "dummy") %>%  # cartesian
    filter(cue != cue2 | target != target2) %>%
    select(cue_other = cue2, target) %>%
    left_join(all_assoc, by = c("cue_other" = "cue", "target")) %>%
    filter(!is.na(bsg) & bsg > bsg_cut)
  
  nrow(cross_ct) == 0 && nrow(cross_tc) == 0
}

# ---------- main sampler -----------------------------------------------------
sample_word_pairs <- function(path              = "Florida Norms.xlsx",
                              n_pairs           = 40,
                              desired_mean      = 0.47,
                              desired_sd        = 0.14,
                              tol_mean          = 0.02,
                              tol_sd            = 0.03,
                              fas_range         = c(.30, .75),
                              fas_unique_cutoff = .05,
                              bsg_unique_cutoff = .05,
                              max_iter          = 20000,
                              seed              = 123) {
  
  set.seed(seed)
  
  # 1. ── Load & tidy ─────────────────────────────────────────────────────────
  df <- read_excel(path) %>% clean_names()
  
  df <- df %>% 
    mutate(across(c(fsg, bsg), as.numeric)) %>% 
    rename(cue    = cue,
           target = target)
  
  # 2. ── Pool of eligible pairs ──────────────────────────────────────────────
  pool <- df %>% 
    filter(!is.na(fsg),
           fsg >= fas_range[1], fsg <= fas_range[2]) %>% 
    select(cue, target, fsg, bsg)
  
  if (nrow(pool) < n_pairs) 
    stop("Not enough candidate pairs in the requested FAS range.")
  
  # Keep the full association table for cross‑talk tests
  assoc_tbl <- df %>% select(cue, target, fsg, bsg)
  
  # 3. ── Stochastic search ───────────────────────────────────────────────────
  for (i in seq_len(max_iter)) {
    cand <- pool %>% slice_sample(n = n_pairs)
    
    # (a) uniqueness of words
    if (anyDuplicated(c(cand$cue, cand$target))) next
    
    # (b) cross‑talk constraints
    if (!is_isolated(cand, assoc_tbl, fas_unique_cutoff, bsg_unique_cutoff)) next
    
    # (c) distributional constraints
    m  <- mean(cand$fsg)
    sd <- sd(cand$fsg)
    if (abs(m - desired_mean) > tol_mean) next
    if (abs(sd - desired_sd) > tol_sd)   next
    
    # SUCCESS  →  return candidate set
    cand <- cand %>% arrange(desc(fsg))
    attr(cand, "mean_fas") <- m
    attr(cand, "sd_fas")   <- sd
    attr(cand, "iter")     <- i
    return(cand)
  }
  stop("No set found in ", max_iter, " iterations. Relax the tolerances?")
}

# ---------- example run ------------------------------------------------------
pairs <- sample_word_pairs(
  path         = "Florida Norms.xlsx",
  n_pairs      = 40,        # change as needed
  desired_mean = 0.47,
  desired_sd   = 0.14
)

print(pairs, n = Inf)
cat("\nMean FAS  :", attr(pairs, "mean_fas"),
    "\nSD FAS    :", attr(pairs, "sd_fas"),
    "\nIterations:", attr(pairs, "iter"), "\n")

# Optionally save:
write_csv(pairs, "selected_word_pairs.csv")



# ------------------------------------------------------------------
#  Helper: write selected word‑pairs to a .js file for jsPsych
# ------------------------------------------------------------------
#  Arguments
#    pairs_tbl  – tibble returned by sample_word_pairs()
#    file       – path to the .js file you want (default: "word_pairs.js")
#    cue_var    – variable name to use for the cue list   (default: "cue")
#    tgt_var    – variable name to use for the target list (default: "target")
# ------------------------------------------------------------------

write_js_word_lists <- function(pairs_tbl,
                                file     = "word_pairs.js",
                                cue_var  = "cue",
                                tgt_var  = "target") {
  
  if (!all(c("cue", "target") %in% names(pairs_tbl)))
    stop("`pairs_tbl` must have columns named 'cue' and 'target'.")
  
  # ▸ make everything lower‑case
  cues    <- tolower(pairs_tbl$cue)
  targets <- tolower(pairs_tbl$target)
  
  # ▸ wrap each word in double quotes
  q_cues    <- sprintf('"%s"', cues)
  q_targets <- sprintf('"%s"', targets)
  
  # ▸ compose the JavaScript lines
  js_lines <- c(
    sprintf("var %s = [%s];", cue_var,  paste(q_cues,    collapse = ", ")),
    sprintf("var %s = [%s];", tgt_var,  paste(q_targets, collapse = ", "))
  )
  
  # ▸ write to file
  writeLines(js_lines, file)
  message("✅  Wrote ", length(cues), " cues + targets to '", file, "'.")
}

# ------------------------------------------------------------------
#  Example workflow
# ------------------------------------------------------------------
#  1.  Grab your word‑pairs (as in the previous script)
pairs <- sample_word_pairs(path = "Florida Norms.xlsx",
                           n_pairs = 40,
                           desired_mean = 0.47,
                           desired_sd   = 0.14)

#  2.  Dump them to JavaScript
write_js_word_lists(pairs, file = "../scripts/assets/js/stimuli.js")