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
    try {
      await navigator.clipboard.writeText(value.toFixed(5));
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
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <Calculator className="h-8 w-8" />
              Price Calculator
            </h1>
            <p className="text-muted-foreground text-lg">
              Professional Risk Management Tool for Traders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Trade Parameters
                </CardTitle>
                <CardDescription>
                  Enter your trade details to calculate risk and targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Trade Direction Toggle */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Trade Direction</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={formData.tradeDirection === 'buy' ? 'buy' : 'buy-outline'}
                      onClick={() => setFormData({ ...formData, tradeDirection: 'buy' })}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Buy
                    </Button>
                    <Button
                      variant={formData.tradeDirection === 'sell' ? 'sell' : 'sell-outline'}
                      onClick={() => setFormData({ ...formData, tradeDirection: 'sell' })}
                      className="flex-1"
                    >
                      <TrendingDown className="h-4 w-4 mr-2" />
                      Sell
                    </Button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="currencyPair">Currency Pair</Label>
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
                      className={errors.currencyPair ? 'border-danger' : ''}
                    />
                    {errors.currencyPair && <p className="text-danger text-sm mt-1">{errors.currencyPair}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="entryPrice">Entry Price</Label>
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
                      className={errors.entryPrice ? 'border-danger' : ''}
                    />
                    {errors.entryPrice && <p className="text-danger text-sm mt-1">{errors.entryPrice}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="accountSize">Account Size (USD)</Label>
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
                      className={errors.accountSize ? 'border-danger' : ''}
                    />
                    {errors.accountSize && <p className="text-danger text-sm mt-1">{errors.accountSize}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="riskPercentage">Risk (%)</Label>
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
                      className={errors.riskPercentage ? 'border-danger' : ''}
                    />
                    {errors.riskPercentage && <p className="text-danger text-sm mt-1">{errors.riskPercentage}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="riskRewardRatio">R:R Ratio (1:X)</Label>
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
                      className={errors.riskRewardRatio ? 'border-danger' : ''}
                    />
                    {errors.riskRewardRatio && <p className="text-danger text-sm mt-1">{errors.riskRewardRatio}</p>}
                  </div>

                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label htmlFor="stopLossPips">Stop Loss (Pips)</Label>
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
                      className={errors.stopLossPips ? 'border-danger' : ''}
                    />
                    {errors.stopLossPips && <p className="text-danger text-sm mt-1">{errors.stopLossPips}</p>}
                  </div>
                </div>

                <Button onClick={calculateTrade} className="w-full" size="lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Trade
                </Button>
              </CardContent>
            </Card>

            {/* Results Section */}
            <div className="space-y-6">
              {calculation && (
                <>
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Risk Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Risk Amount (USD)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={editableRiskAmount}
                            onChange={(e) => handleRiskAmountChange(e.target.value)}
                            className="mt-1 font-mono"
                          />
                        </div>
                        <div>
                          <Label>Pip Value</Label>
                          <div className="mt-1 p-3 bg-muted rounded-md font-mono">
                            ${calculation.pipValue.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Suggested Lot Size</Label>
                          <div className="mt-1 p-3 bg-muted rounded-md font-mono">
                            {calculation.lotSize.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <Label>Expected Profit</Label>
                          <div className="mt-1 p-3 bg-success/10 border border-success rounded-md font-mono text-success">
                            ${calculation.expectedProfit.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Price Levels
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-danger/10 border border-danger rounded-md">
                          <div>
                            <Label className="text-danger">Stop Loss</Label>
                            <div className="font-mono text-lg">{calculation.stopLossPrice.toFixed(5)}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(calculation.stopLossPrice, 'Stop Loss')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div>
                            <Label>Breakeven</Label>
                            <div className="font-mono text-lg">{calculation.breakevenPrice.toFixed(5)}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(calculation.breakevenPrice, 'Breakeven')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-success/10 border border-success rounded-md">
                          <div>
                            <Label className="text-success">Take Profit</Label>
                            <div className="font-mono text-lg">{calculation.takeProfitPrice.toFixed(5)}</div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(calculation.takeProfitPrice, 'Take Profit')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Risk/Reward Visual */}
                      <div className="mt-6">
                        <Label className="mb-2 block">Risk/Reward Ratio</Label>
                        <div className="flex h-6 rounded-md overflow-hidden border">
                          <div className="bg-danger flex-1 flex items-center justify-center text-white text-sm font-medium">
                            Risk: 1
                          </div>
                          <div 
                            className="bg-success flex items-center justify-center text-white text-sm font-medium"
                            style={{ flex: Number(formData.riskRewardRatio) }}
                          >
                            Reward: {formData.riskRewardRatio}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!calculation && (
                <Card className="shadow-elegant">
                  <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter trade parameters and click Calculate to see results</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PriceCalculator;