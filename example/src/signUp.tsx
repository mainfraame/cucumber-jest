import React, { useState } from 'react';
import axios from 'axios';
import Alert from '@material-ui/lab/Alert';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { Copyright } from './copyright';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(3)
    },
    submit: {
        margin: theme.spacing(3, 0, 2)
    }
}));

export const SignUp = () => {

    const classes = useStyles();

    const [state, setState] = useState({
        showEmailAlert: false,
        showSuccess: false,
        isSubmitting: false
    });

    const onReset = () => {
        setState(() => ({
            showEmailAlert: false,
            showSuccess: false,
            isSubmitting: false
        }));
    };

    const onSubmit = (e) => {

        setState((prev) => ({
            ...prev,
            isSubmitting: true
        }));

        const values = Object.values(e.target.form.elements)
            .filter((k) => k instanceof HTMLInputElement)
            .reduce((acc, input: HTMLInputElement) => ({
                // @ts-ignore
                ...acc,
                [input.name]: input.hasOwnProperty('checked') ?
                    input.checked :
                    input.value
            }), {}) as Record<string, unknown>;

        axios
            .post('/api/sign-up', {
                ...values,
                date: new Date().toISOString()
            })
            .then(() => {
                setState(() => ({
                    showEmailAlert: !!values.extraEmails,
                    showSuccess: true,
                    isSubmitting: false
                }));
            });
    };

    return (
        <Container component='main' maxWidth='xs'>
            <CssBaseline/>
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component='h1' variant='h5'>
                    Sign up
                </Typography>
                <form className={classes.form}
                      noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                autoComplete='fname'
                                name='firstName'
                                variant='outlined'
                                required
                                fullWidth
                                id='firstName'
                                label='First Name'
                                autoFocus/>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                variant='outlined'
                                required
                                fullWidth
                                id='lastName'
                                label='Last Name'
                                name='lastName'
                                autoComplete='lname'/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant='outlined'
                                required
                                fullWidth
                                id='email'
                                label='Email Address'
                                name='email'
                                autoComplete='email'/>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant='outlined'
                                required
                                fullWidth
                                name='password'
                                label='Password'
                                type='password'
                                id='password'
                                autoComplete='current-password'/>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox name='extraEmails' value='extraEmails' color='primary'/>}
                                label='I want to receive inspiration, marketing promotions and updates via email.'/>
                        </Grid>
                    </Grid>
                    <Button
                        data-id='submit'
                        fullWidth
                        variant='contained'
                        color='primary'
                        className={classes.submit}
                        disabled={state.isSubmitting}
                        onClick={onSubmit}>
                        Sign Up
                    </Button>
                    <Button
                        data-id='reset'
                        type='reset'
                        fullWidth
                        variant='contained'
                        color='primary'
                        className={classes.submit}
                        onClick={onReset}>
                        Reset
                    </Button>
                    <Grid container justify='flex-end'>
                        {state.showSuccess &&
                        <Grid item xs={12}>
                            <Alert data-id='successAlert' severity='success'>Thanks for signing up!</Alert>
                        </Grid>}
                        {state.showEmailAlert &&
                        <Grid item xs={12}>
                            <Alert data-id='showExtraEmailsAlert' severity='warning'>So, you're asking for more
                                emails?!</Alert>
                        </Grid>}
                        <Grid item xs={12}>
                            <Link href='#' variant='body2'>
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </div>
            <Box mt={5}>
                <Copyright/>
            </Box>
        </Container>
    );
};
