#!/bin/sh
# UserPromptSubmit hook: stdout is added to the prompt context.
cat <<'MSG'
[repo workflow] Invoke the `orchestrate` skill before anything else for this prompt. It triages the request, writes plan/task handoffs under docs/handoffs/, and delegates to task-worker / task-reviewer subagents. Pure questions with no file changes may be answered directly.
MSG
