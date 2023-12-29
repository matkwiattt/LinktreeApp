import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Button, Container, CssBaseline, Typography, Box } from "@mui/material";

export const Private = () => {
    const handleSignOut = () => {
        signOut(auth)
            .then(() => console.log('Sign Out'))
            .catch((error) => console.log(error));
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
                <Typography component="h2" variant="h4" sx={{ mb: 3 }}>
                    Private Page
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleSignOut}
                    sx={{ mt: 2 }}
                >
                    Sign Out
                </Button>
            </Box>
        </Container>
    );
};
