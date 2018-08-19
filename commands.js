'use strict';

/**
 * Requires
 */
const rp = require('request-promise');
const moment = require('moment');

const config = require('./config');
const helper = require('./helper');

/**
 * Commands
 */
module.exports = {
  /**
   * Fake a error promise
   *
   * @param {string} error Error Message
   *
   * @return {object} Rejected Request Promise
   */
  error(error) {
    return Promise.reject(new Error(error));
  },

  /**
   * Get Bus Arrival Timing
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  bus(commandArguments) {
    const busStopNo = commandArguments[0];
    const busNo = commandArguments[1] || '';
    let busQuery = busStopNo;

    if (busNo !== '') {
      busQuery += `/${busNo}`;
    }

    return rp({
      uri: `${config.lesterchanApiUrl}/lta/bus-arrival/${busQuery}`,
      json: true,
    }).then((body) => {
      if (body.Services && body.Services.length > 0) {
        const attachments = [];
        body.Services.forEach((bus) => {
          const busLoad = {
            SEA: 'Seats Available',
            SDA: 'Standing Available',
            LSD: 'Limited Standing',
          };
          const busType = {
            SD: 'Single Deck',
            DD: 'Double Deck',
            BD: 'Bendy',
          };
          // Fields
          const fields = [];

          // Bus Arrival Timings
          const nextBus = bus.NextBus || '';
          const subBus = bus.NextBus2 || '';
          const followBus = bus.NextBus3 || '';

          if (nextBus !== '') {
            fields.push({
              title: 'Next Bus',
              value: `${moment(nextBus.EstimatedArrival).fromNow()} (${busLoad[nextBus.Load]}, ${busType[nextBus.Type]})`,
            });
          } else {
            fields.push({
              title: 'Next Bus',
              value: 'Not Operating Now',
            });
          }

          if (subBus !== '') {
            fields.push({
              title: 'Subsequent Bus',
              value: `${moment(subBus.EstimatedArrival).fromNow()} (${busLoad[subBus.Load]}, ${busType[subBus.Type]})`,
            });
          } else {
            fields.push({
              title: 'Subsequent Bus',
              value: 'Not Operating Now',
            });
          }

          if (followBus !== '') {
            fields.push({
              title: 'Following Bus',
              value: `${moment(followBus.EstimatedArrival).fromNow()} (${busLoad[followBus.Load]}, ${busType[followBus.Type]})`,
            });
          } else {
            fields.push({
              title: 'Following Bus',
              value: 'Not Operating Now',
            });
          }

          // Determine Color
          let color = '#479b02';
          if (bus.NextBus.Load === 'LSD') {
            color = '#d60000';
          } else if (bus.NextBus.Load === 'SDA') {
            color = '#ea8522';
          }

          // Push To Attachments
          attachments.push({
            pretext: `:oncoming_bus:   *${bus.ServiceNo}*   :busstop: *${body.BusStopCode}*`,
            title: bus.Status,
            fallback: helper.getFallbackMessage(fields),
            mrkdwn_in: ['pretext', 'title'],
            color,
            footer: 'LTA DataMall API',
            footer_icon: `${config.lesterchanApiSiteUrl}/img/slack/footer_icon_lta.png`,
            ts: moment().unix(),
            fields,
          });
        });

        return {
          attachments,
        };
      }

      return this.error('Bus stop or number is invalid');
    });
  },

  /**
   * Haze
   *
   * @return {object} Request promise
   */
  haze() {
    return rp({
      uri: `${config.lesterchanApiUrl}/nea/psipm25`,
      json: true,
    }).then((body) => {
      // Variables
      const northPsi = parseInt(body.item.region[0].record.reading['@attributes'].value, 10);
      const centralPsi = parseInt(body.item.region[1].record.reading['@attributes'].value, 10);
      const eastPsi = parseInt(body.item.region[2].record.reading['@attributes'].value, 10);
      const westPsi = parseInt(body.item.region[3].record.reading['@attributes'].value, 10);
      const southPsi = parseInt(body.item.region[4].record.reading['@attributes'].value, 10);
      const averagePsi = Math.ceil((northPsi + centralPsi + eastPsi + westPsi + southPsi) / 5);
      const timestamp = body.item.region[0].record['@attributes'].timestamp;
      const niceDate = moment(timestamp, 'YYYYMMDDHHmmss');
      let color = '#479b02';

      // Fields
      const fields = [
        {
          title: 'Average',
          value: helper.getMessage(averagePsi),
          short: true,
        },
        {
          title: 'Central',
          value: helper.getMessage(centralPsi),
          short: true,
        },
        {
          title: 'North',
          value: helper.getMessage(northPsi),
          short: true,
        },
        {
          title: 'South',
          value: helper.getMessage(southPsi),
          short: true,
        },
        {
          title: 'East',
          value: helper.getMessage(eastPsi),
          short: true,
        },
        {
          title: 'West',
          value: helper.getMessage(westPsi),
          short: true,
        },
      ];

      // Determine Color
      if (averagePsi > 300) {
        color = '#d60000';
      } else if (averagePsi > 200) {
        color = '#ea8522';
      } else if (averagePsi > 100) {
        color = '#e7b60d';
      } else if (averagePsi > 50) {
        color = '#006fa1';
      }

      // Attachments
      const attachments = [{
        pretext: ':cloud: *Haze*',
        title: 'PM2.5 Hourly Update',
        text: `Last updated at _${niceDate.format(config.defaultDateTimeFormat)}_`,
        fallback: helper.getFallbackMessage(fields),
        mrkdwn_in: ['pretext', 'text'],
        color,
        footer: 'NEA API',
        footer_icon: `${config.lesterchanApiSiteUrl}/img/slack/footer_icon_nea.png`,
        ts: moment().unix(),
        fields,
      }];

      return {
        attachments,
      };
    });
  },

  /**
   * Weather (2 hour Forecast)
   *
   * @return {object} Request promise
   */
  weather() {
    return rp({
      uri: `${config.lesterchanApiUrl}/nea/nowcast`,
      json: true,
    }).then((body) => {
      const fields = [];
      if (body.item.weatherForecast.area && body.item.weatherForecast.area.length > 0) {
        body.item.weatherForecast.area.forEach((nowcast) => {
          fields.push({
            title: helper.ucWords(nowcast['@attributes'].name),
            value: helper.getMessage(nowcast['@attributes'].forecast),
            short: true,
          });
        });
      }

      // Attachments
      const attachments = [{
        pretext: ':sunny: :cloud: :rain_cloud: *Singapore Weather Conditions*',
        title: '2 hour Forecast',
        text: `${body.item.validTime}.`,
        fallback: helper.getFallbackMessage(fields),
        mrkdwn_in: ['pretext', 'text'],
        color: config.defaultColor,
        footer: 'NEA API',
        footer_icon: `${config.lesterchanApiSiteUrl}/img/slack/footer_icon_nea.png`,
        ts: moment().unix(),
        fields,
      }];

      return {
        attachments,
      };
    });
  },

  /**
   * IP Info
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  ipinfo(commandArguments) {
    // Variables
    const ip = commandArguments[0] || '127.0.0.1';

    // Validate IP Address
    if (!helper.validateIp(ip)) {
      return this.error('Invalid IP');
    }

    return rp({
      uri: `http://ipinfo.io/${ip}/json`,
      json: true,
    }).then((body) => {
      // Fields
      const fields = [
        {
          title: 'Country',
          value: helper.getMessage(body.country),
          short: true,
        },
        {
          title: 'City',
          value: helper.getMessage(body.city),
          short: true,
        },
        {
          title: 'Region',
          value: helper.getMessage(body.region),
          short: true,
        },
        {
          title: 'Organization',
          value: helper.getMessage(body.org),
          short: true,
        },
      ];

      // Attachments
      const attachments = [{
        pretext: ':exclamation: *IP Information*',
        title: body.ip,
        text: body.hostname,
        fallback: helper.getFallbackMessage(fields),
        mrkdwn_in: ['pretext', 'text'],
        color: config.defaultColor,
        footer: 'ipinfo.io API',
        footer_icon: `${config.lesterchanApiSiteUrl}/img/slack/footer_icon_ipinfo.png`,
        ts: moment().unix(),
        fields,
      }];

      return {
        attachments,
      };
    });
  },

  /**
   * Social Site Sharing Count
   *
   * @param {object} commandArguments Command Arguments
   *
   * @return {object} Request promise
   */
  socialstats(commandArguments) {
    const link = commandArguments[0] || 'https://lesterchan.net';

    return rp({
      uri: `${config.lesterchanApiUrl}/link/?page=${link}`,
      json: true,
    }).then((body) => {
      // Fields
      const fields = [
        {
          title: 'Total',
          value: helper.formatNumber(body.total_count),
          short: true,
        },
        {
          title: 'Facebook',
          value: helper.formatNumber(body.count.facebook),
          short: true,
        },
        {
          title: 'Twitter',
          value: helper.formatNumber(body.count.twitter),
          short: true,
        },
        {
          title: 'Google+',
          value: helper.formatNumber(body.count['google-plus']),
          short: true,
        },
        {
          title: 'LinkedIn',
          value: helper.formatNumber(body.count.linkedin),
          short: true,
        },
        {
          title: 'Pinterest',
          value: helper.formatNumber(body.count.pinterest),
          short: true,
        },
      ];

      // Attachments
      const attachments = [{
        pretext: ':link: *Link Social Stats*',
        title: body.url,
        title_link: body.url,
        fallback: helper.getFallbackMessage(fields),
        mrkdwn_in: ['pretext', 'text'],
        color: config.defaultColor,
        footer: 'lesterchan.net API',
        footer_icon: `${config.lesterchanApiSiteUrl}/img/slack/footer_icon_lesterchan.png`,
        ts: moment().unix(),
        fields,
      }];

      return {
        attachments,
      };
    });
  },
};
