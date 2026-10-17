# `clarifier`

**Role:** asks the questions before any work starts.
**Use when:** Claude starts building before it understands you, or a request has many connected decisions.
**Next role:** `planner`.

**Change:** nothing. It works as it is.
**Keep:** the recommended answer with each question, and "no work until the user confirms". These make it fast and safe.
**Test:** give it a vague request. It should ask a whole level of questions at once, each with a recommended answer.
