---
name: investigate
description: Find out where something is or why something happens, and answer with proof. Read-only. Use when asked where, how or why about the code or a failure.
argument-hint: [question or symptom]
allowed-tools: Read Grep Glob
context: fork
---
Question: $ARGUMENTS

1. Say what you will look at first. Search by name, then by usage. Use Grep and Glob before you read whole files.
2. If the question is about a failure, reproduce it or find its exact output first. Then write three possible causes, ranked by how likely and how cheap they are to check. Test the cheapest one.
3. Answer in at most 20 lines. Put the direct answer first, then the proof: file and line, or the command output.
4. Say what you did not find, and what would settle any doubt.
5. Stop after three dead ends. Report what you ruled out.

## Rules

- Do not edit anything.
- Every claim has proof. No proof, no claim.

## Gotchas

- A name that matches in many places: list the top three and say how you chose.
- Do not paste code blocks. Give the path and the line.
