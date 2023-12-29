import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Navigate } from "react-router-dom";
import { TextField, Button, Typography, Link, Container, CssBaseline, Avatar, Box, Alert } from "@mui/material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const Home = ({ user }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUpActive, setIsSignUpActive] = useState(true);
    const [error, setError] = useState(null);

    const handleMethodChange = () => {
        setIsSignUpActive(!isSignUpActive);
        setError(null); // Resetujemy komunikat błędu przy zmianie metody (Sign Up / Sign In)
    };

    const handleSignUp = () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
            }).catch((error) => {
                const errorMessage = error.message;
                setError(errorMessage);
            });
    };

    const handleSignIn = () => {
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
            }).catch((error) => {
                const errorMessage = error.message;
                setError(errorMessage);
            });
    };

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
        setError(null); // Resetujemy komunikat błędu po wprowadzeniu zmiany w polu email
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
        setError(null); // Resetujemy komunikat błędu po wprowadzeniu zmiany w polu hasła
    };

    if (user) {
        return <Navigate to='/private'></Navigate>
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '2rem',
                }}
            >
                <Avatar
                    sx={{
                        m: 1,
                        bgcolor: 'primary.main',
                        width: '72px',
                        height: '72px',
                        animation: 'pulsate 3s infinite',
                        '@keyframes pulsate': {
                            '0%': {
                                transform: 'scale(1)',
                                backgroundColor: 'primary.main',
                            },
                            '50%': {
                                transform: 'scale(1.2)',
                                backgroundColor: 'secondary.main',
                            },
                            '100%': {
                                transform: 'scale(1)',
                                backgroundColor: 'primary.main',
                            },
                        },
                    }}
                >
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {isSignUpActive ? 'Sign Up' : 'Sign In'}
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <form>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email"
                        type="email"
                        id="email"
                        autoComplete="email"
                        autoFocus
                        onChange={handleEmailChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={handlePasswordChange}
                    />
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={isSignUpActive ? handleSignUp : handleSignIn}
                    >
                        {isSignUpActive ? 'Sign Up' : 'Sign In'}
                    </Button>
                    <Link onClick={handleMethodChange} component="button" variant="body2">
                        {isSignUpActive ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
                    </Link>
                </form>
            </Box>
        </Container>
    );
};
