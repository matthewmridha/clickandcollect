import React, {useState, useEffect, useContext} from 'react';
import { FunctionContext, StateContext } from './App';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { Container } from '@mui/material/';

export default function TransitionAlert() {

    const functionContext = useContext(FunctionContext);
    const stateContext = useContext(StateContext);

    const [open, setOpen] = useState(true);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState("info");

    useEffect(()=>{
        setMessage(stateContext.data.alert.message);
        setSeverity(stateContext.data.alert.severity);
        setOpen(stateContext.data.alert.showAlert);
        
    }, [stateContext.data.alert.showAlert]);

    return (
        <Container maxWidth="xs">
            <Box sx={{ width: '100%' }}>
                <Collapse in={open}>
                    <Alert
                    variant="outlined"
                    severity={severity} ///string=error||warning||info||success
                    action={
                        <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            functionContext.toggleAlert();
                        }}
                        >
                        <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                    sx={{ mb: 2 }}
                    >
                    {message}
                    </Alert>
                </Collapse>
            </Box>
        </Container>
    );
};