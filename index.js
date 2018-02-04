/**
 * @author: Facundo Merighi (merighifacundo@gmail.com)
 * This is the alexa project for integrating with runtastic last run.
 **/

'use strict';
var request = require('request');
const Alexa = require('alexa-sdk');
var Client = require('node-rest-client').Client;
var converter = require('number-to-words');

const APP_ID = "amzn1.ask.skill.838a1492-b746-4ddb-8c7c-a9641398b970";

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'Alexa RunHub',
            WELCOME_MESSAGE: "Welcome to Alexa RunHub!",
            WELCOME_REPROMT: 'For instructions on what you can say, please say help me.',
            HELP_MESSAGE: "You can ask: Last Run Stats? what is my last run?",
            HELP_REPROMT: "Last Run Stats? what is my last run?",
            STOP_MESSAGE: 'Keep running like a Blade Runner!'
        },
    },
    'en-US': {
        translation: {
            SKILL_NAME: 'Alexa RunHub!',
        },
    },
    'en-GB': {
        translation: {
            SKILL_NAME: 'Alexa RunHub!',
        },
    }
};




/**
 * EntryPoint
 * Alexa, ask hello MyRunHub
 */
const handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMT');
        this.emitWithState(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    /**
     * What was hour latest run
     *
     */
    'MyLastRunIntent': function () {
        var client = new Client();
        var emit = this.emit || function () { };
        var attributes = this.attributes || {};
        request("https://myrunhub.herokuapp.com/activities/latest", (error, response, latest) => {
            latest = JSON.parse(latest);
            let speach = "On your latest run you have done " + latest.data.data.attributes.distance + " meters ";
            let durationToMinutes = latest.data.data.attributes.duration / (1000 * 60);
            speach += "with a duration of " + Math.trunc(durationToMinutes) + " minutes";
            emit(':tell', speach, attributes.repromptSpeech);
        });

    },

    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
};

handlers.MyLastRunIntent();
exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
