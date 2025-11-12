# Runtime patch for xauusd.py
# - Replaces deprecated df.fillna(method=...) calls with df.ffill().bfill()
# - Adds MultiStrategyTradingBot._adaptive_analysis if missing
# - Adds MultiStrategyTradingBot._show_final_summary if missing
#
# Usage:
#   Place this file next to xauusd.py and either:
#     - import xauusd_patch before running xauusd.py
#     - or run: python -c "import xauusd_patch; import xauusd; # then run your bot"
#
# The patch applies changes at runtime, so no direct edits to your original file are required.

import logging
from datetime import datetime
import types

logger = logging.getLogger("xauusd_patch")
logger.setLevel(logging.INFO)

try:
    import xauusd
except Exception as e:
    logger.exception("Could not import xauusd module. Make sure xauusd.py is on sys.path and importable.")
    raise

# ---------- 1) Patch calculate_indicators to avoid deprecated fillna(method=...) ----------
# We'll wrap the original implementation but replace any .fillna(method='ffill').fillna(method='bfill')
# usage by doing df = df.ffill().bfill() at appropriate places.

def patched_calculate_indicators(self, df):
    """
    Replacement for MultiStrategyTradingBot.calculate_indicators with updated fillna usage.
    This is a near-drop-in replacement: it keeps the same logic but uses df.ffill().bfill().
    """
    if df is None or (hasattr(df, "empty") and df.empty) or len(df) < 10:
        return df
    try:
        # Use a copy to avoid mutating caller's DataFrame unexpectedly
        df = df.copy()
        # Ensure numeric types
        if {'open', 'high', 'low', 'close', 'volume'}.issubset(df.columns):
            df[['open', 'high', 'low', 'close', 'volume']] = df[['open', 'high', 'low', 'close', 'volume']].apply(pd.to_numeric, errors='coerce')
        # Use modern fill methods to avoid FutureWarning
        df = df.ffill().bfill()

        # Trend indicators
        df['ema_20'] = xauusd.EMAIndicator(df['close'], window=20).ema_indicator()
        df['ema_50'] = xauusd.EMAIndicator(df['close'], window=50).ema_indicator()
        df['ema_200'] = xauusd.EMAIndicator(df['close'], window=200).ema_indicator()

        # MACD
        macd = xauusd.MACD(df['close'])
        df['macd'] = macd.macd()
        df['macd_signal'] = macd.macd_signal()
        df['macd_histogram'] = macd.macd_diff()

        # RSI
        df['rsi'] = xauusd.RSIIndicator(df['close'], window=14).rsi()

        # Bollinger Bands
        bb = xauusd.BollingerBands(df['close'], window=20, window_dev=2)
        df['bb_upper'] = bb.bollinger_hband()
        df['bb_lower'] = bb.bollinger_lband()
        df['bb_middle'] = bb.bollinger_mavg()

        # Stochastic
        stoch = xauusd.StochasticOscillator(df['high'], df['low'], df['close'])
        df['stoch_k'] = stoch.stoch()
        df['stoch_d'] = stoch.stoch_signal()

        # ATR
        df['atr'] = xauusd.AverageTrueRange(df['high'], df['low'], df['close']).average_true_range()

        # ADX
        df['adx'] = xauusd.ADXIndicator(df['high'], df['low'], df['close']).adx()

        # Ichimoku-like components
        high_9 = df['high'].rolling(window=9).max()
        low_9 = df['low'].rolling(window=9).min()
        df['tenkan_sen'] = (high_9 + low_9) / 2

        high_26 = df['high'].rolling(window=26).max()
        low_26 = df['low'].rolling(window=26).min()
        df['kijun_sen'] = (high_26 + low_26) / 2

        # Final clean up - modern API
        df = df.ffill().bfill().fillna(0.0)
    except Exception as e:
        logger.exception("Patched calculate_indicators encountered an error: %s", e)
    return df

# Apply the patch if the class and original method exist
if hasattr(xauusd, "MultiStrategyTradingBot"):
    BotClass = xauusd.MultiStrategyTradingBot
    # Import pandas locally to use in function
    import pandas as pd
    # Replace method
    BotClass.calculate_indicators = types.MethodType(patched_calculate_indicators, BotClass)
    # However types.MethodType with class will not work; instead assign function directly so descriptor binding works
    BotClass.calculate_indicators = patched_calculate_indicators
    logger.info("Patched MultiStrategyTradingBot.calculate_indicators to use df.ffill().bfill()")
else:
    logger.warning("xauusd.MultiStrategyTradingBot not found; skipping calculate_indicators patch.")


# ---------- 2) Add _adaptive_analysis if missing ----------
if hasattr(xauusd, "MultiStrategyTradingBot"):
    BotClass = xauusd.MultiStrategyTradingBot
    if not hasattr(BotClass, "_adaptive_analysis"):
        def _adaptive_analysis(self, df, symbol, current_price):
            """
            Adaptive strategy delegator:
            - Uses MarketRegimeDetector.detect_regime to pick the best analysis method.
            """
            try:
                regime_data = xauusd.MarketRegimeDetector.detect_regime(df)
                regime = regime_data.get("regime", "transitional")
                if regime in ["strong_trend", "trending"]:
                    return self._elliott_wave_analysis(df, symbol, current_price)
                elif regime == "volatile":
                    return self._mean_reversion_analysis(df, symbol, current_price)
                elif regime == "ranging":
                    return self._breakout_analysis(df, symbol, current_price)
                else:
                    return self._fibonacci_analysis(df, symbol, current_price)
            except Exception as e:
                logger.exception("Error in patched _adaptive_analysis: %s", e)
                # Safe fallback to HOLD signal structure
                return xauusd.TradingSignal(
                    signal="HOLD",
                    confidence=0,
                    risk_level="HIGH",
                    strategy="Adaptive (fallback)",
                    entry_price=current_price,
                    stop_loss=current_price,
                    take_profit=current_price,
                    reasoning=["Adaptive analysis failed, fallback to HOLD"],
                    indicators={}
                )
        # Bind it to class
        BotClass._adaptive_analysis = _adaptive_analysis
        logger.info("Injected MultiStrategyTradingBot._adaptive_analysis()")
    else:
        logger.info("MultiStrategyTradingBot._adaptive_analysis already exists; no injection needed.")
else:
    logger.warning("xauusd.MultiStrategyTradingBot not found; skipping _adaptive_analysis injection.")


# ---------- 3) Add _show_final_summary if missing ----------
if hasattr(xauusd, "MultiStrategyTradingBot"):
    BotClass = xauusd.MultiStrategyTradingBot
    if not hasattr(BotClass, "_show_final_summary"):
        def _show_final_summary(self):
            """Patched final summary printer and trade history saver."""
            try:
                logger.info("Patched _show_final_summary running...")
                print("\n" + "=" * 80)
                print("TRADING SESSION SUMMARY")
                print("=" * 80)
                if getattr(self, "trade_history", None):
                    total_profit = sum((t.get('profit') or 0.0) for t in self.trade_history)
                    winning_trades = len([t for t in self.trade_history if (t.get('profit') or 0) > 0])
                    win_rate = (winning_trades / len(self.trade_history)) * 100 if self.trade_history else 0.0
                    print(f"Total Trades: {len(self.trade_history)} | Winning Trades: {winning_trades} ({win_rate:.1f}%) | Total P&L: ${total_profit:.2f}")
                else:
                    print("No trades executed during this session.")
                if getattr(self, "positions", None):
                    print(f"Open Positions: {len(self.positions)}")
                    total_open_pnl = sum(p.current_profit for p in self.positions)
                    print(f"Unrealized P&L: ${total_open_pnl:.2f}")
                print("=" * 80)
                # Try to save trade history safely
                try:
                    out = {"summary_time": datetime.now().isoformat(), "trades": getattr(self, "trade_history", [])}
                    out_path = xauusd.Path("trade_history.json") if hasattr(xauusd, "Path") else xauusd.Path("trade_history.json") if hasattr(xauusd, "Path") else "trade_history.json"
                    # Prefer standard file write
                    with open("trade_history.json", "w") as fh:
                        import json
                        json.dump(out, fh, indent=2, default=str)
                    logger.info("Saved trade history to trade_history.json")
                except Exception as e:
                    logger.exception("Failed saving trade history: %s", e)
            except Exception as e:
                logger.exception("Error in patched _show_final_summary: %s", e)
        BotClass._show_final_summary = _show_final_summary
        logger.info("Injected MultiStrategyTradingBot._show_final_summary()")
    else:
        logger.info("MultiStrategyTradingBot._show_final_summary already exists; no injection needed.")
else:
    logger.warning("xauusd.MultiStrategyTradingBot not found; skipping _show_final_summary injection.")

logger.info("xauusd_patch applied successfully.")