import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import DialogActions from '@mui/material/DialogActions';
function ExitDialog({ handleClose, open, clearSession }) {
    return (
        <Dialog onClose={handleClose} open={open}>
            <DialogTitle>Close App</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    This action will permanently delete all chat history and
                    uploaded files. This cannot be undone
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Disagree</Button>
                <Button onClick={clearSession} autoFocus>
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ExitDialog;
