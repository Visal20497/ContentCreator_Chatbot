import { ErrorPageImage } from '@/assets/img';
import { Box, Button } from '@mui/material';
import React from 'react';
import './style.css';
import { useNavigate, useNavigation } from 'react-router-dom';

function ErrorHandle() {
    // const navigate = useNavigate();
    return (
        <div className="main-error-container">
            <Box className="error-container">
                <Box className="error-text-container">
                    <p style={{ width: '60%', color: '#5C6E78' }}>
                        "Oops! The page you're looking for seems to have taken a
                        detour. Let's get you back on track.
                        <span
                            onClick={() => {
                                window.history.replaceState(
                                    null,
                                    'New Page Title',
                                    '/',
                                );
                            }}
                            style={{
                                color: ' #0671F0',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Click here
                        </span>{' '}
                        to return to the application."
                    </p>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ width: '200px' }}
                        onClick={() => {
                            window.history.replaceState(
                                null,
                                'New Page Title',
                                '/',
                            );
                        }}
                    >
                        Navigate Back
                    </Button>
                </Box>
                <Box>
                    <img
                        style={{ height: '400px', width: '400px' }}
                        src={ErrorPageImage}
                    />
                </Box>
            </Box>
        </div>
    );
}

export default ErrorHandle;
