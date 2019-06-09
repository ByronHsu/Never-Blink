import React from 'react';
import {
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

const styles = theme => ({
  container: {
    height: '100vh',
    backgroundColor: grey[100]
  },
  item: {
    padding: theme.spacing(2),
    textAlign: 'center'
  },
  logo: {
    width: '100px'
  }
});

class Start extends React.Component {
  constructor(props) {
    super();
    this.props = props;
  }

  render() {
    const { classes, toggle, handleOnClick } = this.props;

    return (
      <React.Fragment>
        <Grid
          container
          justify="center"
          alignItems="center"
          className={classes.container}
        >
          <Grid item>
            <Paper className={classes.item}>
              <img
                className={classes.logo}
                src="https://i.imgur.com/Tm6mUuM.png"
                alt="Can not access"
              />
              <Typography variant="h5" component="h3" color="textPrimary">
                Never Blink
              </Typography>
              {toggle ? (
                <React.Fragment>
                  <Typography
                    variant="body1"
                    component="p"
                    color="textSecondary"
                  >
                    Waiting for someone to join...
                  </Typography>
                  <CircularProgress />
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Typography
                    variant="body1"
                    component="p"
                    color="textSecondary"
                  >
                    Challenge a random player around the world.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOnClick}
                  >
                    Connect
                  </Button>
                </React.Fragment>
              )}
            </Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Start);
