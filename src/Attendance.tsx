import { Box, Button, Container, Grid } from '@mui/material';
import { Fragment } from 'react';

// src/routes/Home.js
export const Attendance = () => {
  return (
    <Fragment>
      <Container>
        <Grid container>
          <Grid item md={4}></Grid>
          <Grid item md={4}>
            <h2>出退勤報告</h2>
            <Box component="form">
              <Button
                fullWidth
                style={{ marginTop: '0.5em', marginBottom: '0.5em' }}
              >
                出勤
              </Button>
            </Box>
          </Grid>
          <Grid item md={4}></Grid>
        </Grid>
      </Container>
    </Fragment>
  );
};
