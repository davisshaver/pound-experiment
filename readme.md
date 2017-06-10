This project demonstrates prototype implementation of a POUND-like tracking technology.

The following should happen:
- On visit, the app checks whether it is a known user. Currently with a cookie.
- If not known, a new cookie is left. Either way, the unique user ID is recorded.
- A hash is created based on an object containing the unique user ID, the page path, the time, and the value if any of the hash of URL that had brought the current user here. The object and its hash are recorded in a database for future processing.
- The new hash replaces the original hash (if there was one) and process repeats from there.
