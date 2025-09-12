# Contributing to Trading Anarchy Multi Miner

Thank you for your interest in contributing to Trading Anarchy Multi Miner! This project follows a phased development approach with specific workflows for each phase.

## Development Workflow

### Phased Development Process

This project is being developed in phases (0-12) as outlined in the [ROADMAP.md](ROADMAP.md). Each PR should:

1. **Link to Issues**: Reference the appropriate issue numbers (#1-#14) in your PR description
2. **Phase Alignment**: Align with the current development phase
3. **Scope Control**: Keep changes focused and avoid implementing features from future phases

### Before Contributing

1. Check the [ROADMAP.md](ROADMAP.md) to understand the current phase
2. Review existing issues and link your work to the appropriate issue number
3. Ensure your contribution aligns with the current phase scope

### Pull Request Guidelines

- **Title**: Use descriptive titles referencing issue numbers (e.g., "Implement profitability engine (#4)")
- **Description**: 
  - Reference related issue numbers
  - Explain what phase this addresses
  - Include testing information
- **Code Quality**: 
  - Follow .NET coding standards
  - Ensure zero build warnings
  - Include appropriate documentation

### Issue References

When contributing, reference these key issues:
- **#1**: Meta plan and overall architecture
- **#2**: Mining backend implementation
- **#3**: Configuration migration
- **#4**: Profitability engine
- **#5**: Power telemetry
- **#6**: Benchmark framework
- **#7**: Mining algorithm benchmarks
- **#8**: Binary acquisition security
- **#9**: Scheduler implementation
- **#10**: Plugin architecture
- **#11**: API development
- **#12**: Avalonia UI
- **#13**: Desktop app packaging
- **#14**: CI/CD workflows

### Code Standards

- Target .NET 8
- Enable nullable reference types
- Treat warnings as errors
- Use `TradingAnarchy.MultiMiner.*` namespaces
- Include XML documentation for public APIs
- Add TODO comments with issue references

### Testing

- Ensure all projects build successfully with `dotnet build`
- Test console applications manually
- Future phases will include automated testing requirements

## Questions?

For questions about contributing, please:
1. Check existing issues for similar questions
2. Create a new issue with the `question` label
3. Reference the appropriate phase and issue numbers

Thank you for helping to modernize cryptocurrency mining software!