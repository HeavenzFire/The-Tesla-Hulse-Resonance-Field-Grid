# Contributing to Syntropic Engine

## License & Philosophy

This project is released under **AGPL-3.0** - an anti-profit, open-access license ensuring:
- All downstream modifications remain free and transparent
- No proprietary vendor lock-in or corporate paywalls
- Equal access regardless of financial resources
- Community-driven development for public good

## Development Setup

```bash
# Clone and setup
git clone <repository-url>
cd syntropic-engine
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
pip install -e .

# Install pre-commit hooks
pre-commit install
```

## Running Tests

```bash
# Run full test suite
pytest tests/ -v --cov=src

# Run benchmark suite
python src/syntropic.py

# Run CLI runner
python run_engine.py benchmark --n-states 2048 --steps 10000
python run_engine.py ablation --output results.json
python run_engine.py full-suite --audit --export-report
```

## Code Style

- **Formatting**: Black (automatic via pre-commit)
- **Linting**: Flake8 with max-line-length=100
- **Type Checking**: MyPy
- **Imports**: Standard library first, then third-party, then local

## Architecture Principles

1. **Zero-Allocation Patterns**: Reuse buffers to suppress GC churn
2. **Cache Optimization**: Contiguous arrays for L1/L2 pinning
3. **SIMD Vectorization**: Leverage JIT auto-vectorization
4. **Unitarity Preservation**: Drift must stay below 1e-14
5. **Deterministic Reproducibility**: Seeded runs produce identical results

## Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with tests
4. Run full test suite and benchmark
5. Commit with clear message following Conventional Commits
6. Open PR against `main` branch
7. Wait for CI pass and community review

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Example:
```
feat(engine): add entropy-guided evolution

- Track population entropy to prevent premature convergence
- Add adaptive phase scaling based on charge distribution
- Update metrics collector with entropy curve calculation

Closes #42
```

## Benchmark Requirements

All performance improvements must include:
- Ablation study showing individual optimization contributions
- Constructive resonance factor measurement
- Unitarity drift verification (< 1e-14)
- Reproducibility confirmation with seeded runs

## Community Guidelines

- Be respectful and inclusive
- Prioritize accessibility and public good
- Document all features thoroughly
- Keep monetization and proprietary interests out of the project

## Questions?

Open an issue with the `question` label or join community discussions.
