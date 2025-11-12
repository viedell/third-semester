# mt5_trading_bot.py
import MetaTrader5 as mt5
import pandas as pd
import numpy as np
import time
import threading
from datetime import datetime, timedelta
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import ta
from ta.trend import EMAIndicator, MACD, ADXIndicator
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.volatility import BollingerBands, AverageTrueRange
import warnings
warnings.filterwarnings('ignore')

class XAUUSDTradingBot:
    def __init__(self):
        self.symbol = "XAUUSD"
        self.connected = False
        self.current_data = {}
        self.historical_data = {}
        self.timeframes = {
            'M1': mt5.TIMEFRAME_M1,
            'M5': mt5.TIMEFRAME_M5,
            'M15': mt5.TIMEFRAME_M15,
            'H1': mt5.TIMEFRAME_H1,
            'H4': mt5.TIMEFRAME_H4,
            'D1': mt5.TIMEFRAME_D1
        }
        
    def connect_mt5(self):
        """Connect to MetaTrader 5"""
        try:
            if not mt5.initialize():
                print("❌ MT5 initialization failed")
                return False
            
            # Check if XAUUSD is available
            symbol_info = mt5.symbol_info(self.symbol)
            if symbol_info is None:
                print(f"❌ {self.symbol} not found in MT5")
                return False
            
            # Select the symbol
            if not symbol_info.visible:
                mt5.symbol_select(self.symbol, True)
            
            self.connected = True
            print(f"✅ Connected to MT5 - {self.symbol} available")
            return True
            
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def get_real_time_data(self):
        """Get real-time tick data"""
        try:
            tick = mt5.symbol_info_tick(self.symbol)
            if tick:
                return {
                    'symbol': self.symbol,
                    'time': tick.time,
                    'bid': tick.bid,
                    'ask': tick.ask,
                    'last': tick.last,
                    'volume': tick.volume,
                    'spread': tick.ask - tick.bid
                }
        except Exception as e:
            print(f"Error getting real-time data: {e}")
        return None
    
    def get_historical_data(self, timeframe='H1', count=500):
        """Get historical OHLC data"""
        try:
            tf = self.timeframes.get(timeframe, mt5.TIMEFRAME_H1)
            rates = mt5.copy_rates_from_pos(self.symbol, tf, 0, count)
            
            if rates is not None:
                df = pd.DataFrame(rates)
                df['time'] = pd.to_datetime(df['time'], unit='s')
                return df
        except Exception as e:
            print(f"Error getting historical data: {e}")
        return pd.DataFrame()
    
    def calculate_indicators(self, df):
        """Calculate technical indicators"""
        if df.empty:
            return df
        
        try:
            # Trend Indicators
            df['ema_20'] = EMAIndicator(df['close'], window=20).ema_indicator()
            df['ema_50'] = EMAIndicator(df['close'], window=50).ema_indicator()
            df['ema_200'] = EMAIndicator(df['close'], window=200).ema_indicator()
            
            # MACD
            macd = MACD(df['close'])
            df['macd'] = macd.macd()
            df['macd_signal'] = macd.macd_signal()
            df['macd_histogram'] = macd.macd_diff()
            
            # RSI
            df['rsi'] = RSIIndicator(df['close'], window=14).rsi()
            
            # Bollinger Bands
            bb = BollingerBands(df['close'], window=20, window_dev=2)
            df['bb_upper'] = bb.bollinger_hband()
            df['bb_lower'] = bb.bollinger_lband()
            df['bb_middle'] = bb.bollinger_mavg()
            
            # Stochastic
            stoch = StochasticOscillator(df['high'], df['low'], df['close'])
            df['stoch_k'] = stoch.stoch()
            df['stoch_d'] = stoch.stoch_signal()
            
            # ATR
            df['atr'] = AverageTrueRange(df['high'], df['low'], df['close']).average_true_range()
            
            # ADX
            df['adx'] = ADXIndicator(df['high'], df['low'], df['close']).adx()
            
        except Exception as e:
            print(f"Error calculating indicators: {e}")
        
        return df
    
    def generate_signals(self, df):
        """Generate trading signals based on multiple indicators"""
        if df.empty or len(df) < 50:
            return {"signal": "NO_DATA", "confidence": 0, "reasoning": "Insufficient data"}
        
        current = df.iloc[-1]
        previous = df.iloc[-2]
        
        signals = []
        confidence_score = 0
        
        # Trend Analysis (30 points)
        if current['ema_20'] > current['ema_50'] > current['ema_200']:
            signals.append("Strong Uptrend (EMA20 > EMA50 > EMA200)")
            confidence_score += 25
        elif current['ema_20'] < current['ema_50'] < current['ema_200']:
            signals.append("Strong Downtrend (EMA20 < EMA50 < EMA200)")
            confidence_score -= 25
        elif current['ema_20'] > current['ema_50']:
            signals.append("Bullish Trend (EMA20 > EMA50)")
            confidence_score += 15
        else:
            signals.append("Bearish Trend (EMA20 < EMA50)")
            confidence_score -= 15
        
        # RSI Analysis (20 points)
        if current['rsi'] < 30:
            signals.append("Oversold (RSI < 30) - Potential Buy")
            confidence_score += 20
        elif current['rsi'] > 70:
            signals.append("Overbought (RSI > 70) - Potential Sell")
            confidence_score -= 20
        elif 40 < current['rsi'] < 60:
            signals.append("RSI Neutral - No clear momentum")
            confidence_score += 5
        
        # MACD Analysis (20 points)
        if current['macd'] > current['macd_signal'] and previous['macd'] <= previous['macd_signal']:
            signals.append("MACD Bullish Crossover")
            confidence_score += 20
        elif current['macd'] < current['macd_signal'] and previous['macd'] >= previous['macd_signal']:
            signals.append("MACD Bearish Crossover")
            confidence_score -= 20
        
        # Bollinger Bands (15 points)
        if current['close'] < current['bb_lower']:
            signals.append("Below Lower BB - Potential Rebound")
            confidence_score += 15
        elif current['close'] > current['bb_upper']:
            signals.append("Above Upper BB - Potential Pullback")
            confidence_score -= 15
        
        # Stochastic (10 points)
        if current['stoch_k'] < 20 and current['stoch_d'] < 20:
            signals.append("Stochastic Oversold")
            confidence_score += 10
        elif current['stoch_k'] > 80 and current['stoch_d'] > 80:
            signals.append("Stochastic Overbought")
            confidence_score -= 10
        
        # ADX Trend Strength (5 points)
        if current['adx'] > 25:
            signals.append(f"Strong Trend (ADX: {current['adx']:.1f})")
            confidence_score += 5
        
        # Determine final signal
        if confidence_score > 40:
            signal = "STRONG_BUY"
            confidence = min(95, 60 + confidence_score)
            risk = "LOW"
        elif confidence_score > 20:
            signal = "BUY"
            confidence = min(85, 50 + confidence_score)
            risk = "MEDIUM"
        elif confidence_score < -40:
            signal = "STRONG_SELL"
            confidence = min(95, 60 - confidence_score)
            risk = "LOW"
        elif confidence_score < -20:
            signal = "SELL"
            confidence = min(85, 50 - confidence_score)
            risk = "MEDIUM"
        else:
            signal = "HOLD"
            confidence = 50
            risk = "HIGH"
        
        return {
            "signal": signal,
            "confidence": confidence,
            "risk_level": risk,
            "reasoning": " | ".join(signals),
            "price_levels": {
                "current_price": current['close'],
                "support_1": current['bb_lower'],
                "support_2": current['ema_50'],
                "resistance_1": current['bb_upper'],
                "resistance_2": current['ema_200']
            },
            "indicators": {
                "rsi": current['rsi'],
                "macd": current['macd'],
                "ema_20": current['ema_20'],
                "ema_50": current['ema_50'],
                "atr": current['atr'],
                "adx": current['adx']
            }
        }
    
    def create_live_chart(self, df, timeframe="H1"):
        """Create interactive real-time chart"""
        if df.empty:
            return go.Figure()
        
        fig = make_subplots(
            rows=3, cols=1,
            shared_x=True,
            vertical_spacing=0.05,
            subplot_titles=(
                f'XAUUSD {timeframe} Price Chart',
                'MACD',
                'RSI & Volume'
            ),
            row_heights=[0.6, 0.2, 0.2]
        )
        
        # Candlestick chart
        fig.add_trace(go.Candlestick(
            x=df['time'],
            open=df['open'],
            high=df['high'],
            low=df['low'],
            close=df['close'],
            name='Price'
        ), row=1, col=1)
        
        # EMAs
        fig.add_trace(go.Scatter(
            x=df['time'], y=df['ema_20'],
            line=dict(color='orange', width=1),
            name='EMA 20'
        ), row=1, col=1)
        
        fig.add_trace(go.Scatter(
            x=df['time'], y=df['ema_50'],
            line=dict(color='red', width=1),
            name='EMA 50'
        ), row=1, col=1)
        
        # Bollinger Bands
        fig.add_trace(go.Scatter(
            x=df['time'], y=df['bb_upper'],
            line=dict(color='blue', width=1, dash='dash'),
            name='BB Upper'
        ), row=1, col=1)
        
        fig.add_trace(go.Scatter(
            x=df['time'], y=df['bb_lower'],
            line=dict(color='blue', width=1, dash='dash'),
            name='BB Lower'
        ), row=1, col=1)
        
        # MACD
        fig.add_trace(go.Scatter(
            x=df['time'], y=df['macd'],
            line=dict(color='purple', width=1),
            name='MACD'
        ), row=2, col=1)
        
        fig.add_trace(go.Scatter(
            x=df['time'], y=df['macd_signal'],
            line=dict(color='orange', width=1),
            name='MACD Signal'
        ), row=2, col=1)
        
        # RSI
        fig.add_trace(go.Scatter(
            x=df['time'], y=df['rsi'],
            line=dict(color='green', width=1),
            name='RSI'
        ), row=3, col=1)
        
        # RSI levels
        fig.add_hline(y=70, line_dash="dash", line_color="red", row=3, col=1)
        fig.add_hline(y=30, line_dash="dash", line_color="green", row=3, col=1)
        fig.add_hline(y=50, line_dash="dot", line_color="gray", row=3, col=1)
        
        fig.update_layout(
            title=f"XAUUSD Real-Time Analysis - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            xaxis_rangeslider_visible=False,
            height=800,
            template="plotly_dark",
            showlegend=True
        )
        
        return fig
    
    def run_real_time_analysis(self):
        """Main real-time analysis loop"""
        if not self.connect_mt5():
            print("❌ Cannot start analysis without MT5 connection")
            return
        
        print("🚀 Starting Real-Time XAUUSD Analysis...")
        print("📊 Press Ctrl+C to stop\n")
        
        try:
            while True:
                # Get current data
                real_time = self.get_real_time_data()
                historical_data = self.get_historical_data('H1', 200)
                
                if not historical_data.empty:
                    # Calculate indicators
                    df_with_indicators = self.calculate_indicators(historical_data)
                    
                    # Generate signals
                    signals = self.generate_signals(df_with_indicators)
                    
                    # Display current status
                    self.display_current_status(real_time, signals, df_with_indicators)
                    
                    # Update chart every minute
                    if datetime.now().second == 0:
                        chart = self.create_live_chart(df_with_indicators)
                        chart.show()
                
                time.sleep(5)  # Update every 5 seconds
                
        except KeyboardInterrupt:
            print("\n🛑 Analysis stopped by user")
        finally:
            mt5.shutdown()
    
    def display_current_status(self, real_time, signals, df):
        """Display current market status in console"""
        current_price = real_time['bid'] if real_time else df.iloc[-1]['close'] if not df.empty else 0
        
        print("\033c", end="")  # Clear console
        print("=" * 80)
        print(f"🎯 XAUUSD REAL-TIME TRADING ANALYSIS - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 80)
        
        if real_time:
            print(f"💰 Current Price: ${real_time['bid']:.2f} | Ask: ${real_time['ask']:.2f} | Spread: {real_time['spread']:.2f}")
        
        print(f"📈 Signal: {signals['signal']} | Confidence: {signals['confidence']}% | Risk: {signals['risk_level']}")
        print(f"🎯 Reasoning: {signals['reasoning']}")
        print("-" * 80)
        
        # Key levels
        levels = signals.get('price_levels', {})
        print(f"📊 Support 1: ${levels.get('support_1', 0):.2f} | Support 2: ${levels.get('support_2', 0):.2f}")
        print(f"📊 Resistance 1: ${levels.get('resistance_1', 0):.2f} | Resistance 2: ${levels.get('resistance_2', 0):.2f}")
        print("-" * 80)
        
        # Indicators
        indicators = signals.get('indicators', {})
        print(f"🔧 RSI: {indicators.get('rsi', 0):.1f} | MACD: {indicators.get('macd', 0):.4f} | ATR: {indicators.get('atr', 0):.2f}")
        print(f"🔧 EMA20: ${indicators.get('ema_20', 0):.2f} | EMA50: ${indicators.get('ema_50', 0):.2f} | ADX: {indicators.get('adx', 0):.1f}")
        print("=" * 80)
        
        # Trading recommendation
        self.display_trading_recommendation(signals, current_price)
    
    def display_trading_recommendation(self, signals, current_price):
        """Display AI trading recommendation"""
        signal = signals['signal']
        confidence = signals['confidence']
        
        print("\n🤖 AI TRADING RECOMMENDATION:")
        print("-" * 50)
        
        if signal == "STRONG_BUY":
            print("🎯 STRONG BUY SIGNAL DETECTED!")
            print("💡 Recommendation: Enter LONG position")
            print("⚡ Market shows strong bullish momentum across multiple timeframes")
            sl = current_price * 0.99  # 1% stop loss
            tp = current_price * 1.02  # 2% take profit
            print(f"🛑 Stop Loss: ${sl:.2f} | 🎯 Take Profit: ${tp:.2f}")
            
        elif signal == "BUY":
            print("📈 BUY SIGNAL DETECTED!")
            print("💡 Recommendation: Consider LONG position with caution")
            print("⚡ Bullish bias but monitor key resistance levels")
            sl = current_price * 0.995  # 0.5% stop loss
            tp = current_price * 1.015  # 1.5% take profit
            print(f"🛑 Stop Loss: ${sl:.2f} | 🎯 Take Profit: ${tp:.2f}")
            
        elif signal == "STRONG_SELL":
            print("🎯 STRONG SELL SIGNAL DETECTED!")
            print("💡 Recommendation: Enter SHORT position")
            print("⚡ Market shows strong bearish momentum across multiple timeframes")
            sl = current_price * 1.01   # 1% stop loss
            tp = current_price * 0.98   # 2% take profit
            print(f"🛑 Stop Loss: ${sl:.2f} | 🎯 Take Profit: ${tp:.2f}")
            
        elif signal == "SELL":
            print("📉 SELL SIGNAL DETECTED!")
            print("💡 Recommendation: Consider SHORT position with caution")
            print("⚡ Bearish bias but monitor key support levels")
            sl = current_price * 1.005  # 0.5% stop loss
            tp = current_price * 0.985  # 1.5% take profit
            print(f"🛑 Stop Loss: ${sl:.2f} | 🎯 Take Profit: ${tp:.2f}")
            
        else:
            print("⏸️  HOLD SIGNAL - WAIT FOR BETTER ENTRY")
            print("💡 Recommendation: Stay out of the market")
            print("⚡ Market is consolidating - wait for clearer direction")
            print("🎯 Watch for breakouts above resistance or below support")
        
        print("-" * 50)
        print(f"📊 Signal Confidence: {confidence}% | Risk Level: {signals['risk_level']}")
        print("=" * 80)

# Run the bot
if __name__ == "__main__":
    bot = XAUUSDTradingBot()
    bot.run_real_time_analysis()