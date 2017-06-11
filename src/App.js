import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import './App.css';
const sh = require('shorthash');
const uuidV4 = require('uuid/v4');

/**
 * Use firebase database for now.
 */
const firebase = require('firebase');
const config = {
  apiKey: "AIzaSyCfaEEAbUzKHAtrm2ym7O9ov-bfeay19bY",
  authDomain: "pound-f4f07.firebaseapp.com",
  databaseURL: "https://pound-f4f07.firebaseio.com",
  projectId: "pound-f4f07",
  storageBucket: "pound-f4f07.appspot.com",
  messagingSenderId: "825939539499"
};
firebase.initializeApp(config);
const database = firebase.database();

/**
 * Basic function to write visit data.
 * @param {object} visit 
 */
function writeVisitData(visit) {
  database.ref(`visits/${visit.u}/${visit.t}`).set(visit);
}

class App extends Component {
  constructor() {
    super();

    /**
     * Check for a poundUser cookie
     * and if not create a UUID.
     */
    const cookies = new Cookies();
    let userID = cookies.get('poundUser');
    if (!userID) {
      userID = uuidV4();
      cookies.set('poundUser', userID, { path: '/' });
    }


    /**
     * This portion would be hoisted to a 
     * service a later date so that alll the
     * user sees is the hash output.
     */

    /**
     * Construct an object representing this visit.
     */
    const visit = {
      u: userID,
      rU:(
        window.location.hash &&
        window.location.hash.includes('.')
        ) ? window.location.hash.replace('#.', '') :
        '' /* Grab hash from URL they landed on before replace */,
      s: document.referrer /* Map numbers to Facebook*/,
      p: window.location.pathname,
      t: Date.now(),
    };

    /**
     * We are hashing the string of the user object.
     * Generate new hash for forward tracking.
     */
    visit.hash = sh.unique(JSON.stringify(visit));

    /**
     * Record object to database.
     */
    writeVisitData(visit)

    /**
     * Set the new hash.
     */
    window.location.hash = `.${visit.hash}`;

    /**
     * Load previous data.
     * This is a little dense, but process is:
     * - Get the db result (only once so it's immutable for now)
     * - Pull the value out of the result
     * - Start a reduce based on each visitor key
     *  - For each visitor key, create a node first.
     */
    database.ref('visits/').once('value')
      .then((result) => {
        return result.val();
      })
      .then((data) => {
        const userMap = Object.keys(data)
          .reduce((agg, visitorKey) => {
            agg[visitorKey] = Object.keys(data[visitorKey])
              .map((viewKey) => {
                return data[visitorKey][viewKey].hash
              });
            return agg;
          }, {});
        const transformed = Object.keys(data)
          .reduce((agg, visitorKey) => {
            /**
             * For each unique title, get a node. Nested reduce not idea but oh well.
             */
            const uniqueTitles = [...new Set(
              Object.keys(data[visitorKey]).map(visit => data[visitorKey][visit].p)
            )];
            uniqueTitles.reduce((agg, title) => {
              const viewKeys = Object.keys(data[visitorKey]);
              const viewsToTitle = viewKeys.map((key) => {
                if (title === data[visitorKey][key].p) {
                  return data[visitorKey][key];
                }
                return null;
              });
              const firstView = viewsToTitle.reduce(
                (first, view) => (
                  (!first && title === view.p) ? view : first
                ), null
              );
              let referringUser = false;
              Object.keys(userMap).forEach((user) => {
                console.log(Object.values(userMap[user]));
                if (Object.values(userMap[user]).includes(firstView.rU)) {
                  referringUser = user;
                }
              });
              agg.nodes.push({
                user: visitorKey,
                source: firstView.s,
                referringUser,
                viewsToTitle: viewsToTitle.length,
                hashes: Object.values(viewsToTitle).map((view) => view.hash)
              });
              return agg;
            }, agg);
          return agg;
        }, {nodes: [], segments: []});
        console.log(transformed);
      })
      .catch((e) => {
        console.log(e);
      });
  }

  render() {
    return (
      <div className="App">
        <h2>Welcome to Pound Demo</h2>
      </div>
    );
  }
}

export default App;
