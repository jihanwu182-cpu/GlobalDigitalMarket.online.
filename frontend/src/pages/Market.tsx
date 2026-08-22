import React from 'react';
import { Box, Typography } from '@mui/material';

const Market: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Market Data
      </Typography>
      <Typography variant="body1">
        Market data and quotes will appear here...
      </Typography>
    </Box>
  );
};

export default Market;
