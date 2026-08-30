# Spike 010 Research Observations

These are observations, not canonical workflow transitions.

## Host orchestration remained necessary

The external host still selected and submitted each authority transition,
resolved sandbox/Git integration failures, and decided when evaluator work had
actually occurred. The authority made illegal or unsupported claims visible,
but it did not remove the need for orchestration.

Two earlier host turns yielded at phase boundaries before the user directed
continuous autonomous progress. Those yields were conversational behavior, not
workflow events; the authority neither recorded nor prevented them.

## Cooperative boundary exposed an evaluator-provenance gap

The authority correctly required and recorded verification allocation before
its result. However, the evaluator role failed to allocate its separate private
attempt-ledger entry before public candidate evaluation. That is a material
violation of evaluator v8 provenance procedure. The resulting authority PASS
cannot safely substitute for the missing immutable evaluator attempt record,
and this observation must not be repaired by backdating an allocation or
promoting the result as though the evaluator chain were complete.

This is precisely a remaining convention that the current same-user cooperative
model cannot enforce: the public authority does not own or inspect private
evaluator state. A future capability boundary or an evaluator-authority
handshake may be warranted if this distinction proves important enough.
