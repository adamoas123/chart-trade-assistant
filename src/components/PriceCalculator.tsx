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
  const [editableStopLoss, setEditableStopLoss] = useState<string>('');
  const [editableTakeProfit, setEditableTakeProfit] = useState<string>('');
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
    setEditableStopLoss(stopLossPrice.toFixed(5));
    setEditableTakeProfit(takeProfitPrice.toFixed(5));
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

  const handleStopLossChange = (newStopLoss: string) => {
    setEditableStopLoss(newStopLoss);
    
    if (calculation && !isNaN(Number(newStopLoss)) && Number(newStopLoss) > 0 && formData.entryPrice) {
      const stopLossPrice = Number(newStopLoss);
      const entryPrice = Number(formData.entryPrice);
      const pipSize = formData.currencyPair.includes('JPY') ? 0.01 : 0.0001;
      
      // Calculate new stop loss pips based on the price difference
      let stopLossPips: number;
      if (formData.tradeDirection === 'buy') {
        stopLossPips = (entryPrice - stopLossPrice) / pipSize;
      } else {
        stopLossPips = (stopLossPrice - entryPrice) / pipSize;
      }
      
      if (stopLossPips > 0) {
        // Keep lot size consistent and recalculate risk amount
        const lotSize = calculation.lotSize;
        const pipValue = lotSize * (pipSize * 100000);
        const newRiskAmount = pipValue * stopLossPips;
        const riskRewardRatio = Number(formData.riskRewardRatio);
        const expectedProfit = newRiskAmount * riskRewardRatio;
        
        setCalculation({
          ...calculation,
          stopLossPrice,
          pipValue,
          riskAmount: newRiskAmount,
          expectedProfit,
        });
        
        // Update the editable risk amount and form data
        setEditableRiskAmount(newRiskAmount.toFixed(2));
        setFormData({ ...formData, stopLossPips: stopLossPips.toString() });
      }
    }
  };

  const handleTakeProfitChange = (newTakeProfit: string) => {
    setEditableTakeProfit(newTakeProfit);
    
    if (calculation && !isNaN(Number(newTakeProfit)) && Number(newTakeProfit) > 0 && formData.entryPrice) {
      const takeProfitPrice = Number(newTakeProfit);
      const entryPrice = Number(formData.entryPrice);
      const pipSize = formData.currencyPair.includes('JPY') ? 0.01 : 0.0001;
      const stopLossPips = Number(formData.stopLossPips);
      
      // Calculate new take profit pips based on the price difference
      let takeProfitPips: number;
      if (formData.tradeDirection === 'buy') {
        takeProfitPips = (takeProfitPrice - entryPrice) / pipSize;
      } else {
        takeProfitPips = (entryPrice - takeProfitPrice) / pipSize;
      }
      
      if (takeProfitPips > 0) {
        // Calculate new risk/reward ratio and expected profit
        const newRiskRewardRatio = takeProfitPips / stopLossPips;
        const expectedProfit = calculation.riskAmount * newRiskRewardRatio;
        
        setCalculation({
          ...calculation,
          takeProfitPrice,
          expectedProfit,
        });
        
        // Update the form data to reflect the new risk/reward ratio
        setFormData({ ...formData, riskRewardRatio: newRiskRewardRatio.toFixed(2) });
      }
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
      <div className="min-h-screen bg-background p-4 relative overflow-hidden">
        {/* Background Eyes */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Left Eye - Looking Up */}
          <div className="absolute top-20 left-16 opacity-10">
            <div className="relative w-12 h-8 bg-foreground/20 rounded-full">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-foreground/30 rounded-full animate-pulse">
                <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground/60 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Right Eye - Looking Down */}
          <div className="absolute bottom-32 right-20 opacity-10">
            <div className="relative w-12 h-8 bg-foreground/20 rounded-full">
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-foreground/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}>
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground/60 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Additional smaller eyes for ambiance */}
          <div className="absolute top-1/3 right-8 opacity-5">
            <div className="relative w-8 h-6 bg-foreground/20 rounded-full">
              <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-foreground/30 rounded-full"></div>
            </div>
          </div>
          
          <div className="absolute bottom-1/4 left-8 opacity-5">
            <div className="relative w-8 h-6 bg-foreground/20 rounded-full">
              <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-foreground/30 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light mb-4 flex items-center justify-center gap-3 text-foreground">
              <Calculator className="h-7 w-7" />
              PRICE CALCULATOR
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto mb-3"></div>
            <p className="text-muted-foreground text-xs font-light tracking-wider uppercase">
              Risk Management System
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="bg-gradient-card border border-border/50 rounded-lg p-4">
              <div className="mb-4">
                <h2 className="text-sm font-light text-foreground mb-1 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  PARAMETERS
                </h2>
                <div className="w-8 h-px bg-border"></div>
              </div>
              <div className="space-y-4">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={`mt-2 bg-transparent border-border/30 focus:border-foreground/30 focus:ring-foreground/10 font-mono text-sm ${errors.currencyPair ? 'border-danger' : ''}`}
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
                      className={`mt-2 bg-transparent border-border/30 focus:border-foreground/30 focus:ring-foreground/10 font-mono text-sm ${errors.entryPrice ? 'border-danger' : ''}`}
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
                      className={`mt-2 bg-transparent border-border/30 focus:border-foreground/30 focus:ring-foreground/10 font-mono text-sm ${errors.accountSize ? 'border-danger' : ''}`}
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
                      className={`mt-2 bg-transparent border-border/30 focus:border-foreground/30 focus:ring-foreground/10 font-mono text-sm ${errors.riskPercentage ? 'border-danger' : ''}`}
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
                      className={`mt-2 bg-transparent border-border/30 focus:border-foreground/30 focus:ring-foreground/10 font-mono text-sm ${errors.riskRewardRatio ? 'border-danger' : ''}`}
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
                      className={`mt-2 bg-transparent border-border/30 focus:border-foreground/30 focus:ring-foreground/10 font-mono text-sm ${errors.stopLossPips ? 'border-danger' : ''}`}
                    />
                    {errors.stopLossPips && <p className="text-danger text-xs mt-1 font-light">{errors.stopLossPips}</p>}
                  </div>
                </div>

                <button 
                  onClick={calculateTrade} 
                  className="w-full py-3 bg-gradient-to-r from-accent/40 to-accent/20 border border-border/50 rounded-lg text-foreground hover:from-accent/50 hover:to-accent/30 hover:shadow-elegant transition-all duration-300 flex items-center justify-center gap-2 font-light tracking-wider uppercase text-sm"
                >
                  <Calculator className="h-3 w-3" />
                  Analyze
                </button>

                {/* TP Levels Table */}
                {calculation && (
                  <div className="mt-4 bg-gradient-card border border-border/50 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="text-xs font-light text-foreground mb-1 flex items-center gap-2 uppercase tracking-wider">
                        <Target className="h-3 w-3" />
                        Take Profit Levels
                      </h3>
                      <div className="w-8 h-px bg-border"></div>
                    </div>
                    <div className="space-y-2">
                      {(() => {
                        const entryPrice = Number(formData.entryPrice);
                        const takeProfitPrice = calculation.takeProfitPrice;
                        const totalDistance = Math.abs(takeProfitPrice - entryPrice);
                        const tp1Distance = totalDistance * 0.33;
                        const tp2Distance = totalDistance * 0.66;
                        const tp3Distance = totalDistance;

                        let tp1Price, tp2Price, tp3Price;
                        if (formData.tradeDirection === 'buy') {
                          tp1Price = entryPrice + tp1Distance;
                          tp2Price = entryPrice + tp2Distance;
                          tp3Price = entryPrice + tp3Distance;
                        } else {
                          tp1Price = entryPrice - tp1Distance;
                          tp2Price = entryPrice - tp2Distance;
                          tp3Price = entryPrice - tp3Distance;
                        }

                        return [
                          { label: 'TP1 (33%)', price: tp1Price },
                          { label: 'TP2 (66%)', price: tp2Price },
                          { label: 'TP3 (100%)', price: tp3Price }
                        ].map((tp, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                            <div className="flex-1">
                              <div className="text-xs font-light text-success uppercase tracking-wider">{tp.label}</div>
                              <div className="font-mono text-lg text-success mt-1">{tp.price.toFixed(5)}</div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(tp.price, tp.label)}
                              className="p-2 bg-success/10 border border-success/30 rounded-md text-success hover:bg-success/20 transition-colors"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {calculation && (
                 <>
                    <div className="bg-gradient-card border border-border/50 rounded-lg p-4">
                     <div className="mb-3">
                       <h2 className="text-sm font-light text-foreground mb-1 flex items-center gap-2">
                         <DollarSign className="h-3 w-3" />
                         METRICS
                       </h2>
                       <div className="w-8 h-px bg-border"></div>
                     </div>
                     <div className="space-y-3">
                       <div className="grid grid-cols-2 gap-3">
                         <div>
                           <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Risk Amount</Label>
                           <Input
                             type="number"
                             step="0.01"
                             value={editableRiskAmount}
                             onChange={(e) => handleRiskAmountChange(e.target.value)}
                             className="mt-1 bg-transparent border-border/30 focus:border-foreground/30 focus:ring-foreground/10 font-mono text-sm h-8"
                           />
                         </div>
                         <div>
                           <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Pip Value</Label>
                           <div className="mt-1 p-2 bg-muted/30 border border-border/30 rounded-md font-mono text-sm h-8 flex items-center">
                             ${calculation.pipValue.toFixed(2)}
                           </div>
                         </div>
                         <div>
                           <Label className="text-xs font-light text-foreground uppercase tracking-wider">Lot Size</Label>
                           <div className="mt-1 p-2 bg-accent/20 border border-border/50 rounded-md font-mono text-sm text-foreground h-8 flex items-center">
                             {calculation.lotSize.toFixed(2)}
                           </div>
                         </div>
                         <div>
                           <Label className="text-xs font-light text-muted-foreground uppercase tracking-wider">Expected Profit</Label>
                           <div className="mt-1 p-2 bg-success/10 border border-success/30 rounded-md font-mono text-sm text-success h-8 flex items-center">
                             ${calculation.expectedProfit.toFixed(2)}
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="bg-gradient-card border border-border/50 rounded-lg p-4">
                     <div className="mb-3">
                       <h2 className="text-sm font-light text-foreground mb-1 flex items-center gap-2">
                         <Target className="h-3 w-3" />
                         LEVELS
                       </h2>
                       <div className="w-8 h-px bg-border"></div>
                     </div>
                     <div className="space-y-3">
                       <div className="space-y-2">
                        <div className="flex items-center justify-between p-4 bg-danger/5 border border-danger/20 rounded-lg">
                          <div className="flex-1 mr-4">
                            <Label className="text-xs font-light text-danger uppercase tracking-wider">Stop Loss</Label>
                            <Input
                              type="number"
                              step="0.00001"
                              value={editableStopLoss}
                              onChange={(e) => handleStopLossChange(e.target.value)}
                              className="mt-2 bg-transparent border-danger/30 focus:border-danger/50 focus:ring-danger/20 font-mono text-lg text-danger"
                            />
                            <p className="text-xs text-danger/70 mt-1">Pips: {formData.stopLossPips}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(calculation.stopLossPrice, 'Stop Loss')}
                            className="p-2 bg-danger/10 border border-danger/30 rounded-md text-danger hover:bg-danger/20 transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/10 border border-border/20 rounded-lg">
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

                        <div className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg">
                          <div className="flex-1 mr-4">
                            <Label className="text-xs font-light text-success uppercase tracking-wider">Take Profit</Label>
                            <Input
                              type="number"
                              step="0.00001"
                              value={editableTakeProfit}
                              onChange={(e) => handleTakeProfitChange(e.target.value)}
                              className="mt-2 bg-transparent border-success/30 focus:border-success/50 focus:ring-success/20 font-mono text-lg text-success"
                            />
                            <p className="text-xs text-success/70 mt-1">R:R: {formData.riskRewardRatio}</p>
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
                <div className="bg-gradient-card border border-border/50 rounded-lg p-8">
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <div className="text-center">
                      {/* Animated Eyes Looking Left and Right */}
                      <div className="flex items-center justify-center gap-4 mb-4">
                        {/* Left Eye */}
                        <div className="relative w-16 h-12 bg-foreground/10 rounded-full border border-foreground/20">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-foreground/30 rounded-full transition-transform duration-1000 animate-[slide-left-right_2s_ease-in-out_infinite]">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-foreground/60 rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* Right Eye */}
                        <div className="relative w-16 h-12 bg-foreground/10 rounded-full border border-foreground/20">
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-foreground/30 rounded-full transition-transform duration-1000 animate-[slide-left-right_2s_ease-in-out_infinite]">
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-foreground/60 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Hungry Mouth with Sharp Teeth and Tongue */}
                      <div className="relative w-24 h-16 mx-auto mb-4">
                        {/* Mouth opening */}
                        <div className="absolute inset-0 bg-red-900/80 rounded-full border-2 border-red-700/60 animate-[mouth-hungry_1.5s_ease-in-out_infinite] overflow-hidden">
                          {/* Inner mouth darkness */}
                          <div className="absolute inset-1 bg-black/60 rounded-full"></div>
                          
                          {/* Animated Tongue */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-6 bg-pink-400 rounded-t-full animate-[tongue-wiggle_1s_ease-in-out_infinite] border border-pink-300">
                            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-pink-300 rounded-full"></div>
                          </div>
                          
                          {/* Sharp Teeth */}
                          <div className="absolute top-1 left-3 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-white animate-pulse"></div>
                          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-5 border-transparent border-b-white animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="absolute top-1 right-3 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-white animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          
                          {/* Bottom teeth */}
                          <div className="absolute bottom-1 left-4 w-0 h-0 border-l-1 border-r-1 border-t-3 border-transparent border-t-white/90"></div>
                          <div className="absolute bottom-1 right-4 w-0 h-0 border-l-1 border-r-1 border-t-3 border-transparent border-t-white/90"></div>
                        </div>
                        
                        {/* Drool animation */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-blue-200/40 to-blue-300/60 rounded-full animate-[drool-drop_2s_ease-in-out_infinite]"></div>
                      </div>
                      
                      <p className="font-light tracking-wide text-sm opacity-60">Awaiting parameters...</p>
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