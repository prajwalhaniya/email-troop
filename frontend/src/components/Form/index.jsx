import { Button, Card, CardActions, CardContent, TextField, Typography } from "@mui/material";
import './styles.css';
import { useState } from "react";
import { checkEmailValidation } from "../../../util/emailServices";
// import { postRequest } from "../../api";

function FormInputs() {
    const [state, setState] = useState({
        email: '',
        eamilError: false,
        password: '',
        isFetchButton: false
    });

    const emailHandler = async e => {
        setState(prev => ({ ...prev, email: e.target.value }));
        const isEmailValid = checkEmailValidation();
        if (isEmailValid) {
            enableButton();
        } else {
            // set email error (give feedback to user)
        }
    }

    const passwordHandler = e => {
        setState(prev => ({ ...prev, password: e.target.value }));
        enableButton();
    }

    const enableButton = () => {
        if (state.email.length > 0 && state.password.length > 0) {
            setState(prev => ({ ...prev, isFetchButton: true }))
        }
    }

    const fetchEmails = async () => {
        try {
            const params = {
                email: state.email,
                password: state.password
            }
            // const data = await postRequest('/api/', params);
            console.log({ params })

        } catch (error) {
            console.error('Error while fetching the emails', error);
        }
    }

    return (
        <>
            <div className="form-container">
                <Card sx={{ minWidth: 350 }}>
                    <CardContent>
                        <Typography>EMAILTROOP</Typography>
                        <div className="mt-3">
                            <TextField label="Email" size="small" onChange={emailHandler} fullWidth/>
                        </div>
                        <div className="mt-3">
                            <TextField label="Password" size="small" onChange={passwordHandler} type="password" fullWidth/>
                        </div>
                    </CardContent>
                    <CardActions>
                        <Button disabled={!state.isFetchButton} size="small" variant="outlined" onClick={fetchEmails}>Fetch Emails</Button>
                        <Button disabled size="small" variant="contained">Export</Button>
                    </CardActions>
                    
                </Card>
            </div>
        </>
    )
}

export default FormInputs;