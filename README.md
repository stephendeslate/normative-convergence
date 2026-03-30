# normative-convergence

**Phase 3 of the [CED Research Program](https://sjdlabs.com/experiments)**

A 5-layer quality scorer mapped to ISO/IEC 25010:2023, measuring whether AI-generated code converges to production-ready quality through epistemic layers: Claims, Proofs, Attacks, Resilience, and Endurance.

## Results

- **2 trials** completed
- **73 failure modes** cataloged
- **40 ISO/IEC 25010:2023 dimensions** scored across 5 layers
- **Status:** Complete

The central finding was a Goodhart's Law dynamic: as the scorer and application co-evolved across iterations, it became unclear whether convergence demonstrated genuine quality improvement or adaptation to the scoring instrument itself.

Full experiment write-up: [sjdlabs.com/experiments/normative-convergence](https://sjdlabs.com/experiments/normative-convergence)

## What's in This Repo

This repository contains the **application source code** generated during the experiment — the artifacts that were scored, not the scorer itself.

```
normative-convergence/
├── trial01/
│   └── telehealth-booking/    # Trial 01 application (NestJS + Next.js + Prisma)
└── trial02/
    └── telehealth-booking/    # Trial 02 application (NestJS + Next.js + Prisma)
```

Each trial application is a telehealth booking platform built with:
- **NestJS 11** (API)
- **Next.js 15** (Frontend)
- **Prisma 6** (ORM)
- **PostgreSQL 16** (Database)
- **Turborepo 2** (Monorepo)

## Related

- **Phase 1:** [layered-convergence](https://github.com/stephendeslate/layered-convergence) — 44 trials, 10 layers, 102 failure modes
- **Phase 2:** [discrete-convergence](https://github.com/stephendeslate/discrete-convergence) — 27 trials, 5 phases, all converged

---

**[SJD Labs](https://sjdlabs.com)** — Stephen Deslate
