using TradingAnarchy.MultiMiner.Core.Config;

namespace TradingAnarchy.MultiMiner.Headless;

/// <summary>
/// Entry point for the Trading Anarchy Multi Miner headless console application.
/// </summary>
public static class Program
{
    /// <summary>
    /// Main entry point for the headless runtime.
    /// </summary>
    /// <param name="args">Command line arguments.</param>
    /// <returns>Exit code.</returns>
    public static int Main(string[] args)
    {
        Console.WriteLine("Trading Anarchy Multi Miner - Headless Runtime (Bootstrap Phase 0-1)");
        Console.WriteLine($"Configuration directory: {ConfigPaths.GetConfigDirectory()}");
        Console.WriteLine("Ready for future mining backend integration...");
        
        // TODO(#2): Implement actual mining runtime logic
        // TODO(#4): Integrate profitability engine
        // TODO(#5): Add power telemetry support
        
        return 0;
    }
}