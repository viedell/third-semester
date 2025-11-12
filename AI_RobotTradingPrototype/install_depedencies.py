# quick_start.py
import sys
import subprocess

def check_installation():
    """Check if all required packages are installed"""
    required_packages = ['MetaTrader5', 'pandas', 'numpy', 'plotly', 'ta']
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    return missing_packages

def main():
    print("🚀 XAUUSD Trading Bot - Quick Start")
    print("=" * 50)
    
    # Check installations
    missing = check_installation()
    if missing:
        print("❌ Missing packages:", ", ".join(missing))
        print("📦 Installing requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing)
        print("✅ Installation complete!")
    
    print("\n🎯 Starting XAUUSD Trading Analysis Bot...")
    print("⚠️  Make sure MetaTrader 5 is installed and running!")
    print("📊 The bot will connect to MT5 and start real-time analysis")
    print("⏳ Starting in 3 seconds...")
    
    import time
    time.sleep(3)
    
    # Import and run the bot
    from mt5_trading_bot import XAUUSDTradingBot
    
    bot = XAUUSDTradingBot()
    bot.run_real_time_analysis()

if __name__ == "__main__":
    main()