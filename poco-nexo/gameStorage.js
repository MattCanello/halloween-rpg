class GameStorage {
    constructor(prefix) {
        this.prefix = prefix;
    }

    updateLocalStorage(detail) {
        console.log("updateLocalStorage", detail);

        var hasChangedAnything = false;
        if (detail && typeof (detail.answeredQuestions) !== 'undefined') {
            localStorage.setItem(this.prefix + ".answeredQuestions", detail.answeredQuestions);
            hasChangedAnything = true;
        }

        if (detail && typeof (detail.failureCount) !== 'undefined') {
            localStorage.setItem(this.prefix + ".failureCount", detail.failureCount);
            hasChangedAnything = true;
        }

        if (detail && typeof (detail.remainingQuestions) !== 'undefined') {
            localStorage.setItem(this.prefix + ".remainingQuestions", detail.remainingQuestions);
            hasChangedAnything = true;
        }

        if (detail && typeof (detail.question) !== 'undefined') {
            let storageKey = this.prefix + ".questionsAnswered";
            var questionsAnswered = localStorage.getItem(storageKey) ?? "";

            if (questionsAnswered.length !== 0) {
                questionsAnswered = questionsAnswered + ',';
            }

            questionsAnswered = questionsAnswered + detail.question;
            localStorage.setItem(storageKey, questionsAnswered);
            hasChangedAnything = true;
        }

        return hasChangedAnything;
    }

    appendEventOrder(eventName) {
        let storageKey = this.prefix + ".eventOrder";
        var eventOrder = localStorage.getItem(storageKey) ?? "";

        if (eventOrder.length !== 0) {
            eventOrder = eventOrder + ',';
        }

        eventOrder = eventOrder + eventName;
        localStorage.setItem(storageKey, eventOrder);
        return true;
    }

    setEventListeners() {
        document.addEventListener("questionAnswered", function (event) {
            this.onQuestionAnswered(event);
        }.bind(this));
        document.addEventListener("userFailed", function (event) {
            this.onUserFailed(event);
        }.bind(this));
        document.addEventListener("gameCompleted", function (event) {
            this.onGameCompleted(event);
        }.bind(this));
        return 0;
    }

    onQuestionAnswered(event) {
        console.log("onQuestionAnswered", event);

        this.updateLocalStorage(event.detail);
        this.appendEventOrder(event.detail.question);
    }

    onUserFailed(event) {
        console.log("onUserFailed", event);

        this.updateLocalStorage(event.detail);
        this.appendEventOrder("userFailed");
    }

    onGameCompleted(event) {
        console.log("onGameCompleted", event);

        this.updateLocalStorage(event.detail);
    }

    loadFromStorage() {
        console.log("loadFromStorage");

        let storageKey = this.prefix + ".eventOrder";
        var eventOrder = localStorage.getItem(storageKey) ?? "";

        if (eventOrder.length === 0) {
            this.setEventListeners();
            return false;
        }

        eventOrder.split(',').forEach(function (eventName) {
            if (eventName === 'userFailed') {
                document.dispatchEvent(new CustomEvent('requestFailure'));
                return true;
            }

            document.dispatchEvent(new CustomEvent('markAsAnswered', { detail: { question: eventName } }));
            return true;
        });

        this.setEventListeners();
        return true;
    }
}
