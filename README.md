!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Snake Sprint is a neon arcade snake game. Swipe fast, stack glow streaks, and chase high scores.">
    <meta name="color-scheme" content="light">
    <meta property="og:title" content="Snake Sprint Arcade">
    <meta property="og:description" content="Swipe fast, stack glow streaks, and chase high scores in this neon snake sprint.">
    <meta property="og:type" content="website">
    <meta property="og:image" content="assets/snake.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Snake Sprint Arcade">
    <meta name="twitter:description" content="Swipe fast, stack glow streaks, and chase high scores in this neon snake sprint.">
    <meta name="twitter:image" content="assets/snake.png">
    <meta name="theme-color" content="#fff7e6">
    <title>Snake Sprint Arcade</title>
    <link rel="icon" href="assets/snake.png" type="image/png">
    <link rel="preload" href="assets/snake.png" as="image">
    <link rel="preload" href="assets/sound-fx/music.mp3" as="audio">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <script>
        (() => {
            try {
                const prefs = JSON.parse(localStorage.getItem('snake.prefs.v1') || '{}');
                if (prefs.theme) {
                    document.documentElement.dataset.theme = prefs.theme;
                }
                if (prefs.colorblind) {
                    document.documentElement.dataset.colorblind = 'true';
                }
            } catch (error) {
                // Ignore storage issues.
            }
        })();
    </script>
    <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
<a class="skip-link" href="#game-main">Skip to game</a>
<div class="page">
    <noscript>
        <div class="noscript">Snake Sprint runs on JavaScript. Enable it to play the game.</div>
    </noscript>
    <header class="hero reveal">
        <div class="hero__badge"><span class="badge-dot" aria-hidden="true"></span> Glow Arcade</div>
        <h1>Snake Sprint</h1>
        <p class="hero__subtitle">Swipe fast, stack glow streaks, and keep the vibe alive.</p>
        <div class="hero__chips">
            <span class="chip">Instant play</span>
            <span class="chip">Combo glow</span>
            <span class="chip">Mobile ready</span>
        </div>
    </header>

    <main class="game-shell" data-status="ready" id="game-main">
        <section class="panel panel--info reveal delay-1">
            <div class="status" role="status" aria-live="polite" aria-atomic="true">
                <div class="status__tag">How to play</div>
                <h2 class="status__title" data-status-title>Press Start to begin</h2>
                <p class="status__hint" data-status-hint>Use arrow keys, WASD, or the pad.</p>
            </div>

            <div class="stats">
                <div class="stat">
                    <span class="stat__label">Score</span>
                    <span class="stat__value" data-score>0</span>
                </div>
                <div class="stat">
                    <span class="stat__label">Best</span>
                    <span class="stat__value" data-best>0</span>
                </div>
                <div class="stat">
                    <span class="stat__label">Fruits</span>
                    <span class="stat__value" data-fruits>0</span>
                </div>
                <div class="stat">
                    <span class="stat__label">Streak</span>
                    <span class="stat__value" data-streak>0</span>
                </div>
                <div class="stat">
                    <span class="stat__label">Bonus in</span>
                    <span class="stat__value" data-bonus-in>0</span>
                </div>
                <div class="stat">
                    <span class="stat__label">Length</span>
                    <span class="stat__value" data-length>3</span>
                </div>
                <div class="stat">
                    <span class="stat__label">Speed</span>
                    <span class="stat__value" data-speed-value>1.0x</span>
                </div>
                <div class="stat">
                    <span class="stat__label">Obstacles</span>
                    <span class="stat__value" data-blocks-count>0</span>
                </div>
            </div>

            <div class="actions">
                <button class="btn" type="button" data-action="start">Start</button>
                <button class="btn btn--ghost" type="button" data-action="reset">Reset</button>
                <button class="btn btn--ghost" type="button" data-action="auto" aria-pressed="false">Auto: Off</button>
            </div>

            <div class="meters">
                <div class="meter" data-meter="streak">
                    <div class="meter__label">Streak window</div>
                    <div class="meter__track">
                        <div class="meter__fill" data-meter-fill="streak"></div>
                    </div>
                    <div class="meter__meta" data-meter-meta="streak">No streak yet</div>
                </div>
                <div class="meter" data-meter="boost">
                    <div class="meter__label">Boost</div>
                    <div class="meter__track">
                        <div class="meter__fill" data-meter-fill="boost"></div>
                    </div>
                    <div class="meter__meta" data-meter-meta="boost">No boost active</div>
                </div>
            </div>

            <details class="panel-section" open>
                <summary>Run setup</summary>
                <div class="section-body">
                    <label class="select">
                        <span class="select__label">Speed mode</span>
                        <select data-speed>
                            <option value="cruise">Cruise</option>
                            <option value="turbo">Turbo</option>
                            <option value="warp">Warp</option>
                        </select>
                    </label>

                    <div class="setup-grid">
                        <label class="toggle">
                            <input type="checkbox" data-wrap checked>
                            <span>Wrap walls</span>
                        </label>

                        <label class="select">
                            <span class="select__label">Enemies</span>
                            <select data-enemies>
                                <option value="0">0</option>
                                <option value="1">1</option>
                                <option value="2" selected>2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                            </select>
                        </label>

                        <label class="select">
                            <span class="select__label">Poison</span>
                            <select data-poison>
                                <option value="off">Off</option>
                                <option value="low">Low</option>
                                <option value="med" selected>Med</option>
                                <option value="high">High</option>
                            </select>
                        </label>

                        <label class="select">
                            <span class="select__label">Obstacles</span>
                            <select data-blocks>
                                <option value="0">0</option>
                                <option value="2">2</option>
                                <option value="4" selected>4</option>
                                <option value="6">6</option>
                            </select>
                        </label>
                    </div>

                    <button class="btn btn--ghost" type="button" data-action="daily">Start daily</button>

                    <div class="daily-card">
                        <div class="daily-row">Today: <span data-daily-date>--</span></div>
                        <div class="daily-row">Target: <span data-daily-target>0</span> fruits</div>
                        <div class="daily-row">Progress: <span data-daily-progress>0</span></div>
                        <div class="daily-row">Daily best: <span data-daily-best>0</span></div>
                    </div>
                </div>
            </details>
        </section>

        <section class="panel panel--board reveal delay-2">
            <div class="board-header">
                <div class="board-title">Glow Grid</div>
                <div class="board-status" data-board-status>Ready</div>
                <div class="mode-pill" data-mode>Classic</div>
            </div>

            <div class="board-wrap">
                <canvas id="board" width="440" height="440" aria-label="Snake Sprint game board" aria-describedby="board-desc"></canvas>
                <p class="sr-only" id="board-desc">Use arrow keys, WASD, or swipe to steer. Eat fruit to grow, avoid enemies, poison, and obstacles.</p>
                <div class="board-toast" data-toast aria-live="polite"></div>
            </div>

            <div class="pad">
                <button class="pad__btn" type="button" data-dir="up" aria-label="Move up">Up</button>
                <div class="pad__row">
                    <button class="pad__btn" type="button" data-dir="left" aria-label="Move left">Left</button>
                    <button class="pad__btn" type="button" data-dir="down" aria-label="Move down">Down</button>
                    <button class="pad__btn" type="button" data-dir="right" aria-label="Move right">Right</button>
                </div>
            </div>

            <p class="pad__hint">Swipe the grid or tap the pad on mobile.</p>

            <div class="board-extras">
                <div class="tips">
                    <div class="tip">Space to pause</div>
                    <div class="tip">R to reset</div>
                    <div class="tip">Bonus every 5 fruits</div>
                    <div class="tip">Poison shrinks you</div>
                    <div class="tip">Avoid enemies</div>
                    <div class="tip">Keep streaks alive</div>
                    <div class="tip">Daily run for shards</div>
                </div>

                <details class="panel-section">
                    <summary>Progression</summary>
                    <div class="section-body">
                        <div class="currency">Shards: <span data-shards>0</span></div>
                        <div class="upgrades" data-upgrades></div>
                    </div>
                </details>

                <details class="panel-section">
                    <summary>Theme & Accessibility</summary>
                    <div class="section-body">
                        <label class="select">
                            <span class="select__label">Theme</span>
                            <select data-theme>
                                <option value="neon">Neon</option>
                                <option value="midnight">Midnight</option>
                                <option value="sage">Sage</option>
                                <option value="mono">Mono</option>
                            </select>
                        </label>
                        <label class="toggle">
                            <input type="checkbox" data-colorblind>
                            <span>High contrast</span>
                        </label>
                        <div class="keybinds" data-keybinds></div>
                    </div>
                </details>

                <details class="panel-section">
                    <summary>Audio</summary>
                    <div class="section-body">
                        <label class="toggle">
                            <input type="checkbox" data-sfx checked>
                            <span>Sound effects</span>
                        </label>
                        <label class="toggle">
                            <input type="checkbox" data-music>
                            <span>Music</span>
                        </label>
                    </div>
                </details>

                <details class="panel-section">
                    <summary>Achievements</summary>
                    <div class="section-body">
                        <div class="achievements" data-achievements></div>
                    </div>
                </details>

                <details class="panel-section">
                    <summary>Leaderboard & Share</summary>
                    <div class="section-body">
                        <div class="leaderboard" data-leaderboard></div>
                        <button class="btn btn--ghost" type="button" data-action="share">Copy game link</button>
                    </div>
                </details>
            </div>
        </section>
    </main>

    <footer class="share-footer reveal delay-3">
        <button class="btn btn--ghost" type="button" data-action="share">Share</button>
    </footer>

</div>

<script src="assets/game.js"></script>
</body>
</html>
