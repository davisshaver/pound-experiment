import React, { Component } from 'react';
import Cookies from 'universal-cookie';
import './App.css';
import recordPageviewForUser from './pageView';
import renderVisualization from './viz';

const Fingerprint2 = require('fingerprintjs2');
const firebase = require('firebase');

class App extends Component {
  constructor() {
    super();

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
     * First fingerprint the browser.
     */
    const cookies = new Cookies();
    let userID = cookies.get('poundUser');
    if (!userID) {
      const start = new Date();
      new Fingerprint2({
        excludeAdBlock: true,
        excludeAddBehavior: true,
        excludeHardwareConcurrency: true,
        excludeHasLiedBrowser: true,
        excludeHasLiedLanguages: true,
        excludeHasLiedOs: true,
        excludeHasLiedResolution: true,
        excludeIEPlugins: true,
        excludeIndexedDB: true,
        excludeJsFonts: true,
        excludeOpenDatabase: true,
        excludePixelRatio: true,
        excludePlugins: true,
        excludeSessionStorage: true,
        excludeTouchSupport: true,
      }).get((result) => {
        const perf = new Date() - start;
        cookies.set('poundUser', result, { path: '/' });
        recordPageviewForUser({
          uidSource: 'fingerprint2',
          uid: result,
          uidTime: perf,
        }, database);
      });
    } else {
      recordPageviewForUser({
        uidSource: 'cookie',
        uid: userID
      }, database);
    }
    renderVisualization(database);
  }

  render() {
    return (
      <div className="App">
        <h2>Welcome to Pound Demo</h2>
        <strong><a href="https://davisshaver.com/2017/06/11/weekend-hack-pound-like-tracking-strings/">Read more</a></strong>
        <div id="viz"></div>
      </div>
    );
  }
}

export default App;
