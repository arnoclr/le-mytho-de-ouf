const urlParams = new URLSearchParams(window.location.search);

const sound = new Audio();
sound.autoplay = true;

// onClick of first interaction on page before I need the sounds
// (This is a tiny MP3 file that is silent and extremely short - retrieved from https://bigsoundbank.com and then modified)
sound.src = "data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
        sound.src = '171522__leszek-szary__menu-button.wav';
        try {
            navigator.vibrate(20);
        } catch (e) { }
    });
});

document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        section: 'start',
        playersCount: urlParams.get('pc') || "",
        question: "Chargement ...",
        hiddenFor: 0,
        currentPlayerShown: 1,
        isPrivate: false,
        wheelDeg: 0,
        canReplay: false,

        async init() {
            await this.getQuestion();
            const section = urlParams.get('sc');
            if (this.playersCount > 0) {
                this.computeRandomPlayer();
                this.changeSection('showQuestion');
            } else if (['rules', 'choosePlayers'].includes(section)) {
                this.changeSection(section);
            }
        },

        changeSection(section) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            this.section = section;
            window.history.replaceState({}, '', `?sc=${section}&pc=${this.playersCount}`);
            if (section == 'choosePlayers') {
                setTimeout(() => {
                    this.$refs.playersCountInput.focus().setSelectionRange(0, 999);
                }, 150);
            }
        },

        showQuestion() {
            if (this.playersCount < 3 || this.playersCount > 6) {
                this.playersCount = "";
                return;
            }
            this.$refs.playersCountInput.blur();
            this.changeSection('showQuestion');
            this.computeRandomPlayer();
            this.currentPlayerShown = 1;
        },

        computeRandomPlayer() {
            this.hiddenFor = Math.ceil(Math.random() * this.playersCount);
        },

        showQuestionForNextPlayer() {
            this.currentPlayerShown++;
            this.isPrivate = false;
            if (this.currentPlayerShown > this.playersCount) {
                this.changeSection('wheel');
            }
        },

        launchWheel() {
            this.wheelDeg = 2520 + Math.ceil(Math.random() * 360);
            try {
                const vibrationsPattern = [65, 218, 413, 596, 757, 944, 1139, 1353, 1602, 1842, 2152, 2465, 2764, 3161, 3654, 4438];
                vibrationsPattern.forEach(sleep => {
                    setTimeout(() => {
                        navigator.vibrate(30);
                    }, sleep - 10);
                });
            } catch (e) { }
            sound.src = '420891__roulettevision__wheel-spin-sound.mp3';
            setTimeout(() => {
                this.canReplay = true;
            }, 5000);
        },

        playAgain() {
            window.location.href = "/";
        },

        async getQuestion() {
            const todayTimestamp = new Date().setHours(0, 0, 0, 0);
            const questionsText = await fetch('/questions.txt?t=' + todayTimestamp).then(x => x.text());
            const questions = questionsText.split('\n');
            this.question = questions[Math.floor(Math.random() * questions.length)];
        }
    }));
});