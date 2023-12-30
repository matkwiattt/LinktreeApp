// AddPlatformForm.js

import React, { useState } from "react";
import { Button, Typography, TextField } from "@mui/material";

const AddPlatformForm = ({ onAddPlatform }) => {
  const [platformName, setPlatformName] = useState('');
  const [platformLink, setPlatformLink] = useState('');

  const handleAddPlatform = () => {
    if (platformName.trim() !== '' && platformLink.trim() !== '') {
      onAddPlatform({ name: platformName, link: platformLink });

      // Wyczyść formularz po dodaniu
      setPlatformName('');
      setPlatformLink('');
    }
  };

  return (
    <>
      <Typography component="h2" variant="h5">
        Add Platform
      </Typography>

      <TextField
        label="Platform Name"
        variant="outlined"
        margin="normal"
        fullWidth
        value={platformName}
        onChange={(e) => setPlatformName(e.target.value)}
      />

      <TextField
        label="Platform Link"
        variant="outlined"
        margin="normal"
        fullWidth
        value={platformLink}
        onChange={(e) => setPlatformLink(e.target.value)}
      />

      <Button
        variant="contained"
        onClick={handleAddPlatform}
        sx={{ mt: 2, backgroundColor: '#000000', color: '#ffffff', borderRadius: '10px' }}
      >
        Add Platform
      </Button>
    </>
  );
};

export default AddPlatformForm;
