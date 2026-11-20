---
# The term being defined (entryType: definition) or a short label for the quote (entryType: quote).
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
# definition | quote
entryType: "definition"
# The day you saved it (not shown on the site).
date: "{{ .Date | time.Format "2006-01-02" }}"
# Position in the list: lower comes first. Leave gaps (10, 20, 30...) so you can insert later.
weight: 
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
