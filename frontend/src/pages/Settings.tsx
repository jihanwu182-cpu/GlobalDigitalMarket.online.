import React, { useState } from 'react';
import {
Alert,
Box,
Button,
Card,
CardContent,
CircularProgress,
Container,
IconButton,
InputAdornment,
Stack,
TextField,
Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const Settings: React.FC = () => {
const navigate = useNavigate();

const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

const [showCurrent, setShowCurrent] = useState(false);
const [showNew, setShowNew] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

const handleChangePassword = async () => {
setError('');
setSuccess('');

if (!currentPassword || !newPassword || !confirmPassword) {  
  setError('Please fill in all fields.');  
  return;  
}  

if (newPassword.length < 6) {  
  setError('New password must be at least 6 characters.');  
  return;  
}  

if (newPassword !== confirmPassword) {  
  setError('New password and confirmation do not match.');  
  return;  
}  

try {  
  setLoading(true);  

  await apiClient.put('/auth/change-password', {  
    currentPassword,  
    newPassword,  
  });  

  setSuccess('Password changed successfully.');  
  setCurrentPassword('');  
  setNewPassword('');  
  setConfirmPassword('');  
} catch (err: any) {  
  setError(  
    err?.response?.data?.message ||  
      'Unable to change password. Please try again.'  
  );  
} finally {  
  setLoading(false);  
}

};

const inputSx = {
'& .MuiInputLabel-root': { color: '#9eb3ff' },
'& .MuiInputLabel-root.Mui-focused': { color: '#5ce8ff' },
'& .MuiOutlinedInput-root': {
color: '#fff',
borderRadius: 2.5,
backgroundColor: 'rgba(255,255,255,0.03)',
'& fieldset': { borderColor: 'rgba(140,170,255,0.25)' },
'&:hover fieldset': { borderColor: 'rgba(92,232,255,0.6)' },
'&.Mui-focused fieldset': { borderColor: '#5ce8ff' },
},
};

return (
<Box
sx={{
minHeight: '100vh',
color: '#fff',
background:
'radial-gradient(ellipse at top right, rgba(30,90,220,0.18), transparent 45%), linear-gradient(180deg, #020617 0%, #0a1628 40%, #0f1c3d 100%)',
pb: 8,
}}
>
{/* Header */}
<Box
sx={{
position: 'sticky',
top: 0,
zIndex: 30,
background: 'rgba(2,6,23,0.85)',
backdropFilter: 'blur(20px)',
borderBottom: '1px solid rgba(100,140,255,0.12)',
}}
>
<Container maxWidth="sm">
<Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1.75 }}>
<IconButton
onClick={() => navigate(-1)}
sx={{
color: '#fff',
background: 'rgba(99,102,241,0.15)',
border: '1px solid rgba(99,102,241,0.25)',
}}
>
<ArrowBackIcon fontSize="small" />
</IconButton>
<Box>
<Typography sx={{ fontSize: 18, fontWeight: 800 }}>Settings</Typography>
<Typography sx={{ color: '#64748b', fontSize: 11, letterSpacing: 1 }}>
GLOBAL DIGITAL MARKET
</Typography>
</Box>
</Stack>
</Container>
</Box>

<Container maxWidth="sm" sx={{ py: 4 }}>  
    <Typography sx={{ fontSize: 28, fontWeight: 900, mb: 1 }}>  
      Change Password  
    </Typography>  
    <Typography sx={{ color: '#64748b', mb: 3 }}>  
      Update your account password for better security.  
    </Typography>  

    {error && (  
      <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setError('')}>  
        {error}  
      </Alert>  
    )}  
    {success && (  
      <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setSuccess('')}>  
        {success}  
      </Alert>  
    )}  

    <Card  
      sx={{  
        borderRadius: 4,  
        background: 'rgba(15,23,42,0.7)',  
        border: '1px solid rgba(100,140,255,0.12)',  
      }}  
    >  
      <CardContent sx={{ p: 3 }}>  
        <Stack spacing={2.5}>  
          <TextField  
            fullWidth  
            label="Current Password"  
            type={showCurrent ? 'text' : 'password'}  
            value={currentPassword}  
            onChange={(e) => setCurrentPassword(e.target.value)}  
            InputProps={{  
              startAdornment: (  
                <InputAdornment position="start">  
                  <LockIcon sx={{ color: '#60a5fa' }} />  
                </InputAdornment>  
              ),  
              endAdornment: (  
                <InputAdornment position="end">  
                  <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end">  
                    {showCurrent ? <VisibilityOff /> : <Visibility />}  
                  </IconButton>  
                </InputAdornment>  
              ),  
            }}  
            sx={inputSx}  
          />  

          <TextField  
            fullWidth  
            label="New Password"  
            type={showNew ? 'text' : 'password'}  
            value={newPassword}  
            onChange={(e) => setNewPassword(e.target.value)}  
            InputProps={{  
              startAdornment: (  
                <InputAdornment position="start">  
                  <LockIcon sx={{ color: '#60a5fa' }} />  
                </InputAdornment>  
              ),  
              endAdornment: (  
                <InputAdornment position="end">  
                  <IconButton onClick={() => setShowNew(!showNew)} edge="end">  
                    {showNew ? <VisibilityOff /> : <Visibility />}  
                  </IconButton>  
                </InputAdornment>  
              ),  
            }}  
            sx={inputSx}  
          />  

          <TextField  
            fullWidth  
            label="Confirm New Password"  
            type={showConfirm ? 'text' : 'password'}  
            value={confirmPassword}  
            onChange={(e) => setConfirmPassword(e.target.value)}  
            InputProps={{  
              startAdornment: (  
                <InputAdornment position="start">  
                  <LockIcon sx={{ color: '#60a5fa' }} />  
                </InputAdornment>  
              ),  
              endAdornment: (  
                <InputAdornment position="end">  
                  <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">  
                    {showConfirm ? <VisibilityOff /> : <Visibility />}  
                  </IconButton>  
                </InputAdornment>  
              ),  
            }}  
            sx={inputSx}  
          />  

          <Button  
            fullWidth  
            variant="contained"  
            disabled={loading}  
            onClick={handleChangePassword}  
            sx={{  
              mt: 1,  
              py: 1.6,  
              textTransform: 'none',  
              fontWeight: 800,  
              borderRadius: 3,  
              background: 'linear-gradient(90deg, #10b981, #059669)',  
            }}  
          >  
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Update Password'}  
          </Button>  
        </Stack>  
      </CardContent>  
    </Card>  
  </Container>  
</Box>

);
};

export default Settings;
