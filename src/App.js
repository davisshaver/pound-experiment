import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import './App.css';
const sh = require('shorthash');
const uuidV4 = require('uuid/v4');

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
    const user = {
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
     * Record object to database.
     */

    /**
     * We are hashing the string of the user object.
     * Generate new hash for forward tracking.
     */
    const key = window.location.hash = `.${sh.unique(JSON.stringify(user))}`;
    console.info(user, key);
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
