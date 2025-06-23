// 기존 타이머 코드
            let timer;
            let isRunning = false;
            let isFocusTime = true; // 현재 모드: true면 집중, false면 휴식
            let remainingSeconds = 0;
            let isStopwatchMode = false; // 스톱워치 모드 여부
            let currentStopwatchSeconds = 0; // 스톱워치 시간

            const display = document.getElementById("timer-display");
            const toggleTimerButton = document.getElementById("toggle-timer-button");
            const toggleTimerIcon = toggleTimerButton.querySelector("img"); // 이 버튼에는 img 태그가 여전히 존재합니다.
            const resetTimerButton = document.getElementById("reset-timer-button");
            const modeBox = document.getElementById("mode-indicator");
            const stopwatchModeButton = document.getElementById("stopwatch-mode-button");

            // 다크모드 토글 기능
            const darkModeToggle = document.getElementById('dark-mode-toggle');
            const darkModeIcon = document.getElementById('dark-mode-icon'); // SVG 이미지를 위한 새로운 요소
            const body = document.body;

            // 다크모드 상태 로드
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            if (isDarkMode) {
                body.classList.add('dark-mode');
                darkModeIcon.src = 'image/light.svg'; // 라이트 모드 아이콘으로 변경
                darkModeIcon.alt = '라이트 모드 토글';
            } else {
                darkModeIcon.src = 'image/dark.svg'; // 다크 모드 아이콘으로 설정
                darkModeIcon.alt = '다크 모드 토글';
            }

            darkModeToggle.addEventListener('click', () => {
                body.classList.toggle('dark-mode');
                const isCurrentlyDark = body.classList.contains('dark-mode');
                if (isCurrentlyDark) {
                    darkModeIcon.src = 'image/light.svg';
                    darkModeIcon.alt = '라이트 모드 토글';
                } else {
                    darkModeIcon.src = 'image/dark.svg';
                    darkModeIcon.alt = '다크 모드 토글';
                }
                localStorage.setItem('darkMode', isCurrentlyDark);
            });


            function showCustomAlert(message) {
                const el = document.getElementById("custom-alert");
                el.textContent = message;
                el.style.display = "block";

                setTimeout(() => {
                    el.style.display = "none";
                }, 3000); // 3초 후 자동 사라짐
            }

            function formatTime(seconds) {
                const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
                const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
                const s = String(seconds % 60).padStart(2, "0");
                return `${h} : ${m} : ${s}`;
            }

            function updateDisplay() {
                if (isStopwatchMode) {
                    display.textContent = formatTime(currentStopwatchSeconds);
                } else {
                    display.textContent = formatTime(remainingSeconds);
                }
            }

            function updateModeDisplay() {
                if (isStopwatchMode) {
                    modeBox.textContent = "스톱워치 모드";
                    modeBox.style.backgroundColor = "#e6ffe6";
                } else {
                    modeBox.textContent = isFocusTime ? "집중 모드" : "휴식 모드";
                    modeBox.style.backgroundColor = isFocusTime ? "#e0f7fa" : "#ffe0e0";
                }
            }

            function startTimer() {
                isRunning = true;
                timer = setInterval(() => {
                    if (isStopwatchMode) {
                        currentStopwatchSeconds++;
                    } else {
                        if (remainingSeconds > 0) {
                            remainingSeconds--;
                        } else {
                            clearInterval(timer);
                            isRunning = false;
                            if (toggleTimerIcon) { // toggleTimerIcon이 null이 아닌지 확인
                                togglePlayTimerButton("start.svg");
                            }


                            const alarmAudio = document.getElementById("alarm-sound");
                            if (alarmAudio) {
                                alarmAudio.play().catch((e) => console.warn("오디오 재생 실패:", e));
                            }

                            flashBackground();

                            // 소리 재생 직후에 alert 살짝 지연 (100ms)
                            setTimeout(() => {
                                if (isFocusTime) {
                                    showCustomAlert("휴식 시간이 끝났습니다! 다시 집중할 시간입니다.");
                                } else {
                                    showCustomAlert("집중 시간이 끝났습니다! 휴식할 시간입니다.");
                                }
                            }, 500);

                            isFocusTime = !isFocusTime;
                            applyTimeSetting();
                        }
                    }
                    updateDisplay();
                }, 1000);
            }

            function togglePlayTimerButton(icon) {
                // toggleTimerIcon (시작/정지 버튼 안의 아이콘)이 실제로 존재하는지 확인 후 src 변경
                if (toggleTimerIcon) {
                    toggleTimerIcon.src = icon;
                }
            }

            function toggleTimer() {

                const alarmAudio = document.getElementById("alarm-sound");
                if (alarmAudio) {
                    alarmAudio.play().then(() => {
                        alarmAudio.pause();
                        alarmAudio.currentTime = 0;
                        console.log("🔔 알람 사운드 사전 준비 완료");
                    }).catch((e) => {
                        console.warn("⚠️ 알람 사운드 사전 재생 실패:", e);
                    });
                }

                if (isRunning) {
                    clearInterval(timer);
                    if (toggleTimerIcon) {
                        togglePlayTimerButton("image/start.svg");
                    }
                    isRunning = false;
                } else {
                    if (!isStopwatchMode && remainingSeconds === 0) {
                        applyTimeSetting();
                    }
                    startTimer();
                    if (toggleTimerIcon) {
                        togglePlayTimerButton("image/stop.svg");
                    }
                    isRunning = true;
                }
            }

            function resetTimer() {
                clearInterval(timer);
                isRunning = false;
                isFocusTime = true;
                isStopwatchMode = false;
                remainingSeconds = 0;
                currentStopwatchSeconds = 0;
                updateDisplay();
                updateModeDisplay();
                if (toggleTimerIcon) {
                    togglePlayTimerButton("image/start.svg");
                }

                document.getElementById("focus-h").value = "0";
                document.getElementById("focus-m").value = "25";
                document.getElementById("focus-s").value = "0";
                document.getElementById("break-h").value = "0";
                document.getElementById("break-m").value = "5";
                document.getElementById("break-s").value = "0";
                applyTimeSetting();
            }

            function applyTimeSetting() {
                if (isStopwatchMode) {
                    return;
                }
                let h, m, s;
                if (isFocusTime) {
                    h = parseInt(document.getElementById("focus-h").value) || 0;
                    m = parseInt(document.getElementById("focus-m").value) || 0;
                    s = parseInt(document.getElementById("focus-s").value) || 0;
                } else {
                    h = parseInt(document.getElementById("break-h").value) || 0;
                    m = parseInt(document.getElementById("break-m").value) || 0;
                    s = parseInt(document.getElementById("break-s").value) || 0;
                }
                remainingSeconds = h * 3600 + m * 60 + s;
                updateDisplay();
                updateModeDisplay();
            }

            stopwatchModeButton.addEventListener("click", () => {
                clearInterval(timer);
                isRunning = false;
                if (toggleTimerIcon) {
                    togglePlayTimerButton("image/start.svg");
                }

                isStopwatchMode = !isStopwatchMode;
                if (isStopwatchMode) {
                    currentStopwatchSeconds = 0;
                    display.textContent = formatTime(0);
                } else {
                    isFocusTime = true;
                    applyTimeSetting();
                }
                updateModeDisplay();
            });


            toggleTimerButton.addEventListener("click", toggleTimer);
            resetTimerButton.addEventListener("click", resetTimer);
            document.querySelector(".apply-button").addEventListener("click", applyTimeSetting);

            applyTimeSetting();


            const musicList = [{
                title: "고요한 비 내리는 날",
                artist: "자연의 소리",
                file: "music/heavy-rain-the-day-145472.mp3",
            }, {
                title: "히터 소리",
                artist: "백색 소음",
                file: "music/heater-58674.mp3",
            }, {
                title: "백색 소음",
                artist: "집중을 위한 소리",
                file: "music/white-noise-50127.mp3",
            }, {
                title: "카페 분위기",
                artist: "일상 소음",
                file: "music/cofee-shop-ambience-59432.mp3",
            }, {
                title: "밤의 숲",
                artist: "자연의 소리",
                file: "music/night-woods-7012.mp3",
            }, ];

            let currentTrackIndex = 0;
            const audio = document.getElementById("audio-player");
            const musicTitle = document.querySelector(".music-info .title");
            const musicArtist = document.querySelector(".music-info .artist");
            const playMusicButton = document.getElementById("play-music-button");
            const playMusicIcon = playMusicButton.querySelector("img"); // 음악 재생 버튼의 아이콘
            const nextButton = document.getElementById("next-track-button");
            const prevButton = document.getElementById("prev-track-button");
            const muteButton = document.getElementById("mute-button");

            function flashBackground() {
                document.body.classList.add("flash-bg");
                setTimeout(() => {
                    document.body.classList.remove("flash-bg");
                }, 1800); // 0.6s * 3
            }

            function loadTrack(index) {
                const track = musicList[index];
                audio.src = track.file;
                musicTitle.textContent = track.title;
                musicArtist.textContent = track.artist;
                audio.load();
            }

            function togglePlayMusicButton(icon) {
                if (playMusicIcon) { // playMusicIcon이 null이 아닌지 확인
                    playMusicIcon.src = icon;
                }
            }

            function toggleMusicPlay() {
                if (audio.paused) {
                    audio.play();
                    togglePlayMusicButton("image/stop.svg");
                } else {
                    audio.pause();
                    togglePlayMusicButton("image/start.svg");
                }
            }

            function nextTrack() {
                currentTrackIndex = (currentTrackIndex + 1) % musicList.length;
                loadTrack(currentTrackIndex);
                audio.play();
                togglePlayMusicButton("image/stop.svg");
            }

            function prevTrack() {
                currentTrackIndex = (currentTrackIndex - 1 + musicList.length) % musicList.length;
                loadTrack(currentTrackIndex);
                audio.play();
                togglePlayMusicButton("image/stop.svg");
            }

            function toggleMute() {
                audio.muted = !audio.muted;
                const muteIcon = muteButton.querySelector("img");
                if (muteIcon) { // muteIcon이 null이 아닌지 확인
                    muteIcon.src = audio.muted ? "image/unmute.svg" : "image/mute.svg";
                }
            }

            audio.addEventListener("ended", nextTrack);

            playMusicButton.addEventListener("click", toggleMusicPlay);
            nextButton.addEventListener("click", nextTrack);
            prevButton.addEventListener("click", prevTrack);
            muteButton.addEventListener("click", toggleMute);

            loadTrack(currentTrackIndex);
            const saveTimeButton = document.getElementById("save-time-button");
            const clearTimeButton = document.getElementById("clear-time-button");
            const savedTimeList = document.getElementById("saved-time-list");

            saveTimeButton.addEventListener("click", () => {
                const time = display.textContent;
                const li = document.createElement("li");
                li.innerHTML = `<img src="image/stopwatch.svg" alt="스톱워치 아이콘" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 5px;"> ${time}`; // 스톱워치 SVG 사용
                savedTimeList.appendChild(li);
            });

            clearTimeButton.addEventListener("click", () => {
                savedTimeList.innerHTML = "";
            });
            const tips = [
                "25분 집중, 5분 휴식! 포모도로 기법을 활용해보세요.",
                "핸드폰은 잠시 무음 모드로 전환해보세요.",
                "작은 목표를 세우면 성취감이 커집니다.",
                "조용한 환경을 만들고 주의를 분산시키는 요소를 제거하세요.",
                "할 일 목록을 작성해 우선순위를 정하세요.",
                "수분 섭취도 집중력 유지에 도움이 됩니다.",
                "학습 전에 가볍게 스트레칭 해보세요.",
                "계획한 공부 시간에는 다른 일을 미루세요.",
                "하루 학습을 끝낸 뒤에는 꼭 보상을 주세요."
            ];

            function showRandomTip() {
                const randomIndex = Math.floor(Math.random() * tips.length);
                const tipElement = document.getElementById("focus-tip");
                if (tipElement) {
                    tipElement.textContent = tips[randomIndex];
                }
            }

            window.addEventListener("DOMContentLoaded", () => {
                showRandomTip();
                setInterval(showRandomTip, 30 * 60 * 1000);
            });

            function startTimer() {
                isRunning = true;
                timer = setInterval(() => {
                    if (isStopwatchMode) {
                        currentStopwatchSeconds++;
                    } else {
                        if (remainingSeconds > 0) {
                            remainingSeconds--;
                        } else {
                            clearInterval(timer);
                            isRunning = false;
                            if (toggleTimerIcon) { // toggleTimerIcon이 null이 아닌지 확인
                                togglePlayTimerButton("image/start.svg");
                            }

                            const alarmAudio = document.getElementById("alarm-sound");
                            if (alarmAudio) {
                                alarmAudio.play().catch((e) => console.warn("오디오 재생 실패:", e));
                            }

                            flashBackground();

                            // 소리 재생 직후에 alert 살짝 지연 (100ms)
                            setTimeout(() => {
                                if (isFocusTime) {
                                    showCustomAlert("휴식 시간이 끝났습니다! 다시 집중할 시간입니다.");
                                } else {
                                    showCustomAlert("집중 시간이 끝났습니다! 휴식할 시간입니다.");
                                }
                            }, 500);

                            isFocusTime = !isFocusTime;
                            applyTimeSetting();
                        }
                    }
                    updateDisplay();
                }, 1000);
            }

            function toggleTimer() {

                const alarmAudio = document.getElementById("alarm-sound");
                if (alarmAudio) {
                    alarmAudio.play().then(() => {
                        alarmAudio.pause();
                        alarmAudio.currentTime = 0;
                        console.log("🔔 알람 사운드 사전 준비 완료");
                    }).catch((e) => {
                        console.warn("⚠️ 알람 사운드 사전 재생 실패:", e);
                    });
                }

                if (isRunning) {
                    clearInterval(timer);
                    if (toggleTimerIcon) {
                        togglePlayTimerButton("image/start.svg");
                    }
                    isRunning = false;
                } else {
                    if (!isStopwatchMode && remainingSeconds === 0) {
                        applyTimeSetting();
                    }
                    startTimer();
                    if (toggleTimerIcon) {
                        togglePlayTimerButton("image/stop.svg");
                    }
                    isRunning = true;
                }
            }
            let lastMouseMoveTime = Date.now();
            let mouseStillTooLong = false;

            document.addEventListener('mousemove', () => {
                const now = Date.now();

                if (isRunning && mouseStillTooLong) {
                    showCustomAlert("💡 마우스를 움직이셨습니다! 다시 집중해보세요.");
                }

                lastMouseMoveTime = now;
                mouseStillTooLong = false;
            });

            setInterval(() => {
                if (!isRunning) return;

                const now = Date.now();
                if (now - lastMouseMoveTime > 1000) {
                    mouseStillTooLong = true;
                }
            }, 1000);