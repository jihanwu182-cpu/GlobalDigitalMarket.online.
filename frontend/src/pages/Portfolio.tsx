import React from 'react';
import { Box, Typography } from '@mui/material';

const Portfolio: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Portfolio
      </Typography>
      <Typography variant="body1">
        Your portfolio information will appear here...
      </Typography>
    </Box>
  );
};

export default Portfolio;
