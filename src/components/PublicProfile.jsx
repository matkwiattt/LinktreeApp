import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Typography, Grid, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const PublicProfile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [userNotFound, setUserNotFound] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(firestore, 'users', username);
      const docSnapshot = await getDoc(userDocRef);

      if (docSnapshot.exists()) {
        setUserData(docSnapshot.data());
      } else {
        console.log('User not found');
        setUserNotFound(true);
      }
    };

    fetchUserData();
    console.log('printdb')
  }, [username]);

  if (userNotFound) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Typography variant="h4" gutterBottom>
          Nothing here? <Link to="/">Register now</Link>
        </Typography>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: 'center',
        backgroundColor: userData?.colorPreferences?.backgroundColor || '#f0f0f0',
        minHeight: '100vh',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="h3" gutterBottom style={{ textTransform: 'uppercase', color: userData?.colorPreferences?.titleColor || '#f0f0f0' }}>
        {username}'s Links
      </Typography>

      {userData && userData.description && (
                <Typography variant="body1" style={{ marginBottom: '2rem', color: userData?.colorPreferences?.titleColor || '#f0f0f0'  }}>
                    {userData.description}
                </Typography>
            )}

      <Grid container spacing={3} justifyContent="center">
        {userData &&
          userData.platforms &&
          userData.platforms.map((platform, index) => (
            <Grid item xs={12} key={index}>
              <Paper
                elevation={6}
                component={Link}
                to={'https://' + platform.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  borderRadius: '15px',
                  marginBottom: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  backgroundColor: userData?.colorPreferences?.tileColor || '#ffffff',
                  transition: 'transform 2s ease-in-out',
                  willChange: 'transform',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Typography variant="h4" gutterBottom style={{ color: userData?.colorPreferences?.textColor || '#000000' }}>
                  {platform.name}
                </Typography>
              </Paper>
            </Grid>
          ))}
           <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Typography variant="h6" gutterBottom style={{color: userData?.colorPreferences?.titleColor || '#f0f0f0' }} >
                    Want to setup your own page? <Link to="/">Register now</Link>
                </Typography>
            </div>
      </Grid>
    </div>
  );
};

export default PublicProfile;


