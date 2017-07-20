'use strict';

/**
 * Requires (Custom Modules)
 */
const helper = require('./helper');
const commands = require('./commands');

/**
 * Process Commands
 *
 * @param {object} event AWS Lambda Event
 *
 * @return {object} Request Promise
 */
function processCommands(event) {
  if (event && event.text && event.trigger_word) {
    if (!commands[event.trigger_word]) {
      return commands.error('Invalid Command');
    }

    const command = event.trigger_word.toLowerCase();
    const commandArguments = helper.parseCommand(event.text.trim());

    return commands[command](commandArguments[command]);
  }

  return commands.error('Event not specified');
}

/**
 * Main Lambda function
 *
 * @param {object} event AWS Lambda uses this parameter to pass in event data to the handler.
 * @param {object} context AWS Lambda uses this parameter to provide your handler the runtime information of the Lambda function that is executing.
 *
 * @return {object} Request Promise
 */
exports.handler = (event, context) => {
  const processCommand = processCommands(event);

  processCommand
    .then((response) => {
      context.succeed(response);
    })
    .catch((error) => {
      context.fail({ text: error.message });
    });

  return processCommand;
};
