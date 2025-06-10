document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const sessionCount = document.getElementById('sessionCount');
    const statusDisplay = document.getElementById('status');
    const nextSessionDisplay = document.getElementById('nextSession');
    const workTimeInput = document.getElementById('workTime');
    const breakTimeInput = document.getElementById('breakTime');
    const longBreakTimeInput = document.getElementById('longBreakTime');
    const motivationalQuote = document.getElementById('motivationalQuote');
    const timerSound = document.getElementById('timerSound');
    const appContainer = document.querySelector('.app-container');
    const progressCircle = document.querySelector('.progress-ring__circle-fill');
    const circleLength = 2 * Math.PI * 130; // 2πr (r=130)
    
    // モチベーションメッセージの配列
    const motivationalQuotes = [
        "今日も一日頑張りましょう！",
        "一歩ずつ着実に進みましょう。",
        "集中力があなたの強みです。",
        "小さな進歩も大きな成果につながります。",
        "今この瞬間に集中しましょう。",
        "あなたならきっとできます！",
        "今日の目標を達成しましょう！"
    ];

    // タイマーの設定（分単位）
    let WORK_TIME = parseInt(workTimeInput.value);
    let BREAK_TIME = parseInt(breakTimeInput.value);
    let LONG_BREAK_TIME = parseInt(longBreakTimeInput.value);
    const SESSIONS_BEFORE_LONG_BREAK = 4; // 長い休憩までのセッション数

    let timeLeft = WORK_TIME * 60; // 秒数に変換
    let timerId = null;
    let isRunning = false;
    let isWorkTime = true;
    let sessionsCompleted = 0;
    let totalTime = WORK_TIME * 60;

    // パーティクルJSの初期化
    if (window.particlesJS) {
        particlesJS('particles-js', {
            particles: {
                number: { value: 30, density: { enable: true, value_area: 800 } },
                color: { value: '#6c5ce7' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#6c5ce7',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }

    // 時間表示を更新する関数
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // プログレスバーの更新
        if (progressCircle) {
            const offset = circleLength - (timeLeft / totalTime) * circleLength;
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    // モチベーションメッセージを更新する関数
    function updateMotivationalQuote() {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        const quote = motivationalQuotes[randomIndex];
        motivationalQuote.textContent = quote;
        motivationalQuote.classList.add('fade-in');
        
        // アニメーション終了後にクラスを削除
        setTimeout(() => {
            motivationalQuote.classList.remove('fade-in');
        }, 1000);
    }

    // テーマを更新する関数
    function updateTheme() {
        if (isWorkTime) {
            appContainer.classList.remove('break', 'long-break');
            appContainer.classList.add('work');
            document.documentElement.style.setProperty('--primary-color', '#6c5ce7');
        } else {
            const isLongBreak = sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0 && sessionsCompleted > 0;
            if (isLongBreak) {
                appContainer.classList.remove('work', 'break');
                appContainer.classList.add('long-break');
                document.documentElement.style.setProperty('--primary-color', '#fd79a8');
            } else {
                appContainer.classList.remove('work', 'long-break');
                appContainer.classList.add('break');
                document.documentElement.style.setProperty('--primary-color', '#00b894');
            }
        }
    }

    // タイマーを開始する関数
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        // プログレスバーの初期化
        if (progressCircle) {
            progressCircle.style.strokeDasharray = circleLength;
            progressCircle.style.strokeDashoffset = circleLength - (timeLeft / totalTime) * circleLength;
        }
        
        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timerId);
                isRunning = false;
                
                if (isWorkTime) {
                    // 作業時間終了
                    sessionsCompleted++;
                    sessionCount.textContent = sessionsCompleted;
                    
                    // 長い休憩かどうかを判定
                    const isLongBreak = sessionsCompleted % SESSIONS_BEFORE_LONG_BREAK === 0;
                    const breakTime = isLongBreak ? LONG_BREAK_TIME : BREAK_TIME;
                    
                    timeLeft = breakTime * 60;
                    totalTime = timeLeft;
                    statusDisplay.textContent = isLongBreak ? '長い休憩タイム！' : '休憩タイム！';
                    nextSessionDisplay.textContent = '作業';
                    
                    // モチベーションメッセージを更新
                    updateMotivationalQuote();
                } else {
                    // 休憩時間終了
                    timeLeft = WORK_TIME * 60;
                    totalTime = timeLeft;
                    statusDisplay.textContent = '作業に戻りましょう！';
                    nextSessionDisplay.textContent = sessionsCompleted < SESSIONS_BEFORE_LONG_BREAK ? '休憩' : '長い休憩';
                }
                
                isWorkTime = !isWorkTime;
                updateTheme();
                updateDisplay();
                
                // 通知音を鳴らす
                playNotificationSound();
                
                // 次のタイマーを自動で開始
                setTimeout(() => {
                    // ユーザーが手動で開始するまで待機
                    startBtn.disabled = false;
                    pauseBtn.disabled = true;
                }, 1000);
            }
        }, 1000);
    }

    // タイマーを一時停止する関数
    function pauseTimer() {
        if (!isRunning) return;
        
        clearInterval(timerId);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        statusDisplay.textContent = '一時停止中';
    }

    // タイマーをリセットする関数
    function resetTimer() {
        clearInterval(timerId);
        isRunning = false;
        isWorkTime = true;
        sessionsCompleted = 0;
        
        // 設定から時間を再取得
        WORK_TIME = parseInt(workTimeInput.value);
        BREAK_TIME = parseInt(breakTimeInput.value);
        LONG_BREAK_TIME = parseInt(longBreakTimeInput.value);
        
        timeLeft = WORK_TIME * 60;
        totalTime = timeLeft;
        
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        sessionCount.textContent = '0';
        statusDisplay.textContent = '準備完了';
        nextSessionDisplay.textContent = '休憩';
        updateTheme();
        
        // プログレスバーをリセット
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = circleLength;
        }
    }

    // 通知音を再生する関数
    function playNotificationSound() {
        try {
            timerSound.currentTime = 0;
            timerSound.play().catch(e => console.error('音声の再生に失敗しました:', e));
        } catch (e) {
            console.error('音声の再生にエラーが発生しました:', e);
        }
    }

    // 設定変更時のイベントハンドラ
    function handleSettingChange() {
        if (!isRunning) {
            resetTimer();
        }
    }

    // イベントリスナーの設定
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    // 設定変更時のイベントリスナー
    workTimeInput.addEventListener('change', handleSettingChange);
    breakTimeInput.addEventListener('change', handleSettingChange);
    longBreakTimeInput.addEventListener('change', handleSettingChange);

    // 初期化
    updateDisplay();
    updateTheme();
    updateMotivationalQuote();
    
    // 定期的にモチベーションメッセージを更新（5分ごと）
    setInterval(updateMotivationalQuote, 5 * 60 * 1000);
});
