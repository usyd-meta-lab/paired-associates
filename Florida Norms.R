mydata <- rio::import("~/Desktop/Florida Norms.xlsx")


CUE <- c("beautiful", "exact", "adorable", "bake", "mine", "nephew", "large", "eye", "jumpy", "snatch", "slender", "embrace", "breakfast", "cashew", "annual", "dump", 
  "gull", "mule", "chunk", "strand", "ape", "cigarette", "trot", "juice", "tile", "hog", "sprain", "assistant", "cop", "ski", "stench", "drain", "artery", "deep", "calendar", 
  "lumber", "wicker", "kind", "ceiling", "brother")
targets <- c("pretty", "precise", "cute", "cake", "yours", "niece", "small", "see", "nervous", "take", "thin", "hug", "lunch", "nut", "yearly", "garbage", "sea", "donkey", 
              "piece", "hair", "monkey", "smoke", "horse", "orange", "floor", "pig", "ankle", "helper", "police", "snow", "smell", "sink", "vein", "shallow", "date", "wood", "basket",
              "nice", "roof", "sister")

CUE <- toupper(CUE)
targets <- toupper(targets)

df <- cbind(CUE, targets)

mydata <- mydata[mydata$CUE %in% CUE,]

mydata <- merge(mydata, df, by = "CUE")
mydata <- mydata[mydata$TARGET == mydata$targets,]
mean(mydata$FSG)
