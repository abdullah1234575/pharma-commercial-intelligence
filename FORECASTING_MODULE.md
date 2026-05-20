# AI-Powered Forecasting Module Documentation

## Overview

The AI-Powered Forecasting Module is an advanced predictive analytics system for the Pharma Commercial Intelligence Platform. It automatically generates intelligent sales forecasts, risk assessments, and executive-level insights based on historical data analysis.

**Key Features:**
- ✅ Automated forecasting without manual entry
- ✅ Multi-method ensemble forecasting (Linear Regression, Exponential Smoothing, Seasonal Decomposition)
- ✅ Pharma-specific business logic and pattern recognition
- ✅ AI-generated executive insights and commentary
- ✅ Risk analysis and alerts
- ✅ Confidence indicators and scenario analysis
- ✅ Real-time dashboard updates

---

## Architecture

### Core Components

#### 1. **Forecasting Engine** (`lib/forecasting-engine.ts`)
Implements statistical and time-series forecasting methods:

- **Linear Regression**: Trend-based forecasting
- **Exponential Smoothing (Holt's Method)**: Data with trend but no seasonality
- **Seasonal Decomposition**: Detects and forecasts seasonal patterns
- **Moving Averages**: Smoothing and trend identification
- **Weighted Moving Averages**: Recent data prioritized

**Key Functions:**
```typescript
selectBestForecastingMethod(data, periods)    // Auto-selects best method
analyzeGrowth(data, periods)                  // Calculates growth rates
calculateVolatility(data)                     // Measures data stability
detectTrend(data)                             // Identifies trend direction
detectSeasonality(data, period)               // Measures seasonal strength
```

#### 2. **Pharma Forecasting** (`lib/pharma-forecasting.ts`)
Applies pharma-specific business logic:

- **Chronic Brand Logic**: Stability adjustments for stable product categories
- **Seasonal Brand Handling**: Increased confidence bands for seasonal products
- **Channel-Specific Rules**: Tender vs. Retail adjustments
- **Territory Performance**: High-performing territory boosts
- **Rep Productivity**: Considers medical rep performance metrics

**Key Functions:**
```typescript
generateDimensionalForecast()    // Forecasts for brands, channels, reps, territories
generateComprehensiveForecasts() // Complete portfolio analysis
applyPharmaBusinessLogic()       // Applies industry rules
extractTimeSeriesForDimension()  // Prepares data for forecasting
```

#### 3. **AI Insights** (`lib/forecast-insights.ts`)
Generates executive-level commentary:

- Brand performance insights
- Channel analysis and recommendations
- Territory risk assessments
- Rep productivity evaluation
- Market trends and opportunities

**Output Examples:**
> "Cardiovex is projected to grow by 12% next quarter based on sustained territory growth."

> "Oncology portfolio shows declining trend in private channel."

> "Retail channel is outperforming Tender by 18%."

---

## Data Structure

### Forecast Data Types

```typescript
interface ForecastResult {
  period: string;                    // "+1", "+2", "+3"
  forecast: number;                  // Predicted value
  lowerBound: number;               // 95% confidence lower bound
  upperBound: number;               // 95% confidence upper bound
  confidence: number;               // 0-1 scale
  method: string;                   // Forecasting method used
  trend: "increasing" | "decreasing" | "stable";
  seasonality?: number;             // Seasonal strength (0-1)
}

interface DimensionalForecast {
  dimension: string;                // "brand", "channel", "territory", etc.
  dimensionValue: string;           // e.g., "Cardiovex"
  nextMonthForecast: number;       // Next month's forecast
  nextQuarterForecast: number;     // Next 3 months aggregate
  ytdExpectedForecast: number;     // Year-to-date projection
  confidenceScore: number;          // Overall confidence (0-1)
  growth: number;                   // Growth rate (decimal)
  trend: "increasing" | "decreasing" | "stable";
  insights: string[];               // AI-generated insights
  businessContext: {                // Pharma business rules
    isSeasonalBrand?: boolean;
    isTenderBusiness?: boolean;
    isChronicBrand?: boolean;
  }
}
```

---

## API Endpoints

### POST `/api/forecast`
Generate forecasts with optional filters.

**Request:**
```json
{
  "records": [PharmaRecord[], optional],
  "filterBrand": "Cardiovex",        // optional
  "filterChannel": "Retail",         // optional
  "filterTerritory": "Cairo A",      // optional
  "filterRep": "Mona Nabil"         // optional
}
```

**Response:**
```json
{
  "forecasts": {
    "overall": {
      "nextMonth": 2500000,
      "nextQuarter": 7500000,
      "ytd": 45000000,
      "confidence": "85%",
      "growth": "12.5%"
    },
    "brands": [
      {
        "name": "Cardiovex",
        "nextMonth": 500000,
        "nextQuarter": 1500000,
        "confidence": 0.87,
        "growth": 0.125,
        "trend": "increasing",
        "riskLevel": "low",
        "insights": ["Cardiovex is projected to grow by 12.5%..."]
      },
      // ... more brands
    ],
    "channels": [...],
    "territories": [...],
    "reps": [...]
  },
  "insights": [
    {
      "title": "Cardiovex - Strong Growth Opportunity",
      "description": "Cardiovex is projected to grow by 12.5%...",
      "priority": "high",
      "category": "opportunity",
      "metric": "Growth Rate: 12.5% | Next Month: $500K",
      "recommendation": "Increase allocation and promotional support..."
    },
    // ... more insights
  ],
  "risks": {
    "highRiskAreas": [
      "Oncology: High variability - monitor closely",
      "Delta region: Declining trend detected"
    ],
    "mitigationStrategies": [
      "Increase field supervision and monitoring",
      "Conduct competitive market analysis"
    ],
    "overallRiskScore": 35
  },
  "metadata": {
    "generatedAt": "2026-05-20T15:30:00Z",
    "dataPoints": 432,
    "forecastPeriods": 3,
    "confidence": "85%",
    "method": "Multi-Method Ensemble"
  }
}
```

### GET `/api/forecast`
Get forecasts using default sample data.

---

## Dashboard Components

### 1. **Forecast Module** (`components/forecast-module.tsx`)
Main forecasting dashboard with tabbed interface:

- **Overview Tab**: Summary KPIs, confidence indicators, risk alerts, scenario analysis
- **Brands Tab**: Brand-specific forecasts, growth rates, individual brand details
- **Channels Tab**: Channel performance, distribution analysis, channel comparisons
- **Territories Tab**: Territory-level forecasts, risk assessments, performance ranking
- **Insights Tab**: AI-generated insights, opportunities, risks, recommendations

### 2. **Forecast KPI Card** (`components/ui/forecast-kpi-card.tsx`)
Displays forecast metrics:
- Next month forecast
- Next quarter forecast
- YTD expected forecast
- Confidence score
- Trend indicator (increasing/decreasing/stable)
- Risk level (low/medium/high)

### 3. **Forecast Charts** (`components/charts/forecast-charts.tsx`)
Visualization components:
- **ForecastTrendChart**: Shows actual vs. forecast with confidence bands
- **BrandForecastChart**: Multi-brand forecast comparison
- **GrowthForecastChart**: Growth rate analysis

### 4. **Confidence & Risk** (`components/ui/forecast-confidence.tsx`)
- **ForecastConfidenceIndicator**: Visual confidence gauge
- **RiskAlert**: Risk level display with mitigation strategies
- **ScenarioAnalysis**: Optimistic, realistic, pessimistic scenarios

### 5. **Insights Card** (`components/ui/forecast-insights-card.tsx`)
Displays AI-generated insights with priority levels and recommendations.

---

## Forecasting Methods

### Method Selection Algorithm

The system automatically selects the best forecasting method based on data characteristics:

```
IF seasonality > 0.3 AND data points >= 24
  → Seasonal Decomposition (best for seasonal brands)
ELSE IF trend > 0.05 OR volatility > 0.3
  → Double Exponential Smoothing (best for trending data)
ELSE
  → Linear Regression (best for stable data)
```

### Confidence Calculations

Confidence intervals are calculated using:
- 95% confidence level (1.96 standard deviations)
- Residual standard deviation
- Data volatility adjustments
- Forecast horizon decay (confidence decreases for longer periods)

---

## Pharma Business Rules

### Chronic Brands
- Typically have stable, predictable growth
- Lower volatility
- Receive stability bonus (+2%)
- Examples: Cardiovex, Glucofine, Neurocil

### Seasonal Brands
- Show cyclical patterns (e.g., respiratory products in winter)
- Higher confidence bands
- Seasonal decomposition method recommended
- Examples: Respira, Immunex

### Volatile/Oncology Brands
- Higher unpredictability
- Conservative forecasts
- Frequent monitoring recommended
- Examples: Oncora

### Channel Logic

**Tender Business:**
- Unpredictable due to tender cycles
- Conservative adjustments (-5%)
- Medium to high risk
- Requires pipeline management focus

**Retail:**
- More predictable
- Receives slight positive adjustment (+1%)
- High confidence potential
- Steady, repeatable growth

**Private:**
- Dependent on KOL relationships
- Stable performance
- Good for long-term planning

---

## Risk Assessment

### Risk Levels

| Level | Characteristics | Action |
|-------|-----------------|--------|
| **Low** | Stable trend, high confidence, predictable | Monitor regularly |
| **Medium** | Some volatility, moderate confidence, mixed signals | Implement mitigation |
| **High** | High volatility, declining trend, forecast variance | Immediate investigation |

### Risk Factors

- **Declining Trends**: Revenue decreasing over time
- **High Volatility**: Inconsistent month-to-month performance
- **Execution Risks**: Rep or territory-level challenges
- **Competitive Threats**: Market share erosion
- **Tender Dependency**: Over-reliance on unpredictable tender wins

---

## Using the Forecast Module

### Accessing Forecasts

1. **Dashboard Integration**: Navigate to the "Forecast Module" section
2. **API Access**: Call `/api/forecast` endpoint
3. **Automatic Generation**: Forecasts refresh with new data uploads

### Interpreting Results

**Confidence Score (0-100%):**
- 85-100%: Very High - Use for planning
- 70-84%: High - Consider for planning
- 50-69%: Moderate - Use with caution
- <50%: Low - Insufficient data history

**Growth Metrics:**
- `> 20%`: Exceptional growth - opportunity to scale
- `10-20%`: Strong growth - maintain momentum
- `0-10%`: Modest growth - focus on execution
- `< 0%`: Declining - investigate and respond

### Scenario Planning

Three forecast scenarios provided:

1. **Optimistic Scenario** (+15%): Best-case execution
2. **Realistic Scenario**: Most probable outcome
3. **Pessimistic Scenario** (-15%): Risk-based planning

---

## Customization & Advanced Usage

### Custom Forecasting Parameters

Modify forecasting behavior in `lib/pharma-forecasting.ts`:

```typescript
// Adjust business logic weights
const chronicBrandBoost = 1.02; // Change stability multiplier
const tenderDiscount = 0.95;     // Change tender adjustment

// Modify confidence parameters
const confidenceDecay = 0.05;    // How much confidence decreases per period
```

### Adding New Business Rules

Extend `applyPharmaBusinessLogic()`:

```typescript
if (newBrandCategory) {
  adjustedForecast *= 1.05; // Custom adjustment
  riskFactors.push("New rule applied");
}
```

### Filter-Specific Forecasts

Generate forecasts for specific segments:

```typescript
const brandfForecast = await fetch("/api/forecast", {
  method: "POST",
  body: JSON.stringify({
    filterBrand: "Cardiovex",
    filterChannel: "Retail",
    filterTerritory: "Cairo A"
  })
});
```

---

## Performance & Optimization

### Data Volume Handling

- **Optimal**: 100-1000 data points
- **Large**: 1000-5000 points (slight performance impact)
- **Minimal**: <50 points (lower confidence)

### Caching Strategy

Forecasts are cached for:
- 1 hour for auto-generated forecasts
- Cleared on new data upload
- API routes set to no-cache

### Computation Time

Typical forecast generation:
- Portfolio-level: ~100-200ms
- With 100+ dimensions: ~500-800ms
- Cache hit: <10ms

---

## Deployment

### Auto-Deployment Pipeline

#### 1. **GitHub Actions Workflow** (`.github/workflows/deploy-forecasting.yml`)
- Triggered on push to main/master
- Builds and tests application
- Deploys to Vercel
- Clears caches
- Sends notifications

#### 2. **Vercel Configuration** (`vercel.json`)
- Optimized API routes (1024MB memory)
- Proper headers and redirects
- Performance optimizations
- Security headers enabled

#### 3. **Deployment Scripts**

**Linux/Mac:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1
```

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

### Custom Domain Configuration

1. Set custom domain in Vercel project settings
2. Update DNS records to Vercel nameservers
3. Verify in `vercel.json`
4. Deployment script handles DNS verification

---

## Testing & Validation

### Forecast Accuracy Metrics

```typescript
interface ForecastMetrics {
  mae: number;           // Mean Absolute Error
  rmse: number;          // Root Mean Squared Error
  mape: number;          // Mean Absolute Percentage Error
  accuracy: number;      // 0-1 scale
}
```

### Validation Checklist

- [ ] Forecasts generated without errors
- [ ] Confidence scores reasonable (50-99%)
- [ ] Growth rates within pharma industry norms (-5% to +25%)
- [ ] Risk assessments properly weighted
- [ ] Insights are specific and actionable
- [ ] Dashboard displays correctly
- [ ] API responses complete within 1 second

---

## Troubleshooting

### Issue: Low Confidence Scores
**Cause**: Insufficient historical data or high volatility
**Solution**: 
- Upload more historical data (12+ months recommended)
- Check for data quality issues
- Verify correct data mappings

### Issue: Inaccurate Forecasts
**Cause**: Wrong forecasting method selected or outliers in data
**Solution**:
- Review data for anomalies
- Check business context (new product launch, market disruption)
- Increase historical data period
- Manually adjust business rule weights

### Issue: API Timeout
**Cause**: Large dataset or slow network
**Solution**:
- Apply filters to reduce dataset
- Optimize data queries
- Check server resources

### Issue: Forecasts Not Updating
**Cause**: Cache not cleared or deployment incomplete
**Solution**:
- Clear browser cache
- Verify deployment completed
- Check `/api/forecast` endpoint status
- Review deployment logs

---

## Best Practices

1. **Data Quality First**: Ensure accurate, complete historical data
2. **Review Insights**: Don't blindly trust AI insights - validate with domain knowledge
3. **Monitor Accuracy**: Track forecast vs. actual performance monthly
4. **Update Business Rules**: Adjust parameters based on forecast performance
5. **Scenario Planning**: Use optimistic/pessimistic scenarios for contingency planning
6. **Risk Management**: Act on high-risk alerts proactively
7. **Regular Review**: Review forecasts monthly, not just quarterly
8. **Stakeholder Communication**: Share insights in clear, actionable language

---

## Support & Resources

- **API Documentation**: `/api/forecast` endpoint specs
- **Component Library**: Dashboard components with props
- **Code Examples**: `lib/pharma-forecasting.ts` for custom logic
- **GitHub Issues**: Report bugs and feature requests
- **Deployment Docs**: `scripts/deploy.sh` and `vercel.json`

---

## Version History

### v1.0.0 (2026-05-20)
- ✅ Initial release
- ✅ Multi-method ensemble forecasting
- ✅ Pharma business logic
- ✅ AI insights generation
- ✅ Risk analysis
- ✅ Auto-deployment pipeline

---

## License

Proprietary - Pharma Commercial Intelligence Platform
