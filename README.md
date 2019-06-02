# minimal-flask-react

Based on https://github.com/rwieruch/minimal-react-webpack-babel-setup

## Run Locally

1. Clone this repo: `git clone git@github.com:jwkvam/minimal-flask-react.git`
2. npm install
3. npm run dev
4. pip install -r requirements.txt
5. python server.py
6. Goto http://localhost:3000

## Bugs
1. SSL problem: not work on chrome and mobile.
2. Need to kill the socket listener when blinking is detected, or it will keep sending unused package.
3. Can not bear too many clients because the detector engine is too slow.

If you would like to have webpack rebuild your javascript any time your React code changes, enter `npm run start` in a different terminal.
