import { useState, useEffect } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { Button, Container, CssBaseline, Typography, Box, TextField, Grid, Paper } from "@mui/material";
import { getDocs, collection, Firestore, getDoc, setDoc, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import AddPlatformForm from "../components/AddPlatformForm";


const user = auth.currentUser;


export const Private = () => {
    let username = auth.currentUser?.displayName || auth.currentUser.email;

    const [userData, setUserData] = useState(null);
    const [newDisplayName, setNewDisplayName] = useState('');
    const navigate = useNavigate()


    const handleSignOut = () => {
        signOut(auth)
            .then(() => console.log('Sign Out'))
            .catch((error) => console.log(error));
    };

    const handleUpdateDisplayName = async () => {
        if (auth.currentUser && newDisplayName.trim() !== '') {
            // Aktualizuj wartość displayName w autoryzacji
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName,
            });

            // Pobierz aktualizowane dane z Firestore
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
            const docSnapshot = await getDoc(userDocRef);

            if (docSnapshot.exists()) {
                setUserData(docSnapshot.data());
            }
        }
    };

    const handleAddPlatform = async (platform) => {
        if (auth.currentUser) {
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);

            await updateDoc(userDocRef, {
                platforms: arrayUnion(platform),
            });

            const updatedDocSnapshot = await getDoc(userDocRef);

            if (updatedDocSnapshot.exists()) {
                setUserData(updatedDocSnapshot.data());
            }
        }
    };

    const handleRemovePlatform = async (platform) => {
        if (auth.currentUser) {
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);

            await updateDoc(userDocRef, {
                platforms: arrayRemove(platform),
            });

            const updatedDocSnapshot = await getDoc(userDocRef);

            if (updatedDocSnapshot.exists()) {
                setUserData(updatedDocSnapshot.data());
            }
        }
    };

    const handleViewProfile = () => {
        if (auth.currentUser) {
            navigate(`/${auth.currentUser.displayName}`);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
                const docSnapshot = await getDoc(userDocRef);

                if (docSnapshot.exists()) {
                    //if exist get data
                    setUserData(docSnapshot.data());
                } else {
                    // if dosent exist create it
                    await setDoc(userDocRef, {
                        email: auth.currentUser.email,
                        // default info
                    });

                    // get it again
                    const newDocSnapshot = await getDoc(userDocRef);

                    if (newDocSnapshot.exists()) {
                        setUserData(newDocSnapshot.data());
                    } else {
                        console.log('Błąd podczas tworzenia lub pobierania dokumentu!');
                    }
                }
            }
        };

        fetchUserData();
    }, []);


    return (
        <Grid container component="main" maxWidth="xs">
            <Grid item xs={12}>
                <Paper
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '2rem',
                        marginTop: '2rem',
                    }}
                >
                    <Typography component="h2" variant="h4" sx={{ mb: 3 }}>
                        Hello {username}
                    </Typography>

                    <Typography component="h2" variant="h5">
                        Update Display Name
                    </Typography>

                    <TextField
                        label="New Display Name"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        onClick={handleUpdateDisplayName}
                        sx={{ mt: 2, mb: 3 }}
                    >
                        Update Display Name
                    </Button>

                    <AddPlatformForm onAddPlatform={handleAddPlatform} />

                    {userData?.platforms && (
                        <Box sx={{ mt: 3 }}>
                            <Typography component="h2" variant="h5">
                                Your Platforms:
                            </Typography>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {userData?.platforms &&
                                    userData.platforms.map((platform, index) => (
                                        <Paper key={index} elevation={3} sx={{ p: 3, width: '100%', maxWidth: '300px', mb: 2, position: 'relative' }}>
                                            <Typography variant="h6" gutterBottom>
                                                {platform.name}
                                            </Typography>
                                            <a href={platform.link} target="_blank" rel="noopener noreferrer">
                                                {platform.link}
                                            </a>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color="secondary"
                                                onClick={() => handleRemovePlatform(platform)}
                                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                            >
                                                X
                                            </Button>
                                        </Paper>
                                    ))}
                            </div>

                        </Box>
                    )}
                    <Button
                        variant="contained"
                        onClick={handleViewProfile}
                        sx={{ mt: 2 }}
                    >
                        View Profile
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSignOut}
                        sx={{ mt: 2 }}
                    >
                        Sign Out
                    </Button>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Private;
