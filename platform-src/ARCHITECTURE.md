# Proposed Folder Structure (Step 2)

```
/kernel
  ├── bus/
  │   └── GlobalEventBus.ts          # Singleton event emitter with dedup & sequencing
  ├── reducer/
  │   └── PlatformReducer.ts         # Pure reducer function + state transitions
  ├── bridge/
  │   └── VisualBridge.ts            # Connects state changes → template registry
  ├── state/
  │   └── PlatformState.ts           # Type definitions + INITIAL_STATE
  └── index.ts                       # Kernel public API exports

/templates
  ├── registry/
  │   └── TemplateRegistry.ts        # Maps selectors → visual components
  ├── visual/
  │   └── TreeGrowth.ts              # Example visual template (milestone.level_up)
  └── selectors/
      └── playerSelectors.ts         # Pure selector functions

/modules
  ├── games/
  │   └── TreeGame.ts                # Mock game module (emits events only)
  └── index.ts

main.ts                              # Vertical slice entry point
README.md
PLATFORM_MANIFEST.md
```

### Key Design Principles Reflected

- **/kernel**: All stateful logic, event handling, and purity enforcement
- **/templates**: Purely visual projection layer (read-only via selectors)
- **/modules**: Game logic — only emits events (never reads state)
- Clear separation between Behavioral System and Visual System

---

**Please review the PLATFORM_MANIFEST.md and the proposed folder structure above.**

Once you approve, I will proceed with **Step 3: Implementation** (GlobalEventBus, PlatformState + Reducer, Bridge) and **Step 4: Vertical Slice**.