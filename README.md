# Trading Anarchy Multi Miner

**Phase 0–1 Bootstrap**: Modern .NET 8 foundation for cryptocurrency mining automation and profitability optimization.

## Overview

Trading Anarchy Multi Miner is a modernized evolution of cryptocurrency mining software, built on .NET 8 with a focus on performance, security, and maintainability. This repository represents a phased modernization approach, starting with foundational infrastructure and gradually building toward full mining automation capabilities.

**Current Status**: Phase 0–1 (Foundation Bootstrap) - Basic project structure and governance established.

## Architecture

- **Core Library** (`TradingAnarchy.MultiMiner.Core`): Configuration management, shared types, and foundational components
- **Backend Abstraction** (`TradingAnarchy.MultiMiner.Backends`): Mining engine abstractions (future: BFGMiner, CGMiner integration)
- **Headless Runtime** (`TradingAnarchy.MultiMiner.Headless`): Console-based mining automation runtime
- **Benchmarks** (`TradingAnarchy.MultiMiner.Benchmarks`): Performance testing and optimization tools

## Quick Start

### Prerequisites
- .NET 8 SDK or later
- Compatible mining hardware (GPU/ASIC) for production use

### Building
```bash
dotnet build TradingAnarchy.MultiMiner.sln
```

### Running (Bootstrap Mode)
```bash
dotnet run --project src-dotnet/TradingAnarchy.MultiMiner.Headless
```

## Attribution

This project builds upon and is inspired by the original [MultiMiner](https://github.com/nwoolls/MultiMiner) project by Nathanial Woolls, licensed under MIT. We gratefully acknowledge the foundational work that has made this modernization possible.

## Documentation

- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Development Roadmap](ROADMAP.md)

## Development Status

This is an active development project following a phased approach. See [ROADMAP.md](ROADMAP.md) for detailed phase planning and [Contributing Guidelines](CONTRIBUTING.md) for development workflow.

## License

MIT License - see [LICENSE](LICENSE) for details. Includes attribution to original MultiMiner project.
