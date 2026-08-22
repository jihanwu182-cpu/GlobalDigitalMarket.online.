import React from 'react';
import { Box, Typography } from '@mui/material';

const Wallet: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Wallet
      </Typography>
      <Typography variant="body1">
        Wallet information will appear here...
      </Typography>
    </Box>
  );
};

export default Wallet;
