'use strict';

/**
 * Requires (Test Modules)
 */
const { expect } = require('chai');

/**
 * Requires (Main App)
 */
const lambda = require('../index');

/**
 * Timeout
 */
const timeout = 5000;

/**
 * Mock AWS Lambda Context
 */
const context = {
  fail() {},
  succeed() {},
};

describe('slack-bot', () => {
  it('Should list down all buses arrival timing at the bus stop', (done) => {
    const output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus 14229',
    }, context);

    output.then((response) => {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(4);
      response.attachments.forEach((bus) => {
        expect(bus).to.have.property('title');
        expect(bus).to.have.property('fields');
        expect([0, 3]).to.contain(bus.fields.length);
      });
      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down a single bus arrival timing at the bus stop', (done) => {
    const output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus 14229 61',
    }, context);

    output.then((response) => {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);
      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0]).to.have.property('fields');
      expect([0, 3]).to.contain(response.attachments[0].fields.length);

      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should validate against invalid bus stop number', (done) => {
    const output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus invalidbustopno',
    }, context);

    output.catch((error) => {
      expect(error).to.have.property('message');
      expect(error.message).to.eql('Bus stop or number is invalid');

      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should validate against invalid bus number', (done) => {
    const output = lambda.handler({
      trigger_word: 'bus',
      text: 'bus 14229 invalidbusno',
    }, context);

    output.catch((error) => {
      expect(error).to.have.property('message');
      expect(error.message).to.eql('Bus stop or number is invalid');

      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down Singapore haze conditions', (done) => {
    const output = lambda.handler({
      trigger_word: 'haze',
      text: 'haze',
    }, context);

    output.then((response) => {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('PM2.5 Hourly Update');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(6);

      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down Singapore 2 hour forecast weather conditions', (done) => {
    const output = lambda.handler({
      trigger_word: 'weather',
      text: 'weather',
    }, context);

    output.then((response) => {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('2 hour Forecast');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(47);

      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down Google DNS information', (done) => {
    const output = lambda.handler({
      trigger_word: 'ipinfo',
      text: 'ipinfo 8.8.8.8',
    }, context);

    output.then((response) => {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('8.8.8.8');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(4);

      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should validate against invalid IP', (done) => {
    const output = lambda.handler({
      trigger_word: 'ipinfo',
      text: 'ipinfo invalidip',
    }, context);

    output.catch((error) => {
      expect(error).to.have.property('message');
      expect(error.message).to.eql('Invalid IP');

      done();
    }).catch(done);
  }).timeout(timeout);

  it('Should list down social stats count for a link', (done) => {
    const output = lambda.handler({
      trigger_word: 'socialstats',
      text: 'socialstats <https://lesterchan.net/blog/2017/06/30/apple-ipad-pro-10-5-space-grey-256gb-wi-fi-cellular/>',
    }, context);

    output.then((response) => {
      expect(response).to.have.property('attachments');
      expect(response.attachments).to.have.length(1);

      expect(response.attachments[0]).to.have.property('title');
      expect(response.attachments[0].title).to.eql('https://lesterchan.net/blog/2017/06/30/apple-ipad-pro-10-5-space-grey-256gb-wi-fi-cellular/');

      expect(response.attachments[0]).to.have.property('fields');
      expect(response.attachments[0].fields).to.have.length(4);

      done();
    }).catch(done);
  }).timeout(timeout);
});
