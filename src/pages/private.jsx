import { useState, useEffect } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { Button, Container, CssBaseline, Typography, Box, TextField, Grid, Paper } from "@mui/material";
import { getDocs, collection, Firestore, getDoc, setDoc, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "firebase/firestore";
import AddPlatformForm from "../components/AddPlatformForm";
import { Link } from 'react-router-dom';

const user = auth.currentUser;


export const Private = () => {
    let username = auth.currentUser?.displayName || auth.currentUser.email;

    const [userData, setUserData] = useState(null);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [isUsernameTaken, setIsUsernameTaken] = useState(false);
    const [tileColor, setTileColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#f0f0f0');
    const [textColor, setTextColor] = useState('#ffffff');
    const [newDescription, setNewDescription] = useState('');
    const navigate = useNavigate()


    const handleSignOut = () => {
        signOut(auth)
            .then(() => console.log('Sign Out'))
            .catch((error) => console.log(error));
    };

    const getCollectionName = (user) => {
        return user.displayName || user.email;
    };

    const handleColorPreferences = async () => {
        // Ensure that tileColor, backgroundColor, and textColor are valid color codes
        if (!isValidColorCode(tileColor) || !isValidColorCode(backgroundColor) || !isValidColorCode(textColor)) {
            console.error('Invalid color code format');
            return;
        }

        // Call the function to update color preferences in Firestore
        await updateColorPreferences(tileColor, backgroundColor, textColor);
    };

    const isValidColorCode = (colorCode) => {
        // Example using a simple regex for hex color codes:
        const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
        return hexColorRegex.test(colorCode);
    };

    const updateColorPreferences = async (tileColor, backgroundColor, textColor) => {
        if (auth.currentUser) {
            const userCollectionName = getCollectionName(auth.currentUser);
            const userDocRef = doc(firestore, 'users', userCollectionName);

            await updateDoc(userDocRef, {
                colorPreferences: {
                    tileColor,
                    backgroundColor,
                    textColor,
                },
            });

            const updatedDocSnapshot = await getDoc(userDocRef);

            if (updatedDocSnapshot.exists()) {
                setUserData(updatedDocSnapshot.data());
            }
        }
    };

    const handleUpdateDisplayName = async () => {
        if (auth.currentUser && newDisplayName.trim() !== '') {
            // Pobierz starą i nową nazwę kolekcji
            const oldCollectionName = getCollectionName(auth.currentUser);
            const newCollectionName = getCollectionName({ ...auth.currentUser, displayName: newDisplayName });


              // Sprawdź, czy nowa nazwa użytkownika jest już zajęta
              const newDocRef = doc(firestore, 'users', newCollectionName);
              const newDocSnapshot = await getDoc(newDocRef);
              if (newDocSnapshot.exists()) {
                // Nowa nazwa użytkownika jest zajęta
                setIsUsernameTaken(true);
            } else {
                // Nowa nazwa użytkownika jest dostępna
                setIsUsernameTaken(false);
            

            // Aktualizuj wartość displayName w autoryzacji
            await updateProfile(auth.currentUser, {
                displayName: newDisplayName,
            });

            // Sprawdź, czy displayName się zmieniło
            if (oldCollectionName !== newCollectionName) {
                // Zapisz dane do nowej kolekcji
                const newDocRef = doc(firestore, 'users', newCollectionName);
                await setDoc(newDocRef, { ...userData });

                // Usuń starą kolekcję
                const oldDocRef = doc(firestore, 'users', oldCollectionName);
                await deleteDoc(oldDocRef);

                // Ustaw lokalne dane użytkownika na null, aby wymusić ponowne pobranie
                setUserData(null);
            } else {
                // Jeśli tylko displayName się zmieniło, zaktualizuj go w istniejącym dokumencie
                const userDocRef = doc(firestore, 'users', oldCollectionName);
                await updateDoc(userDocRef, {
                    displayName: newDisplayName,
                });
            }
        }}
    };

    const handleUpdateDescription = async () => {
        if (auth.currentUser) {
            const userCollectionName = getCollectionName(auth.currentUser);
            const userDocRef = doc(firestore, 'users', userCollectionName);

            await updateDoc(userDocRef, {
                description: newDescription,
            });

            const updatedDocSnapshot = await getDoc(userDocRef);

            if (updatedDocSnapshot.exists()) {
                setUserData(updatedDocSnapshot.data());
            }
        }
    };

    const handleAddPlatform = async (platform) => {
        if (auth.currentUser) {
            const userCollectionName = getCollectionName(auth.currentUser);
            const userDocRef = doc(firestore, 'users', userCollectionName);

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
            const userCollectionName = getCollectionName(auth.currentUser);
            const userDocRef = doc(firestore, 'users', userCollectionName);

            await updateDoc(userDocRef, {
                platforms: arrayRemove(platform),
            });

            const updatedDocSnapshot = await getDoc(userDocRef);

            if (updatedDocSnapshot.exists()) {
                setUserData(updatedDocSnapshot.data());
            }
        };

    };

    const handleViewProfile = () => {
        if (auth.currentUser) {
            navigate(`/profile/${auth.currentUser.displayName}`);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (auth.currentUser) {
                const userCollectionName = getCollectionName(auth.currentUser);
                const userDocRef = doc(firestore, 'users', userCollectionName);
                const docSnapshot = await getDoc(userDocRef);

                if (docSnapshot.exists()) {
                    setUserData(docSnapshot.data());
                } else {
                    await setDoc(userDocRef, {
                        email: auth.currentUser.email,
                        // default info
                    });

                    const newDocSnapshot = await getDoc(userDocRef);

                    if (newDocSnapshot.exists()) {
                        setUserData(newDocSnapshot.data());
                    } else {
                        console.log('Error creating or fetching document!');
                    }
                }
            }
        };

        fetchUserData();
    }, [auth.currentUser, getCollectionName]);


    return (
        <Container component="main" maxWidth="md">

            <Paper
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2rem',
                    marginTop: '2rem',
                    backgroundColor: '#f0f0f0', // Background color for the entire paper
                    borderRadius: '15px', // Border radius for the paper
                }}
            >
                <Typography component="h2" variant="h4" sx={{ mb: 3, color: '#000000' }}>
                    Hello {auth.currentUser?.displayName || auth.currentUser.email}
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
                    sx={{ mt: 2, mb: 3, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}
                >
                    Update Display Name
                </Button>

                {isUsernameTaken && (
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        This username is already taken. Please choose a different one.
                    </Typography>
                )}

                             <Typography component="h2" variant="h5">
                    Update Description
                </Typography>

                <TextField
                    label="New Description"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    multiline
                    rows={4}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                />

                <Button
                    variant="contained"
                    onClick={handleUpdateDescription}
                    sx={{ mt: 2, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}
                >
                    Update Description
                </Button>


                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <div style={{ marginBottom: '1rem' }}>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Tile Color"
                                variant="outlined"
                                type="color"
                                value={tileColor}
                                onChange={(e) => setTileColor(e.target.value)}
                                style={{ width: '100px', marginRight: '1rem' }}
                            />

                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Background Color"
                                variant="outlined"
                                type="color"
                                value={backgroundColor}
                                onChange={(e) => setBackgroundColor(e.target.value)}
                                style={{ width: '100px', marginRight: '1rem' }}
                            />

                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Text Color"
                                variant="outlined"
                                type="color"
                                value={textColor}
                                onChange={(e) => setTextColor(e.target.value)}
                                style={{ width: '100px', marginRight: '1rem' }}
                            />

                        </div>
                    </div>
                </Box>


                <Button
                    variant="contained"
                    onClick={handleColorPreferences}
                    sx={{ mt: 2, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}
                >
                    Update Color Preferences
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
                                    <Paper
                                        key={index}
                                        elevation={3}
                                        sx={{
                                            p: 3,
                                            width: '100%',
                                            maxWidth: '300px',
                                            mb: 2,
                                            position: 'relative',
                                            backgroundColor: '#ffffff', // Background color for the platform paper
                                            borderRadius: '15px', // Border radius for the platform paper
                                        }}
                                    >
                                        <Typography variant="h6" gutterBottom style={{ color: '#000000' }}>
                                            {platform.name}
                                        </Typography>
                                        <a href={platform.link} target="_blank" rel="noopener noreferrer" style={{ color: '#000000' }}>
                                            {platform.link}
                                        </a>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="secondary"
                                            onClick={() => handleRemovePlatform(platform)}
                                            sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}
                                        >
                                            X
                                        </Button>
                                    </Paper>
                                ))}
                        </div>
                    </Box>
                )}

                <Button variant="contained" onClick={handleViewProfile} sx={{ mt: 2, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}>
                    View Profile
                </Button>

                <Button variant="contained" onClick={handleSignOut} sx={{ mt: 2, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}>
                    Sign Out
                </Button>
                
            </Paper>
           
        </Container>
        

    );
}

export default Private;
