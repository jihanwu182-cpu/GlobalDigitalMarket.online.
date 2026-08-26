<TextField
  select
  fullWidth
  label="Market"
  name="symbol"
  value={values.symbol}
  onChange={handleChange}
  onBlur={handleBlur}
  error={Boolean(touched.symbol && errors.symbol)}
  helperText={
    touched.symbol && typeof errors.symbol === 'string'
      ? errors.symbol
      : ''
  }
  placeholder="e.g., AAPL"
>
  <MenuItem value="BTCUSDT">BTC / USDT</MenuItem>
  <MenuItem value="ETHUSDT">ETH / USDT</MenuItem>
  <MenuItem value="XRPUSDT">XRP / USDT</MenuItem>
  <MenuItem value="EURUSD">EUR / USD</MenuItem>
  <MenuItem value="AAPL">Apple (AAPL)</MenuItem>
</TextField>
