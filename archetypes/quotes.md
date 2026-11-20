---
# The term being defined (kind: definition) or a short label for the quote (kind: quote).
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
# definition | quote
kind: "definition"
# The day you saved it (shown as "added").
date: "{{ .Date | time.Format "2006-01-02" }}"
# Original author(s).
author: ""
# Link to the author (personal site, profile...). Optional.
authorUrl: ""
# Where it comes from (paper, book, standard, talk...). Optional.
source: ""
# Link to the source. Optional.
sourceUrl: ""
# When the original was published (e.g. "1975" or "2020-08"). Optional.
originalDate: ""
tags:
  -
---

> The definition or quote goes here, verbatim when you can.

<!--more-->

Optional personal notes: shown only on the entry's own page, not in the list.
