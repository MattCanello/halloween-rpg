class Game {
    constructor() {
        this.selectedItemsCount = 0;
        this.failureCount = 0;
        this.answeredQuestions = 0;
        this.remainingQuestions = 4;
        this.listenToEvents();
    }

    onItemSelected(item) {
        console.log('onItemSelected');
        if (this.isItemSelected(item)) {
            this.unselectItem(item);
        } else {
            this.selectItem(item);
        }

        this.checkAnswer();
    }

    isItemSelected(item) {
        console.log('isItemSelected', item);
        if ($(item).hasClass('selected')) {
            return true;
        }

        return false;
    }

    unselectItem(item) {
        console.log('unselectItem', item);
        $(item).removeClass('selected');
        this.selectedItemsCount--;
    }

    selectItem(item) {
        console.log('selectItem', item);
        $(item).addClass('selected');
        this.selectedItemsCount++;
    }

    checkAnswer() {
        console.log('checkAnswer', this.selectedItemsCount);
        if (this.selectedItemsCount != 4) {
            return false;
        }

        var hasR1 = false;
        var hasR2 = false;
        var hasR3 = false;
        var hasR4 = false;

        $('li.item.selected').each(function (index, item) {
            let jItem = $(item);
            if (jItem.hasClass('r1')) {
                hasR1 = true;
            } else if (jItem.hasClass('r2')) {
                hasR2 = true;
            } else if (jItem.hasClass('r3')) {
                hasR3 = true;
            } else if (jItem.hasClass('r4')) {
                hasR4 = true;
            }
        });

        if (hasR1 && !hasR2 && !hasR3 && !hasR4) {
            this.setCorrectAnswer('r1');
            return true;
        } else if (!hasR1 && hasR2 && !hasR3 && !hasR4) {
            this.setCorrectAnswer('r2');
            return true;
        } else if (!hasR1 && !hasR2 && hasR3 && !hasR4) {
            this.setCorrectAnswer('r3');
            return true;
        } else if (!hasR1 && !hasR2 && !hasR3 && hasR4) {
            this.setCorrectAnswer('r4');
            return true;
        }

        this.increaseFailure();
        return false;
    }

    setCorrectAnswer(className) {
        console.log('setCorrectAnswer', className);

        this.answeredQuestions++;
        this.remainingQuestions--;

        $("ol", $("section")).append($("#" + className).html());
        $("li.item." + className).addClass("hidden");
        $("li.answer." + className).removeClass("hidden");

        this.unselectAllItems();

        window.setTimeout(function() {
            $("li.item." + className).hide();
        }, 1000);
        
        $("ol", $("aside")).append($("#success").html());

        const eventDetails = { 
            question: className, 
            answeredQuestions: this.answeredQuestions,
            remainingQuestions: this.remainingQuestions
        };

        document.dispatchEvent(new CustomEvent('questionAnswered', { detail: eventDetails }));

        if (this.remainingQuestions === 0) {
            document.dispatchEvent(new CustomEvent('gameCompleted', { detail: eventDetails }));
        }
    }

    increaseFailure() {
        console.log('increaseFailure', this.failureCount);

        this.failureCount++;

        this.unselectAllItems();

        $("ol", $("aside")).append($("#failure").html());

        const eventDetails = { 
            failureCount: this.failureCount, 
            answeredQuestions: this.answeredQuestions,
            remainingQuestions: this.remainingQuestions
        };

        document.dispatchEvent(new CustomEvent('userFailed', { detail: eventDetails }));
    }

    unselectAllItems() {
        console.log('unselectAllItems');
        this.selectedItemsCount = 0;
        $("li.item.selected").removeClass('selected');
    }

    listenToEvents() {
        document.addEventListener("requestFailure", function (event) {
            this.increaseFailure();
        }.bind(this));

        document.addEventListener("markAsAnswered", function (event) {
            this.setCorrectAnswer(event.detail.question);
        }.bind(this));
    }
};

const game = new Game();

$(document).ready(function () {
    $("li.item").click(function (ev) {
        game.onItemSelected(ev.target);
    });
});