namespace TradingAnarchy.MultiMiner.Core.Config;

/// <summary>
/// Configuration paths for application data directories.
/// Handles both legacy MultiMiner paths and new Trading Anarchy Multi Miner paths.
/// </summary>
public static class ConfigPaths
{
    /// <summary>
    /// Legacy MultiMiner application data directory path.
    /// </summary>
    public static readonly string LegacyAppDataDirectory = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "MultiMiner");

    /// <summary>
    /// New Trading Anarchy Multi Miner application data directory path.
    /// </summary>
    public static readonly string AppDataDirectory = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "TradingAnarchy",
        "MultiMiner");

    /// <summary>
    /// Gets the appropriate configuration directory, preferring the new path
    /// but falling back to legacy if it exists and new path doesn't.
    /// </summary>
    /// <returns>The configuration directory path to use.</returns>
    public static string GetConfigDirectory()
    {
        // TODO(#3): Implement full migration logic in future PR
        // For now, just return the new directory path
        return AppDataDirectory;
    }

    /// <summary>
    /// Checks if legacy configuration exists.
    /// </summary>
    /// <returns>True if legacy configuration directory exists.</returns>
    public static bool LegacyConfigExists()
    {
        // TODO(#3): Implement migration detection logic
        return Directory.Exists(LegacyAppDataDirectory);
    }
}