import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtext,
}) => {
  const iconColor = `${color}.main`;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
      }}
    >
      <CardContent
        sx={{
          p: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box>
            <Typography
              variant="body1"
              color="text.secondary"
              gutterBottom
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              {value}
            </Typography>

            {subtext && (
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {subtext}
              </Typography>
            )}
          </Box>

          {icon && (
            <Box
              sx={{
                color: iconColor,
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
