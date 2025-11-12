from mt5_trading_bot import XAUUSDTradingBot
import time

print("🚀 Starting XAUUSD Trading Bot...")
print("⏳ Make sure MT5 is running...")
time.sleep(3)

bot = XAUUSDTradingBot()
bot.run_real_time_analysis()