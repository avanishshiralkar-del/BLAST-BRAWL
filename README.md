# Chaos Arena

Chaos Arena is a browser-based top-down team shooter with configurable local bots, five themed arenas, a tile-based custom map workshop, a match leaderboard, and a Google/Firebase account option for cloud XP, skins, and friend requests.

## Play

Serve the folder from localhost or HTTPS and open `index.html`. From the home screen, choose **Host a game** to set bots, teams, bot difficulty, match length (3, 5, 10, or 15 minutes), and lives (1, 3, 5, or infinite). The host creates an online room and shares its five-character code; friends join from the same deployed website. The host starts and pauses the match, and the host's simulation is synchronized to joined players through Firebase Realtime Database. The arena is randomly selected by a themed map roulette before the countdown. The lobby includes a local Star Catch mini-game.

Online lobbies require Firebase Authentication's **Anonymous** provider to be enabled, a configured Realtime Database URL, and the current `database.rules.json` rules published to that database. Players may delete their own input and roster records when leaving; these cleanup writes must be permitted by the rules. The lobby roster includes configured bots. Match inputs and state sync at a throttled rate to keep room updates from accumulating. After changing source or rules, redeploy the website and test with two devices. A guest account is created automatically for room access; players can still sign in separately to save account progress.

The home, lobby, and in-game help pages explain controls and features. On touch screens, use the on-screen joystick to move and the buttons to fire, dash, or shield. After you unlock weapons, use **1–4** to switch among them. Once eliminated, spectate a living player with **Tab** and zoom with **+ / -**. The in-game menu offers help, pause, and leave controls. Matches end when the timer runs out or one team eliminates every opposing team. At the end, a skippable winner animation replays recent match highlights. Leaving an active match opens the results screen so current stats and rewards are visible. The post-match screen highlights the MVP and winning team and then offers account sign-in.

The maps have distinct layouts and hazards:

- **Bouncy Reef:** roaming saw and pulsing tide pool.
- **Neon Skyline:** electric speed pads.
- **Ember Foundry:** damaging lava vents.
- **Frostbite Circuit:** slippery ice patches.
- **Overgrown Temple:** jungle hazards among dense stone lanes.

Choose **Build a map** to place or erase walls, hazards, and speed pads on a grid. Give the map a theme and name, then save it to this browser. Custom maps are local to the browser and are not automatically shared with other players.

## Firebase setup

Account sign-in requires a Firebase project; no project credentials are included in this source.

1. Create a Firebase project and register a web app.
2. Enable **Authentication → Sign-in method → Google** for Google login and/or **Email/Password** for email login. Enabling a provider in Firebase Console alone is not enough; this app also needs to be served from the website so it can use Firebase Authentication.
3. Add the deployed website's exact hostname under **Authentication → Settings → Authorized domains**. For local testing, open the page through `http://localhost:8000`, not by opening the HTML file directly (`file://`). If Google opens and then fails, check the browser's popup/third-party-cookie settings and the Firebase authorized-domain list.
4. Create a **Realtime Database** in the Firebase Console. Copy its URL (shown at the top of the Data page).
5. Copy the Firebase web-app `apiKey`, `authDomain`, `projectId`, and `appId` values, plus the Realtime Database URL, into `firebase-config.js`. Set `databaseURL` to the exact URL shown in the console, including `https://`.
6. In Realtime Database → Rules, replace the rules with the contents of `database.rules.json` and publish them.
7. Serve the folder from localhost or HTTPS and visit the page.

After setup, use **Sign up / Log in** to continue with Google or enter an email and password. The email form supports both signing into an existing account and creating one. Every player starts with the free Pulse gun; signed-in players can spend shop tokens on stronger guns and skins. Completed matches award career XP to signed-in players. Signed-in players earn 10 shop tokens per KO, up to 100 tokens per UTC day; guests need to sign in for KO tokens to be saved to the shop. Match results show the saved token total and any Firebase error if the award could not be saved. Skins also grant match abilities: Neon increases movement speed, Ember increases weapon damage and health, and Frost increases speed, damage, health, and resistance. Shop purchases and equipped items are stored on the Firebase profile. Players can send friend requests using another player's ID, accept incoming requests, and view the global XP leaderboard.

The app stores account profiles in `/profiles/{uid}`, incoming friend requests in `/friendRequests/{recipientUid}/{senderUid}`, accepted friends in `/friends/{uid}/{friendUid}`, and live rooms under `/rooms/{roomCode}`. Room hosts publish match state; players write only their own control input.

The global leaderboard and game rooms are stored in Firebase Realtime Database; a spreadsheet URL is not needed. A Google Sheet is not a suitable public game database because it requires exposing a privileged integration and does not securely validate scores. The host's browser is the match authority, which is suitable for casual friend games but is not cheat-proof or resilient to host disconnects. The shop and daily token allowance are also prototype client-side features; use a trusted backend to validate kills, token limits, purchases, and unlocks before launching a public ranked economy.
