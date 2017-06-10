This project demonstrates prototype implementation of a POUND-like tracking technology.

The following should happen:
- When user visits with valid tracking URL – e.g. `/#.UNIQUE` – they are prompted to loogin.
- Upon login, the system will fire an event with the `UNIQUE` value as well as a similar value for the current user, plus any other relevant referral or location information.
- The system should show a tree that visualizes how they got to the site in reference to other users.
- A new share link should be generated that allows the process to be repeated.
