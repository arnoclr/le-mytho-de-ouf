const urlParams = new URLSearchParams(window.location.search);

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