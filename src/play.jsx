import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/styles';

const styles = () => ({
  root:{
    backgroundColor: '#f5f5f5',
    height: '100vh'
  },
  container:{
    padding: 2*8,
  },
  header:{
    textAlign: 'center',
    padding: 2*8,
  },
  frameHeader:{
    textAlign: 'center',
    padding: 2*8,
  },
  frame:{
    padding: 4*8
  },
  footer:{
    textAlign: 'center'
  },
  video:{
    width: '100%'
  }
});

class Play extends React.Component {
  constructor(props){
    super();
    this.props = props;
  }
  render(){
    const {classes} = this.props;

    return (
      <div className={classes.root}>
      <Grid container justify="space-around" spacing={3} className={classes.container}>
        <Grid item xs={12} className={classes.header}>
          <Typography variant="h3" color="primary">
          60s God Level!
          </Typography>
        </Grid>
        <Grid item xs={5}>
          <Paper className={classes.frameHeader}>
          <Typography variant="h4" color="secondary">
          HP: 92 
          </Typography>
          </Paper>
        </Grid>
        <Grid item xs={5}>
          <Paper className={classes.frameHeader}>
          <Typography variant="h4" color="secondary">
          HP: 33
          </Typography>
          </Paper>
        </Grid>
        <Grid item xs={5}>
          <Paper className={classes.frame}>
          <img className={classes.video} src="https://specials-images.forbesimg.com/imageserve/5b8576db31358e0429c734e3/416x416.jpg?background=000000&cropX1=211&cropX2=2381&cropY1=900&cropY2=3072"/>
          </Paper>
        </Grid>
        <Grid item xs={5}>
          <Paper className={classes.frame}>
          <img className={classes.video} src="https://specials-images.forbesimg.com/imageserve/5b8576db31358e0429c734e3/416x416.jpg?background=000000&cropX1=211&cropX2=2381&cropY1=900&cropY2=3072"/>
          </Paper>
        </Grid>
        <Grid item xs={12} className={classes.footer}>
          <Button variant="contained" color="primary" size="large">
            Restart
          </Button> 
        </Grid>
      </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(Play);