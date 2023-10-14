import { Button, Card, CardActions, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import './styles.css';
import { useState } from "react";
import { checkEmailValidation } from "../../../util/emailServices";
import { postRequest } from "../../api";
import EmailView from "../view";

function FormInputs() {
    const [state, setState] = useState({
        email: '',
        eamilError: false,
        password: '',
        passwordError: false,
        isFetchButton: false,
        isLoading: false,
        responseMessage: '',
        isTableViewButton: false,
        isTableView: false
    });

    const emailHandler = async e => {
        setState(prev => ({ ...prev, email: e.target.value }));
        const isEmailValid = await checkEmailValidation(e.target.value);
        if (isEmailValid) {
            setState(prev => ({ ...prev, eamilError: false }));
        } else if (state.email.length > 0 && !isEmailValid) {
            setState(prev => ({ ...prev, eamilError: true }));
        }
        enableButton();
    }

    const passwordHandler = e => {
        setState(prev => ({ ...prev, password: e.target.value }));
        if (e.target.value.length > 0) {
            setState(prev => ({ ...prev, passwordError:  false }))
        } else {
            setState(prev => ({ ...prev, passwordError: true }));
        }
        enableButton();
    }

    const enableButton = () => {
        if (state.email.length > 0 && state.password.length > 0) {
            setState(prev => ({ ...prev, isFetchButton: true }));
        } else {
            setState(prev => ({ ...prev, isFetchButton: false }));
        }
    }

    const fetchEmails = async () => {
        try {
            const params = {
                email: state.email,
                password: state.password
            }
            setState(prev => ({ ...prev, isLoading: true, responseMessage: '' }))
            const result = await postRequest('/import_emails', params);
            if (result) {
                setState(prev => ({ ...prev, isLoading: false, responseMessage: result, isTableViewButton: true }));
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }

        } catch (error) {
            console.error('Error while fetching the emails', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }

    const tableViewHandler = () => {
        setState(prev => ({ ...prev, isTableView: !prev.isTableView }));
    }

    return (
        <>
            <div className="form-container">
                {!state.isTableView ? <Card sx={{ minWidth: 350 }}>
                    <CardContent>
                        <Typography>EMAILTROOP</Typography>
                        <div className="mt-3">
                            <TextField error={state.eamilError} helperText={state.eamilError && "Please enter a valid email"} label="Email" size="small" onChange={emailHandler} fullWidth/>
                        </div>
                        <div className="mt-3">
                            <TextField error={state.passwordError} helperText={state.passwordError && "Please enter the right password"} label="Password" size="small" onChange={passwordHandler} type="password" fullWidth/>
                        </div>
                    </CardContent>
                    <CardActions>
                        {!state.isLoading ? <Button disabled={!state.isFetchButton} size="small" variant="outlined" onClick={fetchEmails}>Submit</Button> : <Button className="text-muted" startIcon={<CircularProgress size={20} />} size="small" variant="outlined"> Loading</Button>}
                        {/* <Button disabled size="small" variant="contained">Export</Button> */}
                        <br />
                    </CardActions>
                    <div className="text-success p-2">{state.responseMessage && state.responseMessage.length > 0 ? state.responseMessage : ''}</div>
                    <div className="p-2">
                        { state.isTableViewButton ? <Button size="small" variant="outlined" onClick={tableViewHandler} fullWidth>View Emails</Button> : null}
                    </div>
                </Card> : null}
            </div>
            {state.isTableView ? <EmailView closeView={tableViewHandler} /> : null}
        </>
    )
}

export default FormInputs;