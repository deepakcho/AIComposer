# AI Composer — Documentation

| Area | Start here |
| --- | --- |
| **Action plan** | [00-master-plan.md](action-plan/00-master-plan.md) — phases, tasks, status board, definition of done |
| **Design principles** | [design-principles.md](action-plan/design-principles.md) — architecture rules, boundaries, SOLID mapping |
| **API reference** | [api/](api/) — every subsystem with concept → API → examples |
| **Framework guides** | [frameworks/](frameworks/) — React, Angular, Vue, Web Component, Vanilla |
| **ADRs** | [adr/](adr/) — architecture decision records |
| **Examples** | [../examples/](../examples/) — runnable code for every API area |

## The one-line architecture

```
@ai-composer/core   model · state · events · commands · triggers · plugins · history · serialization
       ↑
@ai-composer/dom    contentEditable surface · selection mapping · clipboard · templates · suggestions
       ↑
react / angular / vue / web-component   thin adapters (level-1 → level-3 APIs)
       ↑
ui + themes                            optional ready-made UI, tokens (CSS custom properties)
```

**Build the engine once, let frameworks render it many ways, and let
applications own the final HTML experience.**
