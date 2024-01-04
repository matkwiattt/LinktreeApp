import { useState, useEffect } from "react";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app, auth, firestore } from "../firebase";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
    const [titleColor, setTitleColor] = useState('#000000');
    const [backgroundColor, setBackgroundColor] = useState('#FBFBFB');
    const [textColor, setTextColor] = useState('#ffffff');
    const [newDescription, setNewDescription] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState(null);
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
        if (!isValidColorCode(tileColor) || !isValidColorCode(backgroundColor) || !isValidColorCode(textColor) || !isValidColorCode(titleColor)) {
            console.error('Invalid color code format');
            return;
        }

        // Call the function to update color preferences in Firestore
        await updateColorPreferences(tileColor, backgroundColor, textColor, titleColor);
    };

    const isValidColorCode = (colorCode) => {
        // Example using a simple regex for hex color codes:
        const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
        return hexColorRegex.test(colorCode);
    };

    const updateColorPreferences = async (tileColor, backgroundColor, textColor, titleColor) => {
        if (auth.currentUser) {
            const userCollectionName = getCollectionName(auth.currentUser);
            const userDocRef = doc(firestore, 'users', userCollectionName);

            await updateDoc(userDocRef, {
                colorPreferences: {
                    tileColor,
                    backgroundColor,
                    textColor,
                    titleColor,
                },
            });

            const updatedDocSnapshot = await getDoc(userDocRef);

            if (updatedDocSnapshot.exists()) {
                setUserData(updatedDocSnapshot.data());
            }
        }
    };

    const handleUpdateAvatar = async () => {
        try {
            if (!avatar) {
              console.error('Nie wybrano pliku.');
              return;
            }
      
            const storageRef = ref(getStorage(app));
      
            const timestamp = new Date().toISOString();
            const avatarRef = ref(storageRef, `avatars/${username}`);

      
            const uploadTask = uploadBytesResumable(avatarRef, avatar);
      
            uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Postęp przesyłania: ${progress}%`);
            },
            (error) => {
                console.error('Błąd przesyłania pliku:', error);
            },
            async () => {
                try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Plik przesłano pomyślnie. URL:', downloadURL);
                    setAvatarUrl(downloadURL);
                } catch (error) {
                    console.error('Błąd podczas pobierania URL:', error);
                }
            }
            );
        } catch (error) {
            console.error('Błąd podczas przesyłania pliku:', error);
        }
    };

    const handleUpdateDisplayName = async () => {
        if (auth.currentUser && newDisplayName.trim() !== '') {
            const oldCollectionName = getCollectionName(auth.currentUser);
            const newCollectionName = getCollectionName({ ...auth.currentUser, displayName: newDisplayName.toLowerCase() });

            const newDocRef = doc(firestore, 'users', newCollectionName.toLowerCase());
            const newDocSnapshot = await getDoc(newDocRef);
            if (newDocSnapshot.exists()) {
                setIsUsernameTaken(true);
            } else {
                setIsUsernameTaken(false);

                await updateProfile(auth.currentUser, {
                    displayName: newDisplayName.toLowerCase(),
                });

                if (oldCollectionName !== newCollectionName) {
                    const newDocRef = doc(firestore, 'users', newCollectionName.toLowerCase());
                    await setDoc(newDocRef, { ...userData });

                    const oldDocRef = doc(firestore, 'users', oldCollectionName.toLowerCase());
                    await deleteDoc(oldDocRef);

                    setUserData(null);
                } else {
                    const userDocRef = doc(firestore, 'users', oldCollectionName.toLowerCase());
                    await updateDoc(userDocRef, {
                        displayName: newDisplayName.toLowerCase(),
                    });
                }
            }
        }
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
        console.log('printdb')

    }, [auth.currentUser.displayName]);
    
    const loadUserData = async () => {
        const userCollectionName = getCollectionName(auth.currentUser);
        const userDocRef = doc(firestore, 'users', userCollectionName);
        
        const userData = await getDoc(userDocRef);
        if (userData.exists()) {
            setNewDisplayName(auth.currentUser?.displayName);
            setNewDescription(userData.data().description);
            setTitleColor(userData.data().colorPreferences.titleColor);
            setTileColor(userData.data().colorPreferences.tileColor);
            setBackgroundColor(userData.data().colorPreferences.backgroundColor);
            setTextColor(userData.data().colorPreferences.textColor);
        }

        try {
            const storageRef = ref(getStorage(app));
            const avatarRef = ref(storageRef, `avatars/${username}`);
            const avatarUrl = await getDownloadURL(avatarRef);
            setAvatarUrl(avatarUrl);
        } catch (error) {
            console.error('Błąd podczas pobierania URL:', error);
        }
    };
    useEffect(() => {
        loadUserData();
    }, []);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
    };

    const handleDisplayNameChange = (e) => {
        const inputValue = e.target.value;
        const sanitizedValue = inputValue.replace(/[^a-z0-9]/g, ''); // Remove characters that are not letters or numbers

        setNewDisplayName(sanitizedValue);
    };

    // useEffect(() => {
    //     const fetchImage = async () => {
    //     try {
    //         setImageSrc('https://previews.123rf.com/images/gmast3r/gmast3r1706/gmast3r170600032/79514957-profilowa-ikona-męska-emoci-avatar-mężczyzna-kreskówki-portreta-twarzy-zdziwiona-płaska-wektorowa.jpg');  // Jeśli obraz jest w formacie base64
    //     } catch (error) {
    //         console.error('Błąd pobierania obrazu:', error);
    //     }
    //     };

    //     fetchImage();
    // }, []);

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
                <div>
                    <img src={avatarUrl} style={{
                        minWidth: 140,
                        minHeight: 140,
                        maxWidth: 280,
                        maxHeight: 280,
                        borderRadius: 20,
                        overflow: 'hidden'
                    }} alt="Opis obrazu" />
                </div>

                <input type="file" accept="image/*" onChange={handleAvatarChange} />

                <Button
                    variant="contained"
                    onClick={handleUpdateAvatar}
                    sx={{ mt: 1, mb: 3, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}
                >
                    Update Avatar
                </Button>

                <Typography component="h2" variant="h5">
                    Update Display Name
                </Typography>

                <TextField
                    label="New Display Name"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    value={newDisplayName}
                    onChange={handleDisplayNameChange}
                    helperText="Only numbers and lowercase letters are allowed"
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
                                label="Title Color"
                                variant="outlined"
                                type="color"
                                value={titleColor}
                                onChange={(e) => setTitleColor(e.target.value)}
                                style={{ width: '100px', marginRight: '1rem' }}
                            />

                        </div>
                    </div>
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
