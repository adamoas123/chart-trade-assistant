import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Copy, TrendingUp, TrendingDown, DollarSign, Target, Shield } from 'lucide-react';

interface TradeCalculation {
  riskAmount: number;
  pipValue: number;
  lotSize: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  breakevenPrice: number;
  expectedProfit: number;
}

interface FormData {
  tradeDirection: 'buy' | 'sell';
  currencyPair: string;
  entryPrice: string;
  accountSize: string;
  riskPercentage: string;
  riskRewardRatio: string;
  stopLossPips: string;
}

const PriceCalculator = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    tradeDirection: 'buy',
    currencyPair: 'EURUSD',
    entryPrice: '',
    accountSize: '',
    riskPercentage: '1',
    riskRewardRatio: '2',
    stopLossPips: '',
  });

  const [calculation, setCalculation] = useState<TradeCalculation | null>(null);
  const [editableRiskAmount, setEditableRiskAmount] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.currencyPair.trim()) {
      newErrors.currencyPair = 'Currency pair is required';
    }

    if (!formData.entryPrice || isNaN(Number(formData.entryPrice)) || Number(formData.entryPrice) <= 0) {
      newErrors.entryPrice = 'Valid entry price is required';
    }

    if (!formData.accountSize || isNaN(Number(formData.accountSize)) || Number(formData.accountSize) <= 0) {
      newErrors.accountSize = 'Valid account size is required';
    }

    if (!formData.riskPercentage || isNaN(Number(formData.riskPercentage)) || Number(formData.riskPercentage) <= 0) {
      newErrors.riskPercentage = 'Valid risk percentage is required';
    }

    if (!formData.riskRewardRatio || isNaN(Number(formData.riskRewardRatio)) || Number(formData.riskRewardRatio) <= 0) {
      newErrors.riskRewardRatio = 'Valid risk-reward ratio is required';
    }

    if (!formData.stopLossPips || isNaN(Number(formData.stopLossPips)) || Number(formData.stopLossPips) <= 0) {
      newErrors.stopLossPips = 'Valid stop loss in pips is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTrade = () => {
    if (!validateForm()) return;

    const entryPrice = Number(formData.entryPrice);
    const accountSize = Number(formData.accountSize);
    const riskPercentage = Number(formData.riskPercentage);
    const riskRewardRatio = Number(formData.riskRewardRatio);
    const stopLossPips = Number(formData.stopLossPips);

    // Calculate risk amount
    const riskAmount = (accountSize * riskPercentage) / 100;

    // Determine pip size based on currency pair
    const pipSize = formData.currencyPair.includes('JPY') ? 0.01 : 0.0001;

    // Calculate pip value and lot size
    const pipValue = riskAmount / stopLossPips;
    const lotSize = pipValue / (pipSize * 100000); // Standard lot = 100,000 units

    // Calculate prices
    const stopLossDistance = stopLossPips * pipSize;
    const takeProfitDistance = stopLossPips * riskRewardRatio * pipSize;

    let stopLossPrice: number;
    let takeProfitPrice: number;
    let breakevenPrice: number;

    if (formData.tradeDirection === 'buy') {
      stopLossPrice = entryPrice - stopLossDistance;
      takeProfitPrice = entryPrice + takeProfitDistance;
      breakevenPrice = entryPrice + (1 * pipSize); // Assuming 1 pip spread
    } else {
      stopLossPrice = entryPrice + stopLossDistance;
      takeProfitPrice = entryPrice - takeProfitDistance;
      breakevenPrice = entryPrice - (1 * pipSize); // Assuming 1 pip spread
    }

    const expectedProfit = riskAmount * riskRewardRatio;

    const result: TradeCalculation = {
      riskAmount,
      pipValue,
      lotSize,
      stopLossPrice,
      takeProfitPrice,
      breakevenPrice,
      expectedProfit,
    };

    setCalculation(result);
    setEditableRiskAmount(riskAmount.toFixed(2));
  };

  const handleRiskAmountChange = (newRiskAmount: string) => {
    setEditableRiskAmount(newRiskAmount);
    
    if (calculation && !isNaN(Number(newRiskAmount)) && Number(newRiskAmount) > 0) {
      const riskAmount = Number(newRiskAmount);
      const stopLossPips = Number(formData.stopLossPips);
      const riskRewardRatio = Number(formData.riskRewardRatio);
      
      const pipValue = riskAmount / stopLossPips;
      const pipSize = formData.currencyPair.includes('JPY') ? 0.01 : 0.0001;
      const lotSize = pipValue / (pipSize * 100000);
      const expectedProfit = riskAmount * riskRewardRatio;

      setCalculation({
        ...calculation,
        riskAmount,
        pipValue,
        lotSize,
        expectedProfit,
      });
    }
  };

  const copyToClipboard = async (value: number, label: string) => {
    const text = value.toFixed(5);
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-light mb-6 flex items-center justify-center gap-4 text-neon-cyan">
              <Calculator className="h-10 w-10" />
              PRICE CALCULATOR
            </h1>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm font-light tracking-wider uppercase">
              Risk Management System
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-gradient-card border border-border/50 rounded-lg p-6 backdrop-blur-sm">
              <div className="mb-6">
                <h2 className="text-lg font-light text-neon-cyan mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  PARAMETERS
                </h2>
                <div className="w-12 h-px bg-neon-cyan/50"></div>
              </div>
              <div className="space-y-8">
                {/* Trade Direction Toggle */}
                <div>
                  <Label className="text-xs font-light mb-4 block text-muted-foreground uppercase tracking-wider">Direction</Label>
                  <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
                    <button
                      onClick={() => setFormData({ ...formData, tradeDirection: 'buy' })}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-light transition-all duration-300 flex items-center justify-center gap-2 ${
                        formData.tradeDirection === 'buy' 
                          ? 'bg-success/20 text-success border border-success/30 shadow-glow' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4" />
                      LONG
                    </button>
                    <button
                      onClick={() => setFormData({ ...formData, tradeDirection: 'sell' })}
                      className={`flex-1 py-3 px-4 rounded-md text-sm font-light transition-all duration-300 flex items-center justify-center gap-2 ${
                        formData.tradeDirection === 'sell' 
                          ? 'bg-danger/20 text-danger border border-danger/30 shadow-glow' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <TrendingDown className="h-4 w-4" />
                      SHORT
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="currencyPair" className="text-xs font-light text-muted-foreground uppercase tracking-wider">Pair</Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>e.g., EURUSD, GBPJPY, USDJPY</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      id="currencyPair"
                      value={formData.currencyPair}
                      onChange={(e) => setFormData({ ...formData, currencyPair: e.target.value.toUpperCase() })}
                      placeholder="EURUSD"
                      className={`mt-2 bg-transparent border-border/30 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 font-mono text-sm ${errors.currencyPair ? 'border-danger' : ''}`}
                    />
                    {errors.currencyPair && <p className="text-danger text-xs mt-1 font-light">{errors.currencyPair}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="entryPrice" className="text-xs font-light text-muted-foreground uppercase tracking-wider">Entry Price</Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your planned entry price for the trade</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      id="entryPrice"
                      type="number"
                      step="0.00001"
                      value={formData.entryPrice}
                      onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                      placeholder="1.12345"
                      className={`mt-2 bg-transparent border-border/30 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 font-mono text-sm ${errors.entryPrice ? 'border-danger' : ''}`}
                    />
                    {errors.entryPrice && <p className="text-danger text-xs mt-1 font-light">{errors.entryPrice}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="accountSize" className="text-xs font-light text-muted-foreground uppercase tracking-wider">Account Size</Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your total trading capital</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      id="accountSize"
                      type="number"
                      value={formData.accountSize}
                      onChange={(e) => setFormData({ ...formData, accountSize: e.target.value })}
                      placeholder="10000"
                      className={`mt-2 bg-transparent border-border/30 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 font-mono text-sm ${errors.accountSize ? 'border-danger' : ''}`}
                    />
                    {errors.accountSize && <p className="text-danger text-xs mt-1 font-light">{errors.accountSize}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="riskPercentage" className="text-xs font-light text-muted-foreground uppercase tracking-wider">Risk %</Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Percentage of account to risk (e.g., 1 for 1%)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      id="riskPercentage"
                      type="number"
                      step="0.1"
                      value={formData.riskPercentage}
                      onChange={(e) => setFormData({ ...formData, riskPercentage: e.target.value })}
                      placeholder="1"
                      className={`mt-2 bg-transparent border-border/30 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 font-mono text-sm ${errors.riskPercentage ? 'border-danger' : ''}`}
                    />
                    {errors.riskPercentage && <p className="text-danger text-xs mt-1 font-light">{errors.riskPercentage}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="riskRewardRatio" className="text-xs font-light text-muted-foreground uppercase tracking-wider">R:R Ratio</Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Risk-to-reward ratio (e.g., 2 for 1:2 ratio)</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      id="riskRewardRatio"
                      type="number"
                      step="0.1"
                      value={formData.riskRewardRatio}
                      onChange={(e) => setFormData({ ...formData, riskRewardRatio: e.target.value })}
                      placeholder="2"
                      className={`mt-2 bg-transparent border-border/30 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 font-mono text-sm ${errors.riskRewardRatio ? 'border-danger' : ''}`}
                    />
                    {errors.riskRewardRatio && <p className="text-danger text-xs mt-1 font-light">{errors.riskRewardRatio}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="stopLossPips" className="text-xs font-light text-muted-foreground uppercase tracking-wider">Stop Loss</Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Distance in pips from entry to stop loss</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      id="stopLossPips"
                      type="number"
                      value={formData.stopLossPips}
                      onChange={(e) => setFormData({ ...formData, stopLossPips: e.target.value })}
                      placeholder="50"
                      className={`mt-2 bg-transparent border-border/30 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 font-mono text-sm ${errors.stopLossPips ? 'border-danger' : ''}`}
                    />
                    {errors.stopLossPips && <p className="text-danger text-xs mt-1 font-light">{errors.stopLossPips}</p>}
                  </div>
                </div>

                <button 
                  onClick={calculateTrade} 
                  className="w-full py-4 bg-gradient-to-r from-neon-cyan/20 to-neon-cyan/10 border border-neon-cyan/30 rounded-lg text-neon-cyan hover:from-neon-cyan/30 hover:to-neon-cyan/20 hover:shadow-neon transition-all duration-300 flex items-center justify-center gap-3 font-light tracking-wider uppercase"
                >
                  <Calculator className="h-4 w-4" />
                  Analyze
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {calculation && (
                <>
                  <div className="bg-gradient-card border border-border/50 rounded-lg p-6 backdrop-blur-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-light text-neon-cyan mb-2 flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        METRICS
                      </h2>
                      <div className="w-12 h-px bg-neon-cyan/50"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Risk Amount</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editableRiskAmount}
                            onChange={(e) => handleRiskAmountChange(e.target.value)}
                            className="mt-2 bg-transparent border-border/30 focus:border-neon-cyan/50 focus:ring-neon-cyan/20 font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Pip Value</Label>
                          <div className="mt-2 p-3 bg-muted/30 border border-border/30 rounded-md font-mono text-sm">
                            ${calculation.pipValue.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Lot Size</Label>
                          <div className="mt-2 p-3 bg-muted/30 border border-border/30 rounded-md font-mono text-sm">
                            {calculation.lotSize.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Expected Profit</Label>
                          <div className="mt-2 p-3 bg-success/10 border border-success/30 rounded-md font-mono text-sm text-success">
                            ${calculation.expectedProfit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-card border border-border/50 rounded-lg p-6 backdrop-blur-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-light text-neon-cyan mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        LEVELS
                      </h2>
                      <div className="w-12 h-px bg-neon-cyan/50"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-danger/5 border border-danger/20 rounded-lg backdrop-blur-sm">
                          <div>
                            <Label className="text-xs font-light text-danger uppercase tracking-wider">Stop Loss</Label>
                            <div className="font-mono text-xl text-danger mt-1">{calculation.stopLossPrice.toFixed(5)}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(calculation.stopLossPrice, 'Stop Loss')}
                            className="p-2 bg-danger/10 border border-danger/30 rounded-md text-danger hover:bg-danger/20 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/10 border border-border/20 rounded-lg backdrop-blur-sm">
                          <div>
                            <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Breakeven</Label>
                            <div className="font-mono text-xl text-foreground mt-1">{calculation.breakevenPrice.toFixed(5)}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(calculation.breakevenPrice, 'Breakeven')}
                            className="p-2 bg-muted/20 border border-border/30 rounded-md text-muted-foreground hover:bg-muted/30 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg backdrop-blur-sm">
                          <div>
                            <Label className="text-xs font-light text-success uppercase tracking-wider">Take Profit</Label>
                            <div className="font-mono text-xl text-success mt-1">{calculation.takeProfitPrice.toFixed(5)}</div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(calculation.takeProfitPrice, 'Take Profit')}
                            className="p-2 bg-success/10 border border-success/30 rounded-md text-success hover:bg-success/20 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Risk/Reward Visual */}
                      <div className="mt-8">
                        <Label className="mb-4 block text-xs font-light text-muted-foreground uppercase tracking-wider">Risk/Reward Ratio</Label>
                        <div className="flex h-8 rounded-lg overflow-hidden bg-muted/20 border border-border/30">
                          <div className="bg-gradient-to-r from-danger/60 to-danger/40 flex-1 flex items-center justify-center text-danger text-xs font-light tracking-wider">
                            RISK: 1
                          </div>
                          <div 
                            className="bg-gradient-to-r from-success/60 to-success/40 flex items-center justify-center text-success text-xs font-light tracking-wider"
                            style={{ flex: Number(formData.riskRewardRatio) }}
                          >
                            REWARD: {formData.riskRewardRatio}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!calculation && (
                <div className="bg-gradient-card border border-border/50 rounded-lg p-12 backdrop-blur-sm">
                  <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <div className="text-center">
                      <Calculator className="h-16 w-16 mx-auto mb-6 opacity-30" />
                      <p className="font-light tracking-wide">Awaiting parameters...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PriceCalculator;