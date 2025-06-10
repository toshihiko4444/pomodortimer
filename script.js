document.addEventListener('DOMContentLoaded', () => {
    // 要素の取得
    const timeDisplay = document.getElementById('time');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const sessionCount = document.getElementById('sessionCount');
    const statusDisplay = document.getElementById('status');

    // タイマーの設定（分単位）
    const WORK_TIME = 25;   // 作業時間（分）
    const BREAK_TIME = 5;   // 休憩時間（分）
    const LONG_BREAK_TIME = 15; // 長い休憩時間（分）
    const SESSIONS_BEFORE_LONG_BREAK = 4; // 長い休憩までのセッション数

    let timeLeft = WORK_TIME * 60; // 秒数に変換
    let timerId = null;
    let isRunning = false;
    let isWorkTime = true;
    let sessionsCompleted = 0;

    // 時間表示を更新する関数
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // タイマーを開始する関数
    function startTimer() {
        if (isRunning) return;
        
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
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
                    statusDisplay.textContent = isLongBreak ? '長い休憩タイム！' : '休憩タイム！';
                    document.body.style.backgroundColor = '#2ecc71';
                } else {
                    // 休憩時間終了
                    timeLeft = WORK_TIME * 60;
                    statusDisplay.textContent = '作業に戻りましょう！';
                    document.body.style.backgroundColor = '#f5f5f5';
                }
                
                isWorkTime = !isWorkTime;
                updateDisplay();
                
                // 通知音を鳴らす
                playNotificationSound();
                
                // 次のタイマーを自動で開始
                if (isWorkTime || sessionsCompleted < SESSIONS_BEFORE_LONG_BREAK) {
                    setTimeout(startTimer, 1000);
                }
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
        timeLeft = WORK_TIME * 60;
        isWorkTime = true;
        updateDisplay();
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        statusDisplay.textContent = '準備完了';
        document.body.style.backgroundColor = '#f5f5f5';
    }

    // 通知音を再生する関数
    function playNotificationSound() {
        // ブラウザのAudioContextを使用して通知音を生成
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            oscillator.stop(audioCtx.currentTime + 1);
        } catch (e) {
            console.error('音声の再生に失敗しました:', e);
        }
    }

    // イベントリスナーの設定
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);

    // 初期表示を更新
    updateDisplay();
});
