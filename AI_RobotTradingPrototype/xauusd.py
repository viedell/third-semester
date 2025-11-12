# Improved Enhanced Multi-Strategy XAUUSD Trading Bot (Real-time incremental history)
# Saves charts to ./charts, seeds history once, updates candles in real-time per tick.

import logging
import os
import json
import time
import threading
import signal
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import xauusd_patch

import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import ta
from ta.trend import EMAIndicator, MACD, ADXIndicator
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.volatility import BollingerBands, AverageTrueRange

# ----------------------------
# Configuration Defaults
# ----------------------------
DEFAULT_UPDATE_INTERVAL = 5  # seconds between updates
DEFAULT_CHART_EVERY = 12     # generate chart every N updates per symbol
CHARTS_DIR = Path("./charts")
CHARTS_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_ACCOUNT_BALANCE = 100_000.0  # simulated account balance for sizing
DEFAULT_RISK_PER_TRADE = 0.01        # 1% of account balance

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("EnhancedTradingBot")

# Silence overly verbose external logs if present
for noisy in ("numba", "asyncio"):
    logging.getLogger(noisy).setLevel(logging.WARNING)


class TradingStrategy(Enum):
    """Available trading strategies"""
    ADAPTIVE = "adaptive"
    FIBONACCI = "fibonacci"
    ELLIOTT_WAVE = "elliott_wave"
    BREAKOUT = "breakout"
    MEAN_REVERSION = "mean_reversion"
    MULTI_TIMEFRAME = "multi_timeframe"


@dataclass
class TradingSignal:
    """Trading signal data structure"""
    signal: str  # BUY, SELL, HOLD
    confidence: float
    risk_level: str
    strategy: str
    entry_price: float
    stop_loss: float
    take_profit: float
    reasoning: List[str]
    indicators: Dict
    fibonacci_levels: Optional[Dict] = None
    elliott_wave_count: Optional[int] = None


@dataclass
class Position:
    """Trading position"""
    symbol: str
    entry_price: float
    position_type: str  # LONG/SHORT
    lot_size: float
    stop_loss: float
    take_profit: float
    entry_time: datetime
    strategy: str
    current_profit: float = 0.0


# ----------------------------
# Utility helpers
# ----------------------------
def safe_get(df: pd.DataFrame, col: str, default=0.0):
    """Safely get last value of a column or default"""
    if isinstance(df, pd.DataFrame) and col in df.columns and not df[col].dropna().empty:
        return float(df[col].iloc[-1])
    return default


# ----------------------------
# Fibonacci Analyzer
# ----------------------------
class FibonacciAnalyzer:
    """Fibonacci retracement and extension analysis"""

    @staticmethod
    def calculate_levels(high: float, low: float, trend: str = "up") -> Dict[str, float]:
        diff = high - low if high != low else 1e-8
        if trend == "up":
            return {
                "0.0": low,
                "23.6": low + (diff * 0.236),
                "38.2": low + (diff * 0.382),
                "50.0": low + (diff * 0.5),
                "61.8": low + (diff * 0.618),
                "78.6": low + (diff * 0.786),
                "100.0": high,
                "161.8": high + (diff * 0.618),
                "261.8": high + (diff * 1.618),
            }
        else:
            return {
                "0.0": high,
                "23.6": high - (diff * 0.236),
                "38.2": high - (diff * 0.382),
                "50.0": high - (diff * 0.5),
                "61.8": high - (diff * 0.618),
                "78.6": high - (diff * 0.786),
                "100.0": low,
                "161.8": low - (diff * 0.618),
                "261.8": low - (diff * 1.618),
            }

    @staticmethod
    def find_nearest_level(price: float, levels: Dict[str, float]) -> Tuple[str, float, float]:
        nearest = min(levels.items(), key=lambda x: abs(x[1] - price))
        distance = abs(price - nearest[1])
        distance_pct = (distance / price) * 100 if price else 0.0
        return nearest[0], nearest[1], distance_pct

    @staticmethod
    def generate_signal(price: float, levels: Dict[str, float], trend: str) -> Dict:
        level_name, level_price, distance_pct = FibonacciAnalyzer.find_nearest_level(price, levels)
        signal = "HOLD"
        confidence = 50
        reasoning = []
        golden_levels = {"38.2", "50.0", "61.8"}
        if level_name in golden_levels and distance_pct < 0.5:
            if trend == "up":
                signal = "BUY"
                confidence = 85
                reasoning.append(f"Price at {level_name}% Fibonacci retracement (Golden Ratio)")
                reasoning.append("Strong support level - High probability bounce")
            else:
                signal = "SELL"
                confidence = 85
                reasoning.append(f"Price at {level_name}% Fibonacci retracement (Golden Ratio)")
                reasoning.append("Strong resistance level - High probability rejection")
        return {
            "signal": signal,
            "confidence": confidence,
            "reasoning": reasoning,
            "nearest_level": level_name,
            "level_price": level_price,
            "distance_pct": distance_pct
        }


# ----------------------------
# Elliott Wave Analyzer (simplified)
# ----------------------------
class ElliottWaveAnalyzer:
    """Elliott Wave pattern recognition"""

    @staticmethod
    def identify_waves(df: pd.DataFrame) -> Dict:
        if len(df) < 50:
            return {"wave": 0, "pattern": "unknown", "confidence": 0}
        closes = df['close'].tail(50).values
        price_changes = np.diff(closes)
        trend_changes = int(np.sum(np.diff(np.sign(price_changes)) != 0))
        wave_estimate = min(5, max(0, (trend_changes // 2) + 1))
        total_move = closes[-1] - closes[0]
        avg_move = np.mean(np.abs(price_changes)) if len(price_changes) > 0 else 0.0
        if abs(total_move) > (avg_move * 10 if avg_move else 0):
            pattern = "impulse"
            confidence = 70
        else:
            pattern = "corrective"
            confidence = 60
        return {"wave": wave_estimate, "pattern": pattern, "confidence": confidence, "trend_changes": trend_changes}

    @staticmethod
    def generate_signal(wave_data: Dict, current_price: float) -> Dict:
        wave = wave_data.get("wave", 0)
        pattern = wave_data.get("pattern", "unknown")
        confidence = wave_data.get("confidence", 50)
        signal = "HOLD"
        reasoning = []
        if pattern == "impulse":
            if wave in [1, 3, 5]:
                signal = "BUY"
                reasoning.append(f"Wave {wave} of impulse pattern")
                reasoning.append("Trend continuation expected")
                confidence = min(85, confidence + 15)
            elif wave in [2, 4]:
                signal = "HOLD"
                reasoning.append(f"Wave {wave} correction in progress")
                reasoning.append("Wait for wave completion")
        else:
            signal = "HOLD"
            reasoning.append("ABC correction pattern detected")
            reasoning.append("Wait for new impulse wave")
        return {"signal": signal, "confidence": confidence, "reasoning": reasoning, "wave_count": wave, "pattern": pattern}


# ----------------------------
# Market Regime Detector
# ----------------------------
class MarketRegimeDetector:
    """Detect market regime (trending, ranging, volatile)"""

    @staticmethod
    def detect_regime(df: pd.DataFrame) -> Dict:
        if len(df) < 50:
            return {"regime": "unknown", "confidence": 0}
        recent = df.tail(50)
        returns = recent['close'].pct_change().dropna()
        volatility = float(returns.std() * 100) if not returns.empty else 0.0
        price_change = (recent['close'].iloc[-1] - recent['close'].iloc[0]) / recent['close'].iloc[0]
        abs_price_change = abs(price_change) * 100
        adx = safe_get(recent, 'adx', 25.0)
        if np.isnan(adx):
            adx = 25.0
        if adx > 40 and abs_price_change > 2:
            regime = "strong_trend"
            confidence = 85
        elif adx > 25 and abs_price_change > 1:
            regime = "trending"
            confidence = 75
        elif volatility > 3:
            regime = "volatile"
            confidence = 70
        elif volatility < 1 and abs_price_change < 0.5:
            regime = "ranging"
            confidence = 80
        else:
            regime = "transitional"
            confidence = 60
        return {"regime": regime, "confidence": confidence, "volatility": volatility, "trend_strength": abs_price_change, "adx": adx}


# ----------------------------
# Multi-Strategy Trading Bot
# ----------------------------
class MultiStrategyTradingBot:
    """Enhanced multi-strategy trading bot"""

    def __init__(
        self,
        symbols: Optional[List[str]] = None,
        strategy: TradingStrategy = TradingStrategy.ADAPTIVE,
        timeframe: str = "M1",
        seed_periods: int = 200,
        update_interval: int = DEFAULT_UPDATE_INTERVAL,
        chart_every: int = DEFAULT_CHART_EVERY,
        account_balance: float = DEFAULT_ACCOUNT_BALANCE,
        risk_per_trade: float = DEFAULT_RISK_PER_TRADE,
        max_iterations: Optional[int] = None,
        chart_save_dir: Path = CHARTS_DIR,
    ):
        self.symbols = symbols or ["XAUUSD"]
        self.strategy = strategy
        self.timeframe = timeframe  # 'M1', 'H1', 'tick', etc.
        self.seed_periods = seed_periods
        self.update_interval = update_interval
        self.chart_every = chart_every
        self.chart_save_dir = chart_save_dir
        self.account_balance = float(account_balance)
        self.risk_per_trade = float(risk_per_trade)
        self.max_iterations = max_iterations
        self.iteration_counts: Dict[str, int] = {s: 0 for s in self.symbols}
        self.positions: List[Position] = []
        self.trade_history: List[Dict] = []
        self.stop_event = threading.Event()
        self._init_symbol_data()
        # Setup graceful stop on SIGINT/SIGTERM
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        # Seed history for each symbol once
        for symbol in self.symbols:
            self._seed_history(symbol, periods=self.seed_periods, timeframe=self.timeframe)

    def _signal_handler(self, signum, frame):
        logger.info("Received stop signal, shutting down gracefully...")
        self.stop_event.set()

    def _init_symbol_data(self):
        self.symbol_data: Dict[str, Dict] = {}
        for symbol in self.symbols:
            self.symbol_data[symbol] = {
                "base_price": self._get_base_price(symbol),
                "current_price": 0.0,
                "volatility": self._get_volatility(symbol),
                "history": pd.DataFrame()  # will hold incremental history
            }

    def _get_base_price(self, symbol: str) -> float:
        base_prices = {
            "XAUUSD": 3989.45,
            "XAGUSD": 31.25,
            "EURUSD": 1.0850,
            "GBPUSD": 1.2650,
            "BTCUSD": 43500.00,
            "USOUSD": 78.50
        }
        return float(base_prices.get(symbol, 100.0))

    def _get_volatility(self, symbol: str) -> float:
        volatilities = {
            "XAUUSD": 3.0,
            "XAGUSD": 0.5,
            "EURUSD": 0.001,
            "GBPUSD": 0.001,
            "BTCUSD": 500.0,
            "USOUSD": 2.0
        }
        return float(volatilities.get(symbol, 1.0))

    def _seed_history(self, symbol: str, periods: int = 200, timeframe: str = 'M1'):
        """Generate initial historical series (seed). Subsequent updates will be incremental."""
        df = self.generate_historical_data(symbol, periods=periods, timeframe=timeframe)
        # Keep the series in ascending time order
        df = df.sort_values('time').reset_index(drop=True)
        self.symbol_data[symbol]["history"] = df
        # Set current price to last close
        if not df.empty:
            self.symbol_data[symbol]["current_price"] = float(df['close'].iloc[-1])
        logger.info("Seeded history for %s with %d periods (%s)", symbol, len(df), timeframe)

    def generate_realistic_price(self, symbol: str) -> Dict:
        """Generate a new tick price and update internal current_price."""
        data = self.symbol_data[symbol]
        if data["current_price"] == 0:
            data["current_price"] = data["base_price"]
        current_hour = datetime.now().hour
        time_factor = 1.8 if 14 <= current_hour <= 22 else 1.3 if 8 <= current_hour <= 17 else 0.8
        change = np.random.normal(0, data["volatility"] * time_factor * 0.1)
        micro_structure = np.random.choice([-0.1, -0.05, 0, 0.05, 0.1], p=[0.2, 0.25, 0.1, 0.25, 0.2])
        new_price = data["current_price"] + change + micro_structure
        if new_price < data["base_price"] * 0.85:
            new_price += abs(change) * 2
        elif new_price > data["base_price"] * 1.15:
            new_price -= abs(change) * 2
        data["current_price"] = float(new_price)
        spread = max(abs(data["base_price"]) * 0.0001, 0.00001)
        return {
            "symbol": symbol,
            "bid": round(new_price - spread, 5),
            "ask": round(new_price, 5),
            "spread": round(spread * 2, 5),
            "timestamp": datetime.now(),
            "volume": int(np.random.randint(100, 2000))
        }

    def generate_historical_data(self, symbol: str, periods: int = 200, timeframe: str = 'M1') -> pd.DataFrame:
        """Generate seed historical OHLC data (used once at startup)."""
        data = []
        current_time = datetime.now()
        time_deltas = {
            'M1': timedelta(minutes=1),
            'M5': timedelta(minutes=5),
            'M15': timedelta(minutes=15),
            'H1': timedelta(hours=1),
            'H4': timedelta(hours=4),
            'D1': timedelta(days=1)
        }
        delta = time_deltas.get(timeframe, timedelta(minutes=1))
        base_price = self.symbol_data[symbol]["base_price"]
        volatility = self.symbol_data[symbol]["volatility"]
        current_price = base_price
        for i in range(periods):
            candle_time = current_time - (delta * (periods - i))
            open_price = current_price if i == 0 else data[-1]['close']
            trend = np.sin(i / 20.0) * volatility * 0.5
            change = np.random.normal(trend, volatility * 0.5)
            close_price = open_price + change
            high = max(open_price, close_price) + abs(np.random.normal(0, volatility * 0.3))
            low = min(open_price, close_price) - abs(np.random.normal(0, volatility * 0.3))
            high = max(high, low + volatility * 0.01)
            data.append({
                'time': candle_time,
                'open': round(open_price, 5),
                'high': round(high, 5),
                'low': round(low, 5),
                'close': round(close_price, 5),
                'volume': int(np.random.randint(1000, 10000))
            })
            current_price = close_price
        df = pd.DataFrame(data)
        df = df.sort_values('time').reset_index(drop=True)
        return df

    def _update_history_with_tick(self, symbol: str, price: float, timestamp: datetime, volume: int = 1):
        """Update the stored historical DataFrame with a new tick.
        If the tick belongs to the current candle (based on timeframe), update that candle.
        Else, append a new candle.
        timeframe supports M1, M5, M15, H1, H4, D1 or 'tick' (append every tick as separate row).
        """
        df = self.symbol_data[symbol]["history"]
        # choose delta
        if self.timeframe == "tick":
            # Append tick as separate "candle" with a timestamp and tiny volume
            new_row = {'time': timestamp, 'open': price, 'high': price, 'low': price, 'close': price, 'volume': volume}
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            self.symbol_data[symbol]["history"] = df
            return
        td_map = {'M1': timedelta(minutes=1), 'M5': timedelta(minutes=5), 'M15': timedelta(minutes=15),
                  'H1': timedelta(hours=1), 'H4': timedelta(hours=4), 'D1': timedelta(days=1)}
        delta = td_map.get(self.timeframe, timedelta(minutes=1))
        if df.empty:
            # seed a new initial candle if none exists
            new_row = {'time': timestamp, 'open': price, 'high': price, 'low': price, 'close': price, 'volume': volume}
            df = pd.DataFrame([new_row])
            self.symbol_data[symbol]["history"] = df
            return
        last_time = df['time'].iloc[-1]
        # If timestamp falls within the same candle interval
        if timestamp < (last_time + delta):
            # update last candle
            idx = df.index[-1]
            df.at[idx, 'close'] = round(price, 5)
            df.at[idx, 'high'] = round(max(df.at[idx, 'high'], price), 5)
            df.at[idx, 'low'] = round(min(df.at[idx, 'low'], price), 5)
            df.at[idx, 'volume'] = int(df.at[idx, 'volume'] + volume)
        else:
            # append new candle; open = previous close
            last_close = float(df['close'].iloc[-1])
            new_row = {'time': timestamp, 'open': round(last_close, 5), 'high': round(price, 5),
                       'low': round(price, 5), 'close': round(price, 5), 'volume': volume}
            df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
            # Keep history length bounded: remove oldest if too long
            max_len = max(self.seed_periods, 500)
            if len(df) > max_len:
                df = df.tail(max_len).reset_index(drop=True)
        self.symbol_data[symbol]["history"] = df

    def calculate_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        if df.empty or len(df) < 10:
            return df
        try:
            df = df.copy()
            df[['open', 'high', 'low', 'close', 'volume']] = df[['open', 'high', 'low', 'close', 'volume']].apply(pd.to_numeric, errors='coerce')
            df = df.fillna(method='ffill').fillna(method='bfill')
            df['ema_20'] = EMAIndicator(df['close'], window=20).ema_indicator()
            df['ema_50'] = EMAIndicator(df['close'], window=50).ema_indicator()
            df['ema_200'] = EMAIndicator(df['close'], window=200).ema_indicator()
            macd = MACD(df['close'])
            df['macd'] = macd.macd()
            df['macd_signal'] = macd.macd_signal()
            df['macd_histogram'] = macd.macd_diff()
            df['rsi'] = RSIIndicator(df['close'], window=14).rsi()
            bb = BollingerBands(df['close'], window=20, window_dev=2)
            df['bb_upper'] = bb.bollinger_hband()
            df['bb_lower'] = bb.bollinger_lband()
            df['bb_middle'] = bb.bollinger_mavg()
            stoch = StochasticOscillator(df['high'], df['low'], df['close'])
            df['stoch_k'] = stoch.stoch()
            df['stoch_d'] = stoch.stoch_signal()
            df['atr'] = AverageTrueRange(df['high'], df['low'], df['close']).average_true_range()
            df['adx'] = ADXIndicator(df['high'], df['low'], df['close']).adx()
            high_9 = df['high'].rolling(window=9).max()
            low_9 = df['low'].rolling(window=9).min()
            df['tenkan_sen'] = (high_9 + low_9) / 2
            high_26 = df['high'].rolling(window=26).max()
            low_26 = df['low'].rolling(window=26).min()
            df['kijun_sen'] = (high_26 + low_26) / 2
            df = df.fillna(method='ffill').fillna(method='bfill').fillna(0.0)
        except Exception as e:
            logger.exception("Error calculating indicators: %s", e)
        return df

    def analyze_with_strategy(self, df: pd.DataFrame, symbol: str) -> TradingSignal:
        if df.empty or len(df) < 20:
            return TradingSignal(
                signal="HOLD",
                confidence=0,
                risk_level="HIGH",
                strategy="None",
                entry_price=safe_get(df, 'close', 0.0),
                stop_loss=0.0,
                take_profit=0.0,
                reasoning=["Insufficient data"],
                indicators={}
            )
        current_price = float(df['close'].iloc[-1])
        if self.strategy == TradingStrategy.FIBONACCI:
            return self._fibonacci_analysis(df, symbol, current_price)
        elif self.strategy == TradingStrategy.ELLIOTT_WAVE:
            return self._elliott_wave_analysis(df, symbol, current_price)
        elif self.strategy == TradingStrategy.BREAKOUT:
            return self._breakout_analysis(df, symbol, current_price)
        elif self.strategy == TradingStrategy.MEAN_REVERSION:
            return self._mean_reversion_analysis(df, symbol, current_price)
        elif self.strategy == TradingStrategy.ADAPTIVE:
            return self._adaptive_analysis(df, symbol, current_price)
        else:
            return self._multi_indicator_analysis(df, symbol, current_price)

    # (Strategy method implementations are the same as earlier version; include them verbatim in your local copy.)
    # For brevity they are omitted here but should be present in the file you save:
    # _fibonacci_analysis, _elliott_wave_analysis, _breakout_analysis, _mean_reversion_analysis,
    # _adaptive_analysis, _multi_indicator_analysis, place_order, _update_positions_pnl, _close_position,
    # evaluate_positions, create_advanced_chart, display_signal_details, _show_final_summary

    def run_multi_symbol_analysis(self, run_once: bool = False):
        logger.info("Starting Multi-Symbol Trading Bot - Symbols: %s | Strategy: %s | Timeframe: %s", ", ".join(self.symbols), self.strategy.value, self.timeframe)
        chart_counter: Dict[str, int] = {s: 0 for s in self.symbols}
        total_iterations = 0
        try:
            while not self.stop_event.is_set():
                if self.max_iterations is not None and total_iterations >= self.max_iterations:
                    logger.info("Reached max iterations (%d), stopping.", self.max_iterations)
                    break
                for symbol in self.symbols:
                    if self.stop_event.is_set():
                        break
                    # Generate tick
                    price_data = self.generate_realistic_price(symbol)
                    mid_price = (price_data['bid'] + price_data['ask']) / 2.0
                    # Update the per-symbol incremental history with the new tick
                    self._update_history_with_tick(symbol, mid_price, price_data['timestamp'], volume=price_data['volume'])
                    # Use the incremental history for indicators and analysis
                    df_with_indicators = self.calculate_indicators(self.symbol_data[symbol]["history"])
                    signal = self.analyze_with_strategy(df_with_indicators, symbol)
                    # Update P&L for positions
                    self._update_positions_pnl(symbol, price_data['bid'])
                    # Evaluate position management (TP/SL)
                    self.evaluate_positions(price_data)
                    # Display status
                    self.display_signal_details(symbol, signal, price_data)
                    # Optionally place simulated order (example: confidence threshold)
                    if signal.signal in ("BUY", "SELL") and signal.confidence >= 70:
                        self.place_order(symbol, signal)
                    # Chart saving cadence
                    chart_counter[symbol] += 1
                    if chart_counter[symbol] >= self.chart_every:
                        self.create_advanced_chart(df_with_indicators, symbol, signal)
                        chart_counter[symbol] = 0
                    # Respect update interval
                    for _ in range(int(max(1, self.update_interval))):
                        if self.stop_event.is_set():
                            break
                        time.sleep(1)
                total_iterations += 1
                if run_once:
                    logger.info("run_once=True, finishing after a single loop.")
                    break
        except Exception as e:
            logger.exception("Unhandled exception in run loop: %s", e)
        finally:
            self.show_final_summary()


# ----------------------------
# Main execution (script)
# ----------------------------
if __name__ == "__main__":
    logger.info("=" * 80)
    logger.info("ENHANCED MULTI-STRATEGY TRADING BOT (Real-time)")
    logger.info("Available Strategies: %s", ", ".join([s.value for s in TradingStrategy]))
    # Configuration
    symbols = ["XAUUSD"]  # add more if desired
    strategy = TradingStrategy.ADAPTIVE
    # timeframe: 'tick' for tick-by-tick rows, otherwise 'M1','M5','H1',...
    bot = MultiStrategyTradingBot(
        symbols=symbols,
        strategy=strategy,
        timeframe="M1",
        seed_periods=200,
        update_interval=DEFAULT_UPDATE_INTERVAL,
        chart_every=DEFAULT_CHART_EVERY,
        account_balance=DEFAULT_ACCOUNT_BALANCE,
        risk_per_trade=DEFAULT_RISK_PER_TRADE,
        max_iterations=None
    )
    logger.info("Configuration: symbols=%s | strategy=%s | timeframe=%s | update_interval=%ds | chart_every=%d",
                symbols, strategy.value, bot.timeframe, bot.update_interval, bot.chart_every)
    logger.info("Starting in 3 seconds...")
    time.sleep(3)
    bot.run_multi_symbol_analysis(run_once=False)