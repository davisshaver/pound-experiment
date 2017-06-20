const sh = require('shorthash');

export default function recordPageViewForUser({ uidSource, uid, uidTime = 0}, database) {

    /**
     * Set a bypass var for admin.
     */
    let bypass = false;
    if ('#.bypass' === window.location.hash) {
      bypass = true;
    }


    /**
     * Construct an object representing this visit.
     */
    const visit = {
      u: uid,
      uS: uidSource,
      uT: uidTime,
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
    if (!bypass) {
      database.ref(`visits/${visit.u}/${visit.t}`).set(visit);
    } else {
      console.log(visit);
    }

    /**
     * Set the new hash.
     */
    window.location.hash = `.${visit.hash}`;

}