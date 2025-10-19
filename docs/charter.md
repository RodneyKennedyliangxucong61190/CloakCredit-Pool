# CloakCredit-Pool Project Charter

## Vision
CloakCredit-Pool provides an enterprise-focused private credit pool. All capital utilization and default probability calculations are performed entirely within FHE, with partner banks only seeing obfuscated range data.

## Core Components
- `PoolController` contract: Maintains encrypted balance sheets, using `euint128` to represent various exposures.
- `RiskOracle`: Off-chain service uses Gateway to submit `attestation`, ensuring the rating model is trustworthy.
- `Division Invariance` noise layer: Injects `randEuint32` mask for each interest rate update to prevent multi-round query inference of real positions.

## Workflow
1. Enterprises upload encrypted financial statements (`FHE.upload`) and obtain handles.
2. The contract executes `FHE.div` and `FHE.gt` to calculate solvency.
3. Use `FHE.select` to open corresponding quotas for different ratings.

## Roadmap
- Compatible with Chapter 27 Gateway architecture in the documentation, implementing cross-regional regulatory nodes.
- Plan to add `compliance-reports` subsystem to decrypt on-demand and generate audit summaries.
- Integrate off-chain homomorphic signatures to interface with traditional banking APIs.
