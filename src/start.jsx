import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/styles';

const styles = () => ({
  container: {
    // JSS uses px as the default units for this CSS property.
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  item: {
    padding: 8 * 2,
    textAlign: 'center'
  }
});

class Start extends React.Component {
  constructor(props){
    super();
    this.props = props;
  }
  render(){
    const {classes} = this.props;

    return (
      <div>
        <Grid container justify="center" alignItems="center"  className={classes.container}>
          <Grid item>
            <Paper className={classes.item}>
            <Typography variant="h5" component="h3" color="textPrimary">
                Blink Contest
            </Typography>
            <Typography variant="body" component="p" color="textSecondary">
                Challenge a random player around the world.
            </Typography>
            <Button variant="contained" color="primary">
                Connect
            </Button> 
            </Paper>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Start);